import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, BookOpen, ChevronRight } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function CreateCourse() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.id || user.role !== 'teacher') {
      setError('Please sign in as a teacher to create a course.')
      return
    }
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Course title is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Course description is required')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const response = await axios.post(`${API_BASE_URL}/courses`, {
        ...formData,
        teacherId: user.id
      })
      
      const courseId = response.data.id
      navigate(`/teacher/course/${courseId}/add-module`)
    } catch (err) {
      console.error('Error creating course:', err)
      setError('Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-maroon-900 mb-2">Create New Course</h1>
            <p className="text-burlywood-600">Start building your course by providing basic information</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Course Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-maroon-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Web Development Fundamentals"
                  className="w-full px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-burlywood-500">
                  Give your course a clear, descriptive title
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-maroon-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  required
                ></textarea>
                <p className="mt-1 text-xs text-burlywood-500">
                  Provide a detailed description of the course content and learning outcomes
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/dashboard')}
                  className="px-6 py-2 border border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                  {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default CreateCourse
