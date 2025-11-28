export class RouteDetailDisplayPage {
    constructor() {
        this.routeId = 'input[data-testid="route-id-input"]'
        this.routeConfigCard = 'div[data-testid="config-card-details-basic-props"]'
        this.nameProperty = 'div[data-testid="name-plain-text"]'
        this.serviceProperty = 'div[data-testid="service-property-value"]'
        this.pathUUIDArray = 'div[data-testid="paths-copy-uuid-array"]'
        this.pathUUIDArrayItem = 'div[data-testid^="paths-copy-uuid-"]'
        this.pathTextClass = 'div[class="copy-text"]'
        this.methodArray = 'div[data-testid="methods-badge-methods"]'
        this.methodArrayItem = 'div[data-testid^="methods-badge-method-"]'
        this.methodTextClass = 'div[class="badge-content-wrapper"]'
    }

    getRouteId() {
        return cy.get(this.routeId)
    }

    getNameProperty() {
        return cy.get(this.nameProperty)
    }

    getMethodArray() {
        return cy.get(this.methodArray)
    }

    getServiceProperty() {
        return cy.get(this.serviceProperty)
    }

    getPathUUIDArray() {
        return cy.get(this.pathUUIDArray)
    }

    verifyNameProperty(routeName) {
        this.getNameProperty().getText().should('eq', routeName)
    }

    verifyRouteDetails(route) {
        this.getRouteId().should('eq', route.id)
    }

    verifyServicePropertyValue(serviceName) {
        this.getServiceProperty().getText().should('eq', serviceName)
    }

    verifyPathUUIDArray(expectedPaths) {
        // Get the container and count child divs with data-testid starting with "paths-copy-uuid-"
        this.getPathUUIDArray().within(() => {
            cy.get(this.pathUUIDArrayItem).then(($elements) => {
                const count = $elements.length
                
                expect(count).to.eq(expectedPaths.length)
                
                // Loop through each path UUID item
                cy.wrap($elements).each(($el, index) => {
                    cy.wrap($el).find(this.pathTextClass).then(($textEl) => {
                        const actualUUID = $textEl.text().trim()
                        const expectedUUID = expectedPaths[index]
                        expect(actualUUID).to.contain(expectedUUID)
                    })
                })
            })
        })
    }

    verifyMethodArray(expectedMethods) {
        this.getMethodArray().within(() => {
            cy.get(this.methodArrayItem).then(($elements) => {
                const count = $elements.length
                expect(count).to.eq(expectedMethods.length)
                cy.wrap($elements).each(($el, index) => {
                    cy.wrap($el).find(this.methodTextClass).then(($textEl) => {
                        const actualMethod = $textEl.text().trim()
                        const expectedMethod = expectedMethods[index]
                        expect(actualMethod).to.contain(expectedMethod)
                    })
                })
            })
        })
    }

    verifyRouteDetails(route) {
        this.verifyNameProperty(route.name)
        this.verifyServicePropertyValue(route.service.name)
        this.verifyPathUUIDArray(route.paths)
        // Ensure methods is an array
        const methodsArray = Array.isArray(route.methods) ? route.methods : [route.methods]
        this.verifyMethodArray(methodsArray)
    }
}

export const routeDetailDisplayPage = new RouteDetailDisplayPage()