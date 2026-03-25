import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  BookOpen, User, Clock, Play, FileText, CheckCircle, 
  ChevronRight, Download, Award, TrendingUp, ArrowLeft
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  const studentId = user?.role === 'student' ? user.id : null

  useEffect(() => {
    fetchCourseDetails()
    if (studentId) {
      fetchProgress()
    } else {
      setProgress(null)
    }
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`)
      setCourse(response.data)
    } catch (err) {
      setError('Failed to load course details')
      console.error('Error fetching course:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/progress/${studentId}/${courseId}`)
      setProgress(response.data)
    } catch (err) {
      console.error('Error fetching progress:', err)
      setProgress(null)
    }
  }

  const handleEnroll = async () => {
    if (!studentId) {
      navigate('/login')
      return
    }

    try {
      setEnrolling(true)
      await axios.post(`${API_BASE_URL}/enroll?student_id=${studentId}&course_id=${courseId}`)
      // Refresh progress after enrollment
      await fetchProgress()
      alert('Successfully enrolled in the course!')
    } catch (err) {
      console.error('Error enrolling:', err)
      alert('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const isEnrolled = progress?.enrolled === true

  const calculateTotalLessons = () => {
    if (!course) return 0
    let total = 0
    course.modules?.forEach(module => {
      total += module.lessons?.length || 0
    })
    return total
  }

  const calculateCompletedLessons = () => {
    if (!progress) return 0
    return progress.completedLessons?.length || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="loading-spinner"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Course not found'}
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center text-maroon-600 hover:text-maroon-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-burlywood-100 text-lg mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-burlywood-400" />
                <span>Instructor: {course.teacher_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-burlywood-400" />
                <span>{calculateTotalLessons()} Lessons</span>
              </div>
            </div>
          </div>

          {/* Progress Section (if enrolled) */}
          {isEnrolled && (
            <div className="p-6 border-b border-burlywood-200">
              <h3 className="text-lg font-semibold text-maroon-900 mb-3">Your Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-maroon-600">
                  {calculateCompletedLessons()} of {calculateTotalLessons()} lessons completed
                </span>
                <span className="text-sm font-semibold text-maroon-600">
                  {progress?.progressPercent || 0}%
                </span>
              </div>
              <div className="w-full bg-burlywood-200 rounded-full h-2">
                <div
                  className="bg-maroon-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress?.progressPercent || 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Enroll Button (if not enrolled) */}
          {!isEnrolled && (
            <div className="p-6 bg-burlywood-50">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full md:w-auto px-6 py-3 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors font-semibold disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-maroon-900 mb-6">Course Content</h2>
          
          {course.modules && course.modules.length > 0 ? (
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-burlywood-200 rounded-lg overflow-hidden">
                  <div className="bg-burlywood-50 px-6 py-4">
                    <h3 className="text-lg font-semibold text-maroon-900">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-burlywood-100">
                    {module.lessons && module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = progress?.completedLessons?.includes(lesson.id)
                      
                      return (
                        <Link
                          key={lessonIndex}
                          to={`/lesson/${courseId}/${moduleIndex}/${lessonIndex}`}
                          className="flex items-center justify-between p-4 hover:bg-burlywood-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Play className="h-5 w-5 text-maroon-500" />
                            )}
                            <div>
                              <p className="font-medium text-maroon-900 group-hover:text-maroon-700">
                                {lesson.title}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-burlywood-500 mt-1">
                                {lesson.youtubeUrl && (
                                  <span className="flex items-center">
                                    <Play className="h-3 w-3 mr-1" />
                                    Video
                                  </span>
                                )}
                                {lesson.pdfFileId && (
                                  <span className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    PDF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-burlywood-400 group-hover:text-maroon-600" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-burlywood-400 mx-auto mb-4" />
              <p className="text-burlywood-600">No modules added yet</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default CourseDetail
