import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Logout from "./pages/auth/Logout";
import UnderConstruction from "./pages/UnderConstruction";
import MainLayout from "./layouts/MainLayout";
import Categories from "./pages/courses/Categories";
import Courses from "./pages/courses/Courses";
import Levels from "./pages/courses/Levels";
import Exercises from "./pages/courses/Exercises";
import Reels from "./pages/courses/Reels";
import Quotes from "./pages/courses/Quotes";
import Faq from "./pages/courses/Faq";
import CourseDetail from "./components/CourseDetail";
import Users from "./pages/admin/Users";
import CRM from "./pages/admin/CRM";
import VoiceRooms from "./pages/admin/VoiceRooms";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";
import LandingPageSettings from "./pages/admin/LandingPageSettings";
import Books from "./pages/admin/Books";
import LandingPage from "./pages/public/LandingPage";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";


const App = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <SocketProvider>
        <div>
          <Toaster toastOptions={{
            duration: 5000,
            success: {
              duration: 3000,
            },
            error: {
              duration: 8000,
            }
          }}
            position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route element={
              <MainLayout />
            }>

            
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin" element={<Home />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/crm" element={<CRM />} />
              <Route path="/admin/crm/rooms/:roomId" element={<CRM />} />
              <Route path="/admin/voice-rooms" element={<VoiceRooms />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/landing-page-settings" element={<LandingPageSettings />} />
              <Route path="/admin/books" element={<Books />} />
              <Route path="/admin/courses/categories" element={<Categories />} />
              <Route path="/admin/levels" element={<Levels />} />
              <Route path="/admin/courses/exercises" element={<Exercises />} />
              <Route path="/admin/courses/reels" element={<Reels />} />
              <Route path="/admin/courses/quotes" element={<Quotes />} />
              <Route path="/admin/courses/faqs" element={<Faq />} />
              <Route path="/admin/courses/list" element={<Courses />} />
              <Route path="/admin/courses/:id" element={<CourseDetail />} />
            </Route>
            {/* Routes protégées pour les admins */}
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<UnderConstruction />} />
          </Routes>
        </Router>
        </div>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;