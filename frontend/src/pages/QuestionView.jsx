import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function QuestionView({ user }) {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/questions/${questionId}`)
      .then(data => { setQuestion(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [questionId]);

  const checkAnswer = async () => {
    if (!userAnswer.trim()) return;

    if (user) {
      // AI evaluation via backend
      setEvaluating(true);
      try {
        const submission = await api.submitAnswer(user.id, question.id, userAnswer);
        setFeedback({
          isAi: true,
          grade: submission.aiGrade,
          score: submission.aiScore,
          maxScore: question.points,
          feedbackText: submission.aiFeedback,
        });
      } catch {
        // Fallback to simple check
        setFeedback({
          isAi: false,
          isCorrect: userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase(),
          correctAnswer: question.correctAnswer,
        });
      } finally {
        setEvaluating(false);
      }
    } else {
      // Simple string comparison for non-logged-in users
      const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
      setFeedback({ isAi: false, isCorrect, correctAnswer: question.correctAnswer });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !feedback && !evaluating) {
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

  const gradeColors = {
    l: '#10B981', m: '#34D399', c: '#3B82F6', b: '#F59E0B', a: '#EF4444', i: '#DC2626',
  };

  if (loading) {
    return (<><Navbar user={user} /><div className="container"><p className="text-secondary">Ladataan...</p></div></>);
  }

  if (!question) {
    return (
      <>
        <Navbar user={user} />
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
      <Navbar user={user} />
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
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Kirjoita vastaus..."
            disabled={!!feedback || evaluating}
            rows={4}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit',
              borderColor: feedback
                ? (feedback.isAi ? gradeColors[feedback.grade] || 'var(--border-default)' : (feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)'))
                : 'var(--border-default)',
            }}
          />
        </div>

        {/* Actions */}
        {!feedback && !evaluating ? (
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
          >
            {user ? 'Lahetä arvioitavaksi' : 'Tarkista vastaus'}
          </button>
        ) : evaluating ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              AI arvioi vastaustasi...
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              Tama voi kestaa hetken
            </p>
          </div>
        ) : feedback.isAi ? (
          <div>
            {/* AI Feedback */}
            <div className="card" style={{
              marginBottom: '16px',
              borderColor: gradeColors[feedback.grade] || 'var(--border-default)',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: gradeColors[feedback.grade] || 'var(--text-primary)',
                    textTransform: 'uppercase',
                  }}>
                    {feedback.grade}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>
                    AI-arviointi
                  </span>
                </div>
                <span style={{
                  padding: '6px 14px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  {feedback.score} / {feedback.maxScore} p
                </span>
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {feedback.feedbackText}
              </p>
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
        ) : (
          <div>
            {/* Simple feedback */}
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
              {!user && (
                <p className="text-secondary" style={{ fontSize: '13px', marginTop: '8px' }}>
                  Kirjaudu sisaan saadaksesi AI-arvioinnin!
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
