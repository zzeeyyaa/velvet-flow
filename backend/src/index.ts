import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

//import modul yang terpisah foldernya
import { checkDbConnection } from './db'
import { initRedisCache } from './cache';
import { getOpenApiSpec } from './docs/swagger';
import { swaggerUI } from '@hono/swagger-ui';
import { AppError } from './utils/app_errors';

import ticketRouter from './routes/ticket.routes';

// 1. System bootsrapping
console.log('Bootstrapping System...');
await checkDbConnection()
await initRedisCache()
const openapiSpec = getOpenApiSpec()

// 2. Initialize router and Middleware
const app = new Hono()

// Middleware Standar (Wajib untuk integrasi FE & Terminal Log)
app.use('*', logger())
app.use('*', cors())

// 3. Register Rotes
// Rute swagger yang baru, menggunakan url referensi (Bebas dari error type!)

app.get('/openapi.json', (c) => {
  return c.json(openapiSpec)
})

app.get('/ui', swaggerUI({
  url: '/openapi.json'
}))

app.get('/', (c) => {
  return c.text('Velvet Flow API is Running')
})

app.route('/api/v1/tickets', ticketRouter)

// 4. Jaringan Pengaman Global
app.onError((err, c) => {
  console.log('Error log:', err.message)
  // 1. Jika ini adalah error buatan kita sendiri (AppError)
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        reason: err.errorCode,
        message: err.message,
      },
      err.statusCode as any
    )
  }

  // 2. Jika ini error dari validasi Payload (Zod/Validator)

  // 3. Fallback: jika ini error sistem murni yang tidak terduga (500)
  return c.json({
    success: false,
    message: 'Internal server error occured',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  },
    500)
})

// 5. Start Server
export default {
  port: parseInt(process.env.PORT || '3001'),
  fetch: app.fetch,
}

