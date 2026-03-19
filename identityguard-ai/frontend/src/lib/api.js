const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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

        // 🔥 Handle FastAPI validation errors properly
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
        error.code = payload.code;

        console.error("API ERROR:", {
            requestId,
            status: response.status,
            payload,
        });

        throw error;
    }

    return { ...payload, requestId };
}

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
    });

    return parseResponse(response);
}

export { API_BASE_URL };