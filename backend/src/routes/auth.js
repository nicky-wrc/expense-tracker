const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    })

    const defaultCategories = [
      { name: 'Food & Drinks', icon: '🍔', color: '#FF6384', userId: user.id },
      { name: 'Transportation', icon: '🚗', color: '#36A2EB', userId: user.id },
      { name: 'Shopping', icon: '🛒', color: '#FFCE56', userId: user.id },
      { name: 'Entertainment', icon: '🎬', color: '#4BC0C0', userId: user.id },
      { name: 'Bills & Utilities', icon: '💡', color: '#9966FF', userId: user.id },
      { name: 'Health', icon: '💊', color: '#FF9F40', userId: user.id },
      { name: 'Other', icon: '📦', color: '#C9CBCF', userId: user.id }
    ]
    await prisma.category.createMany({ data: defaultCategories })

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Update profile route (requires auth middleware)
const authMiddleware = require('../middleware/auth')

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, password, avatar } = req.body
    const userId = req.user.id

    const updateData = {}
    if (name) updateData.name = name
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }
    // Note: avatar would need proper image upload handling
    // For now, we'll store it as a URL string
    if (avatar) updateData.avatar = avatar

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, avatar: true }
    })

    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router