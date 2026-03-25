namespace RestSaaS.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;

public class ApplicationDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Restaurant> Restaurants { get; set; } = null!;
    public DbSet<Branch> Branches { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserRestaurant> UserRestaurants { get; set; } = null!;
    public DbSet<Menu> Menus { get; set; } = null!;
    public DbSet<MenuCategory> MenuCategories { get; set; } = null!;
    public DbSet<MenuItem> MenuItems { get; set; } = null!;
    public DbSet<Reservation> Reservations { get; set; } = null!;
    public DbSet<Settings> Settings { get; set; } = null!;
    public DbSet<OpeningHours> OpeningHours { get; set; } = null!;
    public DbSet<Plan> Plans { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<BranchMenuOverride> BranchMenuOverrides { get; set; } = null!;
    public DbSet<BillingInfo> BillingInfos { get; set; } = null!;
    public DbSet<PaymentMethod> PaymentMethods { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filters for Tenant Isolation
        var tenantId = _tenantService.GetCurrentTenantId();

        modelBuilder.Entity<UserRestaurant>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        modelBuilder.Entity<Branch>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        
        var branchId = _tenantService.GetCurrentBranchId();

        modelBuilder.Entity<Menu>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || !e.BranchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<MenuCategory>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || !e.BranchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<MenuItem>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || !e.BranchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<Reservation>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<Settings>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || !e.BranchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<OpeningHours>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<Subscription>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        modelBuilder.Entity<Order>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<OrderItem>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || e.BranchId == branchId));
        modelBuilder.Entity<BranchMenuOverride>().HasQueryFilter(e => (!tenantId.HasValue || e.RestaurantId == tenantId) && (!branchId.HasValue || e.BranchId == branchId));
        
        modelBuilder.Entity<BillingInfo>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        modelBuilder.Entity<PaymentMethod>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        modelBuilder.Entity<Invoice>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
        modelBuilder.Entity<Transaction>().HasQueryFilter(e => !tenantId.HasValue || e.RestaurantId == tenantId);
    }
    
    public override int SaveChanges()
    {
        SetTenantIdOnSave();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetTenantIdOnSave();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void SetTenantIdOnSave()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var branchId = _tenantService.GetCurrentBranchId();

        foreach (var entry in ChangeTracker.Entries<TenantEntity>().Where(e => e.State == EntityState.Added))
        {
            if (tenantId.HasValue) entry.Entity.RestaurantId = tenantId.Value;
            if (branchId.HasValue) entry.Entity.BranchId = branchId.Value;
        }
    }
}
