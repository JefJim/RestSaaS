namespace RestSaaS.Core.Entities;

public class PaymentMethod : TenantEntity
{
    public string Provider { get; set; } = "Stripe";
    public string ProviderId { get; set; } = string.Empty; // Token or ID from provider
    public string Last4 { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public bool IsDefault { get; set; }
}
