export class WorkspacePage {

    constructor() {
        this.workspaceLinkDefault = 'div[data-testid="workspace-link-default"]'
    }

    navigateToWorkspace() {
        cy.fixture('server.json').then((server) => {
            const workspaceBaseURL = server.protocol + "://" + server.host + ":" + server.port + "/workspaces"
            cy.visit(workspaceBaseURL)
        })
    }

    clickDefaultWorkspaceLink() {
        cy.get(this.workspaceLinkDefault).click()
    }
}

export const workspacePage = new WorkspacePage()