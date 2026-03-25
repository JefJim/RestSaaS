using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.DTOs;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
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
    private readonly IBillingService _billingService;
    private readonly ITenantService _tenantService;

    public BillingController(IBillingService billingService, ITenantService tenantService)
    {
        _billingService = billingService;
        _tenantService = tenantService;
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
    public async Task<ActionResult<BillingInfo>> GetInfo()
    {
        var info = await _billingService.GetBillingInfoAsync(GetRestaurantId());
        if (info == null) return NotFound();
        return Ok(info);
    }

    [HttpPost("info")]
    public async Task<IActionResult> UpdateInfo(BillingInfoDto dto)
    {
        var info = new BillingInfo
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
    public async Task<IActionResult> AddPaymentMethod(PaymentMethod method)
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
    public async Task<ActionResult<List<Invoice>>> GetInvoices()
    {
        var invoices = await _billingService.GetInvoicesAsync(GetRestaurantId());
        return Ok(invoices);
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
