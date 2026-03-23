import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, TrendingUp, Award, Clock, ChevronRight, Play, FileText } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

function Dashboard() {
  const [stats, setStats] = useState({
    enrolledCourses: 3,
    completedCourses: 1,
    totalHours: 24,
    averageProgress: 65
  })

  const [recentCourses, setRecentCourses] = useState([
    {
      id: 1,
      title: 'Web Development Fundamentals',
      teacher: 'Dr. Sarah Johnson',
      progress: 75,
      lastAccessed: '2 hours ago',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
    },
    {
      id: 2,
      title: 'Python Programming Masterclass',
      teacher: 'Prof. Michael Chen',
      progress: 45,
      lastAccessed: 'Yesterday',
      thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0'
    },
    {
      id: 3,
      title: 'Data Science Essentials',
      teacher: 'Dr. Emily Rodriguez',
      progress: 20,
      lastAccessed: '3 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    }
  ])

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
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
            {recentCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-maroon-900 mb-2">{course.title}</h3>
                  <p className="text-burlywood-600 text-sm mb-3">by {course.teacher}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-maroon-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-burlywood-200 rounded-full h-2">
                      <div 
                        className="bg-maroon-600 rounded-full h-2 transition-all"
                        style={{ width: `${course.progress}%` }}
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