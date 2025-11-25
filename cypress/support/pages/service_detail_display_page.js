export class ServiceDetailDisplayPage {
    constructor() {
        this.serviceId = 'div[data-testid="id-property-value"]'
        this.serviceName = 'div[data-testid="name-plain-text"]'
        this.enabled = 'div[data-testid="enabled-property-value"]'
        this.protocol = 'div[data-testid="protocol-plain-text"]'
        this.host = 'div[data-testid="host-plain-text"]'
        this.port = 'div[data-testid="port-plain-text"]'
        this.path = 'div[data-testid="path-plain-text"]'
    }

    getServiceId() {
        return cy.get(this.serviceId, { timeout: 10000 }).find('.copy-text.monospace').invoke('text')
    }

    getServiceName() {
        return cy.get(this.serviceName).getText()
    }

    getEnabled() {
        return cy.get(this.enabled).getText()
    }

    getHost() {
        return cy.get(this.host).getText()
    }

    getProtocol() {
        return cy.get(this.protocol).getText()
    }

    getPort() {
        return cy.get(this.port).getText()
    }

    getPath() {
        return cy.get(this.path).getText()
    }

    verifyServiceDetails(service) {
        this.getServiceName().should('eq', service.name)
        this.getEnabled().should('eq', service.enabled ? 'Enabled' : 'Disabled')
        this.getProtocol().should('eq', service.protocol)
        this.getHost().should('eq', service.host)
        this.getPort().should('eq', service.port)
        this.getPath().should('eq', service.path)
    }

}

export const serviceDetailDisplayPage = new ServiceDetailDisplayPage()    