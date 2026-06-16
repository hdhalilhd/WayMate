using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;
using YolArkadashim.API.Services;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, TokenService tokenService, IConfiguration config, IHttpClientFactory httpClientFactory) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (!request.AcceptedTerms)
            return BadRequest(new { message = "Kullanıcı sözleşmesini kabul etmelisiniz." });

        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict(new { message = "Bu e-posta adresi zaten kullanılıyor." });

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            AcceptedTermsAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new AuthResponse(
            tokenService.CreateToken(user),
            user.Id.ToString(),
            user.FullName,
            user.Email
        ));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        return Ok(new AuthResponse(
            tokenService.CreateToken(user),
            user.Id.ToString(),
            user.FullName,
            user.Email
        ));
    }

    // Access token ile Google kullanıcı bilgisi doğrula (frontend'den gelir)
    [HttpPost("google-access")]
    public async Task<ActionResult<AuthResponse>> GoogleAccessLogin(GoogleAccessRequest request)
    {
        var httpClient = httpClientFactory.CreateClient("google");
        // Google API'ye access token ile userinfo doğrula
        var verifyRes = await httpClient.GetAsync(
            $"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={request.AccessToken}");

        if (!verifyRes.IsSuccessStatusCode)
            return Unauthorized(new { message = "Geçersiz Google token." });

        var tokenInfo = await verifyRes.Content.ReadFromJsonAsync<JsonElement>();
        var tokenEmail = tokenInfo.GetProperty("email").GetString()?.ToLower();

        // Token'daki email, gönderilen email ile eşleşmeli
        if (tokenEmail != request.Email.ToLower())
            return Unauthorized(new { message = "Token doğrulaması başarısız." });

        var email = request.Email.ToLower();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            user = new User
            {
                FullName = request.FullName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                ProfilePhoto = request.Picture,
                IsVerified = true
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
        else if (request.Picture is not null && user.ProfilePhoto != request.Picture)
        {
            user.ProfilePhoto = request.Picture;
            await db.SaveChangesAsync();
        }

        return Ok(new AuthResponse(
            tokenService.CreateToken(user),
            user.Id.ToString(),
            user.FullName,
            user.Email
        ));
    }
}
