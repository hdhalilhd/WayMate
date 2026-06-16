CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE EXTENSION IF NOT EXISTS postgis;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "Users" (
        "Id" uuid NOT NULL,
        "FullName" character varying(100) NOT NULL,
        "Email" character varying(150) NOT NULL,
        "PasswordHash" text NOT NULL,
        "Phone" character varying(20),
        "ProfilePhoto" text,
        "IsVerified" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "Listings" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "HomeLocation" geometry(Point,4326) NOT NULL,
        "WorkLocation" geometry(Point,4326) NOT NULL,
        "RoutePolyline" geometry(LineString,4326),
        "HomeAddressText" character varying(300) NOT NULL,
        "WorkAddressText" character varying(300) NOT NULL,
        "MorningDepartTime" time without time zone NOT NULL,
        "EveningDepartTime" time without time zone NOT NULL,
        "FlexibilityNote" character varying(500),
        "FlexibilityDaysPct" integer NOT NULL,
        "PricePerTrip" numeric(8,2) NOT NULL,
        "AvailableSeats" integer NOT NULL,
        "Status" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Listings" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Listings_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "RiderProfiles" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "HomeLocation" geometry(Point,4326) NOT NULL,
        "WorkLocation" geometry(Point,4326) NOT NULL,
        "HomeAddressText" character varying(300) NOT NULL,
        "WorkAddressText" character varying(300) NOT NULL,
        "PreferredDepartFrom" time without time zone NOT NULL,
        "PreferredDepartTo" time without time zone NOT NULL,
        CONSTRAINT "PK_RiderProfiles" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_RiderProfiles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "Vehicles" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Brand" character varying(50) NOT NULL,
        "Model" character varying(50) NOT NULL,
        "Year" integer NOT NULL,
        "Plate" character varying(20),
        "Color" character varying(30),
        CONSTRAINT "PK_Vehicles" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Vehicles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "MatchRequests" (
        "Id" uuid NOT NULL,
        "ListingId" uuid NOT NULL,
        "RiderId" uuid NOT NULL,
        "Status" text NOT NULL,
        "InitialMessage" character varying(500),
        "RequestedAt" timestamp with time zone NOT NULL,
        "ContactSharedAt" timestamp with time zone,
        "RiderProfileId" uuid,
        CONSTRAINT "PK_MatchRequests" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_MatchRequests_Listings_ListingId" FOREIGN KEY ("ListingId") REFERENCES "Listings" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_MatchRequests_RiderProfiles_RiderProfileId" FOREIGN KEY ("RiderProfileId") REFERENCES "RiderProfiles" ("Id"),
        CONSTRAINT "FK_MatchRequests_Users_RiderId" FOREIGN KEY ("RiderId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "Conversations" (
        "Id" uuid NOT NULL,
        "MatchRequestId" uuid NOT NULL,
        "DriverId" uuid NOT NULL,
        "RiderId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Conversations" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Conversations_MatchRequests_MatchRequestId" FOREIGN KEY ("MatchRequestId") REFERENCES "MatchRequests" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Conversations_Users_DriverId" FOREIGN KEY ("DriverId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_Conversations_Users_RiderId" FOREIGN KEY ("RiderId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE TABLE "Messages" (
        "Id" uuid NOT NULL,
        "ConversationId" uuid NOT NULL,
        "SenderId" uuid NOT NULL,
        "Content" character varying(2000) NOT NULL,
        "SentAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Messages" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Messages_Conversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES "Conversations" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Messages_Users_SenderId" FOREIGN KEY ("SenderId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Conversations_DriverId" ON "Conversations" ("DriverId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Conversations_MatchRequestId" ON "Conversations" ("MatchRequestId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Conversations_RiderId" ON "Conversations" ("RiderId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Listings_HomeLocation" ON "Listings" USING GIST ("HomeLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Listings_RoutePolyline" ON "Listings" USING GIST ("RoutePolyline");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Listings_UserId" ON "Listings" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Listings_WorkLocation" ON "Listings" USING GIST ("WorkLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_MatchRequests_ListingId" ON "MatchRequests" ("ListingId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_MatchRequests_RiderId" ON "MatchRequests" ("RiderId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_MatchRequests_RiderProfileId" ON "MatchRequests" ("RiderProfileId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Messages_ConversationId" ON "Messages" ("ConversationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_Messages_SenderId" ON "Messages" ("SenderId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_RiderProfiles_HomeLocation" ON "RiderProfiles" USING GIST ("HomeLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_RiderProfiles_UserId" ON "RiderProfiles" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE INDEX "IX_RiderProfiles_WorkLocation" ON "RiderProfiles" USING GIST ("WorkLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Vehicles_UserId" ON "Vehicles" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607091507_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260607091507_InitialCreate', '10.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607151213_AddDeviationRadius') THEN
    ALTER TABLE "Listings" ADD "DeviationRadiusMeters" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607151213_AddDeviationRadius') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260607151213_AddDeviationRadius', '10.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607162712_AddCityToListing') THEN
    ALTER TABLE "Listings" ADD "City" character varying(100) NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607162712_AddCityToListing') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260607162712_AddCityToListing', '10.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE TABLE "Notifications" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Title" character varying(200) NOT NULL,
        "Body" character varying(500) NOT NULL,
        "ListingId" uuid,
        "IsRead" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE TABLE "SavedSearches" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "City" text,
        "HomeLocation" geometry(Point,4326) NOT NULL,
        "WorkLocation" geometry(Point,4326) NOT NULL,
        "HomeAddressText" text NOT NULL,
        "WorkAddressText" text NOT NULL,
        "RadiusMeters" integer NOT NULL,
        "EmailNotify" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_SavedSearches" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_SavedSearches_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE INDEX "IX_Notifications_UserId" ON "Notifications" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE INDEX "IX_SavedSearches_HomeLocation" ON "SavedSearches" USING GIST ("HomeLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE INDEX "IX_SavedSearches_UserId" ON "SavedSearches" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    CREATE INDEX "IX_SavedSearches_WorkLocation" ON "SavedSearches" USING GIST ("WorkLocation");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607183024_AddNotifications') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260607183024_AddNotifications', '10.0.8');
    END IF;
END $EF$;
COMMIT;

