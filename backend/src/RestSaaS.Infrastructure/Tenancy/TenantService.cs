namespace RestSaaS.Infrastructure.Tenancy;

using RestSaaS.Core.Interfaces;

public class TenantService : ITenantService
{
    private Guid? _currentTenantId;

    public Guid? GetCurrentTenantId()
    {
        return _currentTenantId;
    }

    public void SetCurrentTenantId(Guid tenantId)
    {
        _currentTenantId = tenantId;
    }

    public bool IsTenantResolved()
    {
        return _currentTenantId.HasValue;
    }
}
