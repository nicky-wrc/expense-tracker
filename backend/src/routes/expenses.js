const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, categoryId, sortBy, sortOrder } = req.query

    const where = { userId: req.user.id }

    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const orderBy = {}
    orderBy[sortBy || 'date'] = sortOrder || 'desc'

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true, trip: true },
      orderBy
    })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { amount, description, date, categoryId, receiptUrl, tripId } = req.body
    
    if (!amount || !categoryId || !date) {
      return res.status(400).json({ error: 'Missing required fields: amount, categoryId, date' })
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date),
        categoryId,
        receiptUrl: receiptUrl || null,
        tripId: tripId || null,
        userId: req.user.id
      },
      include: { category: true, trip: true }
    })
    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { amount, description, date, categoryId, receiptUrl, tripId } = req.body
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId,
        receiptUrl,
        tripId: tripId || null
      },
      include: { category: true, trip: true }
    })
    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } })
    res.json({ message: 'Expense deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router