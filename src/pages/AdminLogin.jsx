import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../utils/storage';
import { ShieldCheck, User, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    const user = loginUser(formData.email, formData.password);
    
    if (user) {
      if (user.role === 'admin') {
        setUser(user);
        navigate('/admin');
      } else {
        setError('Access denied. Admin privileges required.');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-container" style={{ 
      boxShadow: '0 0 50px rgba(255, 49, 82, 0.15)', 
      border: '1px solid rgba(255, 49, 82, 0.3)',
      background: 'rgba(18, 19, 25, 0.95)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0', background: 'linear-gradient(135deg, var(--primary), #FF7B8F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 950, letterSpacing: '-1px' }}>
          EVENTX ADMIN
        </h2>
      </div>
      
      {error && <div style={{ color: 'white', marginBottom: '1rem', textAlign: 'center', background: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--secondary)' }}>Admin Email</label>
          <input 
            type="email" 
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--secondary)' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ borderColor: 'rgba(236, 72, 153, 0.4)', paddingRight: '3rem' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                color: 'var(--secondary)', 
                opacity: 0.7,
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn" style={{ 
          width: '100%', 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'var(--primary)', 
          color: 'white',
          fontSize: '1rem',
          borderRadius: '2px',
          fontWeight: '900',
          letterSpacing: '1px'
        }}>
          AUTHENTICATE
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', background: 'rgba(255, 49, 82, 0.1)', borderRadius: '0px', padding: '1rem', border: '1px solid rgba(255, 49, 82, 0.2)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800', letterSpacing: '0.5px' }}>
          DEMO: admin@event.com / Password: admin
        </p>
      </div>

      <div style={{ marginTop: '0.75rem', textAlign: 'center', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
        <Link to="/login" style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.85rem' }}>
          <User size={14} /> Back to User Login
        </Link>
      </div>
    </div>
  );
}
