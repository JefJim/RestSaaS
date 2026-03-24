namespace RestSaaS.Core.DTOs;

public class PublicRestaurantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public RestaurantSettingsDto Settings { get; set; } = new();
    public List<OpeningHourDto> OpeningHours { get; set; } = new();
}

public class RestaurantSettingsDto
{
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ThemeConfig { get; set; } = string.Empty; // JSON string for now
}

public class OpeningHourDto
{
    public int DayOfWeek { get; set; }
    public string DayName { get; set; } = string.Empty;
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }
}

public class PublicMenuDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<PublicCategoryDto> Categories { get; set; } = new();
}

public class PublicCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<PublicMenuItemDto> Items { get; set; } = new();
}

public class PublicMenuItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}

public class CreateReservationDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int PartySize { get; set; }
    public DateTime ReservationTime { get; set; }
}

public class ReservationDto
{
    public Guid Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int PartySize { get; set; }
    public DateTime ReservationTime { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

public class UpdateReservationStatusDto
{
    public string Status { get; set; } = string.Empty; // Pending, Confirmed, Cancelled, Completed
}