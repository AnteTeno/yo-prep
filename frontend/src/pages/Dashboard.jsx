import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/questions')
      .then(data => { setQuestions(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group questions by subject
  const grouped = questions.reduce((acc, q) => {
    const subject = q.subject || 'Muu';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(q);
    return acc;
  }, {});

  const subjectMeta = {
    mathematics: { label: 'Matematiikka', category: 'Luonnontieteet', color: '#3B82F6' },
    physics: { label: 'Fysiikka', category: 'Luonnontieteet', color: '#8B5CF6' },
    chemistry: { label: 'Kemia', category: 'Luonnontieteet', color: '#10B981' },
    english: { label: 'Englanti', category: 'Kielet', color: '#F59E0B' },
    history: { label: 'Historia', category: 'Humanistiset', color: '#EF4444' },
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container"><p className="text-secondary">Ladataan...</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            Tervetuloa YO<span style={{ color: 'var(--color-primary)' }}>prep</span>iin
          </h2>
          <p className="text-secondary" style={{ fontSize: '16px' }}>
            Harjoittele ylioppilaskokeisiin. Valitse aine aloittaaksesi.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>
              {questions.length}
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Kysymyksia yhteensa</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-success)' }}>
              {Object.keys(grouped).length}
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Ainetta</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-warning)' }}>
              {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Pistetta yhteensa</p>
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Aineet</h3>

        {Object.keys(grouped).length === 0 ? (
          <div className="card">
            <p className="text-secondary">
              Ei kysymyksia saatavilla. Kaynnista backend ja lisaa kysymyksia.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Object.entries(grouped).map(([subject, qs]) => {
              const meta = subjectMeta[subject] || { label: subject, category: 'Muu', color: '#6B7280' };
              return (
                <div
                  key={subject}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/questions?subject=${subject}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{meta.label}</h3>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: `${meta.color}20`,
                      color: meta.color,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {qs.length} tehtavaa
                    </span>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
                    Vaikeustasot: {[...new Set(qs.map(q => q.difficulty).filter(Boolean))].join(', ') || '-'}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--color-primary)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}>
                    {meta.category}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
