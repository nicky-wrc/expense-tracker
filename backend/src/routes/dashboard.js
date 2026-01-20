const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const where = { userId: req.user.id }
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true }
    })

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const byCategory = expenses.reduce((acc, exp) => {
      const catName = exp.category.name
      if (!acc[catName]) {
        acc[catName] = { name: catName, icon: exp.category.icon, color: exp.category.color, total: 0, count: 0 }
      }
      acc[catName].total += exp.amount
      acc[catName].count += 1
      return acc
    }, {})

    const byDate = expenses.reduce((acc, exp) => {
      const date = exp.date.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, total: 0 }
      }
      acc[date].total += exp.amount
      return acc
    }, {})

    res.json({
      totalExpense,
      totalTransactions: expenses.length,
      byCategory: Object.values(byCategory),
      byDate: Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date))
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router