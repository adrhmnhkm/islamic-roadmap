import { useAuthStore } from '../stores/authStore'

export const Navbar = () => {
  const { user, isAuthenticated, signOut, isAdmin, isSuperAdmin } = useAuthStore()

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
                {(isAdmin || isSuperAdmin) && (
                  <a href="/admin" className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
                    <span className="mr-1">⚡</span>
                    Admin Dashboard
                  </a>
                )}
                
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
                  onClick={signOut}
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