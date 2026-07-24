const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Custom fetch wrapper (API Client)
 * Hanya mengurus Base URL, Headers default, dan Error Handling global.
 */
export async function fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Setup default headers
    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    // Global error handling bisa ditaruh di sini
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}