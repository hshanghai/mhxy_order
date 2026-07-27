import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CharacterDetail from './pages/CharacterDetail';
import ExpenseDetail from './pages/ExpenseDetail';
import IncomeDetail from './pages/IncomeDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/character/:id" element={<ProtectedRoute><CharacterDetail /></ProtectedRoute>} />
        <Route path="/character/:id/expense/:type" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
        <Route path="/character/:id/income/:type" element={<ProtectedRoute><IncomeDetail /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
