import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const session = await getSession();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    } as Record<string, string>;

    if (session?.backendToken) {
        headers['Authorization'] = `Bearer ${session.backendToken}`;
    }

    const response = await fetch(`${API_URL}/api${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Attempt to read error message
        let errorMessage = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
            // Ignore JSON parse error
        }
        throw new Error(`API call failed: ${errorMessage}`);
    }

    if (response.status === 204) return null;

    return response.json();
};

export const api = {
    get: <T>(url: string) => fetchWithAuth(url, { method: 'GET' }) as Promise<T>,
    post: <T>(url: string, body: any) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }) as Promise<T>,
    put: <T>(url: string, body: any) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(body) }) as Promise<T>,
    delete: <T>(url: string) => fetchWithAuth(url, { method: 'DELETE' }) as Promise<T>,
};

export default api;
