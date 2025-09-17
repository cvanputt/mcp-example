# MCP Server for AWS AppRunner Makefile

# Variables
INSPECTOR_PORT1=6274
INSPECTOR_PORT2=6277
INSPECTOR_CONTAINER=mcp-inspector

# Commands
.PHONY: help mcp inspector start compose stop clean

help:
	@echo "MCP Server for AWS AppRunner Makefile"
	@echo ""
	@echo "Commands:"
	@echo "  mcp        - Start the MCP server with Docker Compose"
	@echo "  inspector  - Start the MCP Inspector on port $(INSPECTOR_PORT1) with auth token"
	@echo "  start      - Start both MCP server and Inspector"
	@echo "  compose    - Start both MCP server and Inspector using Docker Compose"
	@echo "  stop       - Stop all running containers"
	@echo "  clean      - Remove containers and clean up"

mcp:
	docker-compose up -d
	@echo "MCP server running at http://localhost:3000"

inspector:
	@echo "Starting MCP Inspector..."
	docker run -d --rm -p $(INSPECTOR_PORT1):6274 -p $(INSPECTOR_PORT2):6277 --name $(INSPECTOR_CONTAINER) \
		--network host \
		ghcr.io/modelcontextprotocol/inspector:latest
	@sleep 3
	@TOKEN=$$(docker logs $(INSPECTOR_CONTAINER) 2>&1 | grep -o 'Session token: [a-f0-9]\+' | sed 's/Session token: //') && \
	echo "MCP Inspector running at:" && \
	echo "http://localhost:$(INSPECTOR_PORT1)/?MCP_PROXY_AUTH_TOKEN=$$TOKEN"

start: mcp
	@echo "Starting MCP Inspector..."
	@sleep 2
	docker run -d --rm -p $(INSPECTOR_PORT1):6274 -p $(INSPECTOR_PORT2):6277 --name $(INSPECTOR_CONTAINER) \
		--network host \
		ghcr.io/modelcontextprotocol/inspector:latest
	@sleep 3
	@TOKEN=$$(docker logs $(INSPECTOR_CONTAINER) 2>&1 | grep -o 'Session token: [a-f0-9]\+' | sed 's/Session token: //') && \
	echo "MCP server running at http://localhost:3000" && \
	echo "MCP Inspector running at:" && \
	echo "http://localhost:$(INSPECTOR_PORT1)/?MCP_PROXY_AUTH_TOKEN=$$TOKEN"

compose:
	docker-compose up -d
	@echo "Waiting for services to start..."
	@sleep 5
	@TOKEN=$$(docker logs $(INSPECTOR_CONTAINER) 2>&1 | grep -o 'Session token: [a-f0-9]\+' | sed 's/Session token: //') && \
	echo "MCP server running at http://localhost:3000" && \
	echo "MCP Inspector running at:" && \
	echo "http://localhost:$(INSPECTOR_PORT1)/?MCP_PROXY_AUTH_TOKEN=$$TOKEN"

stop:
	docker-compose down
	-docker stop mcp-inspector

clean: stop
	-docker rm mcp-inspector
	docker-compose down --rmi local