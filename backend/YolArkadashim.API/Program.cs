using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using YolArkadashim.API.Data;
using YolArkadashim.API.Hubs;
using YolArkadashim.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Bulut host'ları (Render/Railway) dinamik PORT atar — onu dinle
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// PostgreSQL + PostGIS
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite()
    )
);

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // SignalR JWT desteği (query string token)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                var path = ctx.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(token) && path.StartsWithSegments("/hubs"))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();

// Services
builder.Services.AddScoped<TokenService>();
builder.Services.AddHttpClient<GoogleMapsService>();
builder.Services.AddHttpClient("google");
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<NviService>();
builder.Services.AddHttpClient("nvi", c => c.Timeout = TimeSpan.FromSeconds(20));

// Render uyku sorununa karşı self-ping (keep-alive)
builder.Services.AddHttpClient();
builder.Services.AddHostedService<KeepAliveService>();

// CORS — geliştirme + prodüksiyon origin'leri
// Prodüksiyonda Cors:AllowedOrigins ortam değişkeninden virgülle ayrılmış liste okunur
// (örn. Cors__AllowedOrigins = "https://www.waymate.com.tr,https://waymate.com.tr")
var configuredOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? [];

var allowedOrigins = new[]
{
    "http://localhost:3000",
    "http://localhost:3001",
    "https://www.waymate.com.tr",
    "https://waymate.com.tr",
}.Concat(configuredOrigins).Distinct().ToArray();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    )
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

// Sağlık kontrolü (Render health check)
app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

// Uygulama ilk başladığında migration'ları otomatik uygula
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();
