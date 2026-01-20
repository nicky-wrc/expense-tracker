import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { 
  Home, User, LogOut, Camera, Save, 
  Mail, Lock, User as UserIcon, Upload, X, Menu
} from 'lucide-react'

const Profile = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeNav, setActiveNav] = useState('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    avatar: user?.avatar || null
  })

  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        avatar: user.avatar || null
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'ไฟล์ภาพใหญ่เกินไป (สูงสุด 5MB)' })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'กรุณาเลือกไฟล์ภาพเท่านั้น' })
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
    setFormData({ ...formData, avatar: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'รหัสผ่านไม่ตรงกัน' })
        setLoading(false)
        return
      }
    }

    try {
      const updatePayload = {
        name: formData.name
      }
      
      if (formData.password) {
        updatePayload.password = formData.password
      }
      
      if (formData.avatar) {
        updatePayload.avatar = formData.avatar
      }

      const res = await authAPI.updateProfile(updatePayload)
      
      // Update user context
      updateUser(res.data.user)
      
      setMessage({ type: 'success', text: 'อัพเดทโปรไฟล์สำเร็จ!' })
      
      // Clear password fields
      setFormData({ ...formData, password: '', confirmPassword: '' })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 1001,
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            padding: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? {
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1000
        } : {})
      }}>
        <div style={styles.profileSection}>
          <div style={styles.avatar}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={styles.avatarImage} />
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
              if (isMobile) setIsMobileMenuOpen(false)
            }}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <button 
            style={{ ...styles.navItem, ...(activeNav === 'profile' ? styles.navItemActive : {}) }}
            onClick={() => setActiveNav('profile')}
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
      <main style={{
        ...styles.main,
        ...(isMobile ? {
          marginLeft: '0',
          width: '100%',
          padding: '16px',
          paddingTop: '60px'
        } : {})
      }}>
        <div style={styles.topBar}>
          <h1 style={{
            ...styles.pageTitle,
            ...(isMobile ? { fontSize: '24px' } : {})
          }}>Profile Settings</h1>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ข้อมูลโปรไฟล์</h2>

          {message.text && (
            <div style={{
              ...styles.message,
              background: message.type === 'success' 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' 
                ? 'rgba(16, 185, 129, 0.3)' 
                : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.type === 'success' ? '#10b981' : '#f87171'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Avatar Section */}
            <div style={styles.avatarSection}>
              <label style={styles.label}>รูปโปรไฟล์</label>
              <div style={styles.avatarContainer}>
                <div style={styles.avatarWrapper}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" style={styles.largeAvatar} />
                  ) : (
                    <div style={styles.largeAvatarPlaceholder}>
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <label style={styles.avatarUploadBtn}>
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      style={styles.removeAvatarBtn}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <p style={styles.avatarHint}>คลิกที่ไอคอนกล้องเพื่ออัพโหลดรูปภาพ (สูงสุด 5MB)</p>
              </div>
            </div>

            {/* Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <UserIcon size={18} style={{ marginRight: '8px' }} />
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.input}
                placeholder="ระบุชื่อ-นามสกุล"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Mail size={18} style={{ marginRight: '8px' }} />
                อีเมล
              </label>
              <input
                type="email"
                value={formData.email}
                style={{ ...styles.input, background: '#0f0f0f', cursor: 'not-allowed' }}
                disabled
                readOnly
              />
              <p style={styles.hint}>ไม่สามารถเปลี่ยนอีเมลได้</p>
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Lock size={18} style={{ marginRight: '8px' }} />
                รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                placeholder="รหัสผ่านใหม่"
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Lock size={18} style={{ marginRight: '8px' }} />
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={styles.input}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  minLength={6}
                />
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveBtn} disabled={loading}>
                <Save size={18} />
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </form>
        </div>
      </main>
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
    textAlign: 'left',
    width: '100%'
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
  card: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #2a2a2a',
    maxWidth: '700px'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '24px'
  },
  message: {
    padding: '14px 16px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  largeAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #2a2a2a'
  },
  largeAvatarPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '700',
    border: '3px solid #2a2a2a'
  },
  avatarUploadBtn: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '3px solid #1a1a1a',
    transition: 'all 0.2s'
  },
  removeAvatarBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '32px',
    height: '32px',
    background: 'rgba(239, 68, 68, 0.9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px solid #1a1a1a',
    color: '#ffffff'
  },
  avatarHint: {
    color: '#9ca3af',
    fontSize: '13px',
    textAlign: 'center'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
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
  hint: {
    color: '#9ca3af',
    fontSize: '12px',
    marginTop: '-4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  }
}

export default Profile
