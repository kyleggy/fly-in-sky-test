# Fly-in-Sky Test

Cypress end-to-end test suite for Kong API Gateway management interface.

## Description

This project contains automated E2E tests for testing Kong API Gateway functionality, including:
- Gateway service creation and management
- Route creation and configuration
- Route verification via REST calls
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

## Docker Setup 

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

Kong Gateway server details defined in `cypress/fixtures/server.json`:

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
- `route.json`: Route creation test data

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
npx cypress run --spec "cypress/e2e/route/route_flow.cy.js"

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

### Run Tests Using Shell Script (Recommended)

Convenient scripts are provided for both Unix-like systems (macOS, Linux) and Windows:

#### For macOS/Linux (Bash Script)

```bash
# Make script executable (first time only)
chmod +x run-tests.sh

# Run all tests in default browser (headless)
./run-tests.sh

# Run tests in specific browser
./run-tests.sh chrome
./run-tests.sh firefox
./run-tests.sh edge

# Run specific test file
./run-tests.sh chrome --spec "cypress/e2e/route/route_flow.cy.js"

# Run in headed mode (browser visible)
./run-tests.sh chrome --no-headless

# Run without opening report automatically
./run-tests.sh chrome --no-report

# Show help
./run-tests.sh --help
```

#### For Windows (PowerShell Script)

```powershell
# Run all tests in default browser (headless)
.\run-tests.ps1

# Run tests in specific browser
.\run-tests.ps1 chrome
.\run-tests.ps1 firefox
.\run-tests.ps1 edge

# Run specific test file
.\run-tests.ps1 chrome -Spec "cypress/e2e/route/route_flow.cy.js"

# Run in headed mode (browser visible)
.\run-tests.ps1 chrome -NoHeadless

# Run without opening report automatically
.\run-tests.ps1 chrome -NoReport

# Show help
.\run-tests.ps1 -Help
```

**Note for Windows Users:**
- If you encounter execution policy restrictions, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Alternatively, use Git Bash (comes with Git for Windows) to run `run-tests.sh`
- Or use WSL (Windows Subsystem for Linux) to run the bash script

**Features:**
- Automatic dependency check and installation
- Browser selection (chrome, firefox, edge, electron)
- Colored output for better readability
- Automatic test report opening after execution
- Cross-platform support (macOS, Linux, Windows)
- Error handling and status reporting

## GitHub Actions CI

This project supports **GitHub Actions** for continuous integration (CI) testing. The workflow configuration is located at `.github/workflows/cypress-tests.yml`.

### Running CI Tests

CI tests automatically run:
- **On every push** to `main` or `develop` branches
- **On every pull request** targeting `main` or `develop` branches
- **Manually** via workflow dispatch

The workflow runs tests in parallel on both Chrome and Firefox browsers using Docker Compose to start Kong Gateway.

### Viewing CI Test Results

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Select a workflow run to view:
   - Test execution logs
   - Test results summary
   - Download test reports, screenshots, and videos as artifacts

### Manual CI Trigger

To manually trigger CI tests:
1. Go to the **Actions** tab in your repository
2. Select the **Cypress Tests** workflow
3. Click **Run workflow** button
4. Choose the branch and click **Run workflow**

## Test Reports

This project uses **Cypress Mochawesome Reporter** to generate HTML test reports with embedded screenshots and charts.

Reports are automatically generated when running tests. After execution, open the HTML report:

```bash
open cypress/reports/kong-api-gateway-test-report_*.html
```

Reports are saved to `cypress/reports/` with timestamp format: `yyyy-mm-dd_HH-MM-ss`. Videos are only recorded when tests fail.

## Project Structure

```
fly-in-sky-test/
├── cypress/
│   ├── e2e/                          # Test specifications
│   │   ├── route/                    # Route management tests
│   │   │   └── route_flow.cy.js     # Route creation and verification tests
│   │   ├── sanity/                   # Basic flow tests
│   │   │   └── basic_flow.cy.js     # Complete workflow test
│   │   └── service/                  # Service management tests
│   │       ├── create_service.cy.js # Service creation tests
│   │       └── service_grid.cy.js   # Service grid operations
│   ├── fixtures/                     # Test data fixtures
│   │   ├── server.json              # Server configuration
│   │   ├── sanity.json             # Basic flow test data
│   │   ├── service.json            # Service test data
│   │   ├── serviceGrid.json        # Service grid test data
│   │   └── route.json              # Route test data
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
├── run-tests.sh                     # Test execution script (macOS/Linux)
├── run-tests.ps1                    # Test execution script (Windows)
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
   - Service grid operations (filtering, sorting, disabling, deleting)
   - Duplicate service name validation

3. **Route Tests** (`cypress/e2e/route/`)
   - Route creation bound to services
   - Multiple routes bound to a single service
   - Route verification via REST calls
   - Route path configuration (single and multiple paths)
   - Strip path configuration testing

### Page Object Model

The project uses the Page Object Model (POM) pattern for better maintainability:

**Service Pages:**
- **Workspace Page**: Workspace navigation
- **Overview Page**: Overview page interactions
- **Gateway Service Main Page**: Service listing, filtering, sorting, and management
- **New Gateway Service Page**: Service creation forms (full URL and manual configuration)
- **Service Detail Display Page**: Service details and verification

**Route Pages:**
- **Route Main Page**: Route listing and management
- **New Route Page**: Route creation forms (basic and advanced configuration with multiple paths)
- **Route Detail Page**: Route details and ID retrieval

## Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.js`:

**Route Commands:**
- `cy.createRoute(routeData)`: Create a route via API
- `cy.deleteRoute(routeId)`: Delete a route by ID
- `cy.deleteRouteAndService(routeId, serviceId)`: Delete a route and its associated service
- `cy.deleteRouteAndBindingService(routeId)`: Delete a route and automatically find and delete its bound service
- `cy.cleanupRoutes(routeIDs)`: Clean up multiple routes

**Service Commands:**
- `cy.createService(serviceData)`: Create a service via API
- `cy.deleteService(serviceId)`: Delete a service by ID
- `cy.cleanupServices(serviceIDs)`: Clean up multiple services

**Utility Commands:**
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

## Limitations and Known Issues

### Test Coverage

- **Simple validation only**: These tests focus on basic functionality validation. Complex API gateway features and advanced configurations are not currently tested due to limited understanding and time constraints.

### Known Issues

1. **Dirty data in before hooks**: When manually running Cypress tests, `before` hooks may trigger twice in some cases, potentially creating duplicate test data. This does not affect test results but may leave residual data in the Kong Gateway instance.

2. **Screen resolution and environment dependencies**: 
   - Tests have not been validated across different screen resolutions
   - Test stability may vary in different environments

3. **Docker Compose configuration**: The provided `docker/docker-compose.yml` file in the assignment email has been updated to address PostgreSQL data file path changes in recent PostgreSQL builds. Always use the included Docker Compose file rather than older versions.

4. **Shell script compatibility**: The provided shell scripts (`run-tests.sh` and `run-tests.ps1`) may fail to run in some environments due to different shell configurations or permissions. If shell commands fail, please execute `npx cypress run` manually to run the tests.

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

## License

ISC

## Author

zhao-kun.li

## Repository

https://github.com/kyleggy/fly-in-sky-test

