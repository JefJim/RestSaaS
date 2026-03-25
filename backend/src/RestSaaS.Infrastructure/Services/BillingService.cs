using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.DTOs;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestSaaS.Infrastructure.Services;

public class BillingService : IBillingService
{
    private readonly ApplicationDbContext _context;

    public BillingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BillingSummaryDto> GetBillingSummaryAsync(Guid restaurantId)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.RestaurantId == restaurantId && s.IsActive);

        var lastInvoice = await _context.Invoices
            .Where(i => i.RestaurantId == restaurantId && i.Status == "Paid")
            .OrderByDescending(i => i.PaidAt)
            .FirstOrDefaultAsync();

        var defaultPaymentMethod = await _context.PaymentMethods
            .FirstOrDefaultAsync(pm => pm.RestaurantId == restaurantId && pm.IsDefault);

        return new BillingSummaryDto
        {
            PlanName = subscription?.Plan?.Name ?? "Core / Basic",
            PlanPrice = subscription?.Plan?.Price ?? 0,
            NextBillingDate = subscription?.NextBillingDate,
            LastPayment = lastInvoice == null ? null : new LastPaymentDto
            {
                Date = lastInvoice.PaidAt ?? lastInvoice.CreatedAt,
                Amount = lastInvoice.Amount,
                Status = lastInvoice.Status,
                PaymentMethod = defaultPaymentMethod != null 
                    ? $"{defaultPaymentMethod.Brand} **** {defaultPaymentMethod.Last4}" 
                    : "Tarjeta"
            }
        };
    }

    public async Task<BillingInfo?> GetBillingInfoAsync(Guid restaurantId)
    {
        return await _context.BillingInfos
            .FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
    }

    public async Task UpdateBillingInfoAsync(Guid restaurantId, BillingInfo info)
    {
        var existing = await _context.BillingInfos
            .FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);

        if (existing == null)
        {
            info.RestaurantId = restaurantId;
            _context.BillingInfos.Add(info);
        }
        else
        {
            existing.LegalName = info.LegalName;
            existing.TaxId = info.TaxId;
            existing.Address = info.Address;
            existing.Email = info.Email;
            existing.Phone = info.Phone;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<PaymentMethod>> GetPaymentMethodsAsync(Guid restaurantId)
    {
        return await _context.PaymentMethods
            .Where(pm => pm.RestaurantId == restaurantId)
            .ToListAsync();
    }

    public async Task AddPaymentMethodAsync(Guid restaurantId, PaymentMethod method)
    {
        method.RestaurantId = restaurantId;
        
        // If this is the first payment method, make it default
        var count = await _context.PaymentMethods.CountAsync(pm => pm.RestaurantId == restaurantId);
        if (count == 0) method.IsDefault = true;
        else if (method.IsDefault)
        {
            // Unset other defaults
            var others = await _context.PaymentMethods.Where(pm => pm.RestaurantId == restaurantId && pm.IsDefault).ToListAsync();
            foreach (var o in others) o.IsDefault = false;
        }

        _context.PaymentMethods.Add(method);
        await _context.SaveChangesAsync();
    }

    public async Task DeletePaymentMethodAsync(Guid restaurantId, Guid methodId)
    {
        var method = await _context.PaymentMethods.FirstOrDefaultAsync(pm => pm.Id == methodId && pm.RestaurantId == restaurantId);
        if (method != null)
        {
            _context.PaymentMethods.Remove(method);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SetDefaultPaymentMethodAsync(Guid restaurantId, Guid methodId)
    {
        var methods = await _context.PaymentMethods.Where(pm => pm.RestaurantId == restaurantId).ToListAsync();
        foreach (var m in methods)
        {
            m.IsDefault = (m.Id == methodId);
        }
        await _context.SaveChangesAsync();
    }

    public async Task<List<Invoice>> GetInvoicesAsync(Guid restaurantId)
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Where(i => i.RestaurantId == restaurantId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task ProcessSubscriptionRenewalAsync(Guid subscriptionId)
    {
        var sub = await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId);

        if (sub == null || !sub.IsActive) return;

        // 1. Create Invoice
        var invoice = new Invoice
        {
            RestaurantId = sub.RestaurantId,
            SubscriptionId = sub.Id,
            Amount = sub.Plan.Price,
            Currency = sub.Plan.Currency,
            Status = "Pending",
            DueDate = DateTime.UtcNow.AddDays(3),
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{sub.RestaurantId.ToString()[..4].ToUpper()}"
        };

        invoice.Items.Add(new InvoiceItem
        {
            Description = $"Suscripción Plan {sub.Plan.Name} - Período Mensual",
            Amount = sub.Plan.Price,
            Quantity = 1
        });

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        // 2. Attempt Payment (Simulated for MVP)
        var defaultMethod = await _context.PaymentMethods
            .FirstOrDefaultAsync(pm => pm.RestaurantId == sub.RestaurantId && pm.IsDefault);

        if (defaultMethod != null)
        {
            // Simulate 90% success rate
            bool success = true; // For now
            
            var transaction = new Transaction
            {
                RestaurantId = sub.RestaurantId,
                InvoiceId = invoice.Id,
                Amount = invoice.Amount,
                Currency = invoice.Currency,
                Provider = defaultMethod.Provider,
                ProviderTransactionId = $"TX_{Guid.NewGuid().ToString()[..8].ToUpper()}",
                Status = success ? "Success" : "Failed"
            };

            _context.Transactions.Add(transaction);

            if (success)
            {
                invoice.Status = "Paid";
                invoice.PaidAt = DateTime.UtcNow;
                sub.NextBillingDate = (sub.NextBillingDate ?? DateTime.UtcNow).AddMonths(1);
            }
            else
            {
                invoice.Status = "Failed";
            }

            await _context.SaveChangesAsync();
        }
    }
}
