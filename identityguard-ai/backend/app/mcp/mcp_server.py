import argparse
from mcp.server.fastmcp import FastMCP
from pydantic import Field

from .tools import (
    verify_identity_logic,
    register_identity_logic,
    duplicate_check_logic,
    search_embeddings_logic,
    get_admin_stats_logic,
    list_users_logic,
    check_duplicate_activity_logic,
    check_fraud_alerts_logic,
    investigate_user_logic,
    investigate_embedding_cluster_logic,
    duplicate_activity_report_logic,
    ai_security_assistant_logic
)

# ------------------------------------------------
# MCP SERVER INITIALIZATION
# ------------------------------------------------

mcp = FastMCP("IdentityGuardAI")

# ------------------------------------------------
# TOOL EXPORTS
# ------------------------------------------------

@mcp.tool()
def verify_identity(image_base64: str = Field(description="Base64 encoded organic human face image representation")) -> dict:
    """Secure biometric verification returning match validity and similarity index."""
    return verify_identity_logic(image_base64)

@mcp.tool()
def register_identity(name: str, email: str, image_base64: str) -> dict:
    """Extract organic facial embedding and write into the database uniquely. Resolves duplicating payload attempts."""
    return register_identity_logic(name, email, image_base64)

@mcp.tool()
def duplicate_check(image_base64: str) -> dict:
    """Evaluate deepface cosine vectors to parse for duplication without active database ingestion."""
    return duplicate_check_logic(image_base64)

@mcp.tool()
def search_embeddings(image_base64: str) -> dict:
    """Performs raw vectorized queries matching input matrix mappings resolving the top 5 similarity vectors natively."""
    return search_embeddings_logic(image_base64)

@mcp.tool()
def get_admin_stats(token: str = Field(description="Valid Admin JWT Access Token string")) -> dict:
    """Exposes total system metrics mapping logs of all organic embeddings and blocked duplicates."""
    return get_admin_stats_logic(token)

@mcp.tool()
def list_users(token: str = Field(description="Valid Admin JWT Access Token string")) -> dict:
    """Fetches full payload indexing all distinct Users verified in IdentityGuard AI"""
    return list_users_logic(token)

@mcp.tool()
def check_duplicate_activity(token: str = Field(description="Valid Admin JWT Access Token string")) -> dict:
    """Returns duplicate attempts in the last 24h and suspicious registrations."""
    return check_duplicate_activity_logic(token)

@mcp.tool()
def check_fraud_alerts(token: str) -> dict:
    """Returns an active list of outstanding, unresolved FraudAlerts (Admin only)."""
    return check_fraud_alerts_logic(token)

@mcp.tool()
def investigate_user(token: str, alert_id: int) -> dict:
    """Triggers an autonomous LLM investigation into a specific fraud alert generating an actionable report (Admin only)."""
    return investigate_user_logic(token, alert_id)

@mcp.tool()
def investigate_embedding_cluster(token: str) -> dict:
    """Scans the FAISS network for clusters of slightly morphed but distinct identically-sourced synthesized faces (Admin only)."""
    return investigate_embedding_cluster_logic(token)

@mcp.tool()
def duplicate_activity_report(token: str) -> dict:
    """Generates a comprehensive 24-hour sweep pattern of duplicate velocity (Admin only)."""
    return duplicate_activity_report_logic(token)

@mcp.tool()
def ai_security_assistant(token: str, query: str) -> dict:
    """Pass natural language queries like 'show suspicious identities today' to the automated AI assistant (Admin only)."""
    return ai_security_assistant_logic(token, query)

def main():
    parser = argparse.ArgumentParser(description="IdentityGuard MCP Server")
    parser.add_argument("--sse", action="store_true", help="Run as SSE server")
    args = parser.parse_args()

    if args.sse:
        print("Starting MCP SSE server on port 9000...")
        mcp.run(transport="sse", port=9000)
    else:
        print("Starting MCP STDIO server (Claude Desktop mode)...")
        mcp.run()

if __name__ == "__main__":
    main()