namespace RestSaaS.Infrastructure.Tenancy;

using RestSaaS.Core.Interfaces;

public class TenantService : ITenantService
{
    private Guid? _currentTenantId;
    private Guid? _currentBranchId;

    public Guid? GetCurrentTenantId()
    {
        return _currentTenantId;
    }

    public void SetCurrentTenantId(Guid tenantId)
    {
        _currentTenantId = tenantId;
    }

    public Guid? GetCurrentBranchId()
    {
        return _currentBranchId;
    }

    public void SetCurrentBranchId(Guid? branchId)
    {
        _currentBranchId = branchId;
    }

    public bool IsTenantResolved()
    {
        return _currentTenantId.HasValue;
    }
}
