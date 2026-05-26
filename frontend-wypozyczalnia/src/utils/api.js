const DEFAULT_CACHE_TTL = 30_000

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

const responseCache = new Map()
const pendingRequests = new Map()

function buildApiUrl(path) {
    if (!path) {
        return API_BASE_URL
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function invalidateApiCache(path = '') {
    if (!path) {
        responseCache.clear()
        pendingRequests.clear()
        return
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const prefix = `${API_BASE_URL}${normalizedPath}`

    for (const key of responseCache.keys()) {
        if (key.startsWith(prefix)) {
            responseCache.delete(key)
        }
    }

    for (const key of pendingRequests.keys()) {
        if (key.startsWith(prefix)) {
            pendingRequests.delete(key)
        }
    }
}

export async function fetchJson(path, options = {}) {
    const response = await fetch(buildApiUrl(path), options)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function fetchJsonCached(path, options = {}) {
    const { ttl = DEFAULT_CACHE_TTL, ...fetchOptions } = options
    const url = buildApiUrl(path)
    const cached = responseCache.get(url)

    if (cached && cached.expiresAt > Date.now()) {
        return cached.data
    }

    if (pendingRequests.has(url)) {
        return pendingRequests.get(url)
    }

    const request = fetchJson(url, fetchOptions)
        .then((data) => {
            responseCache.set(url, {
                data,
                expiresAt: Date.now() + ttl,
            })
            return data
        })
        .finally(() => {
            pendingRequests.delete(url)
        })

    pendingRequests.set(url, request)
    return request
}