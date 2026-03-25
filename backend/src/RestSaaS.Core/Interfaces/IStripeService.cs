using RestSaaS.Core.Entities;

namespace RestSaaS.Core.Interfaces;

public interface IStripeService
{
    Task<string> CreateCustomerAsync(Guid restaurantId, string email, string name);
    Task<string> CreateSetupIntentAsync(string stripeCustomerId);
    Task<string> CreatePaymentIntentAsync(string stripeCustomerId, decimal amount, string currency, string description);
    Task<bool> HandleWebhookAsync(string json, string stripeSignature);
}
