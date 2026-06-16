using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.Models;

public enum MatchStatus
{
    Pending,
    Accepted,
    Rejected,
    Cancelled,
    ContactShared
}

public class MatchRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ListingId { get; set; }
    public Listing Listing { get; set; } = null!;

    public Guid RiderId { get; set; }
    public User Rider { get; set; } = null!;

    public MatchStatus Status { get; set; } = MatchStatus.Pending;

    [MaxLength(500)]
    public string? InitialMessage { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ContactSharedAt { get; set; }

    public Conversation? Conversation { get; set; }
}
