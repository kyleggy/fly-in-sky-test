export class OverviewPage {
    
    constructor() {
        this.workspaceLinkDefault = 'div[data-testid="workspace-link-default"]'
    }

   navigateToOverview() {
    cy.fixture('server.json').then((server) => {
        const baseURL = server.protocol + "://" + server.host + ":" + server.port
        cy.visit(`${baseURL}/default/overview`)
    })
   }

   addGatewayService() {
    cy.get('button[data-testid="action-button"]').click()
   }

   addRouter() {
    cy.get('div[data-testid="onboarding-route-card"] button[data-testid="action-button"]').click()
   }
}

export const overviewPage = new OverviewPage()