using RestSaaS.Core.Entities;
using RestSaaS.Core.DTOs;

namespace RestSaaS.Core.Interfaces;

public interface IBillingService
{
    Task<BillingSummaryDto> GetBillingSummaryAsync(Guid restaurantId);
    Task<BillingInfo?> GetBillingInfoAsync(Guid restaurantId);
    Task UpdateBillingInfoAsync(Guid restaurantId, BillingInfo info);
    Task<List<PaymentMethod>> GetPaymentMethodsAsync(Guid restaurantId);
    Task AddPaymentMethodAsync(Guid restaurantId, PaymentMethod method);
    Task DeletePaymentMethodAsync(Guid restaurantId, Guid methodId);
    Task SetDefaultPaymentMethodAsync(Guid restaurantId, Guid methodId);
    Task<List<Invoice>> GetInvoicesAsync(Guid restaurantId);
    Task ProcessSubscriptionRenewalAsync(Guid subscriptionId);
    Task<Invoice> GenerateTrialInvoiceAsync(Guid restaurantId, Guid planId);
}
