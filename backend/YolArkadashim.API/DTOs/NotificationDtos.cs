using System.ComponentModel.DataAnnotations;
using YolArkadashim.API.DTOs;

namespace YolArkadashim.API.DTOs;

public record SaveSearchRequest(
    string? City,
    [Required] double HomeLat,
    [Required] double HomeLng,
    [Required] string HomeAddressText,
    [Required] double WorkLat,
    [Required] double WorkLng,
    [Required] string WorkAddressText,
    int RadiusMeters = 500,
    bool EmailNotify = true
);

public record SavedSearchDto(
    Guid Id,
    string? City,
    string HomeAddressText,
    string WorkAddressText,
    int RadiusMeters,
    bool EmailNotify,
    DateTime CreatedAt
);

public record NotificationDto(
    Guid Id,
    string Title,
    string Body,
    Guid? ListingId,
    bool IsRead,
    DateTime CreatedAt
);
