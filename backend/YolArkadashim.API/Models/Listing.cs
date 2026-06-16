using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries;

namespace YolArkadashim.API.Models;

public enum ListingStatus { Active, Paused, Closed }

public class Listing
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // PostGIS geometries (SRID 4326 = WGS84)
    public Point HomeLocation { get; set; } = null!;
    public Point WorkLocation { get; set; } = null!;
    public LineString? RoutePolyline { get; set; }

    [MaxLength(300)]
    public string HomeAddressText { get; set; } = string.Empty;

    [MaxLength(300)]
    public string WorkAddressText { get; set; } = string.Empty;

    // Sabah evden çıkış saati (UTC olarak saklanır, frontend dönüşüm yapar)
    public TimeOnly MorningDepartTime { get; set; }

    // Akşam işten çıkış saati
    public TimeOnly EveningDepartTime { get; set; }

    [MaxLength(500)]
    public string? FlexibilityNote { get; set; }

    // Yüzde kaç gün esnek (0-100)
    public int FlexibilityDaysPct { get; set; } = 0;

    public decimal PricePerTrip { get; set; }

    public int AvailableSeats { get; set; } = 1;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    // Güzergahtan kaç metre sapma kabul edilir (100-1000m)
    public int DeviationRadiusMeters { get; set; } = 500;

    public ListingStatus Status { get; set; } = ListingStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MatchRequest> MatchRequests { get; set; } = [];
}
