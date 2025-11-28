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
        //While there is no route, the empty state button will be shown. we have to wait for 2 seconds 
        // since jquery $mainContent.find does not wait for the element to be found.
        cy.get('div[class="main-content"]').wait(2000).then(($mainContent) => {
            if ($mainContent.find(this.emptyRouteState).length > 0) {
                cy.get(this.createNewEmptyRouteButton).click()
            } else {
                cy.get(this.createNewRouteFromToolbarButton).click()
            }
        })
    }
}

export const routeMainPage = new RouteMainPage()