import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, TrendingUp, Award, Clock, ChevronRight, Play, FileText } from 'lucide-react'
import axios from 'axios'
import Header from './Header'
import Footer from './Footer'

const API_BASE_URL = 'https://eduflow-lms.onrender.com/api'

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  })

  const [recentCourses, setRecentCourses] = useState([])

  const [recommendedCourses, setRecommendedCourses] = useState([
    {
      id: 4,
      title: 'React.js Advanced Concepts',
      teacher: 'John Doe',
      lessons: 24,
      duration: '8 hours'
    },
    {
      id: 5,
      title: 'Machine Learning Basics',
      teacher: 'Jane Smith',
      lessons: 18,
      duration: '6 hours'
    }
  ])
  const [loading, setLoading] = useState(true)

  // Fetch student dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id || user.role !== 'student') {
        setRecentCourses([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/dashboard/student/${user.id}`)
        const enrolledCourses = response.data.enrolled_courses || []

        setStats({
          enrolledCourses: enrolledCourses.length,
          completedCourses: enrolledCourses.filter((course) => course.progressPercent === 100).length,
          totalHours: enrolledCourses.reduce((sum, course) => sum + (course.progressPercent * 0.1), 0),
          averageProgress: Math.round(
            enrolledCourses.reduce((sum, course) => sum + course.progressPercent, 0) /
            (enrolledCourses.length || 1)
          ) || 0
        })
        
        setRecentCourses(
          enrolledCourses.map((course) => ({
            id: course.id || course.courseId,
            title: course.title,
            teacher: course.teacherName,
            progress: course.progressPercent,
            lastAccessed: course.lastOpenedLesson ? 'Resume where you left off' : 'Not started yet'
          }))
        )
      } catch (error) {
        console.error('Error fetching dashboard:', error)
        setRecentCourses([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}! 👋</h1>
              <p className="text-burlywood-200">Continue your learning journey. You're doing great!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-2 bg-burlywood-500 text-maroon-900 rounded-lg hover:bg-burlywood-400 transition-colors font-semibold"
              >
                Browse Courses
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-maroon-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.enrolledCourses}</p>
              </div>
              <div className="bg-maroon-100 rounded-full p-3">
                <BookOpen className="h-8 w-8 text-maroon-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-burlywood-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Completed Courses</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.completedCourses}</p>
              </div>
              <div className="bg-burlywood-100 rounded-full p-3">
                <Award className="h-8 w-8 text-burlywood-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-maroon-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Learning Hours</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.totalHours}</p>
              </div>
              <div className="bg-maroon-100 rounded-full p-3">
                <Clock className="h-8 w-8 text-maroon-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-burlywood-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-burlywood-600 text-sm font-medium">Average Progress</p>
                <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.averageProgress}%</p>
              </div>
              <div className="bg-burlywood-100 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-burlywood-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-maroon-900">My Recent Courses</h2>
            <Link to="/courses" className="text-burlywood-600 hover:text-burlywood-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center py-8 text-burlywood-600">
                Loading your courses...
              </div>
            )}
            {recentCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden bg-gradient-to-r from-maroon-700 to-burlywood-600 flex items-center justify-center">
                  <BookOpen className="h-14 w-14 text-white/90" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-maroon-900 mb-2">{course.title}</h3>
                  <p className="text-burlywood-600 text-sm mb-3">by {course.teacher}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-maroon-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-burlywood-200 rounded-full h-2">
                      <div 
                        className="bg-maroon-600 rounded-full h-2 transition-all"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-burlywood-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Last accessed: {course.lastAccessed}</span>
                    </div>
                    <Play className="h-5 w-5 text-maroon-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {!loading && recentCourses.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center text-burlywood-600 shadow-md">
              You have not enrolled in any courses yet.
            </div>
          )}
        </div>

        {/* Recommended Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-maroon-900">Recommended for You</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-burlywood-100 rounded-full p-3">
                    <GraduationCap className="h-8 w-8 text-burlywood-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-maroon-900">{course.title}</h3>
                    <p className="text-burlywood-600 text-sm">{course.teacher}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-burlywood-500">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {course.lessons} lessons
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/course/${course.id}`}
                  className="px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Dashboard
