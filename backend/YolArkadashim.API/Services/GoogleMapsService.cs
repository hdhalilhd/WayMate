using System.Globalization;
using System.Text.Json;
using NetTopologySuite.Geometries;

namespace YolArkadashim.API.Services;

// Rota (polyline) hesaplama — ücretsiz OSRM (OpenStreetMap) kullanır.
// Google billing / API anahtarı GEREKMEZ. Sınıf adı geriye dönük uyumluluk için korundu.
public class GoogleMapsService(HttpClient httpClient)
{
    private static string Inv(double d) => d.ToString(CultureInfo.InvariantCulture);

    public async Task<LineString?> GetRoutePolylineAsync(Point origin, Point destination)
    {
        // OSRM koordinat sırası: lon,lat  (NetTopologySuite: X=lon, Y=lat)
        var url = "https://router.project-osrm.org/route/v1/driving/" +
                  $"{Inv(origin.X)},{Inv(origin.Y)};{Inv(destination.X)},{Inv(destination.Y)}" +
                  "?overview=full&geometries=geojson";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        if (json.TryGetProperty("code", out var code) && code.GetString() != "Ok") return null;

        var routes = json.GetProperty("routes");
        if (routes.GetArrayLength() == 0) return null;

        var coordsEl = routes[0].GetProperty("geometry").GetProperty("coordinates");
        var coords = new List<Coordinate>();
        foreach (var c in coordsEl.EnumerateArray())
        {
            // GeoJSON: [lon, lat]
            coords.Add(new Coordinate(c[0].GetDouble(), c[1].GetDouble()));
        }

        if (coords.Count < 2) return null;
        return new LineString([.. coords]) { SRID = 4326 };
    }
}
