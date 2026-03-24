using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameRoleAndAddOwnerUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Users",
                newName: "PlatformRole");

            migrationBuilder.RenameColumn(
                name: "AssignedRole",
                table: "UserRestaurants",
                newName: "Role");

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                table: "Restaurants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "Restaurants",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "Restaurants");

            migrationBuilder.RenameColumn(
                name: "PlatformRole",
                table: "Users",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "UserRestaurants",
                newName: "AssignedRole");
        }
    }
}
