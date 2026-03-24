namespace RestSaaS.Core.Entities;

public class Settings : TenantEntity
{
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ThemeConfig { get; set; } = string.Empty; // JSON

    // Navigation
    public override Restaurant Restaurant { get; set; } = null!;
}

public class OpeningHours : TenantEntity
{
    public int DayOfWeek { get; set; } // 0=Sunday, 6=Saturday
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }

    // Navigation
    public override Restaurant Restaurant { get; set; } = null!;
}