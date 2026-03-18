const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;

    // For FormData, let the browser set the Content-Type automatically with the boundary string
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    } as Record<string, string>;

    let backendToken: string | undefined;
    // ... rest of the auth token logic stays same
    if (!backendToken && typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('makikibahay-user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                backendToken = parsedUser.token;
            } catch (e) { }
        }
    }

    if (backendToken) {
        headers['Authorization'] = `Bearer ${backendToken}`;
    }

    const response = await fetch(`${API_URL}/api${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
        } catch (e) { }
        throw new Error(`API call failed: ${errorMessage}`);
    }

    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    get: <T>(url: string) => fetchWithAuth(url, { method: 'GET' }) as Promise<T>,
    post: <T>(url: string, body: any) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }) as Promise<T>,
    patch: <T>(url: string, body: any) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) }) as Promise<T>,
    put: <T>(url: string, body: any) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(body) }) as Promise<T>,
    delete: <T>(url: string, body?: any) => fetchWithAuth(url, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }) as Promise<T>,
    postForm: <T>(url: string, formData: FormData) => fetchWithAuth(url, { method: 'POST', body: formData }) as Promise<T>,
};

export default api;
