# Cypress Test Runner Script for Windows
# Usage: .\run-tests.ps1 [browser] [options]
# Examples:
#   .\run-tests.ps1 chrome
#   .\run-tests.ps1 firefox
#   .\run-tests.ps1 edge
#   .\run-tests.ps1 chrome -spec "cypress/e2e/route/route_flow.cy.js"
#   .\run-tests.ps1 -headless  # Run in headless mode (default browser)

param(
    [Parameter(Position=0)]
    [ValidateSet("chrome", "firefox", "edge", "electron", "")]
    [string]$Browser = "",
    
    [Parameter()]
    [string]$Spec = "",
    
    [Parameter()]
    [switch]$NoHeadless,
    
    [Parameter()]
    [switch]$NoReport,
    
    [Parameter()]
    [switch]$Help
)

# Colors for output
function Write-Info {
    Write-Host "[INFO] $args" -ForegroundColor Blue
}

function Write-Success {
    Write-Host "[SUCCESS] $args" -ForegroundColor Green
}

function Write-Warning {
    Write-Host "[WARNING] $args" -ForegroundColor Yellow
}

function Write-Error {
    Write-Host "[ERROR] $args" -ForegroundColor Red
}

# Show help
if ($Help) {
    Write-Host "Usage: .\run-tests.ps1 [browser] [options]"
    Write-Host ""
    Write-Host "Browsers:"
    Write-Host "  chrome, firefox, edge, electron"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Spec <path>        Run specific test file"
    Write-Host "  -NoHeadless         Run in headed mode (show browser)"
    Write-Host "  -NoReport           Don't open test report after execution"
    Write-Host "  -Help               Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run-tests.ps1 chrome"
    Write-Host "  .\run-tests.ps1 firefox -Spec `"cypress/e2e/route/route_flow.cy.js`""
    Write-Host "  .\run-tests.ps1 chrome -NoHeadless"
    exit 0
}

# Check if npx is available
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "npx is not installed. Please install Node.js and npm first."
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found. Installing dependencies..."
    npm install
}

# Build Cypress command
$CypressCmd = "npx cypress run"

# Add browser if specified
if ($Browser) {
    $CypressCmd += " --browser $Browser"
    Write-Info "Browser: $Browser"
} else {
    Write-Info "Browser: Default (electron)"
}

# Add headless mode
if (-not $NoHeadless) {
    Write-Info "Mode: Headless"
} else {
    $CypressCmd += " --headed"
    Write-Info "Mode: Headed (browser visible)"
}

# Add spec if specified
if ($Spec) {
    $CypressCmd += " --spec `"$Spec`""
    Write-Info "Test file: $Spec"
} else {
    Write-Info "Running all tests"
}

# Print separator
Write-Host ""
Write-Host "=========================================="
Write-Host "  Cypress Test Execution"
Write-Host "=========================================="
Write-Host ""

# Run tests
Write-Info "Starting test execution..."
Write-Host ""
Write-Host "Command: $CypressCmd"
Write-Host ""

# Execute Cypress command
try {
    Invoke-Expression $CypressCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "All tests completed successfully!"
        
        # Find the latest test report
        if (Test-Path "cypress/reports") {
            $LatestReport = Get-ChildItem -Path "cypress/reports" -Filter "*.html" | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1
            
            if ($LatestReport) {
                Write-Info "Test report generated: $($LatestReport.FullName)"
                
                if (-not $NoReport) {
                    Write-Info "Opening test report..."
                    Start-Process $LatestReport.FullName
                }
            } else {
                Write-Warning "No test report found in cypress/reports/"
            }
        } else {
            Write-Warning "Reports directory not found"
        }
        
        Write-Host ""
        Write-Host "=========================================="
        Write-Success "Test execution completed!"
        Write-Host "=========================================="
        exit 0
    } else {
        throw "Test execution failed"
    }
} catch {
    Write-Host ""
    Write-Error "Test execution failed!"
    
    # Still try to open report even on failure
    if (Test-Path "cypress/reports") {
        $LatestReport = Get-ChildItem -Path "cypress/reports" -Filter "*.html" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 1
        if ($LatestReport -and -not $NoReport) {
            Write-Info "Opening test report for failure analysis..."
            Start-Process $LatestReport.FullName
        }
    }
    
    Write-Host ""
    Write-Host "=========================================="
    Write-Error "Test execution failed with errors!"
    Write-Host "=========================================="
    exit 1
}

