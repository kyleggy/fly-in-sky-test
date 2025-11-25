# Fly-in-Sky Test

Cypress end-to-end test suite for Kong API Gateway management interface.

## Description

This project contains automated E2E tests for testing Kong API Gateway functionality, including:
- Gateway service creation and management
- Route configuration
- Service grid operations
- Basic workflow testing

## Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher (comes with Node.js)
- **Kong API Gateway**: Running instance accessible at the configured endpoints
  - Use Docker Compose (recommended for local development) - see [Docker Setup](#docker-setup-optional) section


## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kyleggy/fly-in-sky-test.git
   cd fly-in-sky-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install Cypress and all required dependencies based on `package-lock.json`.

## Docker Setup (Optional)

For local development and testing, you can use Docker Compose to run Kong API Gateway:

1. **Start Kong Gateway with Docker Compose**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Verify Kong Gateway is running**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check Kong Gateway health
   curl http://localhost:8001/
   ```

3. **Access Kong Gateway**
   - **Admin API**: http://localhost:8001
   - **Admin GUI**: http://localhost:8002
   - **Proxy**: http://localhost:8000

4. **Stop Kong Gateway**
   ```bash
   docker-compose down
   ```

The Docker setup includes:
- **PostgreSQL**: Database for Kong (port 5432)
- **Kong Control Plane**: Kong API Gateway with Admin API (port 8001) and Admin GUI (port 8002)
- **Kong Proxy**: Gateway proxy (port 8000)

**Note**: The default Kong admin password is `handyshake` (configured in docker-compose.yml).

## Configuration

### Server Configuration

Update `cypress/fixtures/server.json` with your Kong Gateway server details:

```json
{
    "host": "localhost",
    "port": 8002,
    "serverPort": 8000,
    "adminPort": 8001,
    "protocol": "http",
    "workspace": "default"
}
```

- **host**: Kong Gateway hostname
- **port**: Kong Gateway UI port
- **serverPort**: Kong Gateway proxy port
- **adminPort**: Kong Admin API port
- **protocol**: HTTP protocol (http/https)
- **workspace**: Kong workspace name

### Test Data

Test data fixtures are located in `cypress/fixtures/`:
- `server.json`: Server configuration
- `sanity.json`: Basic flow test data
- `service.json`: Service creation test data
- `serviceGrid.json`: Service grid test data

## Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
npx cypress open
```

This opens the Cypress Test Runner GUI where you can:
- Select and run individual test files
- Watch tests execute in real-time
- Debug tests with time-travel debugging

### Run Tests Headlessly (CLI Mode)

```bash
# Run all tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/service/create_service.cy.js"

# Run tests in a specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

### Run Tests with Video Recording

```bash
# Record videos (default)
npx cypress run --record

# Disable video recording
npx cypress run --no-record
```

## Project Structure

```
fly-in-sky-test/
├── cypress/
│   ├── e2e/                          # Test specifications
│   │   ├── sanity/                   # Basic flow tests
│   │   │   └── basic_flow.cy.js     # Complete workflow test
│   │   └── service/                  # Service management tests
│   │       ├── create_service.cy.js # Service creation tests
│   │       └── service_grid.cy.js   # Service grid operations
│   ├── fixtures/                     # Test data fixtures
│   │   ├── server.json              # Server configuration
│   │   ├── sanity.json             # Basic flow test data
│   │   ├── service.json            # Service test data
│   │   └── serviceGrid.json        # Service grid test data
│   └── support/                      # Support files
│       ├── commands.js              # Custom Cypress commands
│       ├── e2e.js                   # E2E support file
│       └── pages/                   # Page Object Model
│           ├── gateway_service_main_page.js
│           ├── new_gateway_service_page.js
│           ├── new_route_page.js
│           ├── overview_page.js
│           ├── route_detail_page.js
│           ├── route_main_page.js
│           ├── service_detail_display_page.js
│           └── workspace_page.js
├── docker/                           # Docker configuration
│   └── docker-compose.yml           # Kong Gateway Docker setup
├── cypress.config.js                # Cypress configuration
├── jsconfig.json                    # JavaScript configuration
├── package.json                     # Node.js dependencies
├── package-lock.json                # Locked dependency versions
└── README.md                        # This file
```

## Test Structure

### Test Categories

1. **Sanity Tests** (`cypress/e2e/sanity/`)
   - Basic workflow validation
   - End-to-end service and route creation
   - Route verification

2. **Service Tests** (`cypress/e2e/service/`)
   - Service creation from full URL
   - Service creation from manual configuration
   - Service grid operations
   - Duplicate service name validation

### Page Object Model

The project uses the Page Object Model (POM) pattern for better maintainability:

- **Workspace Page**: Workspace navigation
- **Overview Page**: Overview page interactions
- **Gateway Service Main Page**: Service listing and management
- **New Gateway Service Page**: Service creation forms
- **Service Detail Display Page**: Service details and verification
- **Route Main Page**: Route listing and management
- **New Route Page**: Route creation forms
- **Route Detail Page**: Route details

## Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.js`:

- `cy.deleteRoute(routeId)`: Delete a route by ID
- `cy.createService(serviceData)`: Create a service via API
- `cy.deleteService(serviceId)`: Delete a service by ID
- `cy.cleanupRoutes(routeIDs)`: Clean up multiple routes
- `cy.cleanupServices(serviceIDs)`: Clean up multiple services
- `cy.getText()`: Get text content from an element
- `cy.generateShortUUID()`: Generate a short UUID for test isolation

## Test Data Management

Tests use prefixed names to avoid conflicts:
- Each test run generates a unique prefix using `cy.generateShortUUID()`
- Service and route names are prefixed automatically
- Prefix is stored in test context for cleanup

## Best Practices

1. **Test Isolation**: Each test generates unique names using UUID prefixes
2. **Cleanup**: Tests clean up created resources in `after` hooks
3. **Page Objects**: UI interactions are abstracted into page objects
4. **Fixtures**: Test data is externalized in JSON fixtures
5. **Configuration**: Server settings are configurable via `server.json`

## Troubleshooting

### Tests fail to connect to Kong Gateway

- Verify Kong Gateway is running
- Check `cypress/fixtures/server.json` configuration
- Ensure ports are accessible

### Element not found errors

- Check if Kong Gateway UI is fully loaded
- Verify selectors in page objects match current UI
- Check browser console for JavaScript errors

### Dependency issues

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is compatible

## Contributing

1. Create a feature branch
2. Write tests following existing patterns
3. Use Page Object Model for UI interactions
4. Ensure tests clean up after themselves
5. Submit a pull request

## License

ISC

## Author

zhao-kun.li

## Repository

https://github.com/kyleggy/fly-in-sky-test

