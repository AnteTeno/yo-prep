import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Practice({ user }) {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
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

  const checkAnswer = async () => {
    if (!userAnswer.trim() || !question) return;

    if (user) {
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
        setScore(prev => ({
          correct: prev.correct + (submission.aiScore > 0 ? 1 : 0),
          total: prev.total + 1,
        }));
      } catch {
        const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
        setFeedback({ isAi: false, isCorrect, correctAnswer: question.correctAnswer });
        setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
      } finally {
        setEvaluating(false);
      }
    } else {
      const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
      setFeedback({ isAi: false, isCorrect, correctAnswer: question.correctAnswer });
      setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !feedback && !evaluating) checkAnswer();
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
      <Navbar user={user} />
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
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Kirjoita vastaus..."
            disabled={!!feedback || evaluating}
            rows={user ? 4 : 1}
            style={{
              width: '100%', padding: '14px', fontSize: '16px', resize: 'vertical', fontFamily: 'inherit',
              borderColor: feedback
                ? (feedback.isAi ? gradeColors[feedback.grade] || 'var(--border-default)' : (feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)'))
                : 'var(--border-default)',
            }}
          />
        </div>

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
            <div className="card" style={{
              marginBottom: '16px', padding: '24px',
              borderColor: gradeColors[feedback.grade] || 'var(--border-default)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '28px', fontWeight: '700',
                    color: gradeColors[feedback.grade] || 'var(--text-primary)',
                    textTransform: 'uppercase',
                  }}>
                    {feedback.grade}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>AI-arviointi</span>
                </div>
                <span style={{
                  padding: '6px 14px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: '16px', fontSize: '14px', fontWeight: '600',
                }}>
                  {feedback.score} / {feedback.maxScore} p
                </span>
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {feedback.feedbackText}
              </p>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              onClick={fetchRandom}
            >
              Seuraava kysymys →
            </button>
          </div>
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
              {!user && (
                <p className="text-secondary" style={{ fontSize: '13px', marginTop: '8px' }}>
                  Kirjaudu sisaan saadaksesi AI-arvioinnin!
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
