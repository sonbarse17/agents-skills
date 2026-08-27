---
name: agent-framework-azure-ai-py
description: Build Azure AI Foundry agents using the Microsoft Agent Framework
  Python SDK (agent-framework-azure-ai). Use when creating persistent agents
  with AzureAIAgentsProvider, using hosted tools (code interpreter, file search,
  web search), integrating MCP servers, managing conversation threads, or
  implementing streaming responses. Covers function tools, structured outputs,
  and multi-tool agents.
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
  package: agent-framework-azure-ai
tags:
  - skills
  - agent-framework-azure-ai-py
depends_on: []
---

# Agent Framework Azure Hosted Agents

Build persistent agents on Azure AI Foundry using the Microsoft Agent Framework [Python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md) SDK.

## Architecture

```
User Query → AzureAIAgentsProvider → Azure AI Agent Service (Persistent)
                    ↓
              Agent.run() / Agent.run_stream()
                    ↓
              Tools: Functions | Hosted (Code/Search/Web) | MCP
                    ↓
              AgentThread (conversation persistence)
```

## Installation

```bash
# Full framework (recommended)
pip install agent-framework --pre

# Or Azure-specific package only
pip install agent-framework-[azure-ai](../../../[azure-ai](../../../azure-skills/skills/azure-ai/SKILL.md)/SKILL.md) --pre
```

## Environment Variables

```bash
export AZURE_AI_PROJECT_ENDPOINT="https://<project>.services.ai.azure.com/api/projects/<project-id>"  # Required for all auth methods
export AZURE_AI_MODEL_DEPLOYMENT_NAME="gpt-4o-mini"  # Required for all auth methods
export BING_CONNECTION_ID="your-bing-connection-id"  # For web search
export AZURE_TOKEN_CREDENTIALS=prod # Required only if DefaultAzureCredential is used in production
```

## Authentication & Lifecycle

> **🔑 Two rules apply to every code sample below:**
>
> 1. **Prefer `DefaultAzureCredential`.** It works locally (Azure CLI / VS Code / Developer CLI) and in Azure (managed identity, workload identity) with no code change. Avoid connection strings, account/API keys — they bypass Entra [audit](../../../../../AI_and_Agents/Operations/audit/SKILL.md) and rotation.
>    - Local dev: `DefaultAzureCredential` works as-is.
>    - Production: set `AZURE_TOKEN_CREDENTIALS=prod` (or `AZURE_TOKEN_CREDENTIALS=<specific_credential>`) to constrain the credential chain to production-safe credentials.
> 2. **Wrap every client in a context manager** so HTTP transports, sockets, and token caches are released deterministically:
>    - Sync: `with <Client>(...) as client:`
>    - Async: `async with <Client>(...) as client:` **and** `async with DefaultAzureCredential() as credential:` (from `azure.identity.aio`)
>
> Snippets may abbreviate this setup, but production code should always follow both rules.

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity.aio import AzureCliCredential, DefaultAzureCredential, ManagedIdentityCredential

# Development
credential = AzureCliCredential()

# Production
# Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
credential = DefaultAzureCredential(require_envvar=True)
# Or use a specific credential directly in production:
# See https://learn.microsoft.com/[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/api/overview/azure/identity-readme?view=azure-[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)#credential-classes
# credential = ManagedIdentityCredential()
```

## Core Workflow

### Basic Agent

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
import asyncio
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential

async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="MyAgent",
            instructions="You are a helpful assistant.",
        )
        
        result = await agent.run("Hello!")
        print(result.text)

asyncio.run(main())
```

### Agent with Function Tools

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from typing import Annotated
from pydantic import Field
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential

def get_weather(
    location: Annotated[str, Field(description="City name to get weather for")],
) -> str:
    """Get the current weather for a location."""
    return f"Weather in {location}: 72°F, sunny"

