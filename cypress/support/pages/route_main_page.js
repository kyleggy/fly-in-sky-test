export class RouteMainPage {
    constructor() {
        this.routeGridRow = 'tbody tr[data-testid]:not([data-testid=""])'
        this.createNewEmptyRouteButton = 'a[data-testid="empty-state-action"][type="button"]'
        this.createNewRouteFromToolbarButton = 'a[data-testid="toolbar-add-route"][type="button"]'
        this.emptyRouteState = 'div[data-testid="table-empty-state"]'
    }

    navigateToRouteMainPage() {
        return cy.fixture('server.json').then((server) => {
            const routeMainPageURL = server.protocol + "://" + server.host + ":" + server.port + "/" + server.workspace + "/routes"
            return cy.visit(routeMainPageURL)
        })
    }

    clickCreateNewRoute() {
        cy.get('div[class="main-content"]').within(() => {
            cy.getRoutes().then((response) => {
                if (response.body.data && response.body.data.length === 0) {
                    // No routes exist, click the empty state button
                    cy.get(this.createNewEmptyRouteButton).click()
                } else {
                    // Routes exist, click the toolbar button
                    cy.get(this.createNewRouteFromToolbarButton).click()
                }
            })
        })
    }
}

export const routeMainPage = new RouteMainPage()