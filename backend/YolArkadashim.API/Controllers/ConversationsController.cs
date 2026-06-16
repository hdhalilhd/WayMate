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
public class ConversationsController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ConversationDto>>> GetAll()
    {
        var convs = await db.Conversations
            .Include(c => c.Driver)
            .Include(c => c.Rider)
            .Include(c => c.MatchRequest)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .ThenInclude(m => m.Sender)
            .Where(c => c.DriverId == CurrentUserId || c.RiderId == CurrentUserId)
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? c.CreatedAt)
            .ToListAsync();

        return Ok(convs.Select(c =>
        {
            var last = c.Messages.FirstOrDefault();
            MessageDto? lastMsg = last is null ? null : new MessageDto(
                last.Id, last.ConversationId, last.SenderId,
                last.Sender.FullName, last.Content, last.SentAt);

            return new ConversationDto(
                c.Id, c.MatchRequestId,
                c.DriverId, c.Driver.FullName, c.Driver.ProfilePhoto,
                c.Driver.IsEmailVerified, c.Driver.IsTcVerified,
                c.RiderId, c.Rider.FullName, c.Rider.ProfilePhoto,
                c.Rider.IsEmailVerified, c.Rider.IsTcVerified,
                c.MatchRequest.Status.ToString(), lastMsg);
        }));
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid id, [FromQuery] int page = 1)
    {
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == id
                && (c.DriverId == CurrentUserId || c.RiderId == CurrentUserId));

        if (conversation is null) return NotFound();

        var messages = await db.Messages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == id)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * 50)
            .Take(50)
            .ToListAsync();

        return Ok(messages
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageDto(
                m.Id, m.ConversationId, m.SenderId,
                m.Sender.FullName, m.Content, m.SentAt)));
    }
}
