def success_response(data, message: str, meta=None):
    payload = {"success": True, "data": data, "message": message}
    if meta is not None:
        payload["meta"] = meta
    return payload


def error_response(message: str, data=None, code: str | None = None, errors=None):
    payload = {"success": False, "data": data or {}, "message": message}
    if code:
        payload["code"] = code
    if errors is not None:
        payload["errors"] = errors
    return payload
