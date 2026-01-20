import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { expenseAPI, categoryAPI, dashboardAPI, tripAPI } from '../services/api'
import { Eye, Image as ImageIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { 
  Home, User, LogOut, Plus, FileText, Upload, BarChart3, Plane, 
  Filter, Calendar, Trash2, Edit2, X, Search, Download, Settings,
  TrendingUp, Wallet as WalletIcon, DollarSign, Receipt
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [trips, setTrips] = useState([])
  const [tripsModalKey, setTripsModalKey] = useState(0)
  const [summary, setSummary] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showReceiptViewModal, setShowReceiptViewModal] = useState(false)
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null)
  const [showTripModal, setShowTripModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [showTripsModal, setShowTripsModal] = useState(false)
  const [shouldReopenTripsModal, setShouldReopenTripsModal] = useState(false)
  const [addingExpenseToTrip, setAddingExpenseToTrip] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeNav, setActiveNav] = useState('home')
  const [receiptPreview, setReceiptPreview] = useState(null)

  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    receiptUrl: null,
    tripId: null
  })

  const [tripFormData, setTripFormData] = useState({
    name: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    expenses: [{
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: ''
    }]
  })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll()
      setCategories(res.data)
      if (res.data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [formData.categoryId])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { startDate, endDate, sortBy, sortOrder }
      if (filterCategory) params.categoryId = filterCategory

      const [expensesRes, summaryRes, tripsRes] = await Promise.all([
        expenseAPI.getAll(params),
        dashboardAPI.getSummary({ startDate, endDate }),
        tripAPI.getAll().catch(() => ({ data: [] }))
      ])

      setExpenses(expensesRes.data)
      setSummary(summaryRes.data)
      setTrips(tripsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, filterCategory, sortBy, sortOrder])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    const now = new Date()
    let start, end

    switch (range) {
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 })
        end = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
    }

    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
  }


  const fetchTrips = async () => {
    try {
      const res = await tripAPI.getAll()
      console.log('Fetched trips:', res.data)
      setTrips(res.data)
    } catch (error) {
      console.error('Error fetching trips:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingExpense) {
        await expenseAPI.update(editingExpense.id, formData)
      } else {
        await expenseAPI.create(formData)
      }
      setShowModal(false)
      setEditingExpense(null)
      setAddingExpenseToTrip(null)
      setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null, tripId: null })
      fetchData()
      if (addingExpenseToTrip) {
        fetchTrips()
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Error saving expense. Please try again.')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setAddingExpenseToTrip(null)
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      categoryId: expense.categoryId,
      receiptUrl: expense.receiptUrl || null,
      tripId: expense.tripId || null
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id)
        fetchData()
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

  const openAddModal = () => {
    setEditingExpense(null)
    setAddingExpenseToTrip(null)
    setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null, tripId: null })
    setShowModal(true)
  }

  const openReceiptModal = () => {
    setReceiptPreview(null)
    setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null })
    setShowReceiptModal(true)
  }

  const openTripModal = () => {
    setTripFormData({
      name: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      expenses: [{
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryId: categories[0]?.id || ''
      }]
    })
    setShowTripModal(true)
  }

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์ภาพใหญ่เกินไป (สูงสุด 5MB)')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์ภาพเท่านั้น')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result)
        setFormData({ ...formData, receiptUrl: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReceiptSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.amount || !formData.categoryId || !formData.date) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน (Amount, Category, Date)')
        return
      }
      
      const payload = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        categoryId: formData.categoryId,
        receiptUrl: formData.receiptUrl || null
      }
      
      await expenseAPI.create(payload)
      setShowReceiptModal(false)
      setReceiptPreview(null)
      setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null })
      fetchData()
      alert('บันทึกค่าใช้จ่ายพร้อมใบเสร็จสำเร็จ!')
    } catch (error) {
      console.error('Error saving receipt expense:', error)
      const errorMessage = error.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการบันทึก'
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`)
    }
  }

  const handleTripSubmit = async (e) => {
    e.preventDefault()
    try {
      const tripData = {
        name: tripFormData.name,
        description: tripFormData.description || '',
        startDate: tripFormData.startDate,
        endDate: tripFormData.endDate || null,
        expenses: tripFormData.expenses.filter(exp => exp.amount && exp.categoryId)
      }
      
      if (editingTrip) {
        const response = await tripAPI.update(editingTrip.id, tripData)
        console.log('Trip updated successfully:', response.data)
        
        // Close edit modal first
        setShowTripModal(false)
        setEditingTrip(null)
        setTripFormData({
          name: '',
          description: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: '',
          expenses: [{
            amount: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            categoryId: categories[0]?.id || ''
          }]
        })
        
        alert('แก้ไขการเดินทางสำเร็จ!')
        
        // Refresh dashboard data first (this also updates trips)
        await fetchData()
        
        // Reopen View Trips modal if it was open before edit
        if (shouldReopenTripsModal) {
          setShouldReopenTripsModal(false)
          
          // Close modal first to force unmount
          setShowTripsModal(false)
          
          // Wait a bit, then refresh trips and reopen modal
          setTimeout(async () => {
            // Force refresh trips one more time before reopening
            const finalTripsResponse = await tripAPI.getAll()
            console.log('Final trips before reopening modal:', finalTripsResponse.data)
            console.log('Trip details:', finalTripsResponse.data.map(t => ({
              id: t.id,
              name: t.name,
              description: t.description,
              updatedAt: t.updatedAt,
              expensesCount: t.expenses?.length || 0,
              expenses: t.expenses
            })))
            
            // Use functional update to ensure React recognizes the change
            const newTrips = JSON.parse(JSON.stringify(finalTripsResponse.data))
            console.log('Setting trips state to (new array):', newTrips)
            
            // Update trips state immediately
            setTrips(newTrips)
            
            // Force re-render by updating key
            setTripsModalKey(prev => prev + 1)
            
            // Reopen modal after state update with a longer delay to ensure state is processed
            setTimeout(() => {
              console.log('Reopening modal, current trips:', trips)
              setShowTripsModal(true)
            }, 300)
          }, 250)
        }
      } else {
        await tripAPI.create(tripData)
        alert('สร้างการเดินทางสำเร็จ!')
        
        setShowTripModal(false)
        setEditingTrip(null)
        setTripFormData({
          name: '',
          description: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: '',
          expenses: [{
            amount: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            categoryId: categories[0]?.id || ''
          }]
        })
        // Refresh data after successful creation
        await Promise.all([fetchData(), fetchTrips()])
      }
    } catch (error) {
      console.error('Error saving trip:', error)
      console.error('Error details:', error.response?.data)
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEditTrip = (trip) => {
    setEditingTrip(trip)
    // If trip has expenses, use the first one; otherwise create empty expense
    const existingExpense = trip.expenses && trip.expenses.length > 0 ? trip.expenses[0] : null
    setTripFormData({
      name: trip.name,
      description: trip.description || '',
      startDate: format(new Date(trip.startDate), 'yyyy-MM-dd'),
      endDate: trip.endDate ? format(new Date(trip.endDate), 'yyyy-MM-dd') : '',
      expenses: existingExpense ? [{
        id: existingExpense.id,
        amount: existingExpense.amount.toString(),
        description: existingExpense.description || '',
        date: format(new Date(existingExpense.date), 'yyyy-MM-dd'),
        categoryId: existingExpense.categoryId
      }] : [{
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryId: categories[0]?.id || ''
      }]
    })
    // Store that View Trips modal was open (we'll reopen it after edit)
    // Close View Trips modal before opening Edit modal
    const wasTripsModalOpen = showTripsModal
    if (wasTripsModalOpen) {
      setShouldReopenTripsModal(true)
    }
    setShowTripsModal(false)
    setShowTripModal(true)
  }

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบการเดินทางนี้? ค่าใช้จ่ายทั้งหมดจะไม่ถูกลบ แต่จะไม่เชื่อมโยงกับการเดินทางอีกต่อไป')) {
      try {
        await tripAPI.delete(tripId)
        fetchTrips()
        fetchData()
        alert('ลบการเดินทางสำเร็จ!')
      } catch (error) {
        console.error('Error deleting trip:', error)
        alert('เกิดข้อผิดพลาดในการลบ')
      }
    }
  }

  const handleAddExpenseToTrip = (tripId) => {
    setAddingExpenseToTrip(tripId)
    setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null, tripId })
    setShowModal(true)
  }

  const exportExpenses = () => {
    // Escape function สำหรับ CSV
    const escapeCSV = (text) => {
      const str = String(text || '')
      // ถ้ามี comma, quote, หรือ newline ต้องใส่ quote และ escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // สร้าง header ภาษาไทย
    const headers = [
      'วันที่',
      'หมวดหมู่',
      'คำอธิบาย',
      'การเดินทาง',
      'จำนวนเงิน',
      'มีใบเสร็จ'
    ]

    // คำนวณยอดรวมจากข้อมูลที่ filter แล้ว
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
    const totalCount = filteredExpenses.length

    // สร้าง category summary จาก filtered expenses
    const categorySummary = {}
    filteredExpenses.forEach(exp => {
      const catName = exp.category?.name || 'ไม่ระบุ'
      const catIcon = exp.category?.icon || ''
      if (!categorySummary[catName]) {
        categorySummary[catName] = {
          name: catName,
          icon: catIcon,
          count: 0,
          total: 0
        }
      }
      categorySummary[catName].count++
      categorySummary[catName].total += parseFloat(exp.amount) || 0
    })

    // แปลงข้อมูลเป็น CSV format
    const csvRows = [
      headers.join(','),
      ...filteredExpenses.map(exp => {
        const date = format(new Date(exp.date), 'dd/MM/yyyy')
        const category = `${exp.category?.icon || ''} ${exp.category?.name || 'ไม่ระบุ'}`.trim()
        const description = exp.description || 'ไม่มีคำอธิบาย'
        const trip = exp.trip?.name || '-'
        const amount = (parseFloat(exp.amount) || 0).toFixed(2)
        const hasReceipt = exp.receiptUrl ? 'มี' : 'ไม่มี'

        return [
          escapeCSV(date),
          escapeCSV(category),
          escapeCSV(description),
          escapeCSV(trip),
          amount,
          escapeCSV(hasReceipt)
        ].join(',')
      })
    ]

    // เพิ่ม summary section
    csvRows.push('') // empty row
    csvRows.push('สรุป,รายการ,ยอดรวม (฿)')
    csvRows.push(`จำนวนรายการทั้งหมด,${totalCount},${totalAmount.toFixed(2)}`)
    
    // เพิ่ม category summary
    if (Object.keys(categorySummary).length > 0) {
      csvRows.push('') // empty row
      csvRows.push('สรุปตามหมวดหมู่,จำนวนรายการ,ยอดรวม (฿)')
      Object.values(categorySummary).forEach(cat => {
        csvRows.push(`${escapeCSV(cat.icon + ' ' + cat.name)},${cat.count},${cat.total.toFixed(2)}`)
      })
    }

    const csvContent = csvRows.join('\n')
    
    // เพิ่ม BOM (Byte Order Mark) เพื่อให้ Excel อ่าน UTF-8 ได้ถูกต้อง
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const fileName = `รายงานค่าใช้จ่าย_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const filteredExpenses = expenses.filter(exp => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      exp.description?.toLowerCase().includes(query) ||
      exp.category?.name.toLowerCase().includes(query) ||
      exp.amount.toString().includes(query)
    )
  })

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  // Calculate pending tasks
  const pendingApprovals = expenses.filter(e => !e.description).length
  const newTripsRegistered = trips.filter(t => {
    const tripDate = new Date(t.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return tripDate > weekAgo
  }).length
  const unreportedExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expenseDate > today
  }).length
  const upcomingExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date)
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    today.setHours(0, 0, 0, 0)
    expenseDate.setHours(0, 0, 0, 0)
    return expenseDate > today && expenseDate <= nextWeek
  }).length

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.profileSection}>
          <div style={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <h3 style={styles.profileName}>{user?.name || 'User'}</h3>
        </div>

        <nav style={styles.nav}>
          <button 
            style={{ ...styles.navItem, ...(activeNav === 'home' ? styles.navItemActive : {}) }}
            onClick={() => {
              setActiveNav('home')
              navigate('/dashboard')
            }}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <button 
            style={{ ...styles.navItem, ...(activeNav === 'profile' ? styles.navItemActive : {}) }}
            onClick={() => {
              setActiveNav('profile')
              navigate('/profile')
            }}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>

        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span>EXT</span>
          </div>
          <span style={styles.logoText}>Expense Tracker</span>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
        </div>

        {/* Pending Tasks & Recent Expenses Cards */}
        <div style={styles.topCards}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pending Tasks</h3>
            <div style={styles.taskList}>
              <div style={styles.taskItem}>
                <span style={styles.taskLabel}>Pending Approvals</span>
                <span style={styles.taskCount}>{pendingApprovals}</span>
              </div>
              <div style={styles.taskItem}>
                <span style={styles.taskLabel}>New Trips Registered</span>
                <span style={styles.taskCount}>{newTripsRegistered}</span>
              </div>
              <div style={styles.taskItem}>
                <span style={styles.taskLabel}>Unreported Expenses</span>
                <span style={styles.taskCount}>{unreportedExpenses}</span>
              </div>
              <div style={styles.taskItem}>
                <span style={styles.taskLabel}>Upcoming Expenses</span>
                <span style={styles.taskCount}>{upcomingExpenses}</span>
              </div>
              <div style={styles.taskItem}>
                <span style={styles.taskLabel}>Expenses with Receipts</span>
                <span style={styles.taskCount}>{expenses.filter(e => e.receiptUrl).length}</span>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Recent Expenses</h3>
            <div style={styles.recentTable}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.slice(0, 5).map((expense) => (
                    <tr key={expense.id} style={styles.tr}>
                      <td style={styles.td}>{expense.description || 'No description'}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryTag}>{expense.category?.name || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                      <td style={styles.tdAmount}>฿{expense.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="4" style={styles.tdEmpty}>No recent expenses</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Access</h3>
          <div style={styles.quickAccess}>
            <button onClick={openAddModal} style={styles.quickBtn}>
              <div style={{ ...styles.quickIcon, background: 'rgba(239, 68, 68, 0.2)' }}>
                <Plus size={24} color="#ef4444" />
              </div>
              <span>New expense</span>
            </button>
            <button onClick={openReceiptModal} style={styles.quickBtn}>
              <div style={{ ...styles.quickIcon, background: 'rgba(59, 130, 246, 0.2)' }}>
                <Upload size={24} color="#3b82f6" />
              </div>
              <span>Add receipt</span>
            </button>
            <button onClick={exportExpenses} style={styles.quickBtn}>
              <div style={{ ...styles.quickIcon, background: 'rgba(16, 185, 129, 0.2)' }}>
                <BarChart3 size={24} color="#10b981" />
              </div>
              <span>Create report</span>
            </button>
            <button onClick={openTripModal} style={styles.quickBtn}>
              <div style={{ ...styles.quickIcon, background: 'rgba(168, 85, 247, 0.2)' }}>
                <Plane size={24} color="#a855f7" />
              </div>
              <span>Create trip</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={styles.filterSection}>
          <div style={styles.searchBox}>
            <Search size={18} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterControls}>
            <div style={styles.dateRangeButtons}>
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  style={{
                    ...styles.rangeBtn,
                    ...(dateRange === range ? styles.rangeBtnActive : {})
                  }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.filterGroup}>
              <Calendar size={16} color="#9ca3af" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
              <span style={styles.dateSeparator}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <Filter size={16} color="#9ca3af" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.select}
            >
              <option value="" style={styles.option}>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} style={styles.option}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-')
                setSortBy(by)
                setSortOrder(order)
              }}
              style={styles.select}
            >
              <option value="date-desc" style={styles.option}>Date (Newest)</option>
              <option value="date-asc" style={styles.option}>Date (Oldest)</option>
              <option value="amount-desc" style={styles.option}>Amount (High-Low)</option>
              <option value="amount-asc" style={styles.option}>Amount (Low-High)</option>
            </select>

            <button onClick={exportExpenses} style={styles.exportBtn}>
              <Download size={16} />
              Export
            </button>
            <button onClick={() => {
              fetchTrips()
              setShowTripsModal(true)
            }} style={styles.exportBtn}>
              <Plane size={16} />
              View Trips ({trips.length})
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div style={styles.summaryCards}>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryIcon, background: 'rgba(59, 130, 246, 0.2)' }}>
                <DollarSign size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={styles.summaryLabel}>Total Expenses</p>
                <p style={styles.summaryValue}>฿{summary.totalExpense.toLocaleString()}</p>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryIcon, background: 'rgba(16, 185, 129, 0.2)' }}>
                <Receipt size={24} color="#10b981" />
              </div>
              <div>
                <p style={styles.summaryLabel}>Transactions</p>
                <p style={styles.summaryValue}>{summary.totalTransactions}</p>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryIcon, background: 'rgba(168, 85, 247, 0.2)' }}>
                <TrendingUp size={24} color="#a855f7" />
              </div>
              <div>
                <p style={styles.summaryLabel}>Avg per Transaction</p>
                <p style={styles.summaryValue}>
                  ฿{summary.totalTransactions > 0 ? (summary.totalExpense / summary.totalTransactions).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {summary && summary.byCategory.length > 0 && (
          <div style={styles.chartsContainer}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Team Spending Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.byCategory.map((cat) => ({
                  name: cat.name.slice(0, 2).toUpperCase(),
                  value: cat.total,
                  color: cat.color || '#3b82f6'
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ 
                      background: '#1a1a1a', 
                      border: '1px solid #2a2a2a', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    formatter={(value) => [`฿${value.toLocaleString()}`, 'Value']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {summary.byCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Day-to-Day Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.byDate.map(date => ({
                  ...date,
                  dateShort: format(new Date(date.date), 'MMM dd')
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="dateShort" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ 
                      background: '#1a1a1a', 
                      border: '1px solid #2a2a2a', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    formatter={(value) => [`฿${value.toLocaleString()}`, 'Value']}
                    labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  />
                  <Bar dataKey="total" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>All Expenses</h3>
            <button onClick={openAddModal} style={styles.addBtn}>
              <Plus size={18} />
              Add Expense
            </button>
          </div>

          {loading ? (
            <p style={styles.loading}>Loading...</p>
          ) : filteredExpenses.length === 0 ? (
            <p style={styles.noData}>No expenses found. Add your first expense!</p>
          ) : (
            <div style={styles.expensesTable}>
              <table style={styles.fullTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Trip</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Receipt</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} style={styles.tr}>
                      <td style={styles.td}>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryTag}>{expense.category?.icon} {expense.category?.name || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>{expense.description || 'No description'}</td>
                      <td style={styles.td}>
                        {expense.trip ? (
                          <span style={styles.tripTag} title={expense.trip.description || ''}>
                            <Plane size={14} />
                            {expense.trip.name}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                        )}
                      </td>
                      <td style={styles.tdAmount}>฿{expense.amount.toLocaleString()}</td>
                      <td style={styles.td}>
                        {expense.receiptUrl ? (
                          <button
                            onClick={() => {
                              setViewReceiptUrl(expense.receiptUrl)
                              setShowReceiptViewModal(true)
                            }}
                            style={styles.receiptBtn}
                            title="View Receipt"
                          >
                            <ImageIcon size={16} />
                            View
                          </button>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>No receipt</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button onClick={() => handleEdit(expense)} style={styles.editBtn}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} style={styles.deleteBtn}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingExpense ? 'Edit Expense' : addingExpenseToTrip ? 'Add Expense to Trip' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (฿)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="" style={styles.option}>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={styles.option}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.input}
                  placeholder="What was this expense for?"
                />
              </div>
              <button type="submit" style={styles.submitBtn}>
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {showReceiptViewModal && viewReceiptUrl && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptViewModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Receipt</h3>
              <button onClick={() => setShowReceiptViewModal(false)} style={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <img src={viewReceiptUrl} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}

      {/* Receipt Add Modal */}
      {showReceiptModal && !viewReceiptUrl && (
        <div style={styles.modalOverlay} onClick={() => {
          setShowReceiptModal(false)
          setReceiptPreview(null)
          setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null })
        }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Receipt & Expense</h3>
              <button onClick={() => {
                setShowReceiptModal(false)
                setReceiptPreview(null)
                setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '', receiptUrl: null })
              }} style={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleReceiptSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>อัพโหลดใบเสร็จ</label>
                <div style={styles.uploadArea}>
                  {receiptPreview ? (
                    <div style={styles.receiptPreview}>
                      <img src={receiptPreview} alt="Receipt" style={styles.receiptImage} />
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptPreview(null)
                          setFormData({ ...formData, receiptUrl: null })
                        }}
                        style={styles.removeReceiptBtn}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label style={styles.uploadLabel}>
                      <Upload size={32} color="#9ca3af" />
                      <span>คลิกเพื่อเลือกไฟล์</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (฿)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="" style={styles.option}>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={styles.option}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.input}
                  placeholder="What was this expense for?"
                />
              </div>
              <button type="submit" style={styles.submitBtn}>
                Add Receipt & Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {showTripModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTripModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingTrip ? 'Edit Trip' : 'Create New Trip'}</h3>
              <button onClick={() => {
                setShowTripModal(false)
                setEditingTrip(null)
              }} style={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleTripSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trip Name</label>
                <input
                  type="text"
                  value={tripFormData.name}
                  onChange={(e) => setTripFormData({ ...tripFormData, name: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Business Trip to Bangkok"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description (optional)</label>
                <textarea
                  value={tripFormData.description}
                  onChange={(e) => setTripFormData({ ...tripFormData, description: e.target.value })}
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Trip details..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={tripFormData.startDate}
                    onChange={(e) => setTripFormData({ ...tripFormData, startDate: e.target.value })}
                    style={styles.dateInputModal}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date (optional)</label>
                  <input
                    type="date"
                    value={tripFormData.endDate}
                    onChange={(e) => setTripFormData({ ...tripFormData, endDate: e.target.value })}
                    style={styles.dateInputModal}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Initial Expense (optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={tripFormData.expenses[0]?.amount || ''}
                    onChange={(e) => {
                      const currentExpense = tripFormData.expenses[0] || { amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '' }
                      setTripFormData({
                        ...tripFormData,
                        expenses: [{ ...currentExpense, amount: e.target.value }]
                      })
                    }}
                    style={styles.input}
                    placeholder="Amount (฿)"
                  />
                  <select
                    value={tripFormData.expenses[0]?.categoryId || ''}
                    onChange={(e) => {
                      const currentExpense = tripFormData.expenses[0] || { amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '' }
                      setTripFormData({
                        ...tripFormData,
                        expenses: [{ ...currentExpense, categoryId: e.target.value }]
                      })
                    }}
                    style={styles.input}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={tripFormData.expenses[0]?.description || ''}
                    onChange={(e) => {
                      const currentExpense = tripFormData.expenses[0] || { amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: categories[0]?.id || '' }
                      setTripFormData({
                        ...tripFormData,
                        expenses: [{ ...currentExpense, description: e.target.value }]
                      })
                    }}
                    style={styles.input}
                    placeholder="Description"
                  />
                </div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                {editingTrip ? 'Update Trip' : 'Create Trip'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trips List Modal */}
      {showTripsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTripsModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>My Trips</h3>
              <button onClick={() => setShowTripsModal(false)} style={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <div style={{ marginTop: '20px' }}>
              {trips.length === 0 ? (
                <p style={styles.noData}>No trips found. Create your first trip!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} key={`trips-container-${tripsModalKey}-${trips.map(t => `${t.id}-${t.updatedAt || t.createdAt}`).join('-')}`}>
                  {trips.map((trip) => {
                    const totalExpenses = trip.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
                    return (
                      <div key={`${trip.id}-${trip.updatedAt || trip.createdAt}`} style={{ ...styles.card, padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              {trip.name}
                            </h4>
                            {trip.description && (
                              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>{trip.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: '16px', color: '#9ca3af', fontSize: '13px' }}>
                              <span>📅 Start: {format(new Date(trip.startDate), 'MMM dd, yyyy')}</span>
                              {trip.endDate && (
                                <span>📅 End: {format(new Date(trip.endDate), 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>
                              ฿{totalExpenses.toLocaleString()}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                              {trip.expenses?.length || 0} expenses
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditTrip(trip)}
                                style={styles.editBtn}
                                title="Edit Trip"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleAddExpenseToTrip(trip.id)}
                                style={styles.addBtn}
                                title="Add Expense to Trip"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTrip(trip.id)}
                                style={styles.deleteBtn}
                                title="Delete Trip"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {trip.expenses && trip.expenses.length > 0 && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {trip.expenses.map((expense) => (
                                <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#0f0f0f', borderRadius: '6px' }}>
                                  <div>
                                    <span style={{ color: '#ffffff', fontSize: '14px' }}>
                                      {expense.category?.icon} {expense.category?.name}
                                    </span>
                                    {expense.description && (
                                      <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
                                        {expense.description}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ color: '#ef4444', fontWeight: '600' }}>
                                    ฿{expense.amount.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0f0f',
    color: '#ffffff'
  },
  sidebar: {
    width: '260px',
    background: '#1a1a1a',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto'
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #2a2a2a'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#9ca3af',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  navItemActive: {
    background: '#2a2a2a',
    color: '#ffffff'
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: '16px',
    paddingTop: '24px',
    borderTop: '1px solid #2a2a2a'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  logoText: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%'
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '32px',
    background: '#0f0f0f'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff'
  },
  topCards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #2a2a2a'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#0f0f0f',
    borderRadius: '10px'
  },
  taskLabel: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  taskCount: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600'
  },
  recentTable: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '1px solid #2a2a2a'
  },
  tr: {
    borderBottom: '1px solid #2a2a2a'
  },
  td: {
    padding: '12px',
    color: '#ffffff',
    fontSize: '14px'
  },
  tdAmount: {
    padding: '12px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600'
  },
  tdEmpty: {
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af'
  },
  categoryTag: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#2a2a2a',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#ffffff'
  },
  quickAccess: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: '#0f0f0f',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  quickIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterSection: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '15px'
  },
  filterControls: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  dateRangeButtons: {
    display: 'flex',
    gap: '8px'
  },
  rangeBtn: {
    padding: '8px 16px',
    border: '1px solid #2a2a2a',
    background: '#1a1a1a',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#9ca3af',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  rangeBtnActive: {
    background: '#2a2a2a',
    color: '#ffffff',
    borderColor: '#3b82f6'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px'
  },
  dateInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '14px'
  },
  dateSeparator: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  select: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    outline: 'none',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 8px'
  },
  option: {
    background: '#1a1a1a',
    color: '#ffffff'
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  summaryCard: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #2a2a2a'
  },
  summaryIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '4px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff'
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  chartCard: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #2a2a2a'
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px'
  },
  expensesTable: {
    overflowX: 'auto'
  },
  fullTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px'
  },
  noData: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: '#1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '500px',
    margin: '20px',
    border: '1px solid #2a2a2a',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: '#ffffff',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#2a2a2a',
    borderRadius: '10px',
    fontSize: '15px',
    background: '#0f0f0f',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  dateInputModal: {
    padding: '12px 16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#2a2a2a',
    borderRadius: '10px',
    fontSize: '15px',
    background: '#0f0f0f',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s',
    colorScheme: 'dark',
    WebkitAppearance: 'none',
    position: 'relative'
  },
  submitBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.2s'
  },
  uploadArea: {
    border: '2px dashed #2a2a2a',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    background: '#0f0f0f',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#9ca3af'
  },
  receiptPreview: {
    position: 'relative',
    width: '100%',
    maxHeight: '300px',
    display: 'flex',
    justifyContent: 'center'
  },
  receiptImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    border: '1px solid #2a2a2a'
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(239, 68, 68, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff'
  },
  receiptBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#3b82f6',
    fontSize: '13px',
    fontWeight: '500'
  },
  tripTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#a855f7',
    fontWeight: '500'
  }
}

export default Dashboard
