namespace YolArkadashim.API.Services;

/// <summary>
/// Render ücretsiz planı 15 dk hareketsizlikten sonra servisi uykuya alır ve
/// sonraki ilk istek ~50 sn sürer. Bu servis, kendi public URL'ine periyodik
/// olarak /health isteği atarak servisi uyanık tutar (self-ping).
/// Yalnızca Render'da RENDER_EXTERNAL_URL ortam değişkeni varsa çalışır.
/// </summary>
public class KeepAliveService(IHttpClientFactory httpClientFactory, ILogger<KeepAliveService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var baseUrl = Environment.GetEnvironmentVariable("RENDER_EXTERNAL_URL");
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            logger.LogInformation("KeepAlive devre dışı (RENDER_EXTERNAL_URL tanımlı değil — yerel ortam).");
            return;
        }

        var url = $"{baseUrl.TrimEnd('/')}/health";
        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);

        // İlk ping'ten önce uygulamanın tam ayağa kalkmasını bekle
        try { await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await client.GetAsync(url, stoppingToken);
                logger.LogInformation("KeepAlive ping → {Url}", url);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "KeepAlive ping başarısız: {Url}", url);
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
