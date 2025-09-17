# MCP Server for AWS AppRunner

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript, Express.js, and the `@modelcontextprotocol/sdk`. This server is designed to be deployed to AWS AppRunner.

## Overview

This server implements the Model Context Protocol, enabling AI assistants and applications to securely connect to external tools, data sources, and resources. The server provides:

- **Tool Integration**: Define and expose tools that AI can use to perform actions
- **Resource Access**: Control access to files and other resources
- **Prompt Templates**: Provide standardized prompt templates for consistent interactions

## Features

- MCP Server implementation with TypeScript and Express.js
- Streamable HTTP transport supporting both JSON-RPC and SSE
- Sample tools, resources, and prompts
- AWS AppRunner deployment configuration
- Docker containerization with production and development configurations
- Docker Compose for local development with hot reloading
- GitHub Actions CI/CD workflow
- Environment configuration management
- Structured logging with Pino
- MCP Inspector integration for testing and debugging

## Requirements

- Node.js 20+
- npm or yarn
- Docker (for containerization)
- Docker Compose (for local development)
- AWS account (for deployment)

## Getting Started

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/mcp-server.git
   cd mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

### Development

#### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will be available at http://localhost:3000

#### Docker Compose Development (Recommended)

This method provides a consistent development environment with hot reloading:

1. Start the Docker development environment:
   ```bash
   docker-compose up -d
   ```

2. View logs in real-time:
   ```bash
   docker-compose logs -f
   ```

3. The server will be available at http://localhost:3000

4. Changes to source files will be automatically reflected in the running container thanks to volume mounts and hot reloading

5. Stop the development container:
   ```bash
   docker-compose down
   ```

#### Using the Makefile

This project includes a Makefile to simplify common development tasks:

1. Start the MCP server with Docker Compose:
   ```bash
   make mcp
   ```

2. Start the MCP Inspector for testing and debugging:
   ```bash
   make inspector
   ```

3. Start both the MCP server and Inspector together:
   ```bash
   make start
   ```

4. Start both services using Docker Compose:
   ```bash
   make compose
   ```

5. Stop all running containers:
   ```bash
   make stop
   ```

6. Clean up containers and images:
   ```bash
   make clean
   ```

#### Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a tool for testing and debugging MCP implementations:

1. Start the Inspector using one of these methods:
   ```bash
   # Stand-alone Inspector
   make inspector

   # Both MCP server and Inspector with Docker Compose
   make compose
   ```

2. Access the Inspector web UI at http://localhost:6274

3. Connect to your local MCP server at http://localhost:3000

4. Use the Inspector to:
   - Test MCP initialization and session management
   - Discover available tools, resources, and prompts
   - Make tool calls and view responses
   - Debug protocol communication issues

### Testing Your MCP Server

You can test the MCP server using cURL:

```bash
# Health check
curl http://localhost:3000/health

# Initialize MCP connection (POST request)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{},"protocolVersion":"1.0"},"id":1}'

# After initialization, use the returned Mcp-Session-Id for subsequent requests
# Example (replace SESSION_ID with the actual session ID from the response):
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"tool/call","params":{"name":"tool-name","args":{}},"id":2}'

# Connect to SSE stream (GET request) with session ID
curl -N http://localhost:3000/mcp -H "Mcp-Session-Id: SESSION_ID"

# Terminate session (DELETE request)
curl -X DELETE http://localhost:3000/mcp -H "Mcp-Session-Id: SESSION_ID"
```

## Project Structure

```
├── src/
│   ├── mcp/               # MCP implementation
│   │   ├── tools.ts       # Tool handlers
│   │   ├── resources.ts   # Resource handlers
│   │   ├── prompts.ts     # Prompt handlers
│   │   └── server.ts      # MCP server setup with Streamable HTTP transport
│   ├── utils/             # Utilities
│   │   ├── config.ts      # Configuration
│   │   └── logger.ts      # Logging
│   ├── app.ts             # Express app setup
│   └── index.ts           # Application entry point
├── Dockerfile             # Production Docker configuration
├── Dockerfile.dev         # Development Docker configuration with hot reloading
├── docker-compose.yml     # Docker Compose for local development
├── apprunner.yaml         # AWS AppRunner configuration
├── Makefile              # Makefile with development commands
├── .github/               # GitHub Actions workflows
├── CLAUDE.md              # Implementation notes and guidance for Claude Code
└── ...                    # Project configuration files
```

## Deployment to AWS AppRunner

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured
- ECR repository created for the container image
- AppRunner service role with permissions to pull from ECR

### Manual Deployment

1. Build and tag the Docker image:
   ```bash
   docker build -t your-ecr-repo/mcp-server:latest .
   ```

2. Push the image to ECR:
   ```bash
   aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
   docker push your-ecr-repo/mcp-server:latest
   ```

3. Create or update the AppRunner service:
   ```bash
   aws apprunner create-service --cli-input-json file://apprunner-config.json
   ```

### GitHub Actions Deployment

This repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that automates the deployment process when you push to the main branch.

To use it, set up the following GitHub secrets:

- `AWS_ACCESS_KEY_ID`: AWS access key with appropriate permissions
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region for deployment
- `ECR_REPOSITORY`: Name of your ECR repository
- `APPRUNNER_SERVICE`: Name of your AppRunner service
- `APPRUNNER_SERVICE_ROLE_ARN`: ARN of the service role for AppRunner

## Customization

### Adding New Tools

Edit `src/mcp/tools.ts` to add new tool definitions and handlers:

```typescript
// Add to tool list
{
  name: 'your-tool-name',
  description: 'Description of your tool',
  inputSchema: yourToolSchema
}

// Add to tool call handler
case 'your-tool-name':
  return {
    content: [
      {
        type: 'text',
        text: `Result from your tool with args: ${JSON.stringify(args)}`
      }
    ]
  };
```

### Adding New Resources

Edit `src/mcp/resources.ts` to add new resource definitions and content.

### Adding New Prompts

Edit `src/mcp/prompts.ts` to add new prompt templates.

## License

MIT