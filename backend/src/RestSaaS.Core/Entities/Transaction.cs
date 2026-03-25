namespace RestSaaS.Core.Entities;

public class Transaction : TenantEntity
{
    public Guid? InvoiceId { get; set; }
    public virtual Invoice? Invoice { get; set; }
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = "Success"; // Success, Failed, Refunded
    
    public string Provider { get; set; } = string.Empty;
    public string ProviderTransactionId { get; set; } = string.Empty;
    public string? Metadata { get; set; } // JSON
    
    // Stripe Integration
    public string? StripePaymentIntentId { get; set; }
}
