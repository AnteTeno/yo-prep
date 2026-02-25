import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import Practice from './pages/Practice';
import QuestionView from './pages/QuestionView';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/question/:questionId" element={<QuestionView />} />
      </Routes>
    </Router>
  );
}

export default App;
