import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpMessage, setOtpMessage] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.token) {
          onLogin(res.data);
        }
      } else {
        const res = await axios.post('/api/auth/register', { email, password, fullName });
        if (res.data.message) {
          setOtpEmail(email);
          setShowOtp(true);
          setOtpMessage(res.data.message);
        } else if (res.data.token) {
          onLogin(res.data);
        }
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        setOtpEmail(errData.email);
        setShowOtp(true);
        setOtpMessage('Please verify your email to continue');
        handleResendOtp(errData.email);
      } else {
        setError(errData?.error || 'Something went wrong');
      }
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      setOtp(paste.split(''));
      document.getElementById('otp-5').focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/verify-otp', { email: otpEmail, otp: otpCode });
      if (res.data.token) {
        onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResendOtp = async (targetEmail) => {
    setResending(true);
    try {
      await axios.post('/api/auth/resend-otp', { email: targetEmail || otpEmail });
      setOtpMessage('New OTP sent to your email');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    }
    setResending(false);
  };

  if (showOtp) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verify Email</h1>
            <p>We sent a 6-digit code to <strong>{otpEmail}</strong></p>
          </div>

          {otpMessage && <div className="otp-success">{otpMessage}</div>}
          {error && <div className="auth-error">{error}</div>}

          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="otp-input"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button onClick={handleVerifyOtp} disabled={loading} className="auth-submit">
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div className="otp-footer">
            <p>Didn't receive the code?</p>
            <button onClick={() => handleResendOtp()} disabled={resending} className="resend-btn">
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <button onClick={() => { setShowOtp(false); setError(''); setOtp(['', '', '', '', '', '']); }} className="back-to-login">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>JobTracker</h1>
          <p>AI-Powered Job Application Tracker</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>Login</button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>Sign Up</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;