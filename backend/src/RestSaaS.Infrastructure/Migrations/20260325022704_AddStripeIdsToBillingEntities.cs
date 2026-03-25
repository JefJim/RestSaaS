using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeIdsToBillingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripePaymentIntentId",
                table: "Transactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "Subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeInvoiceId",
                table: "Invoices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripePaymentIntentId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StripeInvoiceId",
                table: "Invoices");
        }
    }
}
