export class NewGatewayServicePage {
    constructor() {
        this.defaultFullURLRadioButton = 'input[data-testid="gateway-service-url-radio"][type="radio"]'
        this.manualConfigurationRadioButton = 'input[data-testid="gateway-service-protocol-radio"][type="radio"]'
        this.fullURLInput = 'input[data-testid="gateway-service-url-input"]'
        this.nameInput = 'input[data-testid="gateway-service-name-input"]'
        this.protocolSelect = 'input[data-testid="gateway-service-protocol-select"]'
        this.protocolSelectOptionPrefix = 'div[data-testid="select-item-'
        this.hostInput = 'input[data-testid="gateway-service-host-input"]'
        this.pathInput = 'input[data-testid="gateway-service-path-input"]'
        this.portInput = 'input[data-testid="gateway-service-port-input"]'
        this.saveButton = 'button[data-testid="service-create-form-submit"]'
        this.popUpSuccessMessage = 'div[class*="toaster"][class*="success"][role="alert"]'
        this.popUpSuccessMessageText = 'div.toaster.success p.toaster-message'
        this.formErrorMessage = 'div[data-testid="form-error"]'
        this.cancelSaveButton = 'button[data-testid="service-create-form-cancel"]'
    }

    setFullURL(fullURL) {   
        cy.get(this.fullURLInput).type(fullURL)
    }

    setName(name) {
        cy.get(this.nameInput).clear({force: true});
        cy.get(this.nameInput).type(name, {delay: 200})
    }

    selectFullURLRadioButton() {
        cy.get(this.defaultFullURLRadioButton).then(($checkbox) => {
            const ariaChecked = $checkbox.attr('aria-checked')
            if (ariaChecked !== 'true') {
                cy.wrap($checkbox).click()
            }
        })
    }

    verifyFullURLRadioButtonIsUnChecked() {
        cy.get(this.defaultFullURLRadioButton).should('have.attr', 'aria-checked', 'false')
    }

    verifyManualConfigurationRadioButtonIsUnChecked() {
        cy.get(this.manualConfigurationRadioButton).should('have.attr', 'aria-checked', 'false')
    }

    checkManualConfigurationRadioButton() {
        cy.get(this.manualConfigurationRadioButton).then(($checkbox) => {
            const ariaChecked = $checkbox.attr('aria-checked')
            if (ariaChecked !== 'true') {
                cy.wrap($checkbox).click()
            }
        })
    }

    selectProtocol(protocol) {
        cy.get(this.protocolSelect).click()
        cy.get(this.protocolSelectOptionPrefix + protocol + '"]').click()
    }

    setHost(host) {
        cy.get(this.hostInput).type(host, {delay: 100})
    }

    setPath(path) {
        cy.get(this.pathInput).type(path, {delay: 100})
    }

    setPort(port) {
        cy.get(this.portInput).clear({force: true}).should('have.value', '0')
        cy.get(this.portInput).invoke('val', port).trigger('input').trigger('change')
    }

    createNewGatewayServiceFromManualConfiguration(protocol, host, path, port, name) {
        this.checkManualConfigurationRadioButton()
        this.verifyFullURLRadioButtonIsUnChecked()
        this.selectProtocol(protocol)
        this.setHost(host)
        this.setPath(path)
        this.setPort(port)
        this.setName(name)
        this.clickSaveButton()
        this.verifyServiceCreatedNotification(name)
    }

    clickSaveButton() {
        cy.get(this.saveButton).click()
    }

    verifyServiceCreatedNotification(serviceName) {
        // Verify the success toaster notification appears
        cy.get(this.popUpSuccessMessage, { timeout: 10000 }).should('be.visible')
        
        cy.get(this.popUpSuccessMessageText)
            .should('be.visible')
            .and('contain', serviceName)
    }

    verifyServiceCreationError(serviceName) {
        cy.get(this.formErrorMessage).should('be.visible')
            .and('contain', serviceName).and('contain', 'UNIQUE')
        cy.get(this.cancelSaveButton).click()
    }

    createNewGatewayServiceFromFullURL(fullURL, name) {    
        this.selectFullURLRadioButton()
        this.setFullURL(fullURL)
        this.setName(name)
        this.clickSaveButton()
        this.verifyServiceCreatedNotification(name)
    }

    createNewGatewayServiceFromFullURLWithoutVerify(fullURL, name) {
        this.selectFullURLRadioButton()
        this.setFullURL(fullURL)
        this.setName(name)
        this.clickSaveButton()
    }
}

export const newGatewayServicePage = new NewGatewayServicePage()