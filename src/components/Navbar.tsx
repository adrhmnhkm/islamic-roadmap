import { useAuthStore } from '../store/authStore'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold">
              Islamic Roadmap
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <a href="/demo-progress" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <span className="mr-1">✅</span>
                  Demo Progress
                </a>
                <a href="/analytics" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <span className="mr-1">📊</span>
                  Analytics
                </a>
                <a href="/profile" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <span className="mr-1">👤</span>
                  Profile
                </a>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-700 hover:text-gray-900">
                  Login
                </a>
                <a href="/register" className="text-gray-700 hover:text-gray-900">
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 