using Supabase.Storage;
using RestSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace RestSaaS.Infrastructure.Services;

public class FileUploadService : IFileUploadService
{
    private readonly Supabase.Client _supabaseClient;
    private readonly ITenantService _tenantService;
    private const string BUCKET_NAME = "menu-images";
    private const long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly string[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".webp" };

    private readonly IHttpContextAccessor _httpContextAccessor;

    public FileUploadService(Supabase.Client supabaseClient, ITenantService tenantService, IHttpContextAccessor httpContextAccessor)
    {
        _supabaseClient = supabaseClient;
        _tenantService = tenantService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType)
    {
        // Validate file size
        if (fileStream.Length > MAX_FILE_SIZE)
        {
            throw new ArgumentException("File size exceeds the maximum allowed size of 5MB.");
        }

        // Validate file extension
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!ALLOWED_EXTENSIONS.Contains(extension))
        {
            throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", ALLOWED_EXTENSIONS)}");
        }

        // Get current tenant or user context
        var tenantId = _tenantService.GetCurrentTenantId()?.ToString();
        var storagePrefix = tenantId;

        if (string.IsNullOrEmpty(storagePrefix))
        {
            // Fallback to user ID for cases like onboarding where tenant isn't created yet
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new InvalidOperationException("No se pudo determinar el contexto de usuario o restaurante para la subida.");
            }
            storagePrefix = $"onboarding/{userId}";
        }

        // Generate unique filename with prefix
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}_{fileNameWithoutExtension}{extension}";
        var tenantPath = $"{storagePrefix}/{uniqueFileName}";

        try
        {
            var storage = _supabaseClient.Storage;
            
            // Check if bucket exists
            try {
                await storage.GetBucket(BUCKET_NAME);
            } catch (Exception ex) {
                throw new InvalidOperationException($"El bucket '{BUCKET_NAME}' no fue encontrado en Supabase. Por favor, créalo manualmente en tu panel de Supabase y asegúrate de marcarlo como 'Public'.", ex);
            }

            // Convert stream to byte array
            using var memoryStream = new MemoryStream();
            await fileStream.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            // Upload to Supabase Storage
            var bucket = storage.From(BUCKET_NAME);

            await bucket.Upload(fileBytes, tenantPath, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

            // Get public URL
            var publicUrl = bucket.GetPublicUrl(tenantPath);
            return publicUrl;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to upload image: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Extract file path from URL
            var uri = new Uri(imageUrl);
            var pathSegments = uri.AbsolutePath.Split('/');
            var bucketIndex = Array.IndexOf(pathSegments, BUCKET_NAME);

            if (bucketIndex == -1 || bucketIndex + 1 >= pathSegments.Length)
            {
                throw new ArgumentException("Invalid image URL format.");
            }

            var filePath = string.Join("/", pathSegments.Skip(bucketIndex + 1));

            // Delete from Supabase Storage
            var storage = _supabaseClient.Storage;
            await storage.From(BUCKET_NAME).Remove(new List<string> { filePath });

            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to delete image: {ex.Message}", ex);
        }
    }

    public bool IsValidImageUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return false;

        try
        {
            var uri = new Uri(imageUrl);
            return uri.Host.Contains("supabase") && imageUrl.Contains(BUCKET_NAME);
        }
        catch
        {
            return false;
        }
    }
}