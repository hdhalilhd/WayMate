using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.DTOs;

public record RegisterRequest(
    [Required, MaxLength(100)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    string? Phone,
    bool AcceptedTerms = false
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    string UserId,
    string FullName,
    string Email
);

public record GoogleLoginRequest(
    [Required] string IdToken
);

public record GoogleAccessRequest(
    [Required] string AccessToken,
    [Required] string Email,
    [Required] string FullName,
    string? Picture,
    string? GoogleId
);
