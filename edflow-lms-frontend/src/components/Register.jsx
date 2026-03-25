import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, GraduationCap, CircuitBoard } from 'lucide-react'
import axios from 'axios'
import Header from './Header'
import Footer from './Footer'

const API_BASE_URL = 'https://eduflow-lms.onrender.com/api/api'

function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Add validation
  const newErrors = {}
  if (!formData.name) newErrors.name = 'Name is required'
  if (!formData.email) newErrors.email = 'Email is required'
  if (!formData.password) newErrors.password = 'Password is required'
  if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
  if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }
  
  try {
    setLoading(true)
    setErrors({})
    await axios.post(`${API_BASE_URL}/auth/register`, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    })
    
    // Auto login after registration
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: formData.email,
      password: formData.password
    })
    
    localStorage.setItem('user', JSON.stringify(loginResponse.data))
    
    // Redirect based on role
    if (loginResponse.data.role === 'teacher') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/dashboard')
    }
  } catch (error) {
    console.error('Registration error:', error)
    setErrors({ submit: error.response?.data?.detail || 'Registration failed. Please try again.' })
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
          <div>
            <div className="flex justify-center">
              <div className="bg-maroon-100 rounded-full p-3">
                <UserPlus className="h-12 w-12 text-maroon-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-maroon-900">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-burlywood-600">
              Join EduFlow LMS today
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-maroon-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-burlywood-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-burlywood-300'
                    } placeholder-burlywood-400 text-maroon-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-maroon-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-burlywood-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-burlywood-300'
                    } placeholder-burlywood-400 text-maroon-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-maroon-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'student'})}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.role === 'student'
                        ? 'border-maroon-600 bg-maroon-50 text-maroon-700'
                        : 'border-burlywood-300 text-burlywood-600 hover:border-maroon-400'
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'teacher'})}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.role === 'teacher'
                        ? 'border-maroon-600 bg-maroon-50 text-maroon-700'
                        : 'border-burlywood-300 text-burlywood-600 hover:border-maroon-400'
                    }`}
                  >
                    <CircuitBoard className="h-5 w-5" />
                    <span>Teacher</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-maroon-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-burlywood-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-burlywood-300'
                    } placeholder-burlywood-400 text-maroon-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-burlywood-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-burlywood-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-maroon-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-burlywood-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-burlywood-300'
                    } placeholder-burlywood-400 text-maroon-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-burlywood-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-burlywood-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              {errors.submit && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.submit}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-maroon-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-burlywood-600 hover:text-burlywood-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Register
