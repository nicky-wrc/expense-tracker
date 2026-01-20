const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body
    const category = await prisma.category.create({
      data: { name, icon, color, userId: req.user.id }
    })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color } = req.body
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon, color }
    })
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router