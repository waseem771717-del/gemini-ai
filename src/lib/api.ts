const API_BASE = '/api';

export async function apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Try to parse error message from JSON, but handle cases where response is empty
        let errorMessage = 'Something went wrong';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            // Response body is empty or not JSON
            errorMessage = `Request failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
    }

    // Handle empty responses
    return {} as T;
}
