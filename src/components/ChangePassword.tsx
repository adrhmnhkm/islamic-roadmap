import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface PasswordStrengthProps {
  password: string
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthProps) => {
  const getStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    if (score < 2) return { level: 'weak', color: 'bg-red-500', text: 'Lemah' }
    if (score < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Sedang' }
    return { level: 'strong', color: 'bg-green-500', text: 'Kuat' }
  }
  
  const strength = getStrength(password)
  
  if (!password) return null
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(Object.values(getStrength(password)).filter(v => typeof v === 'boolean' && v).length / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength.level === 'weak' ? 'text-red-600' :
          strength.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {strength.text}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Password harus memiliki minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol
      </div>
    </div>
  )
}

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password minimal 8 karakter'
    if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar'
    if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil'
    if (!/\d/.test(password)) return 'Password harus mengandung angka'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password harus mengandung simbol'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Semua field harus diisi')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok')
      setIsLoading(false)
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    if (currentPassword === newPassword) {
      setError('Password baru harus berbeda dengan password lama')
      setIsLoading(false)
      return
    }

    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('User tidak ditemukan')
      }

      // Test current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        throw new Error('Password lama tidak benar')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess('Password berhasil diubah!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Lama
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan password lama"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan password baru"
              required
            />
          </div>
          <PasswordStrengthIndicator password={newPassword} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Konfirmasi password baru"
              required
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="mt-1 text-sm text-red-600">Password tidak cocok</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPasswords"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showPasswords" className="text-sm text-gray-600">
            Tampilkan password
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </div>
      </form>
    </div>
  )
} 