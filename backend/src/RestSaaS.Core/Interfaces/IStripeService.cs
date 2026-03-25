using RestSaaS.Core.Entities;
using System.Threading.Tasks;

namespace RestSaaS.Core.Interfaces;

public interface IStripeService
{
    Task<string> CreateCustomerAsync(Guid restaurantId, string email, string name);
    Task<string> CreateSetupIntentAsync(string stripeCustomerId);
    Task<string> CreatePaymentIntentAsync(string stripeCustomerId, decimal amount, string currency, string description);
    Task<bool> HandleWebhookAsync(string json, string stripeSignature);
    
    // Subscription Management
    Task<string> CreateSubscriptionAsync(string stripeCustomerId, string priceId, string paymentMethodId);
    Task<bool> CancelSubscriptionAsync(string stripeSubscriptionId);
    Task<bool> UpdateSubscriptionAsync(string stripeSubscriptionId, string newPriceId);
    Task<object> GetSubscriptionAsync(string stripeSubscriptionId);
}
