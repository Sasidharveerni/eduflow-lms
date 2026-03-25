import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, BookOpen, Users, TrendingUp, Edit, Trash2, 
  Eye, ChevronRight, BarChart, Clock, Award, 
  FileText, Video, PlayCircle, Settings, LogOut
} from 'lucide-react'
import axios from 'axios'
import Header from './Header'
import Footer from './Footer'

const API_BASE_URL = 'https://eduflow-lms.onrender.com/api'

function TeacherDashboard() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teacherName, setTeacherName] = useState('')
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    averageProgress: 0,
    totalRevenue: 0
  })

  // Get teacher ID from localStorage (in real app, get from auth context)
  const [teacherId, setTeacherId] = useState(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setTeacherId(user.id)
      setTeacherName(user.name)
      fetchTeacherCourses(user.id)
      fetchTeacherStats(user.id)
    } else {
      // Redirect to login if not authenticated
      navigate('/login')
    }
  }, [])

  const fetchTeacherCourses = async (id) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/courses?teacherId=${id}`)
      setCourses(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherStats = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/teacher/${id}`)
      const data = response.data
      
      // Calculate total students and lessons from courses
      let totalEnrolledStudents = 0
      let totalLessonsCount = 0
      
      data.courses?.forEach(course => {
        totalEnrolledStudents += course.enrollments || 0
        totalLessonsCount += course.totalLessons || 0
      })
      
      setStats({
        totalCourses: data.courses?.length || 0,
        totalStudents: totalEnrolledStudents,
        totalLessons: totalLessonsCount,
        averageProgress: Math.round(
          data.courses?.reduce((sum, course) => sum + (course.averageProgress || 0), 0) / 
          (data.courses?.length || 1)
        ) || 0,
        totalRevenue: totalEnrolledStudents * 49 // Example: $49 per course
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone. All student progress will be lost.')) {
      try {
        await axios.delete(`${API_BASE_URL}/courses/${courseId}`)
        await fetchTeacherCourses(teacherId)
        alert('Course deleted successfully')
      } catch (err) {
        console.error('Error deleting course:', err)
        alert('Failed to delete course. Please try again.')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {teacherName}! 👋</h1>
              <p className="text-burlywood-200">Manage your courses, track student progress, and create engaging content.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/teacher/create-course"
                className="inline-flex items-center px-6 py-2 bg-burlywood-500 text-maroon-900 rounded-lg hover:bg-burlywood-400 transition-colors font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border-2 border-burlywood-500 text-burlywood-300 rounded-lg hover:bg-maroon-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-maroon-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.totalCourses}</p>
                <p className="text-xs text-burlywood-500 mt-1">Active courses</p>
              </div>
              <div className="bg-maroon-100 rounded-full p-3">
                <BookOpen className="h-8 w-8 text-maroon-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-burlywood-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.totalStudents}</p>
                <p className="text-xs text-burlywood-500 mt-1">Enrolled learners</p>
              </div>
              <div className="bg-burlywood-100 rounded-full p-3">
                <Users className="h-8 w-8 text-burlywood-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-maroon-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Total Lessons</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.totalLessons}</p>
                <p className="text-xs text-burlywood-500 mt-1">Educational content</p>
              </div>
              <div className="bg-maroon-100 rounded-full p-3">
                <Video className="h-8 w-8 text-maroon-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-burlywood-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Avg. Progress</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.averageProgress}%</p>
                <p className="text-xs text-burlywood-500 mt-1">Student completion</p>
              </div>
              <div className="bg-burlywood-100 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-burlywood-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/teacher/create-course"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-maroon-100 rounded-full p-3">
                <Plus className="h-6 w-6 text-maroon-600" />
              </div>
              <div>
                <h3 className="font-semibold text-maroon-900">Create New Course</h3>
                <p className="text-sm text-burlywood-600">Start building a new course</p>
              </div>
            </div>
          </Link>

          <Link
            to="#"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-burlywood-100 rounded-full p-3">
                <Users className="h-6 w-6 text-burlywood-600" />
              </div>
              <div>
                <h3 className="font-semibold text-maroon-900">Manage Students</h3>
                <p className="text-sm text-burlywood-600">View student progress</p>
              </div>
            </div>
          </Link>

          <Link
            to="#"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-maroon-100 rounded-full p-3">
                <BarChart className="h-6 w-6 text-maroon-600" />
              </div>
              <div>
                <h3 className="font-semibold text-maroon-900">Analytics</h3>
                <p className="text-sm text-burlywood-600">View detailed reports</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-maroon-700 to-maroon-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">My Courses</h2>
            <span className="text-burlywood-200 text-sm">{courses.length} course(s)</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
                <button
                  onClick={() => fetchTeacherCourses(teacherId)}
                  className="ml-4 text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-burlywood-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-maroon-900 mb-2">No courses yet</h3>
              <p className="text-burlywood-600 mb-6">Start by creating your first course and sharing your knowledge</p>
              <Link
                to="/teacher/create-course"
                className="inline-flex items-center px-6 py-3 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-burlywood-100">
              {courses.map((course) => (
                <div key={course.id} className="p-6 hover:bg-burlywood-50 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-maroon-900">{course.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-burlywood-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center text-maroon-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.total_lessons || 0} Lessons
                        </span>
                        <span className="flex items-center text-maroon-600">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrollments || 0} Students
                        </span>
                        <span className="flex items-center text-maroon-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Created: {formatDate(course.created_at)}
                        </span>
                        {course.averageProgress && (
                          <span className="flex items-center text-maroon-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Avg. Progress: {course.averageProgress}%
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar for Course Completion */}
                      {course.averageProgress > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-burlywood-600 mb-1">
                            <span>Overall Completion</span>
                            <span>{course.averageProgress}%</span>
                          </div>
                          <div className="w-full bg-burlywood-200 rounded-full h-2">
                            <div
                              className="bg-maroon-600 rounded-full h-2 transition-all"
                              style={{ width: `${course.averageProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/course/${course.id}`}
                        className="px-3 py-1.5 bg-burlywood-100 text-maroon-700 rounded-lg hover:bg-burlywood-200 transition-colors flex items-center text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/teacher/course/${course.id}/add-module`}
                        className="px-3 py-1.5 bg-maroon-100 text-maroon-700 rounded-lg hover:bg-maroon-200 transition-colors flex items-center text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Content
                      </Link>
                      <Link
                        to={`/teacher/course/${course.id}/students`}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Students
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-burlywood-600 to-burlywood-700">
              <h3 className="text-lg font-bold text-white">Recent Enrollments</h3>
            </div>
            <div className="p-6">
              <p className="text-center text-burlywood-500 py-8">
                No recent enrollments to display
              </p>
            </div>
          </div>

          {/* Top Performing Courses */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-maroon-600 to-maroon-700">
              <h3 className="text-lg font-bold text-white">Top Performing Courses</h3>
            </div>
            <div className="p-6">
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-burlywood-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-maroon-900">{course.title}</p>
                          <p className="text-xs text-burlywood-500">{course.enrollments || 0} students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-maroon-900">{course.averageProgress || 0}%</p>
                        <p className="text-xs text-burlywood-500">completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-burlywood-500 py-8">No courses available</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default TeacherDashboard