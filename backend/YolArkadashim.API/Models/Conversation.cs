namespace YolArkadashim.API.Models;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MatchRequestId { get; set; }
    public MatchRequest MatchRequest { get; set; } = null!;

    public Guid DriverId { get; set; }
    public User Driver { get; set; } = null!;

    public Guid RiderId { get; set; }
    public User Rider { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Message> Messages { get; set; } = [];
}
