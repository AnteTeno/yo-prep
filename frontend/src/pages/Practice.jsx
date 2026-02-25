import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Practice() {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRandom = () => {
    setLoading(true);
    setUserAnswer('');
    setFeedback(null);
    api.get('/questions/random')
      .then(data => { setQuestion(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRandom(); }, []);

  const checkAnswer = () => {
    if (!userAnswer.trim() || !question) return;

    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setFeedback({ isCorrect, correctAnswer: question.correctAnswer });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !feedback) checkAnswer();
  };

  const subjectLabels = {
    mathematics: 'Matematiikka', physics: 'Fysiikka', chemistry: 'Kemia',
    english: 'Englanti', history: 'Historia',
  };
  const difficultyLabels = { easy: 'Helppo', medium: 'Keskitaso', hard: 'Vaikea' };
  const difficultyColors = {
    easy: 'var(--color-success)', medium: 'var(--color-warning)', hard: 'var(--color-error)',
  };

  if (loading) {
    return (<><Navbar /><div className="container"><p className="text-secondary">Ladataan...</p></div></>);
  }

  if (!question) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h2 style={{ marginBottom: '12px' }}>Ei kysymyksia saatavilla</h2>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            Kaynnista backend ja lisaa kysymyksia aloittaaksesi harjoittelun.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>Etusivulle</button>
        </div>
      </>
    );
  }

  const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Score bar */}
        <div className="card" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '24px', padding: '16px 24px',
        }}>
          <span className="text-secondary" style={{ fontSize: '14px' }}>Harjoittelutila</span>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>{score.correct}</span>
              <span className="text-secondary"> / {score.total} oikein</span>
            </span>
            {score.total > 0 && (
              <span style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: percentage >= 70 ? 'rgba(52, 211, 153, 0.1)' : percentage >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: percentage >= 70 ? 'var(--color-success)' : percentage >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Question tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px', backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--color-primary)', borderRadius: '16px', fontSize: '13px', fontWeight: '600',
          }}>
            {subjectLabels[question.subject] || question.subject}
          </span>
          {question.difficulty && (
            <span style={{
              padding: '4px 12px',
              backgroundColor: `${difficultyColors[question.difficulty] || '#6B7280'}15`,
              color: difficultyColors[question.difficulty] || '#6B7280',
              borderRadius: '16px', fontSize: '13px', fontWeight: '600',
            }}>
              {difficultyLabels[question.difficulty] || question.difficulty}
            </span>
          )}
          <span style={{
            padding: '4px 12px', backgroundColor: 'rgba(52, 211, 153, 0.1)',
            color: 'var(--color-success)', borderRadius: '16px', fontSize: '13px', fontWeight: '600',
          }}>
            {question.points} pistetta
          </span>
        </div>

        {/* Question */}
        <div className="card" style={{ marginBottom: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: '500' }}>
            {question.questionText}
          </h2>
        </div>

        {/* Answer */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kirjoita vastaus..."
            disabled={!!feedback}
            style={{
              width: '100%', padding: '14px', fontSize: '16px',
              borderColor: feedback ? (feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)') : 'var(--border-default)',
            }}
          />
        </div>

        {!feedback ? (
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
          >
            Tarkista vastaus
          </button>
        ) : (
          <div>
            <div className="card" style={{
              marginBottom: '16px', padding: '24px',
              borderColor: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: feedback.isCorrect ? '0' : '8px' }}>
                <span style={{ fontSize: '28px' }}>{feedback.isCorrect ? '✅' : '❌'}</span>
                <h3 style={{
                  fontSize: '18px', fontWeight: '600',
                  color: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {feedback.isCorrect ? 'Oikein!' : 'Vaarin'}
                </h3>
              </div>
              {!feedback.isCorrect && (
                <p style={{ fontSize: '15px' }}>
                  Oikea vastaus: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              onClick={fetchRandom}
            >
              Seuraava kysymys →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
