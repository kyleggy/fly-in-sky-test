export class NewRoutePage {
    constructor() {
        this.routeNameInput = 'input[data-testid="route-form-name"]'
        this.routeServiceSelect = 'input[data-testid="route-form-service-id"]'
        this.routeTagsInput = 'input[data-testid="route-form-tags"]'
        this.basicRadioButton = 'input[data-testid="route-form-config-type-basic"][type="radio"]'
        this.advancedRadioButton = 'input[data-testid="route-form-config-type-advanced"][type="radio"]'
        this.protocolSelect = 'select[data-testid="route-form-protocols"]'
        this.routePathInput = 'input[data-testid="route-form-paths-input-1"]'
        this.selectMethodPrefix = 'div[data-testid="multiselect-item-'
        this.routeMethodSelect = 'div[data-testid="multiselect-trigger"]'
        this.routeHostInput = 'input[data-testid="route-form-hosts-input-1"]'
        this.stripPathCheckbox = 'input[data-testid="route-form-strip-path"]'
        this.routeSaveButton = 'button[data-testid="route-create-form-submit"]'
        this.popUpSuccessMessage = 'div[class*="toaster"][class*="success"][role="alert"]'
        this.popUpSuccessMessageText = 'div.toaster.success p.toaster-message'
        this.routePathInputPrefix = 'input[data-testid="route-form-paths-input-'
        this.addPathButton = 'button[data-testid="add-paths"] span[data-testid="kui-icon-wrapper-add-icon"]'
    }

    setName(name) {
        cy.get(this.routeNameInput).type(name)
    }

    selectService(routeService) {
        cy.get(this.routeServiceSelect).click().type(routeService, {delay: 100}).then(() => {
            cy.get('[class="select-item-label"]').each((el, index, $list) => {
                const itemText = el.text().trim()
                if (itemText == routeService) {
                    cy.wrap(el).click( {force: true} )
                }
            })
        })
    }

    setTags(tags) {
        cy.get(this.routeTagsInput).type(tags)
    }

    clickBasicRadioButton() {
        cy.get(this.basicRadioButton).check()
    }

    verifyBasicRadioButtonIsChecked() {
        cy.get(this.basicRadioButton).should('have.attr', 'aria-checked', 'true')
    }

    clickAdvancedRadioButton() {
        cy.get(this.advancedRadioButton).check()
    }

    verifyAdvancedRadioButtonIsChecked() {
        cy.get(this.advancedRadioButton).should('have.attr', 'aria-checked', 'true')
    }

    selectProtocol(protocol) {
        cy.get(this.protocolSelect).select(protocol)
    }

    setPath(path) {
        cy.get(this.routePathInput).type(path)
    }

    setPathAdvanced(index, path) {
        cy.get(this.routePathInputPrefix + index + '"]').scrollIntoView().type(path, {delay: 200})
    }

    selectMethod(routeMethod) {
        cy.get(this.routeMethodSelect).click()
        cy.get(this.selectMethodPrefix + routeMethod + '"]').click()
    }

    setHost(host) {
        cy.get(this.routeHostInput).type(host)
    }

    checkStripPathRadioButton() {  
        cy.get(this.stripPathCheckbox).then(($checkbox) => {
            const ariaChecked = $checkbox.attr('aria-checked')
            if (ariaChecked !== 'true') {
                cy.wrap($checkbox).click()
            }
        })
    }

    uncheckStripPathRadioButton() {
        cy.get(this.stripPathCheckbox).then(($checkbox) => {
            const ariaChecked = $checkbox.attr('aria-checked')
            if (ariaChecked === 'true') {
                cy.wrap($checkbox).click()
            }
        })
    }

    verifyStripPathIsChecked() {
        cy.get(this.stripPathCheckbox).should('have.attr', 'aria-checked', 'true')
    }

    verifyStripPathIsUnChecked() {
        cy.get(this.stripPathCheckbox).should('have.attr', 'aria-checked', 'false')
    }

    clickSaveButton() {
        cy.get(this.routeSaveButton).click()
    }

    verifyRouteCreatedNotification(routeName) {
        // Verify the success toaster notification appears
        cy.get(this.popUpSuccessMessage, { timeout: 10000 }).should('be.visible')
        
        cy.get(this.popUpSuccessMessageText)
            .should('be.visible')
            .and('contain', routeName)
    }

    createNewBasicRoute(routeName, routeService, tags, routePath, routeMethod) {
        this.setName(routeName)
        this.selectService(routeService)
        this.setTags(tags)
        this.verifyBasicRadioButtonIsChecked()
        this.setPath(routePath)
        this.selectMethod(routeMethod)
        this.verifyStripPathIsChecked()
        this.uncheckStripPathRadioButton()
        this.verifyStripPathIsUnChecked()
        this.checkStripPathRadioButton()    
        this.verifyStripPathIsChecked()
        this.clickSaveButton()
        this.verifyRouteCreatedNotification(routeName)
    }

    createNewAdvancedRoute(routeName, routeService, tags, routePath, routeMethod) {
        this.setName(routeName)
        this.selectService(routeService)
        this.setTags(tags)
        this.clickAdvancedRadioButton()
        this.verifyAdvancedRadioButtonIsChecked()
        // Handle array of paths - set each path with its index
        const paths = Array.isArray(routePath) ? routePath : [routePath]
        cy.wrap(paths).each((path, index) => {
            const pathInputSelector = this.routePathInputPrefix + (index + 1) + '"]'
            
            if (index === 0) {
                // Wait for the first path input to be visible and enabled before setting
                cy.get(pathInputSelector).should('be.visible')
                this.setPathAdvanced(index + 1, path)
            } else {
                // Wait for add button to be visible and clickable before clicking
                cy.get(this.addPathButton)
                    .should('be.visible')
                    .click()
                cy.get(pathInputSelector).scrollIntoView().should('be.visible')
                this.setPathAdvanced(index + 1, path)
            }
        })
        this.selectMethod(routeMethod)
        this.clickSaveButton()
        this.verifyRouteCreatedNotification(routeName)
    }
}

export const newRoutePage = new NewRoutePage()    