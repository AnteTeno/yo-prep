import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('subject') || '');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/questions')
      .then(data => { setQuestions(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Update filter from URL
  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject) setFilter(subject);
  }, [searchParams]);

  const subjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];
  const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];

  const filtered = questions.filter(q => {
    if (filter && q.subject !== filter) return false;
    if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
    return true;
  });

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

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
            Kysymykset {filter && <span className="text-secondary" style={{ fontSize: '16px', fontWeight: '400' }}>
              — {subjectLabels[filter] || filter}
            </span>}
          </h2>
          <span className="text-secondary" style={{ fontSize: '14px' }}>
            {filtered.length} / {questions.length} kysymysta
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 16px', minWidth: '180px' }}
          >
            <option value="">Kaikki aineet</option>
            {subjects.map(s => (
              <option key={s} value={s}>{subjectLabels[s] || s}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{ padding: '10px 16px', minWidth: '180px' }}
          >
            <option value="">Kaikki vaikeustasot</option>
            {difficulties.map(d => (
              <option key={d} value={d}>{difficultyLabels[d] || d}</option>
            ))}
          </select>

          {(filter || difficultyFilter) && (
            <button
              className="btn-secondary"
              onClick={() => { setFilter(''); setDifficultyFilter(''); }}
              style={{ padding: '10px 16px' }}
            >
              Tyhjenna suodattimet
            </button>
          )}
        </div>

        {/* Questions list */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>Ei kysymyksia</p>
            <p className="text-secondary">Kokeile eri suodattimia tai lisaa kysymyksia backendiin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((q) => (
              <div
                key={q.id}
                className="card"
                style={{ cursor: 'pointer', padding: '20px' }}
                onClick={() => navigate(`/question/${q.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}>
                        {subjectLabels[q.subject] || q.subject}
                      </span>
                      {q.difficulty && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: `${difficultyColors[q.difficulty] || '#6B7280'}15`,
                          color: difficultyColors[q.difficulty] || '#6B7280',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {difficultyLabels[q.difficulty] || q.difficulty}
                        </span>
                      )}
                      {q.examCode && (
                        <span className="text-secondary" style={{ fontSize: '11px' }}>
                          {q.examCode}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
                      {q.questionText}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    color: 'var(--color-success)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}>
                    {q.points} p
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
