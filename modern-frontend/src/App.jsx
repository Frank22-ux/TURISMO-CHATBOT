import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterHost from './pages/RegisterHost';
import ForgotPassword from './pages/ForgotPassword';
import DashboardTourist from './pages/DashboardTourist';
import DashboardHost from './pages/DashboardHost';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-host" element={<RegisterHost />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/dashboard-tourist" 
            element={
              <ProtectedRoute>
                <DashboardTourist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-host" 
            element={
              <ProtectedRoute>
                <DashboardHost />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
