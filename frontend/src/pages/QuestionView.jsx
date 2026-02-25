import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function QuestionView() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/questions/${questionId}`)
      .then(data => { setQuestion(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [questionId]);

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setFeedback({
      isCorrect,
      correctAnswer: question.correctAnswer,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !feedback) {
      checkAnswer();
    }
  };

  const reset = () => {
    setUserAnswer('');
    setFeedback(null);
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
        <div className="container">
          <p className="text-error">Kysymysta ei loytynyt.</p>
          <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => navigate('/questions')}>
            Takaisin
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px' }}>
        <button
          className="btn-secondary"
          style={{ marginBottom: '24px' }}
          onClick={() => navigate('/questions')}
        >
          ← Takaisin kysymyksiin
        </button>

        {/* Question header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--color-primary)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {subjectLabels[question.subject] || question.subject}
          </span>
          {question.difficulty && (
            <span style={{
              padding: '4px 12px',
              backgroundColor: `${difficultyColors[question.difficulty] || '#6B7280'}15`,
              color: difficultyColors[question.difficulty] || '#6B7280',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              {difficultyLabels[question.difficulty] || question.difficulty}
            </span>
          )}
          <span style={{
            padding: '4px 12px',
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            color: 'var(--color-success)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {question.points} pistetta
          </span>
          {question.examCode && (
            <span className="text-secondary" style={{ fontSize: '13px' }}>
              {question.examCode}
            </span>
          )}
        </div>

        {/* Question card */}
        <div className="card" style={{ marginBottom: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: '500' }}>
            {question.questionText}
          </h2>
        </div>

        {/* Answer input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Vastauksesi
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kirjoita vastaus..."
            disabled={!!feedback}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderColor: feedback
                ? (feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)')
                : 'var(--border-default)',
            }}
          />
        </div>

        {/* Actions */}
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
            {/* Feedback */}
            <div className="card" style={{
              marginBottom: '16px',
              borderColor: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px' }}>{feedback.isCorrect ? '✅' : '❌'}</span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {feedback.isCorrect ? 'Oikein!' : 'Vaarin'}
                </h3>
              </div>
              {!feedback.isCorrect && (
                <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
                  Oikea vastaus: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={reset}>
                Yrita uudelleen
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '14px' }} onClick={() => navigate('/questions')}>
                Seuraava kysymys
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
