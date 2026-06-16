using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SavedSearchesController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<SavedSearchDto>>> GetAll()
    {
        var list = await db.SavedSearches
            .Where(s => s.UserId == CurrentUserId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(list.Select(ToDto));
    }

    [HttpPost]
    public async Task<ActionResult<SavedSearchDto>> Create(SaveSearchRequest request)
    {
        // Aynı arama zaten varsa güncelle
        var existing = await db.SavedSearches
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId
                && s.HomeAddressText == request.HomeAddressText
                && s.WorkAddressText == request.WorkAddressText);

        if (existing is not null)
        {
            existing.RadiusMeters = request.RadiusMeters;
            existing.EmailNotify = request.EmailNotify;
            existing.City = request.City;
            await db.SaveChangesAsync();
            return Ok(ToDto(existing));
        }

        var search = new SavedSearch
        {
            UserId = CurrentUserId,
            City = request.City,
            HomeLocation = new Point(request.HomeLng, request.HomeLat) { SRID = 4326 },
            WorkLocation = new Point(request.WorkLng, request.WorkLat) { SRID = 4326 },
            HomeAddressText = request.HomeAddressText,
            WorkAddressText = request.WorkAddressText,
            RadiusMeters = request.RadiusMeters,
            EmailNotify = request.EmailNotify,
        };

        db.SavedSearches.Add(search);
        await db.SaveChangesAsync();
        return Ok(ToDto(search));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var search = await db.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);
        if (search is null) return NotFound();

        db.SavedSearches.Remove(search);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static SavedSearchDto ToDto(SavedSearch s) => new(
        s.Id, s.City, s.HomeAddressText, s.WorkAddressText,
        s.RadiusMeters, s.EmailNotify, s.CreatedAt);
}