def get_current_time() -> str:
    """Get the current UTC time."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="WeatherAgent",
            instructions="You help with weather and time queries.",
            tools=[get_weather, get_current_time],  # Pass functions directly
        )
        
        result = await agent.run("What's the weather in Seattle?")
        print(result.text)
```

### Agent with Hosted Tools

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from agent_framework import (
    HostedCodeInterpreterTool,
    HostedFileSearchTool,
    HostedWebSearchTool,
)
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential

async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="MultiToolAgent",
            instructions="You can execute code, search files, and search the web.",
            tools=[
                HostedCodeInterpreterTool(),
                HostedWebSearchTool(name="Bing"),
            ],
        )
        
        result = await agent.run("Calculate the factorial of 20 in [Python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)")
        print(result.text)
```

### Streaming Responses

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="StreamingAgent",
            instructions="You are a helpful assistant.",
        )
        
        print("Agent: ", end="", flush=True)
        async for chunk in agent.run_stream("Tell me a short story"):
            if chunk.text:
                print(chunk.text, end="", flush=True)
        print()
```

### Conversation Threads

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential

async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="ChatAgent",
            instructions="You are a helpful assistant.",
            tools=[get_weather],
        )
        
        # Create thread for conversation persistence
        thread = agent.get_new_thread()
        
        # First turn
        result1 = await agent.run("What's the weather in Seattle?", thread=thread)
        print(f"Agent: {result1.text}")
        
        # Second turn - context is maintained
        result2 = await agent.run("What about Portland?", thread=thread)
        print(f"Agent: {result2.text}")
        
        # Save thread ID for later resumption
        print(f"Conversation ID: {thread.conversation_id}")
```

### Structured Outputs

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from pydantic import BaseModel, ConfigDict
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential

class WeatherResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    location: str
    temperature: float
    unit: str
    conditions: str

async def main():
    async with (
        AzureCliCredential() as credential,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="StructuredAgent",
            instructions="Provide weather information in structured format.",
            response_format=WeatherResponse,
        )
        
        result = await agent.run("Weather in Seattle?")
        weather = WeatherResponse.model_validate_json(result.text)
        print(f"{weather.location}: {weather.temperature}°{weather.unit}")
```

## Provider Methods

| Method | Description |
|--------|-------------|
| `create_agent()` | Create new agent on Azure AI service |
| `get_agent(agent_id)` | Retrieve existing agent by ID |
| `as_agent(sdk_agent)` | Wrap SDK Agent object (no HTTP call) |

## Hosted Tools Quick Reference

| Tool | Import | Purpose |
|------|--------|---------|
| `HostedCodeInterpreterTool` | `from agent_framework import HostedCodeInterpreterTool` | Execute [Python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md) code |
| `HostedFileSearchTool` | `from agent_framework import HostedFileSearchTool` | Search vector stores |
| `HostedWebSearchTool` | `from agent_framework import HostedWebSearchTool` | Bing web search |
| `HostedMCPTool` | `from agent_framework import HostedMCPTool` | Service-managed MCP |
| `MCPStreamableHTTPTool` | `from agent_framework import MCPStreamableHTTPTool` | Client-managed MCP |

## Complete Example

```[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
import asyncio
from typing import Annotated
from pydantic import BaseModel, Field
from agent_framework import (
    HostedCodeInterpreterTool,
    HostedWebSearchTool,
    MCPStreamableHTTPTool,
)
from agent_framework.azure import AzureAIAgentsProvider
from azure.identity.aio import AzureCliCredential


def get_weather(
    location: Annotated[str, Field(description="City name")],
) -> str:
    """Get weather for a location."""
    return f"Weather in {location}: 72°F, sunny"


class AnalysisResult(BaseModel):
    summary: str
    key_findings: list[str]
    confidence: float


async def main():
    async with (
        AzureCliCredential() as credential,
        MCPStreamableHTTPTool(
            name="Docs MCP",
            url="https://learn.microsoft.com/api/mcp",
        ) as mcp_tool,
        AzureAIAgentsProvider(credential=credential) as provider,
    ):
        agent = await provider.create_agent(
            name="ResearchAssistant",
            instructions="You are a research assistant with multiple capabilities.",
            tools=[
                get_weather,
                HostedCodeInterpreterTool(),
                HostedWebSearchTool(name="Bing"),
                mcp_tool,
            ],
        )
        
        thread = agent.get_new_thread()
        
        # Non-streaming
        result = await agent.run(
            "Search for [Python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md) best practices and summarize",
            thread=thread,
        )
        print(f"Response: {result.text}")
        
        # Streaming
        print("\nStreaming: ", end="")
        async for chunk in agent.run_stream("Continue with examples", thread=thread):
            if chunk.text:
                print(chunk.text, end="", flush=True)
        print()
        
        # Structured output
        result = await agent.run(
            "Analyze findings",
            thread=thread,
            response_format=AnalysisResult,
        )
        analysis = AnalysisResult.model_validate_json(result.text)
        print(f"\nConfidence: {analysis.confidence}")


if __name__ == "__main__":
    asyncio.run(main())
```

## Conventions

- Always use async context managers: `async with provider:`
- Pass functions directly to `tools=` parameter (auto-converted to AIFunction)
- Use `Annotated[type, Field(description=...)]` for function parameters
- Use `get_new_thread()` for multi-turn conversations
- Prefer `HostedMCPTool` for service-managed MCP, `MCPStreamableHTTPTool` for client-managed

## Best Practices

1. **This SDK is async-first — use `async def` handlers and `async with` throughout.**
2. **Always use context managers for clients and async credentials.** Wrap every client in `with Client(...) as client:` (sync) or `async with Client(...) as client:` (async). For async `DefaultAzureCredential` from `azure.identity.aio`, also use `async with credential:` so tokens and transports are cleaned up.

## Reference Files

- [../../../../../Global_References/tools.md](../../../../../Global_References/tools.md): Detailed hosted tool patterns
- [../../../../../Global_References/mcp.md](../../../../../Global_References/mcp.md): MCP integration (hosted + local)
- [../../../../../Global_References/threads.md](../../../../../Global_References/threads.md): Thread and conversation management
- [../../../../../Global_References/advanced.md](../../../../../Global_References/advanced.md): OpenAPI, citations, structured outputs

