using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.Models;

public class Vehicle
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    [MaxLength(50)]
    public string Brand { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    [MaxLength(20)]
    public string? Plate { get; set; }

    [MaxLength(30)]
    public string? Color { get; set; }
}
