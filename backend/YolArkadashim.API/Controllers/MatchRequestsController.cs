using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Hubs;
using YolArkadashim.API.Models;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MatchRequestsController(
    AppDbContext db,
    IHubContext<ChatHub> hubContext) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Rider: istek gönder
    [HttpPost]
    public async Task<ActionResult<MatchRequestDto>> Send(SendMatchRequestDto request)
    {
        var listing = await db.Listings.Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == request.ListingId);

        if (listing is null) return NotFound("İlan bulunamadı.");
        if (listing.UserId == CurrentUserId) return BadRequest("Kendi ilanınıza istek gönderemezsiniz.");
        if (listing.Status != ListingStatus.Active) return BadRequest("Bu ilan aktif değil.");

        var existing = await db.MatchRequests.FirstOrDefaultAsync(
            m => m.ListingId == request.ListingId && m.RiderId == CurrentUserId);
        if (existing is not null) return Conflict("Bu ilana zaten istek gönderdiniz.");

        var match = new MatchRequest
        {
            ListingId = request.ListingId,
            RiderId = CurrentUserId,
            InitialMessage = request.InitialMessage
        };

        db.MatchRequests.Add(match);
        await db.SaveChangesAsync();

        var rider = await db.Users.FindAsync(CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = match.Id },
            ToDto(match, listing, rider!));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MatchRequestDto>> GetById(Guid id)
    {
        var match = await db.MatchRequests
            .Include(m => m.Listing).ThenInclude(l => l.User)
            .Include(m => m.Rider)
            .Include(m => m.Conversation)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (match is null) return NotFound();

        var isParticipant = match.RiderId == CurrentUserId || match.Listing.UserId == CurrentUserId;
        if (!isParticipant) return Forbid();

        return Ok(ToDto(match, match.Listing, match.Rider));
    }

    // Driver: gelen istekleri gör
    [HttpGet("received")]
    public async Task<ActionResult<List<MatchRequestDto>>> GetReceived()
    {
        var matches = await db.MatchRequests
            .Include(m => m.Listing).ThenInclude(l => l.User)
            .Include(m => m.Rider)
            .Include(m => m.Conversation)
            .Where(m => m.Listing.UserId == CurrentUserId)
            .OrderByDescending(m => m.RequestedAt)
            .ToListAsync();

        return Ok(matches.Select(m => ToDto(m, m.Listing, m.Rider)));
    }

    // Rider: gönderdiği istekleri gör
    [HttpGet("sent")]
    public async Task<ActionResult<List<MatchRequestDto>>> GetSent()
    {
        var matches = await db.MatchRequests
            .Include(m => m.Listing).ThenInclude(l => l.User)
            .Include(m => m.Rider)
            .Include(m => m.Conversation)
            .Where(m => m.RiderId == CurrentUserId)
            .OrderByDescending(m => m.RequestedAt)
            .ToListAsync();

        return Ok(matches.Select(m => ToDto(m, m.Listing, m.Rider)));
    }

    // Driver: kabul et → konuşma başlat
    [HttpPost("{id:guid}/accept")]
    public async Task<ActionResult<MatchRequestDto>> Accept(Guid id)
    {
        var match = await db.MatchRequests
            .Include(m => m.Listing).ThenInclude(l => l.User)
            .Include(m => m.Rider)
            .Include(m => m.Conversation)
            .FirstOrDefaultAsync(m => m.Id == id && m.Listing.UserId == CurrentUserId);

        if (match is null) return NotFound();
        if (match.Status != MatchStatus.Pending) return BadRequest("Bu istek zaten işlendi.");

        match.Status = MatchStatus.Accepted;

        var conversation = new Conversation
        {
            MatchRequestId = match.Id,
            DriverId = match.Listing.UserId,
            RiderId = match.RiderId
        };

        db.Conversations.Add(conversation);
        match.Conversation = conversation;
        await db.SaveChangesAsync();

        // İlk mesajı varsa konuşmaya ekle
        if (!string.IsNullOrWhiteSpace(match.InitialMessage))
        {
            db.Messages.Add(new Message
            {
                ConversationId = conversation.Id,
                SenderId = match.RiderId,
                Content = match.InitialMessage
            });
            await db.SaveChangesAsync();
        }

        return Ok(ToDto(match, match.Listing, match.Rider));
    }

    // Driver: reddet
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var match = await db.MatchRequests
            .Include(m => m.Listing)
            .FirstOrDefaultAsync(m => m.Id == id && m.Listing.UserId == CurrentUserId);

        if (match is null) return NotFound();
        if (match.Status != MatchStatus.Pending) return BadRequest("Bu istek zaten işlendi.");

        match.Status = MatchStatus.Rejected;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Driver: iletişim bilgilerini paylaş
    [HttpPost("{id:guid}/share-contact")]
    public async Task<IActionResult> ShareContact(Guid id)
    {
        var match = await db.MatchRequests
            .Include(m => m.Listing)
            .Include(m => m.Conversation)
            .FirstOrDefaultAsync(m => m.Id == id && m.Listing.UserId == CurrentUserId);

        if (match is null) return NotFound();
        if (match.Status != MatchStatus.Accepted) return BadRequest("İletişim bilgisi paylaşmak için önce isteği kabul edin.");

        match.Status = MatchStatus.ContactShared;
        match.ContactSharedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Rider'a SignalR ile bildir
        if (match.Conversation is not null)
        {
            await hubContext.Clients
                .Group(match.Conversation.Id.ToString())
                .SendAsync("ContactShared");
        }

        return NoContent();
    }

    // İletişim bilgisini al (accepted veya contact_shared ise)
    [HttpGet("{id:guid}/contact")]
    public async Task<ActionResult<ContactDto>> GetContact(Guid id)
    {
        var match = await db.MatchRequests
            .Include(m => m.Listing).ThenInclude(l => l.User)
            .Include(m => m.Rider)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (match is null) return NotFound();

        var isParticipant = match.RiderId == CurrentUserId || match.Listing.UserId == CurrentUserId;
        if (!isParticipant) return Forbid();

        if (match.Status is MatchStatus.Pending or MatchStatus.Rejected or MatchStatus.Cancelled)
            return Forbid();

        bool isShared = match.Status == MatchStatus.ContactShared;

        // Rider, driver'ın; driver, rider'ın bilgisini görebilir
        var other = match.Listing.UserId == CurrentUserId ? match.Rider : match.Listing.User;

        return Ok(new ContactDto(
            isShared ? other.Phone : null,
            isShared ? other.Email : null,
            isShared
        ));
    }

    private static MatchRequestDto ToDto(MatchRequest m, Listing l, User rider) => new(
        m.Id, m.ListingId,
        l.User.FullName, rider.FullName, rider.ProfilePhoto,
        m.Status.ToString(), m.InitialMessage,
        m.RequestedAt, m.Conversation?.Id
    );
}
