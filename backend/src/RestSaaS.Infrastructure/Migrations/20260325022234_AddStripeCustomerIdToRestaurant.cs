using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeCustomerIdToRestaurant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Restaurants",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Restaurants");
        }
    }
}
