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
    const { name, description, startDate, endDate, expenses } = req.body

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        expenses: true
      }
    })

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Trip name is required' })
    }

    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' })
    }

    const updateData = {
      name: name.trim(),
      description: description !== undefined && description !== null ? description.trim() : null,
      startDate: new Date(startDate),
      endDate: endDate !== undefined && endDate ? new Date(endDate) : null
    }

    // Handle expenses update if provided
    if (expenses !== undefined && Array.isArray(expenses)) {
      // Delete existing expenses that are not in the new list
      const existingExpenseIds = existingTrip.expenses.map(e => e.id)
      const newExpenseIds = expenses
        .filter(exp => exp.id) // Only keep expenses that have an id (existing expenses)
        .map(exp => exp.id)
      
      const expensesToDelete = existingExpenseIds.filter(id => !newExpenseIds.includes(id))
      if (expensesToDelete.length > 0) {
        await prisma.expense.deleteMany({
          where: {
            id: { in: expensesToDelete },
            tripId: req.params.id
          }
        })
      }

      // Update or create expenses
      const expenseUpdates = expenses
        .filter(exp => exp.amount && exp.categoryId) // Only process valid expenses
        .map(exp => {
          if (exp.id) {
            // Update existing expense
            return prisma.expense.update({
              where: { id: exp.id },
              data: {
                amount: parseFloat(exp.amount),
                description: exp.description || null,
                date: new Date(exp.date),
                categoryId: exp.categoryId
              }
            })
          } else {
            // Create new expense
            return prisma.expense.create({
              data: {
                amount: parseFloat(exp.amount),
                description: exp.description || null,
                date: new Date(exp.date),
                categoryId: exp.categoryId,
                tripId: req.params.id,
                userId: req.user.id
              }
            })
          }
        })

      if (expenseUpdates.length > 0) {
        await Promise.all(expenseUpdates)
      }
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
    console.error('Error updating trip:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    })

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    await prisma.trip.delete({
      where: { id: req.params.id }
    })
    res.json({ message: 'Trip deleted' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
