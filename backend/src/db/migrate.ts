import { sql } from "./index";
import * as fs from "fs";
import * as path from "path";

export const runMigrationAndSeed = async () => {
    try {
        console.log("⏳ Running database migrations...");

        // 1. Read and execute schema.sql
        const schemaPath = path.join(__dirname, "schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        
        // Execute the multi-statement schema SQL
        await sql.unsafe(schemaSql);
        console.log("✅ Database tables created successfully.");

        // 2. Seed mock data if tables are empty
        const [categoryCount] = await sql`SELECT COUNT(*)::int AS count FROM categories`;
        if (categoryCount.count === 0) {
            console.log("🌱 Seeding database with initial mock data...");
            
            // Insert Category
            const [category] = await sql`
                INSERT INTO categories (name, description) 
                VALUES ('Concert', 'Music concerts and live performances') 
                RETURNING id
            `;

            // Insert Event
            const [event] = await sql`
                INSERT INTO events (name, description, status, sale_starts_at) 
                VALUES (
                    'Velvet Flow Live 2026', 
                    'The ultimate live ticketing simulation experience.', 
                    'ONGOING', 
                    ${new Date()}
                ) 
                RETURNING id
            `;

            // Insert Ticket
            const [ticket] = await sql`
                INSERT INTO tickets (name, event_id, category_id, total_capacity, price, stock, is_active) 
                VALUES (
                    'VIP Pass', 
                    ${event.id}, 
                    ${category.id}, 
                    100, 
                    150000.00, 
                    100, 
                    TRUE
                ) 
                RETURNING id
            `;

            // Insert a Simulated User
            const [user] = await sql`
                INSERT INTO simulated_users DEFAULT VALUES 
                RETURNING id
            `;

            console.log("✅ Seeding completed successfully!");
            console.log(`- Category ID: ${category.id}`);
            console.log(`- Event ID: ${event.id}`);
            console.log(`- Ticket ID (VIP Pass): ${ticket.id}`);
            console.log(`- Simulated User ID: ${user.id}`);
        } else {
            console.log("ℹ️ Database already contains data. Skipping seeding.");
        }

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
};

// If run directly (e.g., bun run src/db/migrate.ts)
if (require.main === module) {
    runMigrationAndSeed()
        .then(() => {
            console.log("🚀 Migration execution finished.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("💥 Execution failed:", err);
            process.exit(1);
        });
}
