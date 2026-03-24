namespace RestSaaS.Core.Entities;

public class Reservation : TenantEntity
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int PartySize { get; set; }
    public DateTime ReservationTime { get; set; }

    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
