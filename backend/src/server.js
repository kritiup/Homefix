import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 5001
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/homefix' })
app.use(cors({ origin: process.env.CLIENT_URL || true }))
app.use(express.json())

const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const auth = (req, res, next) => { try { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Authentication required' }); req.user = jwt.verify(token, process.env.JWT_SECRET || 'homefix-development-secret'); next() } catch { res.status(401).json({ error: 'Invalid or expired token' }) } }
const tokenFor = user => jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'homefix-development-secret', { expiresIn: '7d' })

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'homefix-api' }))
app.post('/api/auth/register', asyncRoute(async (req, res) => { const { full_name, name, email, password } = req.body; if (!(full_name || name) || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, valid email, and password of at least 8 characters are required' }); const hash = await bcrypt.hash(password, 12); try { const { rows } = await pool.query('INSERT INTO users (full_name, email, password_hash, location) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role', [full_name || name, email, hash, req.body.location || 'Kathmandu']); res.status(201).json({ user: rows[0], token: tokenFor(rows[0]) }) } catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'Email already registered' }); throw error } }))
app.post('/api/auth/login', asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]); const user = rows[0]; if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' }); res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }, token: tokenFor(user) }) }))
app.get('/api/services', asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT * FROM services WHERE name ILIKE $1 ORDER BY name', [`%${req.query.search || ''}%`]); res.json(rows) }))
app.get('/api/services/:id', asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]); if (!rows[0]) return res.status(404).json({ error: 'Service not found' }); res.json(rows[0]) }))
app.get('/api/professionals', asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT * FROM professionals ORDER BY full_name'); res.json(rows) }))
app.get('/api/professionals/:id', asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT * FROM professionals WHERE id = $1', [req.params.id]); if (!rows[0]) return res.status(404).json({ error: 'Professional not found' }); res.json(rows[0]) }))
app.post('/api/bookings', auth, asyncRoute(async (req, res) => { const { service_id, professional_id, booking_date, booking_time, scheduled_date, scheduled_time, address, location, notes } = req.body; if (!service_id || !booking_date && !scheduled_date || !booking_time && !scheduled_time || !address) return res.status(400).json({ error: 'Service, date, time, and address are required' }); const { rows } = await pool.query('INSERT INTO bookings (user_id, service_id, professional_id, booking_date, booking_time, address, location, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [req.user.id, service_id, professional_id || null, booking_date || scheduled_date, booking_time || scheduled_time, address, location || 'Kathmandu', notes || null]); res.status(201).json(rows[0]) }))
app.get('/api/bookings', auth, asyncRoute(async (req, res) => { const { rows } = await pool.query('SELECT b.*, s.name AS service_name, p.full_name AS professional_name FROM bookings b JOIN services s ON s.id = b.service_id LEFT JOIN professionals p ON p.id = b.professional_id WHERE b.user_id = $1 ORDER BY b.booking_date DESC', [req.user.id]); res.json(rows) }))
app.patch('/api/bookings/:id/status', auth, asyncRoute(async (req, res) => { const { rows } = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [req.body.status, req.params.id, req.user.id]); if (!rows[0]) return res.status(404).json({ error: 'Booking not found' }); res.json(rows[0]) }))
app.post('/api/reviews', auth, asyncRoute(async (req, res) => { if (!req.body.professional_id || !Number.isInteger(req.body.rating) || req.body.rating < 1 || req.body.rating > 5 || !req.body.comment) return res.status(400).json({ error: 'Professional, rating from 1-5, and comment are required' }); const { rows } = await pool.query('INSERT INTO reviews (user_id, professional_id, booking_id, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.user.id, req.body.professional_id, req.body.booking_id || null, req.body.rating, req.body.comment]); res.status(201).json(rows[0]) }))
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Internal server error' }) })
app.listen(port, () => console.log(`HomeFix API listening on http://localhost:${port}`))
