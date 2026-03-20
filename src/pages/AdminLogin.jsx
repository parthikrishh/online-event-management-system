import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setItem } from '../utils/storage';
import { api } from '../services/apiService';
import { User, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { prefetchRoute } from '../utils/routePrefetch';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

      try {
        const userFound = await api.users.getByEmail({ email: formData.email });
        if (userFound && userFound.password === formData.password) {
          if (userFound.role === 'admin') {
            setItem('oems_current_user', userFound);
            setUser(userFound);
            prefetchRoute('admin', { idle: true });
            navigate('/admin');
            return;
          } else {
            setError('Access denied. Admin privileges required.');
            return;
          }
        } else {
          setError('Invalid credentials');
        }
      } catch (err) {
        console.error("Admin auth failed", err);
        setError("Authentication failed.");
      }
  };

  return (
    <section className="auth-page auth-page-admin">
      <div className="auth-container">
        <div className="auth-head">
          <p className="auth-kicker">EventX Control Center</p>
          <h2>Admin login</h2>
          <p>Secure access for operations, analytics, and event workflows.</p>
        </div>
      
      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Admin Email</label>
          <div className="input-with-icon">
            <Mail size={16} />
            <input 
              type="email" 
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@test.com"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-with-icon">
            <Lock size={16} />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ 
          width: '100%', 
          marginTop: '1rem'
        }}>
          Secure Login
        </button>
      </form>

      <div className="auth-demo-block">
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ADMIN ACCESS<br />
          <strong style={{ color: 'var(--text-main)' }}>admin@test.com / admin123</strong>
        </p>
      </div>

      <div className="auth-foot-link">
        <Link to="/login" style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.85rem' }}>
          <User size={14} /> Back to User Login
        </Link>
      </div>
      </div>
    </section>
  );
}
