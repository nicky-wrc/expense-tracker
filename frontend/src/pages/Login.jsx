import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Wallet, Mail, Lock, LogIn, ArrowRight } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await authAPI.login({ email, password })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Wallet size={40} color="#7c3aed" />
          </div>
          <h1 style={styles.title}>Expense Tracker</h1>
          <p style={styles.subtitle}>Welcome back! Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error}>
              <div style={styles.errorIcon}>!</div>
              {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <Mail size={20} color="#9ca3af" style={styles.icon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: focusedField === 'email' ? '#7c3aed' : '#2a2a2a'
              }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} color="#9ca3af" style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                borderColor: focusedField === 'password' ? '#7c3aed' : '#2a2a2a'
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
    `,
    pointerEvents: 'none'
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 1
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: '8px',
    fontSize: '15px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    position: 'absolute',
    left: '16px',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#2a2a2a',
    borderRadius: '12px',
    fontSize: '15px',
    background: '#0f0f0f',
    color: '#ffffff',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#7c3aed',
    boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)'
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '14px',
    borderRadius: '10px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ef4444',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    color: '#9ca3af',
    fontSize: '14px'
  },
  link: {
    color: '#a855f7',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.2s'
  }
}

export default Login