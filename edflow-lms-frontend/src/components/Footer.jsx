import React from 'react'
import { Heart, Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-maroon-900 text-burlywood-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-burlywood-400 mb-4">EduFlow LMS</h3>
            <p className="text-burlywood-200 text-sm">
              A lightweight Learning Management System designed to help teachers deliver structured learning content and track student progress with minimal infrastructure complexity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-burlywood-400 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/courses" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                  Courses
                </a>
              </li>
              <li>
                <a href="/about" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-burlywood-400 mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-burlywood-400" />
                <span className="text-burlywood-200">support@eduflow.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-burlywood-400" />
                <span className="text-burlywood-200">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-burlywood-400" />
                <span className="text-burlywood-200">123 Education St, Learning City</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold text-burlywood-400 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-burlywood-200 hover:text-burlywood-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-maroon-800 mt-8 pt-8 text-center">
          <p className="text-burlywood-200 text-sm flex items-center justify-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by EduFlow Team
          </p>
          <p className="text-burlywood-300 text-xs mt-2">
            © 2026 EduFlow LMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer