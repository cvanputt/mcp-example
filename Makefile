# MCP Server for AWS AppRunner Makefile

# Variables
INSPECTOR_PORT1=6274
INSPECTOR_PORT2=6277

# Commands
.PHONY: help mcp inspector start compose stop clean

help:
	@echo "MCP Server for AWS AppRunner Makefile"
	@echo ""
	@echo "Commands:"
	@echo "  mcp        - Start the MCP server with Docker Compose"
	@echo "  inspector  - Start the MCP Inspector on port $(INSPECTOR_PORT)"
	@echo "  start      - Start both MCP server and Inspector"
	@echo "  compose    - Start both MCP server and Inspector using Docker Compose"
	@echo "  stop       - Stop all running containers"
	@echo "  clean      - Remove containers and clean up"

mcp:
	docker-compose up -d
	@echo "MCP server running at http://localhost:3000"

inspector:
	docker run --rm -p $(INSPECTOR_PORT1):6274 -p $(INSPECTOR_PORT2):6277 --name mcp-inspector \
		--network host \
		ghcr.io/modelcontextprotocol/inspector:latest
	@echo "MCP Inspector running at http://localhost:$(INSPECTOR_PORT1)"

start: mcp
	@sleep 2
	docker run --rm -p $(INSPECTOR_PORT1):6274 -p $(INSPECTOR_PORT2):6277 --name mcp-inspector \
		--network host \
		ghcr.io/modelcontextprotocol/inspector:latest

compose:
	docker-compose up -d
	@echo "MCP server running at http://localhost:3000"
	@echo "MCP Inspector running at http://localhost:6274"

stop:
	docker-compose down
	-docker stop mcp-inspector

clean: stop
	-docker rm mcp-inspector
	docker-compose down --rmi local