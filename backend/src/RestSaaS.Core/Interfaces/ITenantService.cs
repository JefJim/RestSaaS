namespace RestSaaS.Core.Interfaces;

public interface ITenantService
{
    Guid? GetCurrentTenantId();
    void SetCurrentTenantId(Guid tenantId);
    Guid? GetCurrentBranchId();
    void SetCurrentBranchId(Guid? branchId);
    bool IsTenantResolved();
}
