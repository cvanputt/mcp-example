# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server implementation using TypeScript, Express.js, and the `@modelcontextprotocol/sdk`. It's designed to be deployed to AWS AppRunner.

Purpose:
- Provide a standardized server that implements the Model Context Protocol
- Enable AI assistants to securely connect to external tools and data sources
- Serve as a boilerplate for building custom MCP-compatible servers

Architecture:
- Express.js HTTP server with MCP server integration
- Streamable HTTP transport for MCP communication (supporting both JSON-RPC and SSE)
- Modular design with separate handlers for tools, resources, and prompts

## Development Setup

Environment Setup:
- Node.js 20+ required
- Clone repository and run `npm install`
- Copy `.env.example` to `.env` and customize as needed

Required Dependencies:
- All dependencies are specified in package.json
- Core dependencies: express, @modelcontextprotocol/sdk

## Common Commands

Build Commands:
```
npm run build        # Build the TypeScript project
npm start            # Start the production server
npm run dev          # Run development server with auto-reload
npm run lint         # Run linting
npm test             # Run tests
```

Deployment Commands:
```
# Production Docker commands
docker build -t mcp-server .                   # Build Docker image
docker run -p 3000:3000 mcp-server             # Run Docker container locally

# Development with Docker Compose (with hot reloading)
docker-compose up -d                           # Start development container
docker-compose logs -f                         # Watch logs
docker-compose down                            # Stop development container

# AWS Deployment
aws apprunner create-service --cli-input-json file://apprunner-config.json  # Deploy to AWS AppRunner
```

## Project Structure

Key Directories:
- `src/`: Source code directory
  - `mcp/`: MCP implementation (tools, resources, prompts)
  - `utils/`: Utility functions (config, logger)
- `dist/`: Compiled JavaScript (generated)

Important Files:
- `src/index.ts`: Application entry point
- `src/app.ts`: Express application setup
- `src/mcp/server.ts`: MCP server implementation
- `Dockerfile`: Production Docker container configuration
- `Dockerfile.dev`: Development Docker container with hot reloading
- `docker-compose.yml`: Docker Compose configuration for development
- `apprunner.yaml`: AWS AppRunner configuration

Configuration:
- `.env`: Environment variables (created from .env.example)
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.json`: ESLint configuration

## Implementation Notes

MCP Components:
- Tools: Implement functionality that can be called by AI assistants
- Resources: Provide access to data like files or database records
- Prompts: Define templates for standardized AI prompts

Key Implementation Files:
- `src/mcp/tools.ts`: Tool definitions and handlers
- `src/mcp/resources.ts`: Resource definitions and handlers
- `src/mcp/prompts.ts`: Prompt template definitions

Customization:
- Add new tools by extending the tools module
- Add new resources by extending the resources module
- Add new prompt templates by extending the prompts module

## Recent Updates

Transport Upgrades:
- Migrated from SSE-only transport to Streamable HTTP transport
- Streamable HTTP supports both JSON-RPC and SSE communication
- Simplified request handling with session management
- Improved client compatibility and protocol compliance

Docker Development Environment:
- Added Docker Compose setup for local development
- Configured volume mounts for live code updates
- Set up hot reloading with tsx
- Environment variables pre-configured for development
- Changes to source files are immediately reflected in the running container

Testing the API:
```bash
# Test initialization request
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{},"protocolVersion":"1.0"},"id":1}'
```