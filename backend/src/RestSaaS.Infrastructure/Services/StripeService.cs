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
    private readonly string _webhookSecret;

    public StripeService(IConfiguration configuration)
    {
        _secretKey = configuration["Stripe:SecretKey"] ?? throw new ArgumentNullException("Stripe Secret Key is missing");
        _webhookSecret = configuration["Stripe:WebhookSecret"] ?? "";
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

    public async Task<string> CreateSubscriptionAsync(string stripeCustomerId, string priceId, string paymentMethodId)
    {
        // Attach payment method to customer
        var paymentMethodService = new PaymentMethodService();
        await paymentMethodService.AttachAsync(paymentMethodId, new PaymentMethodAttachOptions
        {
            Customer = stripeCustomerId,
        });

        // Set as default payment method
        var customerService = new CustomerService();
        await customerService.UpdateAsync(stripeCustomerId, new CustomerUpdateOptions
        {
            InvoiceSettings = new CustomerInvoiceSettingsOptions
            {
                DefaultPaymentMethod = paymentMethodId,
            },
        });

        // Create subscription
        var subscriptionOptions = new SubscriptionCreateOptions
        {
            Customer = stripeCustomerId,
            Items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions
                {
                    Price = priceId,
                },
            },
            DefaultPaymentMethod = paymentMethodId,
            Expand = new List<string> { "latest_invoice.payment_intent" },
        };

        var subscriptionService = new Stripe.SubscriptionService();
        var subscription = await subscriptionService.CreateAsync(subscriptionOptions);
        return subscription.Id;
    }

    public async Task<bool> CancelSubscriptionAsync(string stripeSubscriptionId)
    {
        var service = new Stripe.SubscriptionService();
        var subscription = await service.CancelAsync(stripeSubscriptionId);
        return subscription.Status == "canceled";
    }

    public async Task<bool> UpdateSubscriptionAsync(string stripeSubscriptionId, string newPriceId)
    {
        var service = new Stripe.SubscriptionService();
        
        // Get current subscription
        var subscription = await service.GetAsync(stripeSubscriptionId);
        
        // Update the subscription item with new price
        var item = subscription.Items.Data[0];
        var updateOptions = new Stripe.SubscriptionUpdateOptions
        {
            Items = new List<Stripe.SubscriptionItemOptions>
            {
                new Stripe.SubscriptionItemOptions
                {
                    Id = item.Id,
                    Price = newPriceId,
                },
            },
            ProrationBehavior = "create_prorations",
        };

        var updatedSubscription = await service.UpdateAsync(stripeSubscriptionId, updateOptions);
        return updatedSubscription.Status == "active";
    }

    public async Task<object> GetSubscriptionAsync(string stripeSubscriptionId)
    {
        var service = new Stripe.SubscriptionService();
        return await service.GetAsync(stripeSubscriptionId, new Stripe.SubscriptionGetOptions
        {
            Expand = new List<string> { "latest_invoice", "customer" }
        });
    }

    public async Task<bool> HandleWebhookAsync(string json, string stripeSignature)
    {
        try
        {
            var stripeEvent = Stripe.EventUtility.ConstructEvent(json, stripeSignature, _webhookSecret);
            
            switch (stripeEvent.Type)
            {
                case "invoice.paid":
                    await HandleInvoicePaidAsync(stripeEvent);
                    break;
                case "invoice.payment_failed":
                    await HandleInvoicePaymentFailedAsync(stripeEvent);
                    break;
                case "customer.subscription.updated":
                    await HandleSubscriptionUpdatedAsync(stripeEvent);
                    break;
                case "customer.subscription.deleted":
                    await HandleSubscriptionDeletedAsync(stripeEvent);
                    break;
                case "checkout.session.completed":
                    await HandleCheckoutSessionCompletedAsync(stripeEvent);
                    break;
            }
            
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    private async Task HandleInvoicePaidAsync(Stripe.Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (invoice == null) return;

        // TODO: Update local invoice status
        // This would be implemented in a service that syncs Stripe data with local DB
        // For now, just log the event
        Console.WriteLine($"Invoice {invoice.Id} paid successfully");
    }

    private async Task HandleInvoicePaymentFailedAsync(Stripe.Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (invoice == null) return;

        // TODO: Update local invoice status to failed
        Console.WriteLine($"Invoice {invoice.Id} payment failed");
    }

    private async Task HandleSubscriptionUpdatedAsync(Stripe.Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (subscription == null) return;

        // TODO: Update local subscription status
        Console.WriteLine($"Subscription {subscription.Id} updated to {subscription.Status}");
    }

    private async Task HandleSubscriptionDeletedAsync(Stripe.Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (subscription == null) return;

        // TODO: Update local subscription status to cancelled
        Console.WriteLine($"Subscription {subscription.Id} cancelled");
    }

    private async Task HandleCheckoutSessionCompletedAsync(Stripe.Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        if (session == null) return;

        // TODO: Handle successful checkout
        Console.WriteLine($"Checkout session {session.Id} completed");
    }
}
