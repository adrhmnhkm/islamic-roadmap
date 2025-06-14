import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitTimer, setRateLimitTimer] = useState(0)
  const signup = useAuthStore((state) => state.signup)

  // Countdown timer for rate limiting
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (rateLimitTimer > 0) {
      timer = setTimeout(() => {
        setRateLimitTimer(rateLimitTimer - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [rateLimitTimer])

  const getErrorMessage = (err: any) => {
    if (err?.message?.includes('For security purposes')) {
      setRateLimitTimer(20) // Start countdown
      return 'Terlalu banyak percobaan registrasi. Silakan tunggu 20 detik sebelum mencoba lagi.'
    }
    
    if (err?.message?.includes('User already registered')) {
      return 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
    }
    
    if (err?.message?.includes('Invalid email')) {
      return 'Format email tidak valid. Silakan periksa kembali email Anda.'
    }
    
    if (err?.message?.includes('Password should be at least')) {
      return 'Password minimal 6 karakter.'
    }
    
    if (err?.status === 429 || err?.message?.includes('Too many requests')) {
      setRateLimitTimer(20)
      return 'Terlalu banyak percobaan. Silakan tunggu 20 detik dan coba lagi.'
    }
    
    return err?.message || 'Gagal membuat akun. Silakan coba lagi.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || rateLimitTimer > 0) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await signup(email, password, username)
      window.location.href = '/profile'
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = isSubmitting || rateLimitTimer > 0

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            {rateLimitTimer > 0 && (
              <div className="mt-2 text-sm">
                Coba lagi dalam: <span className="font-bold text-red-800">{rateLimitTimer}</span> detik
              </div>
            )}
          </div>
        )}
        
        {rateLimitTimer > 0 && !error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Silakan tunggu <span className="font-bold">{rateLimitTimer}</span> detik sebelum mencoba lagi.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? 'Signing up...' : 
             rateLimitTimer > 0 ? `Tunggu ${rateLimitTimer}s` : 
             'Sign Up'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/login"
          >
            Already have an account?
          </a>
        </div>
      </form>
    </div>
  )
} 