using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;
using YolArkadashim.API.Services;

namespace YolArkadashim.API.Hubs;

[Authorize]
public class ChatHub(AppDbContext db, EmailService emailService, IConfiguration config) : Hub
{
    // Online kullanıcıları takip et (userId -> aktif bağlantı sayısı)
    private static readonly ConcurrentDictionary<Guid, int> OnlineUsers = new();

    private Guid CurrentUserId =>
        Guid.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public override async Task OnConnectedAsync()
    {
        OnlineUsers.AddOrUpdate(CurrentUserId, 1, (_, c) => c + 1);

        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{CurrentUserId}");

        var convIds = await db.Conversations
            .Where(c => c.DriverId == CurrentUserId || c.RiderId == CurrentUserId)
            .Select(c => c.Id.ToString())
            .ToListAsync();

        foreach (var groupId in convIds)
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        OnlineUsers.AddOrUpdate(CurrentUserId, 0, (_, c) => Math.Max(0, c - 1));
        await base.OnDisconnectedAsync(exception);
    }

    private static bool IsOnline(Guid userId) =>
        OnlineUsers.TryGetValue(userId, out var c) && c > 0;

    public async Task SendMessage(Guid conversationId, string content)
    {
        if (string.IsNullOrWhiteSpace(content) || content.Length > 2000)
            throw new HubException("Geçersiz mesaj içeriği.");

        var conversation = await db.Conversations
            .Include(c => c.MatchRequest)
            .FirstOrDefaultAsync(c => c.Id == conversationId
                && (c.DriverId == CurrentUserId || c.RiderId == CurrentUserId));

        if (conversation is null)
            throw new HubException("Konuşma bulunamadı veya erişim izniniz yok.");

        if (conversation.MatchRequest.Status is MatchStatus.Rejected or MatchStatus.Cancelled)
            throw new HubException("Bu konuşma kapatılmış.");

        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = CurrentUserId,
            Content = content.Trim()
        };

        db.Messages.Add(message);
        await db.SaveChangesAsync();

        var sender = await db.Users.FindAsync(CurrentUserId);
        var dto = new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderId,
            sender!.FullName,
            message.Content,
            message.SentAt
        );

        await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", dto);

        // Alıcı çevrimdışıysa e-posta bildirimi gönder
        var recipientId = conversation.DriverId == CurrentUserId
            ? conversation.RiderId : conversation.DriverId;

        if (!IsOnline(recipientId))
        {
            var recipient = await db.Users.FindAsync(recipientId);
            if (recipient is not null)
            {
                var baseUrl = config["App:BaseUrl"] ?? "http://localhost:3000";
                var preview = message.Content.Length > 120 ? message.Content[..120] + "…" : message.Content;
                var html = $"""
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden">
                  <div style="background:linear-gradient(135deg,#0d9488,#22d3ee);padding:26px;text-align:center">
                    <h1 style="color:white;margin:0;font-size:20px">💬 Yeni mesajın var</h1>
                  </div>
                  <div style="padding:26px">
                    <p style="color:#374151"><b>{sender.FullName}</b> sana WayMate üzerinden mesaj gönderdi:</p>
                    <div style="background:white;border-left:3px solid #0d9488;border-radius:8px;padding:14px;margin:16px 0;color:#374151">{System.Net.WebUtility.HtmlEncode(preview)}</div>
                    <a href="{baseUrl}/mesaj?id={conversationId}" style="display:block;background:#0d9488;color:white;padding:13px;border-radius:10px;text-align:center;text-decoration:none;font-weight:bold">Mesaja Yanıt Ver →</a>
                  </div>
                </div>
                """;
                // Bloklamadan gönder
                _ = emailService.SendAsync(recipient.Email, recipient.FullName,
                    $"{sender.FullName} sana mesaj gönderdi · WayMate", html);
            }
        }
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var exists = await db.Conversations.AnyAsync(
            c => c.Id == conversationId
              && (c.DriverId == CurrentUserId || c.RiderId == CurrentUserId));

        if (!exists) throw new HubException("Erişim izniniz yok.");

        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
    }
}
