import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, User, Clock, ChevronRight, Filter, GraduationCap } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'https://eduflow-lms.onrender.com/api'

function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/courses`)
      setCourses(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeacher = filterTeacher === '' || course.teacher_name === filterTeacher
    return matchesSearch && matchesTeacher
  })

  // Get unique teachers for filter
  const uniqueTeachers = [...new Set(courses.map(course => course.teacher_name))]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-maroon-900 mb-2">Explore Courses</h1>
          <p className="text-burlywood-600">Discover and enroll in courses that match your interests</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-burlywood-400" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-burlywood-400" />
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-r from-maroon-600 to-maroon-700 p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-sm font-medium">{course.total_lessons || 0} Lessons</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-maroon-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-burlywood-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-burlywood-500" />
                        <span className="text-sm text-maroon-600">{course.teacher_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-burlywood-500" />
                        <span className="text-sm text-maroon-600">
                          {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors flex items-center justify-center space-x-2">
                      <span>View Course</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-burlywood-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-maroon-900 mb-2">No courses found</h3>
                <p className="text-burlywood-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default CourseList