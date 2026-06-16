using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace YolArkadashim.API.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger)
{
    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var smtp = config.GetSection("Smtp");
        var host = smtp["Host"];
        if (string.IsNullOrEmpty(host))
        {
            logger.LogWarning("SMTP yapılandırması eksik, e-posta gönderilmedi: {To}", toEmail);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                smtp["FromName"] ?? "WayMate",
                smtp["FromEmail"] ?? smtp["Username"]!));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(host, int.Parse(smtp["Port"] ?? "587"), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtp["Username"], smtp["Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            logger.LogInformation("E-posta gönderildi: {To}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "E-posta gönderilemedi: {To}", toEmail);
        }
    }

    public string BuildListingNotificationHtml(string userName, string driverName, string city, string homeAddr, string workAddr, string price, Guid listingId, string baseUrl) =>
        $"""
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0d9488,#06b6d4);padding:32px;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">🚗 Yeni İlan Bulundu!</h1>
          </div>
          <div style="padding:28px">
            <p style="color:#374151;font-size:15px">Merhaba <strong>{userName}</strong>,</p>
            <p style="color:#374151">Kaydettiğin arama kriterlerine uygun yeni bir ilan yayınlandı.</p>
            <div style="background:white;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
              <p style="margin:6px 0;color:#374151"><strong>Sürücü:</strong> {driverName}</p>
              <p style="margin:6px 0;color:#374151"><strong>Şehir:</strong> {city}</p>
              <p style="margin:6px 0;color:#374151"><strong>Güzergah:</strong> {homeAddr} → {workAddr}</p>
              <p style="margin:6px 0;color:#0d9488;font-size:18px;font-weight:bold">₺{price} / ay</p>
            </div>
            <a href="{baseUrl}/ilanlar/{listingId}"
               style="display:block;background:#0d9488;color:white;padding:14px;border-radius:10px;text-align:center;text-decoration:none;font-weight:bold;font-size:15px">
              İlanı İncele →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:20px;text-align:center">
              Bu bildirimi almak istemiyorsan <a href="{baseUrl}/profil" style="color:#0d9488">bildirim ayarlarından</a> kapatabilirsin.
            </p>
          </div>
        </div>
        """;
}
