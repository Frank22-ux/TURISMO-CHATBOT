import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardTourist from './pages/DashboardTourist';
import DashboardHost from './pages/DashboardHost';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
  );
}

export default App;
