# 🏗️ BLUEPRINT LOGIKA TICKET SERVICE (velvet-flow)

Dokumen ini berisi alur logika (plot) dan spesifikasi kueri database untuk 3 mode simulasi war ticket di `src/services/ticket.service.ts`.

---

## 💥 1. MODE RENTAN: `buyTicketVulnerable()`
**Tujuan:** Membuktikan terjadinya *Race Condition* (Overselling) saat tidak ada proteksi.

**Alur Logika (Plot):**
1. **[BACA]** Ambil data stok tiket saat ini dari Postgres.
   - *Query:* `SELECT stock FROM tickets WHERE id = $1`
2. **[VALIDASI]** Cek di level aplikasi (TypeScript).
   - *Logika:* `IF (stock < quantity) { lempar Error 400 "Stok habis" }`
3. **[TULIS]** Kurangi stok di Postgres.
   - *Query:* `UPDATE tickets SET stock = stock - $1 WHERE id = $2`
4. **[CATAT]** Masukkan riwayat pesanan ke tabel orders.
   - *Query:* `INSERT INTO orders (ticket_id, simulated_user_id, quantity) VALUES ($1, $2, $3) RETURNING id`
5. **[SELESAI]** Kembalikan response JSON berisi nomor Virtual Account (VA).

*⚠️ Efek Kiamat: Karena langkah 1 dan 3 terpisah, 500 bot akan mengeksekusi langkah 1 bersamaan, melihat stok masih ada, lalu mengeksekusi langkah 3 bersamaan. Stok akan minus!*

---

## 🐢 2. MODE SETENGAH TANGGUH: `buyTicketSemiResilient()`
**Tujuan:** Membuktikan data aman dari *overselling*, namun latensi server membengkak parah karena antrean di database.

**Alur Logika (Plot):**
1. **[BUKA JALUR]** Memulai transaksi database eksklusif.
   - *Query:* `BEGIN;`
2. **[BACA & KUNCI]** Ambil data stok dan gembok baris ini dari bot lain.
   - *Query:* `SELECT stock FROM tickets WHERE id = $1 FOR UPDATE;`
3. **[VALIDASI]** Cek stok di level aplikasi.
   - *Logika:* `IF (stock < quantity) { jalankan ROLLBACK; lempar Error 400 }`
4. **[TULIS]** Kurangi stok di Postgres.
   - *Query:* `UPDATE tickets SET stock = stock - $1 WHERE id = $2;`
5. **[CATAT]** Masukkan riwayat pesanan ke tabel orders.
   - *Query:* `INSERT INTO orders (...) VALUES (...);`
6. **[TUTUP JALUR]** Simpan permanen dan lepas gembok agar bot antrean berikutnya bisa masuk.
   - *Query:* `COMMIT;`
7. **[SELESAI]** Kembalikan response JSON berisi nomor Virtual Account (VA).

*🛡️ Efek Antrean: Data aman 100%. Namun saat `FOR UPDATE` dieksekusi bot 1, bot ke 2-500 akan membeku (menunggu/timeout) di pintu database.*

---

## 🚀 3. MODE TANGGUH: `buyTicketResilient()`
**Tujuan:** Membuktikan data aman 100% dan latensi super kilat. Memindahkan beban komputasi dari Harddisk (Postgres) ke RAM (Redis).

**Alur Logika (Plot):**
1. **[EKSEKUSI REDIS]** Aplikasi sama sekali TIDAK melakukan `SELECT` ke Postgres. Langsung tembak Lua Script ke Redis untuk cek & potong stok secara *Atomic*.
   - *Aksi:* `redis.eval(LUA_SCRIPT, 1, ticketId, quantity)`
2. **[VALIDASI REDIS]** Evaluasi jawaban dari satpam Redis.
   - *Logika:* `IF (redisResult == -1) { lempar Error 400 "Stok habis" }`
3. **[CATAT POSTGRES]** Jika Redis membolehkan lewat, langsung catat pesanan di Postgres (Postgres hanya menerima perintah `INSERT` tanpa mikir/mengecek stok lagi).
   - *Query:* `INSERT INTO orders (ticket_id, simulated_user_id, quantity) VALUES ($1, $2, $3) RETURNING id`
   - *Query Opsional (Sinkronisasi):* `UPDATE tickets SET stock = stock - $1 WHERE id = $2` *(Untuk menyamakan data Postgres dengan Redis di akhir).*
4. **[SELESAI]** Kembalikan response JSON berisi nomor Virtual Account (VA).

*⚡ Efek Kilat: Tidak ada gembok/antrean di Postgres. Redis mampu memproses puluhan ribu pemotongan stok per detik di dalam RAM.*