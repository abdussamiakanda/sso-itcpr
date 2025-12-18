import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';

function Login({ onLoginSuccess, API_BASE_URL, API_SSO_ENDPOINT }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password is too weak',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/user-disabled': 'This account has been disabled',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/operation-not-allowed': 'Email/password sign in is not enabled'
    };
    
    return errorMessages[errorCode] || 'Incorrect credentials. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!API_BASE_URL || !API_SSO_ENDPOINT) {
        throw new Error('API configuration is not complete');
      }

      // Step 1: Authenticate with Firebase first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Step 2: Get Firebase ID token
      const firebaseIdToken = await user.getIdToken();
      
      // Step 3: Call API to get custom SSO token
      const response = await fetch(`${API_BASE_URL}${API_SSO_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firebaseIdToken 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success && data.customToken) {
        // Store the custom SSO token
        onLoginSuccess(user, data.customToken);
        setError('');
      } else {
        throw new Error(data.error || 'Failed to get SSO token from API');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific API errors
      if (error.message.includes('API error:')) {
        setError('Server authentication failed. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(getErrorMessage(error.code) || error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <h1>ITCPR SSO</h1>
          <p>Single Sign-On Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {error && (
          <div className="error-message" style={{ display: 'block' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

