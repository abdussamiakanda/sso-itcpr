import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const apps = [
  {
    id: 'website',
    name: 'Website',
    description: 'Main ITCPR website',
    url: 'https://itcpr.org',
    icon: 'fa-solid fa-earth-asia',
    color: '#3b82f6'
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'ITCPR portal',
    url: 'https://portal.itcpr.org',
    icon: 'fa-solid fa-house',
    color: '#f43f5e'
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Staff management portal',
    url: 'https://staff.itcpr.org',
    icon: 'fa-solid fa-users-gear',
    color: '#a855f7',
    requiresPosition: 'staff'
  },
  {
    id: 'webmail',
    name: 'Webmail',
    description: 'Email system',
    url: 'https://webmail.itcpr.org',
    icon: 'fa-solid fa-envelope',
    color: '#8b5cf6'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Online terminal access',
    url: 'https://terminal.itcpr.org',
    icon: 'fa-solid fa-laptop-code',
    color: '#10b981'
  },
  {
    id: 'server',
    name: 'Server',
    description: 'Server management',
    url: 'https://server.itcpr.org',
    icon: 'fa-solid fa-server',
    color: '#f59e0b'
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Digital library resources',
    url: 'https://library.itcpr.org',
    icon: 'fa-solid fa-book-open-reader',
    color: '#ef4444'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Cloud resources',
    url: 'https://cloud.itcpr.org',
    icon: 'fa-solid fa-cloud',
    color: '#06b6d4'
  },
  {
    id: 'codelab',
    name: 'CodeLab',
    description: 'Code repository',
    url: 'https://code.itcpr.org',
    icon: 'fa-solid fa-atom',
    color: '#6366f1'
  },
  {
    id: 'jupyter',
    name: 'JupyterLab',
    description: 'Jupyter Notebook Repository',
    url: 'https://jupyter.itcpr.org',
    icon: 'fa-brands fa-python',
    color: '#06b6d4'
  },
  {
    id: 'overleaf',
    name: 'Overleaf',
    description: 'Online LaTeX editor',
    url: 'https://overleaf.itcpr.org',
    icon: 'fa-solid fa-file-lines',
    color: '#14b8a6'
  },
  {
    id: 'latex',
    name: 'LaTeX',
    description: 'Document preparation system',
    url: 'https://latex.itcpr.org',
    icon: 'fa-solid fa-file-code',
    color: '#84cc16'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'ITCPR events and activities',
    url: 'https://events.itcpr.org',
    icon: 'fa-solid fa-calendar',
    color: '#22c55e'
  },
  {
    id: 'apply',
    name: 'Apply',
    description: 'Application portal',
    url: 'https://apply.itcpr.org',
    icon: 'fa-solid fa-file-pen',
    color: '#facc15'
  },
  {
    id: 'buildbox',
    name: 'Buildbox',
    description: 'Interactive coding environment',
    url: 'https://buildbox.itcpr.org',
    icon: 'fa-solid fa-gamepad',
    color: '#ec4899'
  },
  {
    id: 'forum',
    name: 'Forum',
    description: 'Community discussions',
    url: 'https://forum.itcpr.org',
    icon: 'fa-solid fa-comments',
    color: '#f97316'
  },
  {
    id: 'news',
    name: 'News',
    description: 'Latest science news',
    url: 'https://news.itcpr.org',
    icon: 'fa-solid fa-newspaper',
    color: '#8b5cf6'
  },
  {
    id: 'physics',
    name: 'Engine',
    description: 'Physics simulation engine',
    url: 'https://physics.itcpr.org',
    icon: 'fa-solid fa-gear',
    color: '#64748b'
  },
  {
    id: 'free',
    name: 'Free',
    description: 'Find common free time',
    url: 'https://free.itcpr.org',
    icon: 'fa-solid fa-calendar-check',
    color: '#f59e0b'
  }
];

function Dashboard({ user, customToken, redirectUrl, onLogout }) {
  const [error, setError] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPosition(userData.position || null);
        }
      } catch (error) {
        console.error('Error fetching user position:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosition();
  }, [user]);

  const generateSSOToken = async (targetUrl, appId) => {
    if (!user) {
      console.error('No current user available');
      return;
    }

    try {
      // Create SSO payload
      const ssoPayload = {
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        },
        app: appId,
        timestamp: Date.now(),
        token: customToken,
        tokenType: 'custom_token'
      };

      // Method 1: Send via URL parameters (for redirects)
      if (redirectUrl) {
        const ssoData = encodeURIComponent(JSON.stringify(ssoPayload));
        const finalUrl = `${redirectUrl}?sso=${ssoData}`;
        window.location.href = finalUrl;
      } else {
        // Method 2: Send via postMessage (for popup windows)
        const newWindow = window.open(targetUrl, '_blank');
        
        // Wait for the new window to load, then send the SSO data
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            newWindow.postMessage(ssoPayload, '*');
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error generating SSO token:', error);
      setError('Failed to authenticate with the application');
    }
  };

  const openApp = (appId) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // If there's a redirect URL, use it instead
    if (redirectUrl) {
      generateSSOToken(redirectUrl, appId);
      return;
    }

    // Generate SSO token and redirect
    generateSSOToken(app.url, appId);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ITCPR Applications</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      
      {error && (
        <div className="error-message" style={{ display: 'block', margin: '20px 32px' }}>
          {error}
        </div>
      )}
      
      <div className="apps-grid">
        {apps
          .filter(app => {
            // Filter apps based on position requirement
            if (app.requiresPosition) {
              return userPosition === app.requiresPosition;
            }
            return true; // Show apps without position requirements
          })
          .map(app => (
            <div 
              key={app.id} 
              className="app-card" 
              onClick={() => openApp(app.id)}
            >
              <div className="app-icon" style={{ backgroundColor: app.color }}>
                <i className={app.icon}></i>
              </div>
              <div className="app-info">
                <h3>{app.name}</h3>
                <p>{app.description}</p>
              </div>
              <div className="app-arrow">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;

