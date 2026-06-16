using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using YolArkadashim.API.Models;

namespace YolArkadashim.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Listing> Listings { get; set; }
    public DbSet<RiderProfile> RiderProfiles { get; set; }
    public DbSet<MatchRequest> MatchRequests { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<SavedSearch> SavedSearches { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Report> Reports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("postgis");

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.RiderProfile).WithOne(r => r.User)
             .HasForeignKey<RiderProfile>(r => r.UserId);
            e.HasOne(u => u.Vehicle).WithOne(v => v.User)
             .HasForeignKey<Vehicle>(v => v.UserId);
        });

        // Listing
        modelBuilder.Entity<Listing>(e =>
        {
            e.Property(l => l.HomeLocation).HasColumnType("geometry(Point,4326)");
            e.Property(l => l.WorkLocation).HasColumnType("geometry(Point,4326)");
            e.Property(l => l.RoutePolyline).HasColumnType("geometry(LineString,4326)");
            e.Property(l => l.Status).HasConversion<string>();
            e.Property(l => l.PricePerTrip).HasColumnType("decimal(8,2)");

            e.HasIndex(l => l.HomeLocation).HasMethod("GIST");
            e.HasIndex(l => l.WorkLocation).HasMethod("GIST");
            e.HasIndex(l => l.RoutePolyline).HasMethod("GIST");
        });

        // RiderProfile
        modelBuilder.Entity<RiderProfile>(e =>
        {
            e.Property(r => r.HomeLocation).HasColumnType("geometry(Point,4326)");
            e.Property(r => r.WorkLocation).HasColumnType("geometry(Point,4326)");

            e.HasIndex(r => r.HomeLocation).HasMethod("GIST");
            e.HasIndex(r => r.WorkLocation).HasMethod("GIST");
        });

        // MatchRequest
        modelBuilder.Entity<MatchRequest>(e =>
        {
            e.Property(m => m.Status).HasConversion<string>();
            e.HasOne(m => m.Conversation).WithOne(c => c.MatchRequest)
             .HasForeignKey<Conversation>(c => c.MatchRequestId);
        });

        // Conversation
        modelBuilder.Entity<Conversation>(e =>
        {
            e.HasOne(c => c.Driver).WithMany()
             .HasForeignKey(c => c.DriverId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Rider).WithMany()
             .HasForeignKey(c => c.RiderId).OnDelete(DeleteBehavior.Restrict);
        });

        // Message
        modelBuilder.Entity<Message>(e =>
        {
            e.HasOne(m => m.Sender).WithMany()
             .HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.Restrict);
        });

        // Report
        modelBuilder.Entity<Report>(e =>
        {
            e.Property(r => r.Status).HasConversion<string>();
            e.HasOne(r => r.Reporter).WithMany()
             .HasForeignKey(r => r.ReporterId).OnDelete(DeleteBehavior.Restrict);
        });

        // SavedSearch
        modelBuilder.Entity<SavedSearch>(e =>
        {
            e.Property(s => s.HomeLocation).HasColumnType("geometry(Point,4326)");
            e.Property(s => s.WorkLocation).HasColumnType("geometry(Point,4326)");
            e.HasIndex(s => s.HomeLocation).HasMethod("GIST");
            e.HasIndex(s => s.WorkLocation).HasMethod("GIST");
        });
    }
}
