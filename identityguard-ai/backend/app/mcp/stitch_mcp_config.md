# Stitch Configuration Command

Run the following command in your terminal. You **MUST** be inside the `identityguard-ai/backend` directory.

```bash
cd "/Users/yash/Downloads/My Resume/face_de_duplication copy 2/identityguard-ai/backend"
source .venv/bin/activate
# Start the SSE listener
python -m app.mcp.mcp_server --sse
```

Then, in a new terminal with the Stitch CLI installed:
```bash
stitch server add identityguard http://localhost:9000/sse
```
