// ITCPR SSO Application - Function-based structure

// Global variables
let currentUser = null;
let customToken = null;
let redirectUrl = null;
let isPopupMode = false;
let parentUrl = null;

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
        id: 'latex',
        name: 'LaTeX',
        description: 'Document preparation system',
        url: 'https://latex.itcpr.org',
        icon: 'fa-solid fa-file-code',
        color: '#84cc16'
    },
    {
        id: 'playground',
        name: 'Playground',
        description: 'Interactive coding environment',
        url: 'https://playground.itcpr.org',
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
        id: 'events',
        name: 'Events',
        description: 'ITCPR events and activities',
        url: 'https://events.itcpr.org',
        icon: 'fa-solid fa-calendar',
        color: '#22c55e'
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
    }
];

async function init() {
    await checkRedirectUrl();
    await setupEventListeners();
    await checkAuthState();
    await checkPopupMode();
}

async function checkRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    redirectUrl = urlParams.get('redirect');
}

async function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleEmailLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => handleLogout());
    }
}

async function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            if (isPopupMode) {
                // In popup mode, send auth data to parent and close
                handlePopupAuth();
            } else {
                // Normal mode, show dashboard
                showDashboard();
                updateUserInfo();
            }
        } else {
            currentUser = null;
            customToken = null;
            showLogin();
        }
    });
}

async function handleEmailLogin(e) {
    e.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Step 1: Authenticate with Firebase first
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Step 2: Only call API if there's a redirect URL
        if (redirectUrl) {
            const firebaseIdToken = await user.getIdToken();
            const response = await fetch('https://api.itcpr.org/auth/sso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${firebaseIdToken}`
                },
                body: JSON.stringify({ email, password, firebaseIdToken })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.token) {
                // Store the custom SSO token
                customToken = data.token;
                currentUser = user;
                
                hideError();
                showDashboard();
                updateUserInfo();
            } else {
                throw new Error(data.error || 'Failed to get SSO token');
            }
        } else {
            // No redirect URL, just use Firebase authentication
            currentUser = user;
            hideError();
            showDashboard();
            updateUserInfo();
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error.code) || error.message || 'Login failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        customToken = null;
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    renderApps();
}

function updateUserInfo() {
    const userEmail = document.getElementById('user-email');
    if (userEmail && currentUser) {
        userEmail.textContent = currentUser.email;
    }
}

function renderApps() {
    const appsGrid = document.getElementById('apps-grid');
    if (!appsGrid) return;

    appsGrid.innerHTML = apps.map(app => `
        <div class="app-card" onclick="openApp('${app.id}')">
            <div class="app-icon" style="background-color: ${app.color}">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-info">
                <h3>${app.name}</h3>
                <p>${app.description}</p>
            </div>
            <div class="app-arrow">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        </div>
    `).join('');
}

function openApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // If there's a redirect URL, use it instead
    if (redirectUrl) {
        generateSSOToken(redirectUrl, appId);
        return;
    }

    // Generate SSO token and redirect
    generateSSOToken(app.url, appId);
}

async function generateSSOToken(targetUrl, appId) {
    if (!currentUser) return;

    try {
        // Use custom SSO token if available, otherwise use Firebase ID token
        const token = customToken || await currentUser.getIdToken();
        
        // Create SSO payload
        const ssoPayload = {
            user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email
            },
            app: appId,
            timestamp: Date.now(),
            token: token
        };

        // Redirect to target application
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.open(targetUrl, '_blank');
        }
        
    } catch (error) {
        console.error('Error generating SSO token:', error);
        showError('Failed to authenticate with the application');
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('hidden', !show);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function checkPopupMode() {
    // Check if this is opened as a popup/redirect for SSO
    const urlParams = new URLSearchParams(window.location.search);
    const isPopup = urlParams.get('popup') === 'true';
    const parentUrlParam = urlParams.get('parent');
    
    if (isPopup && parentUrlParam) {
        console.log('SSO popup mode detected');
        isPopupMode = true;
        parentUrl = parentUrlParam;
        
        // Add popup mode class to body
        document.body.classList.add('popup-mode');
        
        // Update page title for popup
        document.title = 'ITCPR SSO - Authentication';
    }
}

async function handlePopupAuth() {
    try {
        // Use custom SSO token if available, otherwise use Firebase ID token
        const token = customToken || await currentUser.getIdToken();
        
        // Create SSO payload
        const ssoPayload = {
            user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email
            },
            timestamp: Date.now(),
            token: token,
            success: true
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
        handlePopupError('Authentication error');
    }
}

function handlePopupError(message) {
    const errorPayload = {
        success: false,
        error: message,
        timestamp: Date.now()
    };

    if (window.opener) {
        window.opener.postMessage(errorPayload, parentUrl);
    }

    // Show error briefly before closing
    showError(message);
    setTimeout(() => {
        window.close();
    }, 2000);
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/user-disabled': 'This account has been disabled'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Initialize the SSO application
init();

// Export functions for global access
window.openApp = openApp; 