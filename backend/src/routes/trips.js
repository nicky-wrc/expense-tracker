const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        expenses: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(trips)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        expenses: {
          include: { category: true }
        }
      }
    })
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }
    res.json(trip)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Create trip
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, expenses } = req.body

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id,
        expenses: expenses && expenses.length > 0 ? {
          create: expenses.map(exp => ({
            amount: parseFloat(exp.amount),
            description: exp.description,
            date: new Date(exp.date),
            categoryId: exp.categoryId,
            receiptUrl: exp.receiptUrl,
            userId: req.user.id
          }))
        } : undefined
      },
      include: {
        expenses: {
          include: { category: true }
        }
      }
    })
    res.status(201).json(trip)
  } catch (error) {
    console.error('Error creating trip:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (startDate) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null
    }

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        expenses: {
          include: { category: true }
        }
      }
    })
    res.json(trip)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id }
    })
    res.json({ message: 'Trip deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
