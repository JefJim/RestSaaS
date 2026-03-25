namespace RestSaaS.Core.DTOs;

public class BillingSummaryDto
{
    public string PlanName { get; set; } = string.Empty;
    public decimal PlanPrice { get; set; }
    public DateTime? NextBillingDate { get; set; }
    public LastPaymentDto? LastPayment { get; set; }
}

public class LastPaymentDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
}

public class BillingInfoDto
{
    public string LegalName { get; set; } = string.Empty;
    public string TaxId { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class PaymentMethodDto
{
    public Guid Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public bool IsDefault { get; set; }
}
