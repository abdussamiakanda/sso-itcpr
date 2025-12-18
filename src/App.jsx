import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Loading from './components/Loading';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_SSO_ENDPOINT = import.meta.env.VITE_API_SSO_ENDPOINT;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in environment variables');
}

if (!API_SSO_ENDPOINT) {
  console.error('VITE_API_SSO_ENDPOINT is not defined in environment variables');
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [customToken, setCustomToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPopupMode, setIsPopupMode] = useState(false);
  const [parentUrl, setParentUrl] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    // Check for redirect URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }

    // Check for popup mode
    const isPopup = urlParams.get('popup') === 'true';
    const parentUrlParam = urlParams.get('parent');
    const url = parentUrlParam ? new URL(parentUrlParam) : null;

    if (isPopup && parentUrlParam && (
      url.hostname.endsWith('.itcpr.org') || 
      url.hostname === 'itcpr.org' || 
      url.origin === 'http://127.0.0.1:5500' || 
      url.origin === 'http://localhost:5173' || 
      url.origin === 'http://localhost:3000'
    )) {
      setIsPopupMode(true);
      setParentUrl(parentUrlParam);
      document.body.classList.add('popup-mode');
      document.title = 'ITCPR SSO - Authentication';
    }

    // Monitor auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        if (isPopupMode) {
          // In popup mode, check if we have a custom token
          if (customToken) {
            // We have a custom token, send auth data to parent and close
            handlePopupAuth(user, customToken);
          } else {
            // No custom token, fetch one
            await fetchCustomToken(user);
          }
        }
      } else {
        setCurrentUser(null);
        setCustomToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isPopupMode, customToken]);

  const fetchCustomToken = async (user) => {
    try {
      if (!API_BASE_URL || !API_SSO_ENDPOINT) {
        throw new Error('API configuration is not complete');
      }
      
      if (user) {
        const firebaseIdToken = await user.getIdToken();

        const response = await fetch(`${API_BASE_URL}${API_SSO_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email: user.email,
            password: 'test',
            firebaseIdToken
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.success && data.customToken) {
          setCustomToken(data.customToken);
        }
      }
    } catch (error) {
      console.error('Error fetching custom token:', error);
    }
  };

  const handlePopupAuth = (user, token) => {
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Create SSO payload with custom token
      const ssoPayload = {
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        },
        timestamp: Date.now(),
        token: token,
        tokenType: 'custom_token',
        success: true,
      };

      // Send message to parent window
      if (window.opener) {
        window.opener.postMessage(ssoPayload, parentUrl);
      }

      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);

    } catch (error) {
      console.error('Popup auth error:', error);
      handlePopupError('Authentication error: ' + error.message);
    }
  };

  const handlePopupError = (message) => {
    const errorPayload = {
      success: false,
      error: message,
      timestamp: Date.now()
    };

    if (window.opener) {
      window.opener.postMessage(errorPayload, parentUrl);
    }

    // Show error briefly before closing
    setTimeout(() => {
      window.close();
    }, 2000);
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setCustomToken(token);
    
    if (isPopupMode) {
      handlePopupAuth(user, token);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setCustomToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container">
      {currentUser ? (
        <Dashboard 
          user={currentUser} 
          customToken={customToken}
          redirectUrl={redirectUrl}
          onLogout={handleLogout}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          API_BASE_URL={API_BASE_URL}
          API_SSO_ENDPOINT={API_SSO_ENDPOINT}
        />
      )}
    </div>
  );
}

export default App;

