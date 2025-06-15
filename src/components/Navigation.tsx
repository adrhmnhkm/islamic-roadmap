import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAdmin, isSuperAdmin, role } = useAuthStore();

  useEffect(() => {
    // Initialize auth store when component mounts
    useAuthStore.getState().initialize();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              🕌 Islamic Roadmap
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Beranda
            </a>
            <a href="/roadmaps" className="text-gray-700 hover:text-blue-600 transition-colors">
              Roadmap
            </a>
            <a href="/subscribe" className="text-gray-700 hover:text-blue-600 transition-colors">
              Newsletter
            </a>
            
            {/* Admin Menu Items */}
            {isAdmin && (
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                  👑 Admin
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      📊 Dashboard
                    </a>
                    <a href="/admin/newsletter" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      📧 Newsletter
                    </a>
                    <a href="/admin/roadmaps" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      🗺️ Manage Roadmaps
                    </a>
                    <a href="/admin/quizzes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      📝 Manage Quizzes
                    </a>
                    {isSuperAdmin && (
                      <>
                        <hr className="my-1" />
                        <a href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          👥 User Management
                        </a>
                        <a href="/admin/system" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          ⚙️ System Settings
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block">
                    {user.full_name || user.email}
                  </span>
                  {role !== 'user' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  )}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      👤 Profile
                    </a>
                    <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      📈 My Progress
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      ⚙️ Settings
                    </a>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Masuk
                </a>
                <a
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Daftar
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <a href="/" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 transition-colors">
                Beranda
              </a>
              <a href="/roadmaps" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 transition-colors">
                Roadmap
              </a>
              <a href="/subscribe" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 transition-colors">
                Newsletter
              </a>

              {/* Mobile Admin Menu */}
              {isAdmin && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">👑 Admin Panel</div>
                  <a href="/admin" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                    📊 Dashboard
                  </a>
                  <a href="/admin/newsletter" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                    📧 Newsletter
                  </a>
                  <a href="/admin/roadmaps" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                    🗺️ Manage Roadmaps
                  </a>
                  <a href="/admin/quizzes" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                    📝 Manage Quizzes
                  </a>
                  {isSuperAdmin && (
                    <>
                      <a href="/admin/users" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                        👥 User Management
                      </a>
                      <a href="/admin/system" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-1">
                        ⚙️ System Settings
                      </a>
                    </>
                  )}
                </div>
              )}

              {user ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.full_name || user.email}
                      </div>
                      {role !== 'user' && (
                        <div className="text-xs text-blue-600">
                          {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </div>
                      )}
                    </div>
                  </div>
                  <a href="/profile" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                    👤 Profile
                  </a>
                  <a href="/dashboard" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                    📈 My Progress
                  </a>
                  <a href="/settings" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                    ⚙️ Settings
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors py-2"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 flex flex-col space-y-2">
                  <a
                    href="/login"
                    onClick={closeMenu}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Masuk
                  </a>
                  <a
                    href="/register"
                    onClick={closeMenu}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Daftar
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 