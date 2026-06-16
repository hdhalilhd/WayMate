using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.Models;

public enum ReportStatus { Open, Reviewing, Resolved, Dismissed }

public class Report
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    // Şikayet edilen kullanıcı ve/veya ilan
    public Guid? ReportedUserId { get; set; }
    public Guid? ListingId { get; set; }

    // Seçilen sebepler (virgülle ayrılmış: spam, taciz, sahte-ilan, ...)
    [Required, MaxLength(300)]
    public string Reasons { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public ReportStatus Status { get; set; } = ReportStatus.Open;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
