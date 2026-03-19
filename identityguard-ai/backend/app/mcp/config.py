import os
import json

MCP_SERVER_NAME = "IdentityGuardAI"
MCP_PORT = 9000

# Base configuration for creating plugin configs
def _get_base_dir():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
