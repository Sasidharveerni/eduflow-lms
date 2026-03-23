import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, User, LogOut, Menu, X, GraduationCap } from 'lucide-react'

function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Replace with actual auth state
  const [userRole, setUserRole] = useState('student') // Replace with actual role

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <header className="bg-maroon-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-burlywood-400" />
            <span className="text-xl font-bold text-white">EduFlow LMS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-burlywood-100 hover:text-burlywood-300 transition-colors">
              Home
            </Link>
            {isLoggedIn && userRole === 'student' && (
              <>
                <Link to="/courses" className="text-burlywood-100 hover:text-burlywood-300 transition-colors">
                  My Courses
                </Link>
                <Link to="/dashboard" className="text-burlywood-100 hover:text-burlywood-300 transition-colors">
                  Dashboard
                </Link>
              </>
            )}
            {isLoggedIn && userRole === 'teacher' && (
              <>
                <Link to="/teacher/dashboard" className="text-burlywood-100 hover:text-burlywood-300 transition-colors">
                  Teacher Dashboard
                </Link>
                <Link to="/teacher/create-course" className="text-burlywood-100 hover:text-burlywood-300 transition-colors">
                  Create Course
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-maroon-700 px-3 py-1 rounded-lg">
                  <User className="h-5 w-5 text-burlywood-400" />
                  <span className="text-burlywood-100">John Doe</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-burlywood-100 hover:text-burlywood-300 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-burlywood-100 hover:text-burlywood-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-burlywood-600 text-maroon-900 rounded-lg hover:bg-burlywood-500 transition-colors font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-burlywood-100 hover:text-burlywood-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-maroon-700">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-burlywood-100 hover:text-burlywood-300 py-2">
                Home
              </Link>
              {isLoggedIn && userRole === 'student' && (
                <>
                  <Link to="/courses" className="text-burlywood-100 hover:text-burlywood-300 py-2">
                    My Courses
                  </Link>
                  <Link to="/dashboard" className="text-burlywood-100 hover:text-burlywood-300 py-2">
                    Dashboard
                  </Link>
                </>
              )}
              {isLoggedIn && userRole === 'teacher' && (
                <>
                  <Link to="/teacher/dashboard" className="text-burlywood-100 hover:text-burlywood-300 py-2">
                    Teacher Dashboard
                  </Link>
                  <Link to="/teacher/create-course" className="text-burlywood-100 hover:text-burlywood-300 py-2">
                    Create Course
                  </Link>
                </>
              )}
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-burlywood-100 hover:text-burlywood-300 border border-burlywood-600 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-burlywood-600 text-maroon-900 rounded-lg hover:bg-burlywood-500 font-semibold"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 text-burlywood-100 hover:text-burlywood-300 py-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header