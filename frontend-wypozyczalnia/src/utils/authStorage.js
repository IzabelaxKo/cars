const AUTH_KEYS = {
    token: 'token',
    userId: 'userId',
    role: 'role',
    isAdmin: 'isAdmin',
    userEmail: 'userEmail',
}

function getStorage() {
    if (typeof window === 'undefined') {
        return null
    }

    return window.sessionStorage
}

export function saveAuthSession(payload) {
    const storage = getStorage()
    if (!storage || !payload) {
        return
    }

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return
        }

        storage.setItem(key, String(value))
    })
}

export function getAuthValue(key) {
    const storage = getStorage()
    if (!storage) {
        return null
    }

    return storage.getItem(key)
}

export function isAdminSession() {
    const role = getAuthValue(AUTH_KEYS.role)
    const isAdmin = getAuthValue(AUTH_KEYS.isAdmin)

    return role === 'admin' || isAdmin === 'true'
}  

export function clearAuthSession() {
    const storage = getStorage()
    if (!storage) {
        return
    }

    Object.values(AUTH_KEYS).forEach((key) => {
        storage.removeItem(key)
    })
}

export function isLoggedIn() {  
    const token = getAuthValue(AUTH_KEYS.token)
    return !!token
}

export function getUserName() {
    return getAuthValue(AUTH_KEYS.userEmail)
}

export { AUTH_KEYS }