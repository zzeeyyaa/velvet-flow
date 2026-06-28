import Redis from 'ioredis'

// 1. Inisiasi Redis dengan Retry Strategy agar Resilient
export const redis = new Redis(process.env.REDIS_URL!, {
    retryStrategy(times) {
        return Math.min(times * 50, 2000) // Reconnect eksponensial maksimal 2 detik
    }
})

// Variabel untuk menyimpan kode hash (SHA1) dari Lua Script kita
export let luaBookingScriptSha: string = ''

// Kode Lua Script (Atomic Check-and-Decrement)
const LUA_BOOKING_SCRIPT = `
  local stock = redis.call('GET', KEYS[1])
  if tonumber(stock) <= 0 then
    return -1
  end
  return redis.call('DECR', KEYS[1])
`

// 2. Fungsi Inisiasi saat Booting
export const initRedisCache = async () => {
    try {
        await redis.ping()
        console.log('✅ Redis Connected')

        // LOAD script ke memori Redis, Redis akan membalas dengan string SHA1
        luaBookingScriptSha = await redis.script('LOAD', LUA_BOOKING_SCRIPT) as string
        console.log(`✅ Lua Booking Script Loaded (SHA1: ${luaBookingScriptSha.substring(0, 8)}...)`)
    } catch (error) {
        console.error('❌ Redis Connection/Script Load Failed:', error)
        process.exit(1) // Matikan server jika Redis mati
    }
}