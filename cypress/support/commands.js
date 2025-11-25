// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Delete a single route by ID
 * @param {string} routeId - The route ID to delete
 */
Cypress.Commands.add('deleteRoute', (routeId) => {
    cy.log(`Destroying route ID: ${routeId}`)
    cy.fixture('server.json').then((server) => {
        const routesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/routes/${routeId}`
        cy.request({
            method: 'DELETE',
            url: routesAPIURL,
            failOnStatusCode: false
        }).then((response) => {
            if (response.status === 204) {
                cy.log(`Successfully deleted route ID: ${routeId}`)
            } else if (response.status === 404) {
                cy.log(`Route ID ${routeId} not found (already deleted or doesn't exist)`)
            } else {
                cy.log(`Unexpected status ${response.status} when deleting route ID: ${routeId}`)
            }
        })
    })
})

/**
 * Create a service via POST request
 * @param {object} serviceData - The service data to create
 * @returns {Cypress.Chainable} The response object
 */
Cypress.Commands.add('createService', (serviceData) => {
    cy.log(`Creating service: ${serviceData.name}`)
    return cy.fixture('server.json').then((server) => {
        const servicesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/services`
        return cy.request({
            method: 'POST',
            url: servicesAPIURL,
            body: serviceData,
            failOnStatusCode: false
        }).then((response) => {
            // Verify status without changing the chain
            if (response.status !== 201) {
                throw new Error(`Expected status 201 but got ${response.status}`)
            }
            cy.log(`Successfully created service: ${serviceData.name}`)
            // Return the response wrapped in a chainable object to sync/async conflicts error
            return cy.wrap(response)
        })
    })
})

/**
 * Delete a single service by ID
 * @param {string} serviceId - The service ID to delete
 */
Cypress.Commands.add('deleteService', (serviceId) => {
    cy.log(`Destroying service ID: ${serviceId}`)
    cy.fixture('server.json').then((server) => {
        const servicesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/services/${serviceId}`
        cy.request({
            method: 'DELETE',
            url: servicesAPIURL,
            failOnStatusCode: false
        }).then((response) => {
            if (response.status === 204) {
                cy.log(`Successfully deleted service ID: ${serviceId}`)
            } else if (response.status === 404) {
                cy.log(`Service ID ${serviceId} not found (already deleted or doesn't exist)`)
            } else {
                cy.log(`Unexpected status ${response.status} when deleting service ID: ${serviceId}`)
            }
        })
    })
})

/**
 * Clean up multiple routes
 * @param {string[]} routeIDs - Array of route IDs to delete
 */
Cypress.Commands.add('cleanupRoutes', (routeIDs) => {
    if (routeIDs && routeIDs.length > 0) {
        cy.log(`Cleaning up ${routeIDs.length} route(s)`)
        cy.wrap(routeIDs).each((id) => {
            cy.deleteRoute(id)
        })
    }
})

/**
 * Clean up multiple services
 * @param {string[]} serviceIDs - Array of service IDs to delete
 */
Cypress.Commands.add('cleanupServices', (serviceIDs) => {
    if (serviceIDs && serviceIDs.length > 0) {
        cy.log(`Cleaning up ${serviceIDs.length} service(s)`)
        cy.wrap(serviceIDs).each((id) => {
            cy.deleteService(id)
        })
    }
})

/**
 * Get text content from an element
 * @example cy.get('div').getText()
 */
Cypress.Commands.add('getText', { prevSubject: 'element' }, ($element) => {
    cy.wrap($element).scrollIntoView()
    return cy.wrap($element).invoke('text')
})

/**
 * Generate a short UUID (8 characters)
 * @returns {string} A short random UUID string
 * @example cy.generateShortUUID().then((uuid) => { ... })
 */
Cypress.Commands.add('generateShortUUID', () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return cy.wrap(result)
})