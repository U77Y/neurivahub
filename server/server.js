// NeurivaHub API: Express + MongoDB + JWT
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(express.json())

// ---------- Models (the shape of our data) ----------
const S = mongoose.Schema
const User = mongoose.model('User', new S({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: 'user' },   // 'user' or 'admin'
  plan: { type: String, default: 'Free' }
}, { timestamps: true }))
const Course = mongoose.model('Course', new S({ title: String, price: String, level: String, icon: String }))
const Project = mongoose.model('Project', new S({ title: String, category: String, icon: String }))
const Event = mongoose.model('Event', new S({ title: String, date: String, place: String, attendees: [{ type: S.Types.ObjectId, ref: 'User' }] }))
const Message = mongoose.model('Message', new S({ name: String, email: String, message: String }, { timestamps: true }))

// ---------- Auth helpers ----------
const sign = u => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
// Must be logged in
const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '')
  try { req.user = jwt.verify(t, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Please log in' }) }
}
// Must be admin
const admin = (req, res, next) => auth(req, res, () =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only' }))
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ error: e.message }))

app.post('/api/auth/signup', wrap(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6) throw new Error('Name, email and 6+ character password needed')
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  res.json({ token: sign(user), user: { id: user._id, name, email, role: user.role, plan: user.plan } })
}))
app.post('/api/auth/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() })
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) throw new Error('Wrong email or password')
  res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan } })
}))

// ---------- Users (admin only) ----------
app.get('/api/users', admin, wrap(async (req, res) => res.json(await User.find().select('-password'))))
app.put('/api/users/me/plan', auth, wrap(async (req, res) =>
  res.json(await User.findByIdAndUpdate(req.user.id, { plan: req.body.plan }, { new: true }).select('-password'))))
app.delete('/api/users/:id', admin, wrap(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.json({ ok: true }) }))

// ---------- Courses, Projects, Events: public read, admin write ----------
const crud = (path, Model) => {
  app.get(path, wrap(async (req, res) => res.json(await Model.find())))
  app.post(path, admin, wrap(async (req, res) => res.json(await Model.create(req.body))))
  app.put(path + '/:id', admin, wrap(async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }))))
  app.delete(path + '/:id', admin, wrap(async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }) }))
}
crud('/api/courses', Course)
crud('/api/projects', Project)
crud('/api/events', Event)
// Logged-in user registers for an event
app.post('/api/events/:id/register', auth, wrap(async (req, res) =>
  res.json(await Event.findByIdAndUpdate(req.params.id, { $addToSet: { attendees: req.user.id } }, { new: true }))))

// ---------- Contact form saves to DB ----------
app.post('/api/contact', wrap(async (req, res) => res.json(await Message.create(req.body))))
app.get('/api/contact', admin, wrap(async (req, res) => res.json(await Message.find().sort('-createdAt'))))

// ---------- Dashboard stats ----------
app.get('/api/stats', admin, wrap(async (req, res) => {
  const users = await User.find()
  const price = { Pro: 25000, Premium: 60000 }
  res.json({
    users: users.length, courses: await Course.countDocuments(), projects: await Project.countDocuments(),
    revenue: users.reduce((s, u) => s + (price[u.plan] || 0), 0)
  })
}))

// ---------- Start + first-time seed ----------
mongoose.connect(process.env.MONGO_URI).then(async () => {
  if (!(await User.findOne({ role: 'admin' })))
    await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), role: 'admin', plan: 'Premium' })
  if (!(await Course.countDocuments()))
    await Course.insertMany([['Coding','TSh 40,000','Beginner','Code2'],['AI','TSh 60,000','Intermediate','Brain'],['Design','TSh 35,000','Beginner','PenTool'],['Arduino','TSh 45,000','Beginner','Cpu'],['Web Dev','TSh 50,000','Intermediate','Globe'],['Startup','TSh 30,000','All levels','Rocket']].map(a => ({ title: a[0], price: a[1], level: a[2], icon: a[3] })))
  if (!(await Project.countDocuments()))
    await Project.insertMany([['Soko Bot','AI','Bot'],['Smart Duka','Hardware','Cpu'],['Mbeya Eats','Web','Utensils'],['Kanga UI Kit','Design','Palette'],['Solar Tracker','Hardware','Sun'],['Swahili Chat','AI','MessageCircle']].map(a => ({ title: a[0], category: a[1], icon: a[2] })))
  if (!(await Event.countDocuments()))
    await Event.insertMany([['Hack Night Mbeya','Nov 8','Mbeya Tech Hub'],['Arduino Bootcamp','Nov 22','Dar es Salaam'],['Demo Day 2026','Dec 5','Iringa'],['Design Jam','Dec 14','Online']].map(a => ({ title: a[0], date: a[1], place: a[2] })))
  app.listen(process.env.PORT || 5000, () => console.log('API running on port ' + (process.env.PORT || 5000)))
}).catch(e => console.error('MongoDB error:', e.message))
