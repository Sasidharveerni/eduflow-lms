import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

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
  if (!formData.email) newErrors.email = 'Email is required'
  if (!formData.password) newErrors.password = 'Password is required'
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }
  
  try {
    setLoading(true)
    const response = await axios.post("http://localhost:8000/api/auth/login", {
      email: formData.email,
      password: formData.password
    })
    
    // Store user data (in real app, store token)
    localStorage.setItem('user', JSON.stringify(response.data))
    
    // Redirect based on role
    if (response.data.role === 'teacher') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    setErrors({ submit: error.response?.data?.detail || 'Login failed. Please try again.' })
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
                <LogIn className="h-12 w-12 text-maroon-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-maroon-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-burlywood-600">
              Sign in to access your learning dashboard
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-burlywood-300'
                    } placeholder-burlywood-400 text-maroon-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-burlywood-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-maroon-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-burlywood-600 hover:text-burlywood-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-maroon-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-burlywood-600 hover:text-burlywood-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Login