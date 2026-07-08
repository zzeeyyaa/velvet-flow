import Redis from 'ioredis'

// 1. Inisiasi Redis dengan Lazy Connect agar tidak langsung menghubungkan saat import
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 3, // Batasi retry agar tidak loop selamanya saat dev
    retryStrategy(times) {
        // Jika tidak ada REDIS_URL atau sudah mencoba lebih dari 3 kali, stop retry
        if (!process.env.REDIS_URL || times > 3) {
            return null
        }
        return Math.min(times * 50, 2000)
    }
})

// Tangkap error secara diam-diam agar tidak menodai konsol log saat Redis tidak aktif
redis.on('error', (err) => {
    // Cukup log jika diatur secara eksplisit
    if (process.env.REDIS_URL) {
        console.warn('⚠️ Redis Connection Error:', err.message)
    }
})

// Variabel untuk menyimpan kode hash (SHA1) dari Lua Script kita
export let luaBookingScriptSha: string = ''

// Kode Lua Script (Atomic Check-and-Decrement)
// Menggunakan struktur data Hash di Redis (berisi field 'stock' dan 'is_active')
const LUA_BOOKING_SCRIPT = `
  -- Ambil data 'stock' dan 'is_active' sekaligus menggunakan HMGET
  local ticket = redis.call('HMGET', KEYS[1], 'stock', 'is_active')
  local stock = ticket[1]
  local is_active = ticket[2]
  
  -- Tolak transaksi jika: 
  -- 1. Tiket tidak ada di Redis
  -- 2. Stok tidak mencukupi
  -- 3. Tiket dinonaktifkan (is_active == '0' atau 'false')
  if not stock or tonumber(stock) < tonumber(ARGV[1]) or is_active == '0' or is_active == 'false' then
    return -1   
  end
  
  -- Kurangi stok secara atomic menggunakan HINCRBY (butuh nilai negatif untuk mengurangi)
  return redis.call('HINCRBY', KEYS[1], 'stock', -tonumber(ARGV[1]))
`

// 2. Fungsi Inisiasi saat Booting (Dibuat opsional)
export const initRedisCache = async () => {
    if (!process.env.REDIS_URL) {
        console.log('⚠️ Redis URL is empty. Skipping Redis cache (Development Mode)...')
        return
    }

    try {
        await redis.connect()
        await redis.ping()
        console.log('✅ Redis Connected')

        // LOAD script ke memori Redis, Redis akan membalas dengan string SHA1
        luaBookingScriptSha = await redis.script('LOAD', LUA_BOOKING_SCRIPT) as string
        console.log(`✅ Lua Booking Script Loaded (SHA1: ${luaBookingScriptSha.substring(0, 8)}...)`)
    } catch (error: any) {
        console.warn('⚠️ Redis Connection failed, proceeding without cache:', error.message || error)
    }
}
