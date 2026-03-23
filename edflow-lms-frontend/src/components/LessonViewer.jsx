import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Play, FileText, CheckCircle, Download, ChevronLeft, 
  ChevronRight, BookOpen, ArrowLeft, Check
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function LessonViewer() {
  const { courseId, moduleIndex, lessonIndex } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [showPDF, setShowPDF] = useState(false)

  // Mock user ID - in real app, get from auth context
  const studentId = '67e1f8d5c2a4b3c1d5e6f7a8' // Replace with actual user ID

  useEffect(() => {
    fetchCourseAndLesson()
    fetchProgress()
  }, [courseId, moduleIndex, lessonIndex])

  const fetchCourseAndLesson = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`)
      const courseData = response.data
      setCourse(courseData)
      
      // Get the specific lesson
      const module = courseData.modules?.[parseInt(moduleIndex)]
      const lessonData = module?.lessons?.[parseInt(lessonIndex)]
      setLesson(lessonData)
      
      // Fetch PDF if available
      if (lessonData?.pdfFileId) {
        setPdfUrl(`${API_BASE_URL}/pdf/${lessonData.pdfFileId}`)
      }
    } catch (err) {
      console.error('Error fetching lesson:', err)
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
    }
  }

  const handleMarkComplete = async () => {
    if (!lesson) return
    
    try {
      setMarkingComplete(true)
      const isCompleted = progress?.completedLessons?.includes(lesson._id || lesson.id)
      
      await axios.post(`${API_BASE_URL}/progress/update`, {
        studentId,
        courseId,
        lessonId: lesson._id || lesson.id,
        completed: !isCompleted
      })
      
      // Refresh progress
      await fetchProgress()
    } catch (err) {
      console.error('Error updating progress:', err)
      alert('Failed to update progress. Please try again.')
    } finally {
      setMarkingComplete(false)
    }
  }

  const isLessonCompleted = () => {
    if (!progress || !lesson) return false
    return progress.completedLessons?.includes(lesson._id || lesson.id)
  }

  const getNextLesson = () => {
    if (!course) return null
    
    const currentModule = parseInt(moduleIndex)
    const currentLesson = parseInt(lessonIndex)
    const modules = course.modules
    
    // Check next lesson in same module
    if (currentLesson + 1 < modules[currentModule].lessons.length) {
      return { moduleIndex: currentModule, lessonIndex: currentLesson + 1 }
    }
    
    // Check next module
    if (currentModule + 1 < modules.length && modules[currentModule + 1].lessons.length > 0) {
      return { moduleIndex: currentModule + 1, lessonIndex: 0 }
    }
    
    return null
  }

  const getPreviousLesson = () => {
    if (!course) return null
    
    const currentModule = parseInt(moduleIndex)
    const currentLesson = parseInt(lessonIndex)
    const modules = course.modules
    
    // Check previous lesson in same module
    if (currentLesson > 0) {
      return { moduleIndex: currentModule, lessonIndex: currentLesson - 1 }
    }
    
    // Check previous module
    if (currentModule > 0 && modules[currentModule - 1].lessons.length > 0) {
      return { 
        moduleIndex: currentModule - 1, 
        lessonIndex: modules[currentModule - 1].lessons.length - 1 
      }
    }
    
    return null
  }

  const handleNavigateLesson = (newModuleIndex, newLessonIndex) => {
    navigate(`/lesson/${courseId}/${newModuleIndex}/${newLessonIndex}`)
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

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Lesson not found
          </div>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
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
        {/* Navigation Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Link 
                to={`/course/${courseId}`}
                className="inline-flex items-center text-maroon-600 hover:text-maroon-700 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Course
              </Link>
              <h1 className="text-xl font-bold text-maroon-900">{lesson.title}</h1>
              <p className="text-sm text-burlywood-600 mt-1">
                Course: {course.title}
              </p>
            </div>
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isLessonCompleted()
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-maroon-600 text-white hover:bg-maroon-700'
              }`}
            >
              {isLessonCompleted() ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <h2 className="text-lg font-bold text-maroon-900 mb-4">Course Content</h2>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {course.modules?.map((module, mIdx) => (
                  <div key={mIdx} className="border border-burlywood-200 rounded-lg">
                    <div className="bg-burlywood-50 px-3 py-2 rounded-t-lg">
                      <h3 className="font-semibold text-maroon-800 text-sm">
                        Module {mIdx + 1}: {module.title}
                      </h3>
                    </div>
                    <div className="divide-y divide-burlywood-100">
                      {module.lessons?.map((l, lIdx) => {
                        const isCurrent = parseInt(moduleIndex) === mIdx && parseInt(lessonIndex) === lIdx
                        const isCompleted = progress?.completedLessons?.includes(l._id || l.id)
                        
                        return (
                          <button
                            key={lIdx}
                            onClick={() => handleNavigateLesson(mIdx, lIdx)}
                            className={`w-full text-left px-3 py-2 hover:bg-burlywood-50 transition-colors flex items-center justify-between ${
                              isCurrent ? 'bg-burlywood-100' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Play className="h-4 w-4 text-maroon-500 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isCurrent ? 'font-semibold text-maroon-900' : 'text-maroon-700'}`}>
                                {l.title}
                              </span>
                            </div>
                            {l.pdfFileId && (
                              <FileText className="h-3 w-3 text-burlywood-500" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Lesson Content */}
          <div className="lg:col-span-2">
            {/* YouTube Video */}
            {lesson.youtubeUrl && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="aspect-video">
                  <iframe
                    src={lesson.youtubeUrl.replace('watch?v=', 'embed/')}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            {lesson.pdfFileId && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-burlywood-50 px-4 py-3 border-b border-burlywood-200 flex justify-between items-center">
                  <h3 className="font-semibold text-maroon-900">Study Material</h3>
                  <a
                    href={pdfUrl}
                    download
                    className="flex items-center space-x-1 text-maroon-600 hover:text-maroon-700"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download PDF</span>
                  </a>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => setShowPDF(!showPDF)}
                    className="w-full px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors mb-4"
                  >
                    {showPDF ? 'Hide PDF' : 'View PDF'}
                  </button>
                  {showPDF && (
                    <div className="border border-burlywood-200 rounded-lg overflow-hidden">
                      <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        title="PDF Viewer"
                        className="w-full h-[600px]"
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lesson Navigation */}
            <div className="flex justify-between items-center">
              {getPreviousLesson() && (
                <button
                  onClick={() => handleNavigateLesson(
                    getPreviousLesson().moduleIndex,
                    getPreviousLesson().lessonIndex
                  )}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous Lesson</span>
                </button>
              )}
              {getNextLesson() && (
                <button
                  onClick={() => handleNavigateLesson(
                    getNextLesson().moduleIndex,
                    getNextLesson().lessonIndex
                  )}
                  className="flex items-center space-x-2 px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors ml-auto"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default LessonViewer