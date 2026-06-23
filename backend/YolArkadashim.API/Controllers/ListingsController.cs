using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;
using YolArkadashim.API.Services;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListingsController(AppDbContext db, GoogleMapsService mapsService, NotificationService notificationService) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<ListingDto>> Create(CreateListingRequest request)
    {
        // Bir kullanıcı yalnızca 1 aktif/duraklatılmış ilan açabilir
        var hasListing = await db.Listings.AnyAsync(l =>
            l.UserId == CurrentUserId && l.Status != ListingStatus.Closed);
        if (hasListing)
            return Conflict(new { message = "Zaten bir ilanınız var. Yeni ilan açmak için mevcut ilanınızı kapatın." });

        var homePoint = MakePoint(request.HomeLocation.Lng, request.HomeLocation.Lat);
        var workPoint = MakePoint(request.WorkLocation.Lng, request.WorkLocation.Lat);

        var listing = new Listing
        {
            UserId = CurrentUserId,
            City = request.City,
            District = request.District,
            HomeLocation = homePoint,
            WorkLocation = workPoint,
            HomeAddressText = request.HomeLocation.AddressText,
            WorkAddressText = request.WorkLocation.AddressText,
            MorningDepartTime = request.MorningDepartTime,
            EveningDepartTime = request.EveningDepartTime,
            FlexibilityNote = request.FlexibilityNote,
            FlexibilityDaysPct = request.FlexibilityDaysPct,
            PricePerTrip = request.PricePerTrip,
            AvailableSeats = request.AvailableSeats,
            DeviationRadiusMeters = request.DeviationRadiusMeters
        };

        // Google Maps'ten rota polyline'ı hesapla (async, hata olursa devam et)
        try
        {
            listing.RoutePolyline = await mapsService.GetRoutePolylineAsync(homePoint, workPoint);
        }
        catch { /* Rota hesaplanamazsa ilan yine de oluşturulur */ }

        db.Listings.Add(listing);
        await db.SaveChangesAsync();

        var user = await db.Users.FindAsync(CurrentUserId);

        // Kayıtlı aramalara eşleşen kullanıcılara bildirim gönder (arka planda)
        _ = Task.Run(async () =>
        {
            listing.User = user!;
            await notificationService.NotifyMatchingSearchesAsync(listing);
        });

        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, ToDto(listing, user!, null, null));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ListingDto>> GetById(Guid id)
    {
        var listing = await db.Listings
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (listing is null) return NotFound();
        return Ok(ToDto(listing, listing.User, null, null));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<ListingDto>>> GetMine()
    {
        var listings = await db.Listings
            .Include(l => l.User)
            .Where(l => l.UserId == CurrentUserId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(listings.Select(l => ToDto(l, l.User, null, null)));
    }

    // Şehir/ilçe bazlı listeleme (rota gerekmez)
    [HttpGet("by-city")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ListingDto>>> ByCity([FromQuery] string? city, [FromQuery] string? district)
    {
        var query = db.Listings
            .Include(l => l.User)
            .Where(l => l.Status == ListingStatus.Active);

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(l => l.City == city);

        if (!string.IsNullOrWhiteSpace(district))
            query = query.Where(l => l.District == district);

        var listings = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(listings.Select(l => ToDto(l, l.User, null, null)));
    }

    // Bir kullanıcının aktif ilanları (herkese açık profil için)
    [HttpGet("by-user/{userId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ListingDto>>> ByUser(Guid userId)
    {
        var listings = await db.Listings
            .Include(l => l.User)
            .Where(l => l.UserId == userId && l.Status == ListingStatus.Active)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(listings.Select(l => ToDto(l, l.User, null, null)));
    }

    // PostGIS ile rota buffer eşleştirme sorgusu
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ListingDto>>> Search([FromQuery] SearchListingsRequest request)
    {
        var riderHome = MakePoint(request.RiderHomeLng, request.RiderHomeLat);
        var riderWork = MakePoint(request.RiderWorkLng, request.RiderWorkLat);

        var query = db.Listings
            .Include(l => l.User)
            .Where(l => l.Status == ListingStatus.Active)
            .Where(l => l.RoutePolyline != null)
            .Where(l => l.RoutePolyline!.IsWithinDistance(riderHome, l.DeviationRadiusMeters / 111320.0))
            .Where(l => l.RoutePolyline!.IsWithinDistance(riderWork, l.DeviationRadiusMeters / 111320.0));

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(l => l.City == request.City);

        // Saat filtresi
        if (request.PreferredDepartFrom.HasValue)
            query = query.Where(l => l.MorningDepartTime >= request.PreferredDepartFrom.Value);
        if (request.PreferredDepartTo.HasValue)
            query = query.Where(l => l.MorningDepartTime <= request.PreferredDepartTo.Value);

        var listings = await query
            .OrderBy(l => l.RoutePolyline!.Distance(riderHome))
            .Take(30)
            .ToListAsync();

        return Ok(listings.Select(l =>
        {
            double? homeDist = l.RoutePolyline?.Distance(riderHome) * 111320.0;
            double? workDist = l.RoutePolyline?.Distance(riderWork) * 111320.0;
            return ToDto(l, l.User, homeDist, workDist);
        }));
    }

    // İlanı düzenle (sadece sahibi)
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ListingDto>> Update(Guid id, CreateListingRequest request)
    {
        var listing = await db.Listings
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == CurrentUserId);
        if (listing is null) return NotFound();

        var homePoint = MakePoint(request.HomeLocation.Lng, request.HomeLocation.Lat);
        var workPoint = MakePoint(request.WorkLocation.Lng, request.WorkLocation.Lat);

        listing.City = request.City;
        listing.District = request.District;
        listing.HomeLocation = homePoint;
        listing.WorkLocation = workPoint;
        listing.HomeAddressText = request.HomeLocation.AddressText;
        listing.WorkAddressText = request.WorkLocation.AddressText;
        listing.MorningDepartTime = request.MorningDepartTime;
        listing.EveningDepartTime = request.EveningDepartTime;
        listing.FlexibilityNote = request.FlexibilityNote;
        listing.FlexibilityDaysPct = request.FlexibilityDaysPct;
        listing.PricePerTrip = request.PricePerTrip;
        listing.AvailableSeats = request.AvailableSeats;
        listing.DeviationRadiusMeters = request.DeviationRadiusMeters;

        // Güzergah değişmiş olabilir — polyline'ı yeniden hesapla
        try
        {
            listing.RoutePolyline = await mapsService.GetRoutePolylineAsync(homePoint, workPoint);
        }
        catch { /* Rota hesaplanamazsa eski hâliyle devam */ }

        await db.SaveChangesAsync();
        return Ok(ToDto(listing, listing.User, null, null));
    }

    // İlanı kalıcı olarak sil (sadece sahibi)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var listing = await db.Listings.FirstOrDefaultAsync(l => l.Id == id && l.UserId == CurrentUserId);
        if (listing is null) return NotFound();

        db.Listings.Remove(listing);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var listing = await db.Listings.FirstOrDefaultAsync(l => l.Id == id && l.UserId == CurrentUserId);
        if (listing is null) return NotFound();

        if (!Enum.TryParse<ListingStatus>(status, true, out var newStatus))
            return BadRequest("Geçersiz durum değeri.");

        listing.Status = newStatus;
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static Point MakePoint(double lng, double lat) =>
        new(lng, lat) { SRID = 4326 };

    // Yakınımdaki ilanlar: kullanıcının konumuna yakın ev noktası olan ilanlar
    [HttpGet("nearby")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ListingDto>>> Nearby([FromQuery] NearbyListingsRequest request)
    {
        var userPoint = MakePoint(request.Lng, request.Lat);
        double radiusDeg = request.RadiusMeters / 111320.0;

        var query = db.Listings
            .Include(l => l.User)
            .Where(l => l.Status == ListingStatus.Active)
            .Where(l => l.HomeLocation.IsWithinDistance(userPoint, radiusDeg));

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(l => l.City == request.City);

        var listings = await query
            .OrderBy(l => l.HomeLocation.Distance(userPoint))
            .Take(30)
            .ToListAsync();

        return Ok(listings.Select(l =>
        {
            double? dist = l.HomeLocation.Distance(userPoint) * 111320.0;
            return ToDto(l, l.User, dist, null);
        }));
    }

    private static ListingDto ToDto(Listing l, User u, double? homeDist, double? workDist) => new(
        l.Id, l.UserId, u.FullName, u.ProfilePhoto, l.City, l.District,
        u.IsEmailVerified, u.IsTcVerified,
        new LocationDto(l.HomeLocation.Y, l.HomeLocation.X, l.HomeAddressText),
        new LocationDto(l.WorkLocation.Y, l.WorkLocation.X, l.WorkAddressText),
        l.MorningDepartTime, l.EveningDepartTime,
        l.FlexibilityNote, l.FlexibilityDaysPct,
        l.PricePerTrip, l.AvailableSeats, l.DeviationRadiusMeters,
        l.Status.ToString(), l.CreatedAt,
        homeDist, workDist
    );
}
