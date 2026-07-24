import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CharacterDetail from './pages/CharacterDetail';
import ExpenseDetail from './pages/ExpenseDetail';
import IncomeDetail from './pages/IncomeDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
        <Route path="/character/:id/expense/:type" element={<ExpenseDetail />} />
        <Route path="/character/:id/income/:type" element={<IncomeDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
