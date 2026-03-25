import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import CourseList from './components/CourseList'
import CourseDetail from './components/CourseDetail'
import LessonViewer from './components/LessonViewer'
import TeacherDashboard from './components/TeacherDashboard'
import CreateCourse from './components/CreateCourse'
import AddModule from './components/AddModule'
import AddLesson from './components/AddLesson'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/lesson/:courseId/:moduleIndex/:lessonIndex" element={<LessonViewer />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/create-course" element={<CreateCourse />} />
          <Route path="/teacher/course/:courseId/add-module" element={<AddModule />} />
          <Route path="/teacher/course/:courseId/module/:moduleIndex/add-lesson" element={<AddLesson />} />
          <Route path="/teacher/course/:courseId/module/:moduleIndex/lesson/:lessonId/edit" element={<AddLesson />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
