export class RouteDetailDisplayPage {
    constructor() {
        this.routeId = 'div[data-testid="id-copy-uuid"]'
    }

    getRouteId() {
        // Get the UUID text from the nested copy-text element within id-property-value
        return cy.get(this.routeId, { timeout: 10000 }).find('.copy-text.monospace').invoke('text')
    }
}

export const routeDetailDisplayPage = new RouteDetailDisplayPage()    