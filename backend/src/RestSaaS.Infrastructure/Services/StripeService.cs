using Microsoft.Extensions.Configuration;
using RestSaaS.Core.Interfaces;
using Stripe;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RestSaaS.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly string _secretKey;

    public StripeService(IConfiguration configuration)
    {
        _secretKey = configuration["Stripe:SecretKey"] ?? throw new ArgumentNullException("Stripe Secret Key is missing");
        StripeConfiguration.ApiKey = _secretKey;
    }

    public async Task<string> CreateCustomerAsync(Guid restaurantId, string email, string name)
    {
        var options = new CustomerCreateOptions
        {
            Email = email,
            Name = name,
            Metadata = new Dictionary<string, string>
            {
                { "RestaurantId", restaurantId.ToString() }
            }
        };

        var service = new CustomerService();
        var customer = await service.CreateAsync(options);
        return customer.Id;
    }

    public async Task<string> CreateSetupIntentAsync(string stripeCustomerId)
    {
        var options = new SetupIntentCreateOptions
        {
            Customer = stripeCustomerId,
            PaymentMethodTypes = new List<string> { "card" }
        };

        var service = new SetupIntentService();
        var setupIntent = await service.CreateAsync(options);
        return setupIntent.ClientSecret;
    }

    public async Task<string> CreatePaymentIntentAsync(string stripeCustomerId, decimal amount, string currency, string description)
    {
        var options = new PaymentIntentCreateOptions
        {
            Customer = stripeCustomerId,
            Amount = (long)(amount * 100), // Stripe expects amounts in cents
            Currency = currency.ToLower(),
            Description = description,
            PaymentMethodTypes = new List<string> { "card" }
        };

        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);
        return paymentIntent.ClientSecret;
    }

    public async Task<bool> HandleWebhookAsync(string json, string stripeSignature)
    {
        // This will be implemented when we need real-time sync
        // For now, we'll focus on the client-side flow
        return await Task.FromResult(true);
    }
}
