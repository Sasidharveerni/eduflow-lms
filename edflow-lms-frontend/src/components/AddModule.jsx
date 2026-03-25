import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, FolderOpen, ChevronRight, Trash2, Pencil } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'https://eduflow-lms.onrender.com/api/api'

function AddModule() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingModule, setAddingModule] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`)
      setCourse(response.data)
      setModules(response.data.modules || [])
    } catch (err) {
      console.error('Error fetching course:', err)
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = async (e) => {
    e.preventDefault()
    if (!newModuleTitle.trim()) {
      setError('Module title is required')
      return
    }

    try {
      setAddingModule(true)
      setError('')
      
      await axios.post(`${API_BASE_URL}/courses/${courseId}/modules`, {
        title: newModuleTitle
      })
      
      // Refresh course data
      await fetchCourse()
      setNewModuleTitle('')
    } catch (err) {
      console.error('Error adding module:', err)
      setError('Failed to add module')
    } finally {
      setAddingModule(false)
    }
  }

  const handleDeleteModule = async (moduleIndex) => {
    if (window.confirm('Are you sure you want to delete this module and all its lessons?')) {
      try {
        await axios.delete(`${API_BASE_URL}/courses/${courseId}/modules/${moduleIndex}`)
        await fetchCourse()
      } catch (err) {
        console.error('Error deleting module:', err)
        alert('Failed to delete module')
      }
    }
  }

  const handleAddLesson = (moduleIndex) => {
    navigate(`/teacher/course/${courseId}/module/${moduleIndex}/add-lesson`)
  }

  const handleEditLesson = (moduleIndex, lessonId) => {
    navigate(`/teacher/course/${courseId}/module/${moduleIndex}/lesson/${lessonId}/edit`)
  }

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await axios.delete(`${API_BASE_URL}/lessons/${lessonId}`)
        await fetchCourse()
      } catch (err) {
        console.error('Error deleting lesson:', err)
        alert('Failed to delete lesson')
      }
    }
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

  if (error && !course) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-maroon-900 mb-2">Course Structure</h1>
            <p className="text-burlywood-600">
              Course: <span className="font-semibold text-maroon-700">{course?.title}</span>
            </p>
          </div>

          {/* Add Module Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Add New Module</h2>
            </div>
            
            <form onSubmit={handleAddModule} className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Module title (e.g., Introduction to Programming)"
                  className="flex-1 px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={addingModule}
                  className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addingModule ? 'Adding...' : 'Add Module'}
                </button>
              </div>
            </form>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-maroon-900 mb-4">Course Modules</h2>
            
            {modules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FolderOpen className="h-16 w-16 text-burlywood-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-maroon-900 mb-2">No modules yet</h3>
                <p className="text-burlywood-600">Start by adding your first module above</p>
              </div>
            ) : (
              modules.map((module, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-burlywood-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-maroon-600" />
                      <h3 className="text-lg font-semibold text-maroon-900">
                        Module {index + 1}: {module.title}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddLesson(index)}
                        className="px-3 py-1 bg-maroon-100 text-maroon-700 rounded hover:bg-maroon-200 transition-colors flex items-center text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteModule(index)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {module.lessons && module.lessons.length > 0 ? (
                    <div className="divide-y divide-burlywood-100">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id || lessonIndex} className="px-6 py-3 flex justify-between items-center hover:bg-burlywood-50 gap-4">
                          <div>
                            <p className="font-medium text-maroon-900">{lesson.title}</p>
                            <div className="flex space-x-3 text-xs text-burlywood-500 mt-1">
                              {lesson.youtubeUrl && <span>📹 Video</span>}
                              {lesson.pdfFileId && <span>📄 PDF</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-burlywood-500">Lesson {lessonIndex + 1}</span>
                            <button
                              onClick={() => handleEditLesson(index, lesson.id)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center text-sm"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-burlywood-500 mb-2">No lessons in this module yet</p>
                      <button
                        onClick={() => handleAddLesson(index)}
                        className="text-maroon-600 hover:text-maroon-700 text-sm font-medium inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add first lesson
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="px-6 py-2 border border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-colors"
            >
              Back to Dashboard
            </button>
            {modules.length > 0 && (
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
              >
                Finish Course Setup
              </button>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AddModule
