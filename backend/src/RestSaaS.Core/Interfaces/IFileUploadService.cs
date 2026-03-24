namespace RestSaaS.Core.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteImageAsync(string imageUrl);
    bool IsValidImageUrl(string imageUrl);
}