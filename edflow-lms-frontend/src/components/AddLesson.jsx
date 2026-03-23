import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Video, FileText, Upload, X, ChevronRight, ArrowLeft } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function AddLesson() {
  const { courseId, moduleIndex } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    order: 0
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`)
      setCourse(response.data)
      // Set default order based on existing lessons
      const module = response.data.modules?.[parseInt(moduleIndex)]
      if (module && module.lessons) {
        setFormData(prev => ({
          ...prev,
          order: module.lessons.length
        }))
      }
    } catch (err) {
      console.error('Error fetching course:', err)
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('Please select a valid PDF file')
      setPdfFile(null)
    }
  }

  const handleUploadPDF = async () => {
    if (!pdfFile) return null
    
    const uploadFormData = new FormData()
    uploadFormData.append('file', pdfFile)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/upload-pdf`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })
      return response.data.fileId
    } catch (err) {
      console.error('Error uploading PDF:', err)
      throw new Error('Failed to upload PDF')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Lesson title is required')
      return
    }
    if (!formData.youtubeUrl.trim()) {
      setError('YouTube URL is required')
      return
    }
    
    try {
      setUploading(true)
      setError('')
      
      let pdfFileId = null
      if (pdfFile) {
        pdfFileId = await handleUploadPDF()
      }
      
      // Create lesson
      const lessonFormData = new FormData()
      lessonFormData.append('title', formData.title)
      lessonFormData.append('youtubeUrl', formData.youtubeUrl)
      lessonFormData.append('order', formData.order)
      if (pdfFileId) {
        lessonFormData.append('pdfFileId', pdfFileId)
      }
      
      await axios.post(
        `${API_BASE_URL}/courses/${courseId}/modules/${moduleIndex}/lessons`,
        lessonFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      // Navigate back to modules page
      navigate(`/teacher/course/${courseId}/add-module`)
    } catch (err) {
      console.error('Error adding lesson:', err)
      setError('Failed to add lesson. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
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

  const module = course?.modules?.[parseInt(moduleIndex)]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-maroon-50 to-burlywood-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/teacher/course/${courseId}/add-module`)}
              className="inline-flex items-center text-maroon-600 hover:text-maroon-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Modules
            </button>
            <h1 className="text-3xl font-bold text-maroon-900 mb-2">Add New Lesson</h1>
            <p className="text-burlywood-600">
              Course: <span className="font-semibold">{course?.title}</span> | 
              Module: <span className="font-semibold">{module?.title}</span>
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Lesson Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}
              
              {/* Lesson Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-maroon-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Variables"
                  className="w-full px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* YouTube URL */}
              <div>
                <label htmlFor="youtubeUrl" className="block text-sm font-medium text-maroon-700 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  required
                />
                {formData.youtubeUrl && (
                  <div className="mt-2 text-xs text-burlywood-500">
                    Preview URL: {getYouTubeEmbedUrl(formData.youtubeUrl)}
                  </div>
                )}
              </div>
              
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-maroon-700 mb-2">
                  Study Material (PDF) - Optional
                </label>
                <div className="border-2 border-dashed border-burlywood-300 rounded-lg p-6 text-center hover:border-maroon-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-burlywood-400 mb-3" />
                    <p className="text-burlywood-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-burlywood-400">PDF files only</p>
                  </label>
                </div>
                
                {pdfFile && (
                  <div className="mt-3 flex items-center justify-between bg-burlywood-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-maroon-600" />
                      <span className="text-sm text-maroon-700">{pdfFile.name}</span>
                      <span className="text-xs text-burlywood-500">
                        ({(pdfFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-maroon-600 mb-1">
                      <span>Uploading PDF...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-burlywood-200 rounded-full h-2">
                      <div
                        className="bg-maroon-600 rounded-full h-2 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Lesson Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-maroon-700 mb-2">
                  Lesson Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-32 px-4 py-2 border border-burlywood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-burlywood-500">
                  Order in which lessons appear (0, 1, 2, ...)
                </p>
              </div>
              
              {/* Preview Section */}
              <div className="border-t border-burlywood-200 pt-6">
                <h3 className="text-lg font-semibold text-maroon-900 mb-4">Preview</h3>
                <div className="bg-burlywood-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Video className="h-5 w-5 text-maroon-600" />
                    <span className="font-medium text-maroon-900">{formData.title || 'Lesson Title'}</span>
                  </div>
                  {formData.youtubeUrl && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                      <iframe
                        src={getYouTubeEmbedUrl(formData.youtubeUrl)}
                        title="Video Preview"
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                  {pdfFile && (
                    <div className="flex items-center space-x-2 text-sm text-burlywood-600">
                      <FileText className="h-4 w-4" />
                      <span>PDF material will be available</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/course/${courseId}/add-module`)}
                  className="px-6 py-2 border border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? 'Adding Lesson...' : 'Add Lesson'}
                  {!uploading && <ChevronRight className="ml-2 h-4 w-4" />}
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

export default AddLesson