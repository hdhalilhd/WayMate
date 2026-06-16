using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YolArkadashim.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviationRadius : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeviationRadiusMeters",
                table: "Listings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeviationRadiusMeters",
                table: "Listings");
        }
    }
}
