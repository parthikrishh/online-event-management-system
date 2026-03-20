import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setItem } from '../utils/storage';
import { useMutation, api } from '../services/apiService';
import { ShieldAlert, Eye, EyeOff, Mail, Lock, UserRound } from 'lucide-react';
import { prefetchRoutes } from '../utils/routePrefetch';

export default function UserLogin({ setUser }) {
  const navigate = useNavigate();
  const registerMutation = useMutation(api.users.create);
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', or 'forgot'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'register') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all fields');
        return;
      }
      try {
        const user = await registerMutation({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user',
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        });
        if (user) {
          const newUser = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'user',
            id: user.id || Date.now().toString()
          };
          setItem('oems_current_user', newUser);
          setUser(newUser);
          navigate('/');
        }
      } catch (err) {
        console.error("Registration failed", err);
        setError("Registration failed. Email might already be in use.");
      }
    } else if (activeTab === 'forgot') {
      setError('Password reset is currently disabled in real-time mode.');
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        return;
      }
      try {
        const userFound = await api.users.getByEmail({ email: formData.email });
        if (userFound && userFound.password === formData.password) {
          if (userFound.role === 'admin') {
            setError('Admin accounts cannot log in here. Please use Admin Portal.');
          } else {
            setItem('oems_current_user', userFound);
            setUser(userFound);
            prefetchRoutes(['events', 'userDashboard'], { idle: true });
            navigate('/');
            return;
          }
        } else {
          setError('Invalid credentials');
        }
      } catch (err) {
        console.error("Auth failed", err);
        setError("Authentication failed.");
      }
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-head">
          <p className="auth-kicker">EventX User Portal</p>
          <h2>Welcome back</h2>
          <p>The best events are just one login away.</p>
        </div>

      <div className="auth-tabs" style={{ marginBottom: '1rem' }}>
        <div 
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
        >
          Login
        </div>
        <div 
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
        >
          Register
        </div>
      </div>
      
      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {successMsg && <div className="auth-alert auth-alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        {activeTab === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <UserRound size={16} />
              <input 
                type="text" 
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-with-icon">
            <Mail size={16} />
            <input 
              type="email" 
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{activeTab === 'forgot' ? 'New Password' : 'Password'}</label>
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
          {activeTab === 'login' ? 'Sign In' : activeTab === 'register' ? 'Create Account' : 'Reset Password'}
        </button>
      </form>

      {activeTab === 'login' && (
        <div className="auth-demo-block">
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            DEMO ACCESS<br />
            <strong style={{ color: 'var(--text-main)' }}>user@test.com / user123</strong>
          </p>
        </div>
      )}

      {activeTab === 'login' && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={() => { setActiveTab('forgot'); setError(''); setSuccessMsg(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Forgot Password?
          </button>
        </div>
      )}

      <div className="auth-foot-link">
        <Link to="/admin-login" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.85rem' }}>
          <ShieldAlert size={14} /> Admin Portal
        </Link>
      </div>
      </div>
    </section>
  );
}
