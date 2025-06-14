import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitTimer, setRateLimitTimer] = useState(0)
  const login = useAuthStore((state) => state.login)

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
      setRateLimitTimer(20)
      return 'Terlalu banyak percobaan login. Silakan tunggu 20 detik sebelum mencoba lagi.'
    }
    
    if (err?.message?.includes('Invalid login credentials') || 
        err?.message?.includes('Email atau password salah')) {
      return 'Email atau password salah. Silakan periksa kembali.'
    }
    
    if (err?.message?.includes('Email not confirmed')) {
      return 'Silakan verifikasi email Anda terlebih dahulu sebelum login.'
    }
    
    if (err?.message?.includes('Too many requests') || err?.status === 429) {
      setRateLimitTimer(20)
      return 'Terlalu banyak percobaan login. Silakan tunggu 20 detik dan coba lagi.'
    }
    
    return err?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || rateLimitTimer > 0) return
    
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      // Redirect setelah login berhasil
      window.location.href = '/profile'
    } catch (err: any) {
      console.error('Login error:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = isSubmitting || rateLimitTimer > 0

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="remember" />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <a
            href="/reset-password"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Forgot Password?
          </a>
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? 'Logging in...' : 
             rateLimitTimer > 0 ? `Tunggu ${rateLimitTimer}s` : 
             'Login'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/signup"
          >
            Create Account
          </a>
        </div>
      </form>
    </div>
  )
} 