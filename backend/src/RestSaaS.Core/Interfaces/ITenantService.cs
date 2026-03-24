namespace RestSaaS.Core.Interfaces;

public interface ITenantService
{
    Guid? GetCurrentTenantId();
    void SetCurrentTenantId(Guid tenantId);
    bool IsTenantResolved();
}
