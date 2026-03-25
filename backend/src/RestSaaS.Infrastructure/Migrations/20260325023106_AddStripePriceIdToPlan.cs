using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStripePriceIdToPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripePriceId",
                table: "Plans",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripePriceId",
                table: "Plans");
        }
    }
}
