using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;
using YolArkadashim.API.Services;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(AppDbContext db, EmailService emailService, NviService nviService) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static UserProfileDto ToDto(User u) => new(
        u.Id.ToString(), u.FullName, u.Email, u.Phone, u.ProfilePhoto,
        u.IsVerified, u.IsEmailVerified, u.IsTcVerified, u.CreatedAt);

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMe()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();
        return Ok(ToDto(user));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();

        user.FullName = request.FullName;
        user.Phone = request.Phone;
        await db.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Mevcut şifre hatalı." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await db.SaveChangesAsync();
        return Ok(new { message = "Şifre başarıyla güncellendi." });
    }

    // ── E-POSTA DOĞRULAMA ────────────────────────────────────────────────

    [HttpPost("me/send-email-code")]
    public async Task<IActionResult> SendEmailCode()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();
        if (user.IsEmailVerified) return BadRequest(new { message = "E-posta zaten doğrulanmış." });

        var code = Random.Shared.Next(100000, 999999).ToString();
        user.EmailVerifyCode = code;
        user.EmailVerifyExpiresAt = DateTime.UtcNow.AddMinutes(15);
        await db.SaveChangesAsync();

        var html = $"""
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0d9488,#22d3ee);padding:28px;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">WayMate E-posta Doğrulama</h1>
          </div>
          <div style="padding:28px;text-align:center">
            <p style="color:#374151">Merhaba {user.FullName}, doğrulama kodun:</p>
            <div style="font-size:38px;font-weight:bold;letter-spacing:8px;color:#0d9488;margin:18px 0">{code}</div>
            <p style="color:#9ca3af;font-size:13px">Bu kod 15 dakika geçerlidir. Sen istemediysen bu e-postayı yok say.</p>
          </div>
        </div>
        """;
        await emailService.SendAsync(user.Email, user.FullName, "WayMate doğrulama kodun: " + code, html);

        return Ok(new { message = "Doğrulama kodu e-posta adresine gönderildi." });
    }

    [HttpPost("me/verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();
        if (user.IsEmailVerified) return Ok(new { message = "Zaten doğrulanmış." });

        if (user.EmailVerifyCode is null || user.EmailVerifyExpiresAt is null ||
            user.EmailVerifyExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Kodun süresi dolmuş. Yeni kod iste." });

        if (user.EmailVerifyCode != request.Code.Trim())
            return BadRequest(new { message = "Kod hatalı." });

        user.IsEmailVerified = true;
        user.EmailVerifyCode = null;
        user.EmailVerifyExpiresAt = null;
        await db.SaveChangesAsync();

        return Ok(new { message = "E-posta başarıyla doğrulandı." });
    }

    // ── TC KİMLİK DOĞRULAMA (NVI) ────────────────────────────────────────

    [HttpPost("me/verify-tc")]
    public async Task<IActionResult> VerifyTc(VerifyTcRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();
        if (user.IsTcVerified) return Ok(new { message = "TC kimlik zaten doğrulanmış." });

        if (!NviService.IsValidFormat(request.TcNo))
            return BadRequest(new { message = "Geçersiz TC kimlik numarası." });

        var ok = await nviService.VerifyAsync(request.TcNo, request.FirstName, request.LastName, request.BirthYear);
        if (!ok)
            return BadRequest(new { message = "Bilgiler kimlik kayıtlarıyla eşleşmedi. Ad, soyad ve doğum yılını kontrol et." });

        // KVKK: TC No saklanmaz, yalnızca doğrulama sonucu tutulur
        user.IsTcVerified = true;
        user.TcVerifiedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "TC kimlik başarıyla doğrulandı." });
    }
}
