// Token verification and role synchronization utility
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? '/api'
    : (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '/api';

/**
 * Verify token with backend and sync role
 * @returns {Promise<{valid: boolean, role: string, username: string}>}
 */
async function verifyAndSyncRole() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        return { valid: false, role: null, username: null };
    }

    try {
        const response = await fetch(`${API_BASE}/verify_token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Token invalid, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            return { valid: false, role: null, username: null };
        }

        const data = await response.json();
        
        if (data.valid) {
            // Update localStorage with current role from database
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('username', data.username);
            
            console.log('✅ Token verified. Role synced:', data.role);
            return { valid: true, role: data.role, username: data.username };
        } else {
            // Token invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            return { valid: false, role: null, username: null };
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        return { valid: false, role: null, username: null };
    }
}

/**
 * Check if user should be redirected based on role
 */
async function checkRoleAndRedirect() {
    const { valid, role } = await verifyAndSyncRole();
    
    if (!valid) {
        // Not authenticated, redirect to login
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('register') &&
            !window.location.pathname.includes('landing')) {
            window.location.href = '/login.html';
        }
        return;
    }

    const path = window.location.pathname;
    
    // Redirect creators away from consumer pages
    if (role === 'creator' && (path === '/' || path.includes('index.html'))) {
        console.log('Creator detected on consumer page, redirecting...');
        window.location.href = '/creator-dashboard.html';
        return;
    }
    
    // Redirect consumers away from creator pages
    if (role === 'consumer' && path.includes('creator-dashboard')) {
        console.log('Consumer detected on creator page, redirecting...');
        window.location.href = '/';
        return;
    }
}

// Export for use in other files
export { verifyAndSyncRole, checkRoleAndRedirect };
