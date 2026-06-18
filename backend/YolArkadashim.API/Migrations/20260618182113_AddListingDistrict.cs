using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YolArkadashim.API.Migrations
{
    /// <inheritdoc />
    public partial class AddListingDistrict : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "Listings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "District",
                table: "Listings");
        }
    }
}
