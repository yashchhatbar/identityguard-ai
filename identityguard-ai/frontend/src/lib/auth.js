const TOKEN_KEY = 'identityguard.token';
const USER_KEY = 'identityguard.user';

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function persistSession({ access_token: token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
