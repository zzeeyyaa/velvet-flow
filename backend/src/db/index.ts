import postgres from "postgres";

const sqlString = process.env.DATABASE_URL || ''

export const sql = postgres(
    sqlString,
    {
        max: 50,
        idle_timeout: 10,
    })

export const checkDbConnection = async () => {
    try {
        await sql`SELECT 1`
        console.log('✅ Database Connected')
    } catch (error) {
        console.error('❌ Database Connection Failed')
        process.exit(1)
    }
}