using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.DTOs;

public record LocationDto(double Lat, double Lng, string AddressText);

public record CreateListingRequest(
    [Required, MaxLength(100)] string City,
    [Required] LocationDto HomeLocation,
    [Required] LocationDto WorkLocation,
    [Required] TimeOnly MorningDepartTime,
    [Required] TimeOnly EveningDepartTime,
    string? FlexibilityNote,
    int FlexibilityDaysPct,
    [Range(0, 9999)] decimal PricePerTrip,
    [Range(1, 8)] int AvailableSeats,
    [Range(100, 1000)] int DeviationRadiusMeters = 500
);

public record ListingDto(
    Guid Id,
    Guid UserId,
    string DriverName,
    string? DriverPhoto,
    string City,
    bool DriverEmailVerified,
    bool DriverTcVerified,
    LocationDto HomeLocation,
    LocationDto WorkLocation,
    TimeOnly MorningDepartTime,
    TimeOnly EveningDepartTime,
    string? FlexibilityNote,
    int FlexibilityDaysPct,
    decimal PricePerTrip,
    int AvailableSeats,
    int DeviationRadiusMeters,
    string Status,
    DateTime CreatedAt,
    double? HomeDistanceMeters,
    double? WorkDistanceMeters
);

public record SearchListingsRequest(
    [Required] double RiderHomeLat,
    [Required] double RiderHomeLng,
    [Required] double RiderWorkLat,
    [Required] double RiderWorkLng,
    string? City,
    TimeOnly? PreferredDepartFrom,
    TimeOnly? PreferredDepartTo,
    int RadiusMeters = 800
);

public record NearbyListingsRequest(
    [Required] double Lat,
    [Required] double Lng,
    string? City,
    int RadiusMeters = 5000
);
