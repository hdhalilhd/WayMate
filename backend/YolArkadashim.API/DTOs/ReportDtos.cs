using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.DTOs;

public record CreateReportRequest(
    Guid? ReportedUserId,
    Guid? ListingId,
    [Required, MinLength(1)] List<string> Reasons,
    [MaxLength(1000)] string? Description
);
