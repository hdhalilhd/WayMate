using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using YolArkadashim.API.Data;
using YolArkadashim.API.Hubs;
using YolArkadashim.API.Models;

namespace YolArkadashim.API.Services;

public class NotificationService(
    AppDbContext db,
    EmailService emailService,
    IHubContext<ChatHub> hubContext,
    IConfiguration config)
{
    public async Task NotifyMatchingSearchesAsync(Listing listing)
    {
        if (listing.RoutePolyline is null) return;

        // Kayıtlı aramaları bul — şehir ve konum eşleşenler
        var savedSearches = await db.SavedSearches
            .Include(s => s.User)
            .Where(s => s.UserId != listing.UserId) // kendi ilanı için bildirim yok
            .Where(s => s.City == null || s.City == listing.City)
            .Where(s => listing.RoutePolyline.IsWithinDistance(s.HomeLocation, s.RadiusMeters / 111320.0))
            .Where(s => listing.RoutePolyline.IsWithinDistance(s.WorkLocation, s.RadiusMeters / 111320.0))
            .ToListAsync();

        if (savedSearches.Count == 0) return;

        var baseUrl = config["App:BaseUrl"] ?? "http://localhost:3000";
        var monthlyPrice = Math.Round(listing.PricePerTrip * 22).ToString();

        var notifications = savedSearches.Select(s => new Notification
        {
            UserId = s.UserId,
            Title = "Yeni ilan: güzergahına uygun araç var!",
            Body = $"{listing.City} - {listing.HomeAddressText} → {listing.WorkAddressText} · ₺{monthlyPrice}/ay",
            ListingId = listing.Id,
        }).ToList();

        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync();

        // SignalR ile anlık bildirim gönder
        foreach (var n in notifications)
        {
            await hubContext.Clients
                .Group($"user-{n.UserId}")
                .SendAsync("NewNotification", new
                {
                    id = n.Id,
                    title = n.Title,
                    body = n.Body,
                    listingId = n.ListingId,
                    createdAt = n.CreatedAt
                });
        }

        // E-posta bildirimleri
        var emailTasks = savedSearches
            .Where(s => s.EmailNotify)
            .Select(s =>
            {
                var html = emailService.BuildListingNotificationHtml(
                    s.User.FullName, listing.User?.FullName ?? "Sürücü",
                    listing.City, listing.HomeAddressText, listing.WorkAddressText,
                    monthlyPrice, listing.Id, baseUrl);
                return emailService.SendAsync(s.User.Email, s.User.FullName,
                    "🚗 WayMate: Güzergahına uygun yeni ilan!", html);
            });

        await Task.WhenAll(emailTasks);
    }
}
