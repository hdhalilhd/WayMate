using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.DTOs;

public record UserProfileDto(
    string Id,
    string FullName,
    string Email,
    string? Phone,
    string? ProfilePhoto,
    bool IsVerified,
    bool IsEmailVerified,
    bool IsTcVerified,
    DateTime CreatedAt
);

public record VerifyEmailRequest(
    [Required, MaxLength(6)] string Code
);

public record VerifyTcRequest(
    [Required] string TcNo,
    [Required] string FirstName,
    [Required] string LastName,
    [Required, Range(1900, 2025)] int BirthYear
);

public record UpdateProfileRequest(
    [Required, MaxLength(100)] string FullName,
    [MaxLength(20)] string? Phone
);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(6)] string NewPassword
);
