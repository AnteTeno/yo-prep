import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Profile({ user, onLogout }) {
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getProgress(user.id),
      api.getSubmissions(user.id),
    ])
      .then(([prog, subs]) => {
        setProgress(prog);
        setSubmissions(subs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  const subjectLabels = {
    mathematics: 'Matematiikka', physics: 'Fysiikka', chemistry: 'Kemia',
    english: 'Englanti', history: 'Historia',
  };

  const gradeColors = {
    l: '#10B981', m: '#34D399', c: '#3B82F6', b: '#F59E0B', a: '#EF4444', i: '#DC2626',
  };

  if (loading) {
    return (<><Navbar user={user} /><div className="container"><p className="text-secondary">Ladataan...</p></div></>);
  }

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);

  return (
    <>
      <Navbar user={user} />
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* User header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
              {user.username}
            </h2>
            <p className="text-secondary" style={{ fontSize: '14px' }}>{user.email}</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => { onLogout(); navigate('/'); }}
            style={{ padding: '8px 20px' }}
          >
            Kirjaudu ulos
          </button>
        </div>

        {/* Stats overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>
              {progress?.totalSubmissions || 0}
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Vastauksia yhteensa</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-success)' }}>
              {progress?.subjects?.length || 0}
            </p>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Ainetta harjoiteltu</p>
          </div>
        </div>

        {/* Per-subject stats */}
        {progress?.subjects?.length > 0 && (
          <>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Edistyminen aineittain</h3>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
              {progress.subjects.map((s) => (
                <div key={s.subject} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {subjectLabels[s.subject] || s.subject}
                      </h4>
                      <p className="text-secondary" style={{ fontSize: '13px' }}>
                        {s.totalAnswers} vastausta
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-primary)' }}>
                          {s.averageScore}
                        </p>
                        <p className="text-secondary" style={{ fontSize: '11px' }}>Keskiarvo</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-success)' }}>
                          {s.bestScore}
                        </p>
                        <p className="text-secondary" style={{ fontSize: '11px' }}>Paras</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent submissions */}
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Viimeisimmat vastaukset</h3>
        {recentSubmissions.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <p className="text-secondary">Ei viela vastauksia. Aloita harjoittelu!</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/practice')}>
              Harjoittele
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {sub.question?.questionText?.substring(0, 80) || 'Kysymys'}
                      {sub.question?.questionText?.length > 80 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="text-secondary" style={{ fontSize: '12px' }}>
                        {subjectLabels[sub.question?.subject] || sub.question?.subject}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '12px' }}>
                        {new Date(sub.submittedAt).toLocaleDateString('fi-FI')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {sub.aiGrade && (
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: gradeColors[sub.aiGrade] || 'var(--text-primary)',
                        textTransform: 'uppercase',
                      }}>
                        {sub.aiGrade}
                      </span>
                    )}
                    {sub.aiScore != null && (
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>
                        {sub.aiScore} p
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
