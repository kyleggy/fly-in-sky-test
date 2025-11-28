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
        this.filterProtocolDropdownPrefix = 'div[data-testid="protocol"] div[data-testid="select-item-'
        this.filterProtocolApplyButton = 'div[data-testid="protocol"] button[data-testid="apply-filter"]'
        this.deleteMenuButton = 'button[data-testid="action-entity-delete"]'
        this.enabledSwitch = 'span[data-testid="switch-control"]'
        this.deleteConfirmationInput = 'input[data-testid="confirmation-input"]'
        this.deleteConfirmationApplyButton = 'button[data-testid="modal-action-button"]'
        this.orderByNameColumnHeader = 'th[data-testid="table-header-name"]'
        this.gridRow = 'tbody tr[data-testid]:not([data-testid=""])'
        this.emptyServiceState = 'div[data-testid="table-empty-state"]'
        this.nameCell = 'td[data-testid="name"]'
        this.protocolCell = 'td[data-testid="protocol"]'
        this.alertMessageForDeleteServiceBindWithRoute = 'div[class="prompt-content"] div[class="alert-message"]'
        this.disableServicePopupButton = 'button[data-testid="modal-action-button"]'
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

    _getSwitchToggle(serviceName) {
        return `tr[data-testid="${serviceName}"] span[data-testid="switch-control"]`
    }

    //`tr[data-testid="${serviceName}"] input[type="checkbox"][data-testid*="toggle-input"]`
    _getToggleCheckbox(serviceName) {
        return `tr[data-testid="${serviceName}"] span[data-testid="switch-control"]`
    }

    _clickDisableToggle(serviceName) {
        cy.get(this._getToggleCheckbox(serviceName)).click({ force: true })
        cy.get(this.disableServicePopupButton).click()
    }

    verifyToggleUncheckedAfterDisableService(serviceName) {
        cy.get(this._getToggleCheckbox(serviceName)).should('have.class', 'checked')
        this._clickDisableToggle(serviceName)
        cy.get(this._getToggleCheckbox(serviceName)).should('not.have.class', 'checked')
    }

    deleteService(serviceName) {
        this._clickTriggerButton(serviceName)
        this._clickDeleteMenuButton(serviceName)
        this._typeDeleteConfirmation(serviceName)
        this._clickDeleteConfirmationApplyButton()
    }

    verifyServiceBindWithRouteNotAllowedDelete(serviceName) {
        this._clickTriggerButton(serviceName)
        this._clickDeleteMenuButton(serviceName)
        this._typeDeleteConfirmation(serviceName)
        this._clickDeleteConfirmationApplyButton()
        cy.get(this.alertMessageForDeleteServiceBindWithRoute).should('have.text', 'an existing \'routes\' entity references this \'services\' entity')
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

    getEnabledSwitch(serviceName) {
        return `tr[data-testid="${serviceName}"] span[data-testid="switch-control"]`
    }

    navigateToGatewayServiceMainPage() {
        return cy.fixture('server.json').then((server) => {
            const gatewayServiceMainPURL = server.protocol + "://" + server.host + ":" + server.port + "/" + server.workspace + "/services"
            return cy.visit(gatewayServiceMainPURL)
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

    setFilterByNameAndProtocol(name, protocol) {
        cy.get(this.filterName).click()
        cy.get(this.filterNameInput).type(name)
        cy.get(this.filterProtocol).click()
        cy.get(this.filterProtocolDropdown).click()
        cy.get(this.filterProtocolDropdownPrefix + protocol + '"]').click()
        cy.get(this.filterProtocolApplyButton).click()
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

    verifyRowNameInGrid(serviceName) {
        cy.get(`tr[data-testid="${serviceName}"]`).should('exist')
    }

    verifyRowCountAndNameStartsWithInGrid(prefix, expectedCount) {
        this.verifyRowCountStartsWithInGrid(prefix, expectedCount)
        cy.get(`tbody tr[data-testid^="${prefix}"]`).each(($row) => {
            // Find the name cell (td[data-testid="name"]) within this specific row and wrap it
            cy.wrap($row.find(this.nameCell)).within(() => {
                // Verify the <b> element exists and its text starts with the prefix
                cy.get('b').should('exist').and(($b) => {
                    expect($b.text().startsWith(prefix)).to.be.true
                })
            })
        })
    }

    verifyRowCountAndProtocolInGrid(prefix, protocol, expectedCount) {
        this.verifyRowCountStartsWithInGrid(prefix, expectedCount)
        cy.get(`tbody tr[data-testid^="${prefix}"]`).each(($row) => {
            // Find the protocol cell (td[data-testid="protocol"]) within this specific row and wrap it
            cy.wrap($row.find(this.protocolCell)).within(() => {
                // Get the span with class "content-wrapper" that equals to the protocol value
                cy.get('span.content-wrapper').should('exist').and(($span) => {
                    expect($span.text().trim()).to.equal(protocol)
                })
            })
        })
    }

    verifyRowCountStartsWithInGrid(prefix, expectedCount) {
        cy.get(`tbody tr[data-testid^="${prefix}"]`).should('have.length', expectedCount)
    }

}

export const gatewayServiceMainPage = new GatewayServiceMainPage()
