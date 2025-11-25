export class GatewayServiceMainPage {
    constructor() {
        this.serviceName = 'input[data-testid="gateway-service-name-input"]'
        this.createNewEmptyGatewayServiceButton = 'a[data-testid="empty-state-action"][type="button"]'
        this.createNewGatewayServiceFromToolbarButton = 'a[data-testid="toolbar-add-gateway-service"][type="button"]'
        this.filterButton = 'button[data-testid="filter-button"]'
        this.filterName = 'div[data-testid="name"]'
        this.filterNameInput = 'div[data-testid="name"] input[id="filter-name"]'
        this.applyNameButton = 'div[data-testid="name"] button[data-testid="apply-filter"]'
        this.filterProtocol = 'div[data-testid="protocol"]'
        this.filterProtocolDropdown = 'div[data-testid="protocol"] input[data-testid="select-input"]'
        this.filterProtocolDropdownPrefix = 'div[data-testid="protocol"] div[data-testid="select-item-"'
        this.filterProtocolApplyButton = 'div[data-testid="protocol"] button[data-testid="apply-filter"]'
        this.deleteMenuButton = 'button[data-testid="action-entity-delete"]'
        this.enabledSwitch = 'span[data-testid="switch-control"]'
        this.deleteConfirmationInput = 'input[data-testid="confirmation-input"]'
        this.deleteConfirmationApplyButton = 'button[data-testid="modal-action-button"]'
        this.orderByNameColumnHeader = 'th[data-testid="table-header-name"]'
        this.gridRow = 'tbody tr[data-testid]:not([data-testid=""])'
        this.emptyServiceState = 'div[data-testid="table-empty-state"]'
    }

    _getTriggerButton(serviceName) {
        return `tr[data-testid="${serviceName}"] button[data-testid="row-actions-dropdown-trigger"]`
    }

    _clickTriggerButton(serviceName) {
        cy.get(this._getTriggerButton(serviceName)).click()
    }

    _getDeleteMenuButton(serviceName) {
       return `tr[data-testid="${serviceName}"] button[data-testid="action-entity-delete"]`
    }

    _clickDeleteMenuButton(serviceName) {
        cy.get(this._getDeleteMenuButton(serviceName)).click()
    }

    _clickDeleteConfirmationApplyButton() {
        cy.get(this.deleteConfirmationApplyButton).click()
    }

    _typeDeleteConfirmation(serviceName) {
        cy.get(this.deleteConfirmationInput).type(serviceName)
    }

    deleteService(serviceName) {
        this._clickTriggerButton(serviceName)
        this._clickDeleteMenuButton(serviceName)
        this._typeDeleteConfirmation(serviceName)
        this._clickDeleteConfirmationApplyButton()
    }

    orderByByName() {   
        cy.get(this.orderByNameColumnHeader).click()
    }

    verifyOrderByByName(serviceNames) {
        // Get the current sort order
        cy.get(this.orderByNameColumnHeader).invoke('attr', 'aria-sort').then((sortOrder) => {
            // Sort expected service names according to the sort order
            const expectedOrder = [...serviceNames].sort((a, b) => {
                if (sortOrder === 'ascending') {
                    return a.localeCompare(b)
                } else {
                    return b.localeCompare(a)
                }
            })

            // Get actual service names from the grid
            cy.get(this.gridRow).then(($rows) => {
                const actualOrder = Array.from($rows).map((row) => {
                    return Cypress.$(row).attr('data-testid')
                })

                // Verify the order matches
                expect(actualOrder).to.deep.equal(expectedOrder)
            })
        })
    }

    selectServiceByName(serviceName) {
        cy.get(`tr[data-testid="${serviceName}"]`).select()
    }

    getEnabledSwitch(serviceName) {
        return `tr[data-testid="${serviceName}"] span[data-testid="switch-control"]`
    }

    navigateToGatewayServiceMainPage() {
        cy.fixture('server.json').then((server) => {
            const gatewayServiceMainPURL = server.protocol + "://" + server.host + ":" + server.port + "/" + server.workspace + "/services"
            cy.visit(gatewayServiceMainPURL)
        })
    }

    clickCreateNewGatewayService() {
        //While there is no service, the empty state button will be shown. we have to wait for 2 seconds 
        // since jquery $mainContent.find does not wait for the element to be found.
        cy.get('div[class="main-content"]').wait(2000).then(($mainContent) => {
            if ($mainContent.find(this.emptyServiceState).length > 0) {
                cy.get(this.createNewEmptyGatewayServiceButton).click()
            } else {
                cy.get(this.createNewGatewayServiceFromToolbarButton).click()
            }
        })
    }

    setFilterByName(name) { 
        cy.get(this.filterName).click()
        cy.get(this.filterNameInput).type(name)
        cy.get(this.applyNameButton).click()
    }

    clickFilterButton() {
        cy.get(this.filterButton).click()
    }

    verifyRowCountInGrid(expectedCount) {
        cy.get(this.gridRow).should('have.length', expectedCount)
    }

    getRowCountInGrid() {
        return cy.get(this.gridRow).its('length')
    }

    verifyRowNameInGrid(serviceName) {
        cy.get(`tr[data-testid="${serviceName}"]`).should('exist')
    }

    verifyRowCountStartsWithInGrid(prefix, expectedCount) {
        cy.get(`tbody tr[data-testid^="${prefix}"]`).should('have.length', expectedCount)
    }
}

export const gatewayServiceMainPage = new GatewayServiceMainPage()
