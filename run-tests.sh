#!/bin/bash

# Cypress Test Runner Script
# Usage: ./run-tests.sh [browser] [options]
# Examples:
#   ./run-tests.sh chrome
#   ./run-tests.sh firefox
#   ./run-tests.sh edge
#   ./run-tests.sh chrome --spec "cypress/e2e/route/route_flow.cy.js"
#   ./run-tests.sh --headless  # Run in headless mode (default browser)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BROWSER=""
SPEC=""
HEADLESS=true
OPEN_REPORT=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        chrome|firefox|edge|electron)
            BROWSER="$1"
            shift
            ;;
        --spec)
            SPEC="$2"
            shift 2
            ;;
        --no-headless|--headed)
            HEADLESS=false
            shift
            ;;
        --no-report)
            OPEN_REPORT=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [browser] [options]"
            echo ""
            echo "Browsers:"
            echo "  chrome, firefox, edge, electron"
            echo ""
            echo "Options:"
            echo "  --spec <path>        Run specific test file"
            echo "  --no-headless        Run in headed mode (show browser)"
            echo "  --no-report          Don't open test report after execution"
            echo "  --help, -h           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 chrome"
            echo "  $0 firefox --spec \"cypress/e2e/route/route_flow.cy.js\""
            echo "  $0 chrome --no-headless"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Cypress is installed
if ! command -v npx &> /dev/null; then
    print_error "npx is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Build Cypress command
CYPRESS_CMD="npx cypress run"

# Add browser if specified
if [ -n "$BROWSER" ]; then
    CYPRESS_CMD="$CYPRESS_CMD --browser $BROWSER"
    print_info "Browser: $BROWSER"
else
    print_info "Browser: Default (electron)"
fi

# Add headless mode
if [ "$HEADLESS" = true ]; then
    print_info "Mode: Headless"
else
    CYPRESS_CMD="$CYPRESS_CMD --headed"
    print_info "Mode: Headed (browser visible)"
fi

# Add spec if specified
if [ -n "$SPEC" ]; then
    CYPRESS_CMD="$CYPRESS_CMD --spec \"$SPEC\""
    print_info "Test file: $SPEC"
else
    print_info "Running all tests"
fi

# Print separator
echo ""
echo "=========================================="
echo "  Cypress Test Execution"
echo "=========================================="
echo ""

# Run tests
print_info "Starting test execution..."
echo ""
echo "Command: $CYPRESS_CMD"
echo ""

# Execute Cypress command
if eval $CYPRESS_CMD; then
    echo ""
    print_success "All tests completed successfully!"
    
    # Find the latest test report
    if [ -d "cypress/reports" ]; then
        LATEST_REPORT=$(ls -t cypress/reports/*.html 2>/dev/null | head -n 1)
        
        if [ -n "$LATEST_REPORT" ]; then
            print_info "Test report generated: $LATEST_REPORT"
            
            if [ "$OPEN_REPORT" = true ]; then
                print_info "Opening test report..."
                
                # Detect OS and open report accordingly
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    open "$LATEST_REPORT"
                elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                    # Linux
                    if command -v xdg-open &> /dev/null; then
                        xdg-open "$LATEST_REPORT"
                    elif command -v gnome-open &> /dev/null; then
                        gnome-open "$LATEST_REPORT"
                    else
                        print_warning "Could not open report automatically. Please open manually: $LATEST_REPORT"
                    fi
                elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
                    # Windows
                    start "$LATEST_REPORT"
                else
                    print_warning "Unknown OS. Please open report manually: $LATEST_REPORT"
                fi
            fi
        else
            print_warning "No test report found in cypress/reports/"
        fi
    else
        print_warning "Reports directory not found"
    fi
    
    echo ""
    echo "=========================================="
    print_success "Test execution completed!"
    echo "=========================================="
    exit 0
else
    echo ""
    print_error "Test execution failed!"
    
    # Still try to open report even on failure
    if [ -d "cypress/reports" ]; then
        LATEST_REPORT=$(ls -t cypress/reports/*.html 2>/dev/null | head -n 1)
        if [ -n "$LATEST_REPORT" ] && [ "$OPEN_REPORT" = true ]; then
            print_info "Opening test report for failure analysis..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                open "$LATEST_REPORT"
            elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                if command -v xdg-open &> /dev/null; then
                    xdg-open "$LATEST_REPORT"
                fi
            fi
        fi
    fi
    
    echo ""
    echo "=========================================="
    print_error "Test execution failed with errors!"
    echo "=========================================="
    exit 1
fi

