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
 * Create a route via POST request
 * @param {object} routeData - The route data to create
 * @returns {Cypress.Chainable} The response object
 */
Cypress.Commands.add('createRoute', (routeData) => {
    cy.log(`Creating route: ${routeData.name || 'unnamed route'}`)
    return cy.fixture('server.json').then((server) => {
        const routesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/routes`
        return cy.request({
            method: 'POST',
            url: routesAPIURL,
            body: routeData,
            failOnStatusCode: false
        }).then((response) => {
            // Verify status without changing the chain
            if (response.status !== 201) {
                throw new Error(`Expected status 201 but got ${response.status}. Response: ${JSON.stringify(response.body)}`)
            }
            cy.log(`Successfully created route: ${routeData.name || 'unnamed route'}`)
            // Return the response wrapped in a chainable object to sync/async conflicts error
            return cy.wrap(response)
        })
    })
})

/**
 * Delete a single route by ID
 * @param {string} routeId - The route ID to delete
 * @returns {Cypress.Chainable} The response object with success status
 */
Cypress.Commands.add('deleteRoute', (routeId) => {
    cy.log(`Destroying route ID: ${routeId}`)
    return cy.fixture('server.json').then((server) => {
        const routesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/routes/${routeId}`
        return cy.request({
            method: 'DELETE',
            url: routesAPIURL,
            failOnStatusCode: false
        }).then((response) => {
            if (response.status === 204) {
                cy.log(`Successfully deleted route ID: ${routeId}`)
                return cy.wrap({ success: true, status: response.status })
            } else if (response.status === 404) {
                cy.log(`Route ID ${routeId} not found (already deleted or doesn't exist)`)
                return cy.wrap({ success: false, status: response.status })
            } else {
                cy.log(`Unexpected status ${response.status} when deleting route ID: ${routeId}`)
                return cy.wrap({ success: false, status: response.status })
            }
        })
    })
})

/**
 * Delete a route first, then delete the associated service if route deletion succeeds
 * @param {string} routeId - The route ID to delete
 * @param {string} serviceId - The service ID to delete after route is deleted
 * @example cy.deleteRouteAndService('route-id', 'service-id')
 */
Cypress.Commands.add('deleteRouteAndService', (routeId, serviceId) => {
    cy.log(`Deleting route ${routeId} and then service ${serviceId}`)
    cy.deleteRoute(routeId).then((result) => {
        if (result.success) {
            cy.log(`Route deleted successfully, now deleting service ${serviceId}`)
            cy.deleteService(serviceId)
        } else {
            cy.log(`Route deletion failed (status: ${result.status}), skipping service deletion`)
        }
    })
})

/**
 * Get route details and delete route first, then delete the associated service if route deletion succeeds
 * Automatically retrieves the service ID from the route
 * @param {string} routeId - The route ID to delete
 * @example cy.deleteRouteAndBindingService('route-id')
 */
Cypress.Commands.add('deleteRouteAndBindingService', (routeId) => {
    cy.log(`Getting route ${routeId} details to find associated service`)
    cy.fixture('server.json').then((server) => {
        const routesAPIURL = `${server.protocol}://${server.host}:${server.adminPort}/${server.workspace}/routes/${routeId}`
        cy.request({
            method: 'GET',
            url: routesAPIURL,
            failOnStatusCode: false
        }).then((response) => {
            if (response.status === 200 && response.body.service && response.body.service.id) {
                const serviceId = response.body.service.id
                cy.log(`Found service ID ${serviceId} associated with route ${routeId}`)
                cy.deleteRouteAndService(routeId, serviceId)
            } else {
                cy.log(`Route ${routeId} not found or has no associated service. Attempting to delete route only.`)
                cy.deleteRoute(routeId)
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