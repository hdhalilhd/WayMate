using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetAll()
    {
        var list = await db.Notifications
            .Where(n => n.UserId == CurrentUserId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(list.Select(n => new NotificationDto(
            n.Id, n.Title, n.Body, n.ListingId, n.IsRead, n.CreatedAt)));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> UnreadCount() =>
        Ok(await db.Notifications.CountAsync(n => n.UserId == CurrentUserId && !n.IsRead));

    [HttpPost("read-all")]
    public async Task<IActionResult> ReadAll()
    {
        await db.Notifications
            .Where(n => n.UserId == CurrentUserId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return NoContent();
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> Read(Guid id)
    {
        var n = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId);
        if (n is null) return NotFound();
        n.IsRead = true;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
