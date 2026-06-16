using NetTopologySuite.Geometries;

namespace YolArkadashim.API.Models;

public class SavedSearch
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? City { get; set; }

    public Point HomeLocation { get; set; } = null!;
    public Point WorkLocation { get; set; } = null!;

    public string HomeAddressText { get; set; } = string.Empty;
    public string WorkAddressText { get; set; } = string.Empty;

    public int RadiusMeters { get; set; } = 500;

    public bool EmailNotify { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
