namespace RestSaaS.Core.Entities;

public class UserRestaurant : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public Guid RestaurantId { get; set; }
    public virtual Restaurant Restaurant { get; set; } = null!;
    
    public string AssignedRole { get; set; } = "Staff"; // RestaurantOwner, RestaurantAdmin, Staff
}
