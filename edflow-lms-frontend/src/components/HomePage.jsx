import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Video, FileText, TrendingUp, Award, ChevronRight, Star } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

function HomePage() {
  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Video Lessons',
      description: 'YouTube integrated lessons for seamless learning experience'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'PDF Materials',
      description: 'Download and read study materials in PDF format'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Track Progress',
      description: 'Monitor your learning progress in real-time'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Self-Paced Learning',
      description: 'Learn at your own pace with structured content'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'EduFlow has transformed my learning experience. The platform is intuitive and easy to use!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Teacher',
      content: 'Creating courses has never been easier. My students love the structured approach.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      content: 'The progress tracking feature keeps me motivated. Highly recommended!',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-maroon-800 to-maroon-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Transform Your Learning Journey with{' '}
                  <span className="text-burlywood-400">EduFlow LMS</span>
                </h1>
                <p className="text-burlywood-100 text-lg mb-8">
                  A lightweight Learning Management System designed to help teachers deliver structured 
                  learning content and track student progress with minimal infrastructure complexity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 bg-burlywood-500 text-maroon-900 rounded-lg font-semibold hover:bg-burlywood-400 transition-colors"
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-burlywood-500 text-burlywood-300 rounded-lg font-semibold hover:bg-maroon-800 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-maroon-700 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-center">
                    <GraduationCap className="h-48 w-48 text-burlywood-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-burlywood-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-maroon-900 mb-4">Why Choose EduFlow?</h2>
              <p className="text-maroon-600 max-w-2xl mx-auto">
                We provide everything you need for effective online learning
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-maroon-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-maroon-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-maroon-900 mb-2">{feature.title}</h3>
                  <p className="text-burlywood-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-maroon-800 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-burlywood-400 mb-2">500+</div>
                <div className="text-burlywood-200">Active Courses</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-burlywood-400 mb-2">10,000+</div>
                <div className="text-burlywood-200">Happy Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-burlywood-400 mb-2">100+</div>
                <div className="text-burlywood-200">Expert Teachers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-burlywood-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-maroon-900 mb-4">What Our Users Say</h2>
              <p className="text-maroon-600">Join thousands of satisfied learners and educators</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-maroon-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-maroon-900">{testimonial.name}</p>
                    <p className="text-burlywood-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-burlywood-200 mb-8 max-w-2xl mx-auto">
              Join EduFlow today and experience the future of online education
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-burlywood-500 text-maroon-900 rounded-lg font-semibold hover:bg-burlywood-400 transition-colors"
            >
              Get Started Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default HomePage