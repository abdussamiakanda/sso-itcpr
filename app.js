// ITCPR SSO Application
class ITCPRSSO {
    constructor() {
        this.currentUser = null;
        this.redirectUrl = null;
        this.apps = [
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
        
        this.init();
    }

    init() {
        this.checkRedirectUrl();
        this.setupEventListeners();
        this.checkAuthState();
        this.checkPopupMode();
    }

    checkRedirectUrl() {
        // Check for redirect URL in query parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.redirectUrl = urlParams.get('redirect');
        
        // Also check for stored redirect URL
        if (!this.redirectUrl) {
            this.redirectUrl = localStorage.getItem('itcpr_redirect_url');
        }
        
        if (this.redirectUrl) {
            localStorage.setItem('itcpr_redirect_url', this.redirectUrl);
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleEmailLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    checkAuthState() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                
                if (this.isPopupMode) {
                    // In popup mode, send auth data to parent and close
                    this.handlePopupAuth();
                } else {
                    // Normal mode, show dashboard
                    this.showDashboard();
                    this.updateUserInfo();
                }
            } else {
                this.currentUser = null;
                this.showLogin();
            }
        });
    }

    async handleEmailLogin(e) {
        e.preventDefault();
        this.showLoading(true);

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Authenticate with email/password
            await auth.signInWithEmailAndPassword(email, password);
            
            this.hideError();
            
            // The checkAuthState will handle the rest based on popup mode
            // No need to manually show dashboard here
            
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.showLoading(false);
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            localStorage.removeItem('itcpr_redirect_url');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showLogin() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('dashboard-section').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        this.renderApps();
    }

    updateUserInfo() {
        const userEmail = document.getElementById('user-email');
        if (userEmail && this.currentUser) {
            userEmail.textContent = this.currentUser.email;
        }
    }

    renderApps() {
        const appsGrid = document.getElementById('apps-grid');
        if (!appsGrid) return;

        appsGrid.innerHTML = this.apps.map(app => `
            <div class="app-card" onclick="ssoApp.openApp('${app.id}')">
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

    openApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        // If there's a redirect URL, use it instead
        if (this.redirectUrl) {
            this.generateSSOToken(this.redirectUrl, appId);
            return;
        }

        // Generate SSO token and redirect
        this.generateSSOToken(app.url, appId);
    }

    async generateSSOToken(targetUrl, appId) {
        if (!this.currentUser) return;

        try {
            // Get Firebase ID token
            const idToken = await this.currentUser.getIdToken();
            
            // Create SSO payload
            const ssoPayload = {
                user: {
                    uid: this.currentUser.uid,
                    email: this.currentUser.email,
                    displayName: this.currentUser.displayName || this.currentUser.email
                },
                app: appId,
                timestamp: Date.now(),
                token: idToken
            };

            // Store SSO data in localStorage for the target app to access
            localStorage.setItem('itcpr_sso_data', JSON.stringify(ssoPayload));
            
            // Clear redirect URL
            localStorage.removeItem('itcpr_redirect_url');
            
            // Redirect to target application
            if (this.redirectUrl) {
                window.location.href = this.redirectUrl;
            } else {
                window.open(targetUrl, '_blank');
            }
            
        } catch (error) {
            console.error('Error generating SSO token:', error);
            this.showError('Failed to authenticate with the application');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    getErrorMessage(errorCode) {
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

    checkPopupMode() {
        // Check if this is opened as a popup/redirect for SSO
        const urlParams = new URLSearchParams(window.location.search);
        const isPopup = urlParams.get('popup') === 'true';
        const parentUrl = urlParams.get('parent');
        
        if (isPopup && parentUrl) {
            console.log('SSO popup mode detected');
            this.isPopupMode = true;
            this.parentUrl = parentUrl;
            
            // Add popup mode class to body
            document.body.classList.add('popup-mode');
            
            // Update page title for popup
            document.title = 'ITCPR SSO - Authentication';
        }
    }

    handlePopupAuth() {
        try {
            // Get Firebase ID token
            this.currentUser.getIdToken().then(idToken => {
                // Create SSO payload
                const ssoPayload = {
                    user: {
                        uid: this.currentUser.uid,
                        email: this.currentUser.email,
                        displayName: this.currentUser.displayName || this.currentUser.email
                    },
                    timestamp: Date.now(),
                    token: idToken,
                    success: true
                };

                // Send message to parent window
                if (window.opener) {
                    window.opener.postMessage(ssoPayload, this.parentUrl);
                }

                // Close the popup after a short delay
                setTimeout(() => {
                    window.close();
                }, 500);

            }).catch(error => {
                console.error('Error getting ID token:', error);
                this.handlePopupError('Authentication failed');
            });
        } catch (error) {
            console.error('Popup auth error:', error);
            this.handlePopupError('Authentication error');
        }
    }

    handlePopupError(message) {
        const errorPayload = {
            success: false,
            error: message,
            timestamp: Date.now()
        };

        if (window.opener) {
            window.opener.postMessage(errorPayload, this.parentUrl);
        }

        // Show error briefly before closing
        this.showError(message);
        setTimeout(() => {
            window.close();
        }, 2000);
    }
}

// Initialize the SSO application
const ssoApp = new ITCPRSSO();

// Export for global access
window.ssoApp = ssoApp; 