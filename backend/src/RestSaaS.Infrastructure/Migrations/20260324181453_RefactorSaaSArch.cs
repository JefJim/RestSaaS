using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorSaaSArch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaxUsers",
                table: "Plans",
                newName: "MaxStaffUsers");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "MenuItems",
                newName: "BasePrice");

            migrationBuilder.AddColumn<bool>(
                name: "AllowImages",
                table: "Plans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AllowOrders",
                table: "Plans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AllowReservations",
                table: "Plans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxBranches",
                table: "Plans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BranchMenuOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    IsAvailableOverride = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchMenuOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BranchMenuOverrides_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BranchMenuOverrides_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BranchMenuOverrides_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BranchMenuOverrides_BranchId",
                table: "BranchMenuOverrides",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchMenuOverrides_MenuItemId",
                table: "BranchMenuOverrides",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchMenuOverrides_RestaurantId",
                table: "BranchMenuOverrides",
                column: "RestaurantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BranchMenuOverrides");

            migrationBuilder.DropColumn(
                name: "AllowImages",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "AllowOrders",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "AllowReservations",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "MaxBranches",
                table: "Plans");

            migrationBuilder.RenameColumn(
                name: "MaxStaffUsers",
                table: "Plans",
                newName: "MaxUsers");

            migrationBuilder.RenameColumn(
                name: "BasePrice",
                table: "MenuItems",
                newName: "Price");
        }
    }
}
