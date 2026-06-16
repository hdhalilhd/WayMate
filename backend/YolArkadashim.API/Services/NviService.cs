using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace YolArkadashim.API.Services;

/// <summary>
/// TC Kimlik No doğrulama — NVI (Nüfus ve Vatandaşlık İşleri) resmi açık servisi.
/// Ücretsizdir. TC + Ad + Soyad + Doğum yılı eşleşmesini true/false döner,
/// kişinin bilgilerini DÖNDÜRMEZ.
/// </summary>
public partial class NviService(IHttpClientFactory httpClientFactory, ILogger<NviService> logger)
{
    private const string ServiceUrl = "https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx";

    /// <summary>TC No'nun matematiksel (checksum) geçerliliğini kontrol eder — ağ gerektirmez.</summary>
    public static bool IsValidFormat(string? tc)
    {
        if (string.IsNullOrWhiteSpace(tc) || !MyRegex().IsMatch(tc)) return false;
        var d = tc.Select(c => c - '0').ToArray();
        if (d[0] == 0) return false;

        int oddSum = d[0] + d[2] + d[4] + d[6] + d[8];   // 1,3,5,7,9. haneler
        int evenSum = d[1] + d[3] + d[5] + d[7];          // 2,4,6,8. haneler
        int digit10 = ((oddSum * 7) - evenSum) % 10;
        if (digit10 < 0) digit10 += 10;
        if (digit10 != d[9]) return false;

        int sumFirst10 = d.Take(10).Sum();
        return sumFirst10 % 10 == d[10];
    }

    /// <summary>NVI üzerinden resmi doğrulama. true = eşleşiyor.</summary>
    public async Task<bool> VerifyAsync(string tcNo, string firstName, string lastName, int birthYear)
    {
        if (!IsValidFormat(tcNo)) return false;

        var tr = new CultureInfo("tr-TR");
        var ad = firstName.Trim().ToUpper(tr);
        var soyad = lastName.Trim().ToUpper(tr);

        var soap = $"""
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
              <TCKimlikNo>{tcNo}</TCKimlikNo>
              <Ad>{System.Security.SecurityElement.Escape(ad)}</Ad>
              <Soyad>{System.Security.SecurityElement.Escape(soyad)}</Soyad>
              <DogumYili>{birthYear}</DogumYili>
            </TCKimlikNoDogrula>
          </soap:Body>
        </soap:Envelope>
        """;

        try
        {
            var client = httpClientFactory.CreateClient("nvi");
            using var content = new StringContent(soap, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula");

            var resp = await client.PostAsync(ServiceUrl, content);
            var body = await resp.Content.ReadAsStringAsync();

            // <TCKimlikNoDogrulaResult>true</TCKimlikNoDogrulaResult>
            return body.Contains("<TCKimlikNoDogrulaResult>true</TCKimlikNoDogrulaResult>", StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "NVI doğrulama hatası");
            return false;
        }
    }

    [GeneratedRegex(@"^\d{11}$")]
    private static partial Regex MyRegex();
}
