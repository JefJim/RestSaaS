using Microsoft.AspNetCore.Mvc;
using RestSaaS.Core.Interfaces;
using System.IO;
using System.Threading.Tasks;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhooksController : ControllerBase
{
    private readonly IStripeService _stripeService;

    public WebhooksController(IStripeService stripeService)
    {
        _stripeService = stripeService;
    }

    [HttpPost("stripe")]
    public async Task<IActionResult> HandleStripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        var result = await _stripeService.HandleWebhookAsync(json, stripeSignature);

        if (result)
        {
            return Ok(new { received = true });
        }
        else
        {
            return BadRequest(new { error = "Invalid webhook signature" });
        }
    }
}