using System.Text.Json;
using NetTopologySuite.Geometries;

namespace YolArkadashim.API.Services;

public class GoogleMapsService(IConfiguration config, HttpClient httpClient)
{
    private readonly string _apiKey = config["GoogleMaps:ApiKey"]!;

    public async Task<LineString?> GetRoutePolylineAsync(Point origin, Point destination)
    {
        // origin: Point(lon, lat) — NetTopologySuite X=lon, Y=lat
        var url = $"https://maps.googleapis.com/maps/api/directions/json" +
                  $"?origin={origin.Y},{origin.X}" +
                  $"&destination={destination.Y},{destination.X}" +
                  $"&key={_apiKey}";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var status = json.GetProperty("status").GetString();
        if (status != "OK") return null;

        var encodedPolyline = json
            .GetProperty("routes")[0]
            .GetProperty("overview_polyline")
            .GetProperty("points")
            .GetString()!;

        var coordinates = DecodePolyline(encodedPolyline);
        if (coordinates.Length < 2) return null;

        return new LineString(coordinates) { SRID = 4326 };
    }

    // Google Encoded Polyline Algorithm decoder
    private static Coordinate[] DecodePolyline(string encoded)
    {
        var coords = new List<Coordinate>();
        int index = 0, lat = 0, lng = 0;

        while (index < encoded.Length)
        {
            lat += DecodeNext(encoded, ref index);
            lng += DecodeNext(encoded, ref index);
            coords.Add(new Coordinate(lng / 1e5, lat / 1e5)); // X=lon, Y=lat
        }

        return [.. coords];
    }

    private static int DecodeNext(string encoded, ref int index)
    {
        int result = 0, shift = 0, b;
        do
        {
            b = encoded[index++] - 63;
            result |= (b & 0x1F) << shift;
            shift += 5;
        } while (b >= 0x20);

        return (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    }
}
