using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YolArkadashim.API.Data;
using YolArkadashim.API.DTOs;
using YolArkadashim.API.Models;

namespace YolArkadashim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(CreateReportRequest request)
    {
        if (request.ReportedUserId is null && request.ListingId is null)
            return BadRequest(new { message = "Şikayet edilen kullanıcı veya ilan belirtilmeli." });

        if (request.ReportedUserId == CurrentUserId)
            return BadRequest(new { message = "Kendinizi şikayet edemezsiniz." });

        var report = new Report
        {
            ReporterId = CurrentUserId,
            ReportedUserId = request.ReportedUserId,
            ListingId = request.ListingId,
            Reasons = string.Join(",", request.Reasons),
            Description = request.Description,
        };

        db.Reports.Add(report);
        await db.SaveChangesAsync();

        return Ok(new { message = "Şikayetiniz alındı. En kısa sürede incelenecektir." });
    }
}
