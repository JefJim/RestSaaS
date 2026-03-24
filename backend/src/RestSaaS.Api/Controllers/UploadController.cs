using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestSaaS.Core.Interfaces;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;

    public UploadController(IFileUploadService fileUploadService)
    {
        _fileUploadService = fileUploadService;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided." });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, and WebP images are allowed." });
            }

            // Validate file size (5MB max)
            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size exceeds the maximum allowed size of 5MB." });
            }

            using var stream = file.OpenReadStream();
            var imageUrl = await _fileUploadService.UploadImageAsync(stream, file.FileName, file.ContentType);

            return Ok(new
            {
                message = "Image uploaded successfully.",
                imageUrl = imageUrl
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpDelete("image")]
    public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return BadRequest(new { message = "Image URL is required." });
            }

            if (!_fileUploadService.IsValidImageUrl(imageUrl))
            {
                return BadRequest(new { message = "Invalid image URL." });
            }

            var result = await _fileUploadService.DeleteImageAsync(imageUrl);

            if (result)
            {
                return Ok(new { message = "Image deleted successfully." });
            }
            else
            {
                return NotFound(new { message = "Image not found or could not be deleted." });
            }
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }
}