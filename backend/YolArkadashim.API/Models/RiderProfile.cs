using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries;

namespace YolArkadashim.API.Models;

public class RiderProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Point HomeLocation { get; set; } = null!;
    public Point WorkLocation { get; set; } = null!;

    [MaxLength(300)]
    public string HomeAddressText { get; set; } = string.Empty;

    [MaxLength(300)]
    public string WorkAddressText { get; set; } = string.Empty;

    // Tercih edilen kalkış saati aralığı
    public TimeOnly PreferredDepartFrom { get; set; }
    public TimeOnly PreferredDepartTo { get; set; }

    public ICollection<MatchRequest> MatchRequests { get; set; } = [];
}
