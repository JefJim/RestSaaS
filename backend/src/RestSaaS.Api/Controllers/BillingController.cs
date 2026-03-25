using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.DTOs;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestSaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly RestSaaS.Core.Interfaces.IBillingService _billingService;
    private readonly ITenantService _tenantService;
    private readonly ApplicationDbContext _context;
    private readonly IStripeService _stripeService;

    public BillingController(RestSaaS.Core.Interfaces.IBillingService billingService, ITenantService tenantService, ApplicationDbContext context, IStripeService stripeService)
    {
        _billingService = billingService;
        _tenantService = tenantService;
        _context = context;
        _stripeService = stripeService;
    }

    private Guid GetRestaurantId() => _tenantService.GetCurrentTenantId() 
        ?? throw new InvalidOperationException("Restaurant context is required.");

    [HttpGet("summary")]
    public async Task<ActionResult<BillingSummaryDto>> GetSummary()
    {
        try
        {
            var summary = await _billingService.GetBillingSummaryAsync(GetRestaurantId());
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("info")]
    public async Task<ActionResult<RestSaaS.Core.Entities.BillingInfo>> GetInfo()
    {
        var info = await _billingService.GetBillingInfoAsync(GetRestaurantId());
        if (info == null) 
        {
            return Ok(new RestSaaS.Core.Entities.BillingInfo { 
                LegalName = "", 
                TaxId = "", 
                Address = "", 
                Email = "", 
                Phone = "" 
            });
        }
        return Ok(info);
    }

    [HttpPost("info")]
    public async Task<IActionResult> UpdateInfo(BillingInfoDto dto)
    {
        var info = new RestSaaS.Core.Entities.BillingInfo
        {
            LegalName = dto.LegalName,
            TaxId = dto.TaxId,
            Address = dto.Address,
            Email = dto.Email,
            Phone = dto.Phone
        };

        await _billingService.UpdateBillingInfoAsync(GetRestaurantId(), info);
        return Ok();
    }

    [HttpGet("payment-methods")]
    public async Task<ActionResult<List<PaymentMethodDto>>> GetPaymentMethods()
    {
        var methods = await _billingService.GetPaymentMethodsAsync(GetRestaurantId());
        var dtos = methods.Select(m => new PaymentMethodDto
        {
            Id = m.Id,
            Brand = m.Brand,
            Last4 = m.Last4,
            ExpiryMonth = m.ExpiryMonth,
            ExpiryYear = m.ExpiryYear,
            IsDefault = m.IsDefault
        }).ToList();
        
        return Ok(dtos);
    }

    [HttpPost("payment-methods")]
    public async Task<IActionResult> AddPaymentMethod(RestSaaS.Core.Entities.PaymentMethod method)
    {
        await _billingService.AddPaymentMethodAsync(GetRestaurantId(), method);
        return Ok();
    }

    [HttpDelete("payment-methods/{id}")]
    public async Task<IActionResult> DeletePaymentMethod(Guid id)
    {
        await _billingService.DeletePaymentMethodAsync(GetRestaurantId(), id);
        return Ok();
    }

    [HttpPost("payment-methods/{id}/default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        await _billingService.SetDefaultPaymentMethodAsync(GetRestaurantId(), id);
        return Ok();
    }

    [HttpGet("invoices")]
    public async Task<ActionResult<List<RestSaaS.Core.Entities.Invoice>>> GetInvoices()
    {
        var invoices = await _billingService.GetInvoicesAsync(GetRestaurantId());
        return Ok(invoices);
    }

    [HttpGet("stripe-setup-intent")]
    public async Task<ActionResult<object>> GetStripeSetupIntent()
    {
        var restaurantId = GetRestaurantId();
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        if (restaurant == null) return NotFound();

        if (string.IsNullOrEmpty(restaurant.StripeCustomerId))
        {
            var email = (await _billingService.GetBillingInfoAsync(restaurantId))?.Email ?? restaurant.Slug + "@tablehive.com";
            restaurant.StripeCustomerId = await _stripeService.CreateCustomerAsync(restaurantId, email, restaurant.Name);
            await _context.SaveChangesAsync();
        }

        var clientSecret = await _stripeService.CreateSetupIntentAsync(restaurant.StripeCustomerId);
        return Ok(new { clientSecret });
    }

    [HttpPost("stripe-payment-intent")]
    public async Task<ActionResult<object>> CreateStripePaymentIntent([FromQuery] Guid planId)
    {
        var restaurantId = GetRestaurantId();
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        var plan = await _context.Plans.FindAsync(planId);
        
        if (restaurant == null || plan == null) return NotFound();

        if (string.IsNullOrEmpty(restaurant.StripeCustomerId))
        {
            var email = (await _billingService.GetBillingInfoAsync(restaurantId))?.Email ?? restaurant.Slug + "@tablehive.com";
            restaurant.StripeCustomerId = await _stripeService.CreateCustomerAsync(restaurantId, email, restaurant.Name);
            await _context.SaveChangesAsync();
        }

        var clientSecret = await _stripeService.CreatePaymentIntentAsync(
            restaurant.StripeCustomerId, 
            plan.Price, 
            plan.Currency, 
            $"Suscripción Plan {plan.Name} - {restaurant.Name}");

        return Ok(new { clientSecret });
    }

    [HttpPost("simulate-renewal")]
    public async Task<IActionResult> SimulateRenewal()
    {
        // For testing purposes
        var restaurantId = GetRestaurantId();
        var context = HttpContext.RequestServices.GetRequiredService<RestSaaS.Infrastructure.Data.ApplicationDbContext>();
        var sub = await context.Subscriptions.FirstOrDefaultAsync(s => s.RestaurantId == restaurantId && s.IsActive);
        
        if (sub != null)
        {
            await _billingService.ProcessSubscriptionRenewalAsync(sub.Id);
            return Ok(new { message = "Simulación de renovación procesada." });
        }
        
        return BadRequest(new { message = "No se encontró suscripción activa." });
    }
}
