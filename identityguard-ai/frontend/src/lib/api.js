// ✅ Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔥 Generic response parser
async function parseResponse(response) {
    const requestId = response.headers.get("x-request-id");

    let payload = {};
    try {
        payload = await response.json();
    } catch {
        payload = {};
    }

    if (!response.ok) {
        let message = "Request failed";

        // Handle FastAPI validation errors
        if (payload?.errors) {
            message = payload.errors.map((err) => err.msg || err.message).join(", ");
        } else if (Array.isArray(payload?.detail)) {
            message = payload.detail.map((err) => err.msg).join(", ");
        } else if (payload?.detail) {
            message = payload.detail;
        } else if (payload?.message) {
            message = payload.message;
        }

        const error = new Error(message);
        error.requestId = requestId;
        error.code = payload?.code;

        console.error("API ERROR:", {
            requestId,
            status: response.status,
            payload,
        });

        throw error;
    }

    return { ...payload, requestId };
}

// 🔥 Main API request function
export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
    });

    return parseResponse(response);
}

// 🔥 Helper for file upload (VERY IMPORTANT for your app)
export async function uploadFile(path, formData) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    return parseResponse(response);
}

// Export base URL if needed
export { API_BASE_URL };
