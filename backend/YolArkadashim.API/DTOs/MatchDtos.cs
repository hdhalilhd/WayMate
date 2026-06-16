using System.ComponentModel.DataAnnotations;

namespace YolArkadashim.API.DTOs;

public record SendMatchRequestDto(
    [Required] Guid ListingId,
    [MaxLength(500)] string? InitialMessage
);

public record MatchRequestDto(
    Guid Id,
    Guid ListingId,
    string DriverName,
    string RiderName,
    string? RiderPhoto,
    string Status,
    string? InitialMessage,
    DateTime RequestedAt,
    Guid? ConversationId
);

public record ContactDto(
    string? Phone,
    string? Email,
    bool IsShared
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string Content,
    DateTime SentAt
);

public record SendMessageDto(
    [Required] Guid ConversationId,
    [Required, MaxLength(2000)] string Content
);

public record ConversationDto(
    Guid Id,
    Guid MatchRequestId,
    Guid DriverId,
    string DriverName,
    string? DriverPhoto,
    bool DriverEmailVerified,
    bool DriverTcVerified,
    Guid RiderId,
    string RiderName,
    string? RiderPhoto,
    bool RiderEmailVerified,
    bool RiderTcVerified,
    string MatchStatus,
    MessageDto? LastMessage
);
