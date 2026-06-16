using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public string? ProfilePhoto { get; set; }

    public bool IsVerified { get; set; } = false;

    // E-posta doğrulama
    public bool IsEmailVerified { get; set; } = false;
    [MaxLength(6)]
    public string? EmailVerifyCode { get; set; }
    public DateTime? EmailVerifyExpiresAt { get; set; }

    // TC Kimlik doğrulama (NVI) — KVKK gereği TC No saklanmaz, sadece sonuç
    public bool IsTcVerified { get; set; } = false;
    public DateTime? TcVerifiedAt { get; set; }

    // Kullanıcı sözleşmesi onayı
    public DateTime? AcceptedTermsAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Listing> Listings { get; set; } = [];
    public RiderProfile? RiderProfile { get; set; }
    public Vehicle? Vehicle { get; set; }
}
