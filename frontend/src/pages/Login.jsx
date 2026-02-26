import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isRegister) {
        user = await api.register(username, email, password);
      } else {
        user = await api.login(username, password);
      }
      onLogin(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Kirjautuminen epaonnistui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '440px', paddingTop: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          {isRegister ? 'Rekisteroidy' : 'Kirjaudu sisaan'}
        </h2>
        <p className="text-secondary" style={{ textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>
          {isRegister ? 'Luo uusi tili aloittaaksesi harjoittelun' : 'Tervetuloa takaisin!'}
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-error)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Kayttajanimi
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kayttajanimi"
              required
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Sahkoposti
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahkoposti@esimerkki.fi"
                required
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Salasana
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="salasana"
              required
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px', marginBottom: '16px' }}
          >
            {loading ? 'Ladataan...' : (isRegister ? 'Rekisteroidy' : 'Kirjaudu')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          <span className="text-secondary">
            {isRegister ? 'Onko sinulla jo tili? ' : 'Eiko sinulla ole tilia? '}
          </span>
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            {isRegister ? 'Kirjaudu sisaan' : 'Rekisteroidy'}
          </button>
        </p>
      </div>
    </>
  );
}
