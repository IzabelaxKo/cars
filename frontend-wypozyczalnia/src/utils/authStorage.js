const AUTH_KEYS = {
    token: 'token',
    userId: 'userId',
    role: 'role',
    userRole: 'userRole',
    isAdmin: 'isAdmin',
    userName: 'userName',
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
    const userRole = getAuthValue(AUTH_KEYS.userRole)
    const isAdmin = getAuthValue(AUTH_KEYS.isAdmin)

    return role === 'admin' || userRole === 'admin' || isAdmin === 'true'
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

export { AUTH_KEYS }