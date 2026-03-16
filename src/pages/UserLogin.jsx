import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser, resetPassword } from '../utils/storage';
import { UserPlus, LogIn, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function UserLogin({ setUser }) {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'register') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all fields');
        return;
      }
      const user = registerUser(formData);
      if (user) {
        setUser(user);
        navigate('/');
      } else {
        setError('Email already exists');
      }
    } else if (activeTab === 'forgot') {
      if (!formData.email || !formData.password) {
        setError('Please enter your email and a new password');
        return;
      }
      const success = resetPassword(formData.email, formData.password);
      if (success) {
        setSuccessMsg('Password reset successful! You can now login.');
        setActiveTab('login');
        setFormData({ ...formData, password: '' });
      } else {
        setError('Email not found. Please register.');
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        return;
      }
      const user = loginUser(formData.email, formData.password);
      if (user) {
        if (user.role === 'admin') {
          setError('Admin accounts cannot log in here. Please use Admin Portal.');
          // Don't set user
        } else {
          setUser(user);
          navigate('/');
        }
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0', background: 'linear-gradient(135deg, var(--primary), #FF7B8F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 950, letterSpacing: '-1px' }}>
          EVENTX USER
        </h2>
      </div>

      <div className="auth-tabs" style={{ marginBottom: '0.75rem', padding: '0.2rem' }}>
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
      
      {error && <div style={{ color: 'white', marginBottom: '1rem', textAlign: 'center', background: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>{error}</div>}
      {successMsg && <div style={{ color: 'white', marginBottom: '1rem', textAlign: 'center', background: 'var(--success)', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        {activeTab === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">{activeTab === 'forgot' ? 'New Password' : 'Password'}</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ paddingRight: '3rem' }}
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
                color: 'var(--text-muted)', 
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
          {activeTab === 'login' ? 'LOGIN' : activeTab === 'register' ? 'REGISTER' : 'RESET PASSWORD'}
        </button>
      </form>

      {activeTab === 'login' && (
        <div style={{ marginTop: '1rem', textAlign: 'center', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '0px', padding: '0.8rem', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: '900', letterSpacing: '0.8px', textShadow: '0 0 10px rgba(0, 210, 255, 0.3)' }}>
            DEMO: user@event.com / Password: user
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

      <div style={{ marginTop: '0.75rem', textAlign: 'center', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
        <Link to="/admin-login" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.8rem' }}>
          <ShieldAlert size={14} /> Admin Portal
        </Link>
      </div>
    </div>
  );
}
