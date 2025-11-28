import { routeMainPage } from '../../support/pages/route_main_page'
import { newRoutePage } from '../../support/pages/new_route_page'
import { routeDetailDisplayPage } from '../../support/pages/route_detail_page'

describe('Route Flow', function() {
    const serviceIDs = []
    const routeIDs = []
    let route = {}

    before(function() {
        cy.generateShortUUID().then((namePrefix) => {
            this.namePrefix = namePrefix
            cy.log(`Generated name prefix: ${this.namePrefix}`)
            
            cy.fixture('route.json').then((routeData) => {
                const serviceData = {
                    ...routeData.service,
                    name: `${this.namePrefix}-${routeData.service.name}`
                }
                
                cy.createService(serviceData).then((serviceResponse) => {
                    const serviceId = serviceResponse.body.id
                    serviceIDs.push(serviceId)
                    cy.log(`Created service: ${serviceData.name} with ID: ${serviceId}`)
                    
                    // Prepare route objects with prefixed names for use in tests
                    route = {
                        service: {
                            ...serviceData,
                            id: serviceId
                        },
                        routes: routeData.routes.map((route) => ({
                            name: `${this.namePrefix}-${route.name}`,
                            path: route.path,
                            method: route.method,
                            stripPath: route.stripPath,
                            tags: route.tags,
                            service: {
                                id: serviceId,
                                name: serviceData.name
                            },
                            
                        }))
                    }
                })
            })
        })
    })

    beforeEach(function() {
        // Helper function to verify a route with retry logic - available to all tests
        this.verifyRoute = function(route, path, routeIndex, server, timeout = 30000) {
            const routeURL = `${server.protocol}://${server.host}:${server.serverPort}${path}`
            cy.log(`Testing route ${routeIndex + 1}: ${routeURL}`)
            
            const startTime = Date.now()
            const retryRequest = () => {
                const elapsedTime = Date.now() - startTime
                if (elapsedTime >= timeout) {
                    throw new Error(`Route ${routeIndex + 1} (${route.name}) did not succeed within ${timeout}ms`)
                }
                
                cy.request({
                    method: route.method,
                    url: routeURL,
                    failOnStatusCode: false,
                    timeout: 6000
                }).then((response) => {
                    // Check if response exists and has status property
                    // With failOnStatusCode: false, Cypress should always return a response object
                    // but check for edge cases
                    if (!response || (response.status === undefined && response.statusCode === undefined)) {
                        // Network error or no response - retry if within timeout
                        if (Date.now() - startTime < timeout) {
                            cy.log(`Route ${routeIndex + 1} (${route.name}) request failed, retrying...`)
                            cy.wait(1000, { log: true })
                            retryRequest()
                        } else {
                            throw new Error(`Route ${routeIndex + 1} (${route.name}) failed after ${timeout}ms - no response received`)
                        }
                    } else {
                        const status = response.status || response.statusCode || 0
                        if (status === 200) {
                            expect(status).to.eq(200)
                            cy.log(`Route ${routeIndex + 1} (${route.name}) is working correctly`)
                        } else if (Date.now() - startTime < timeout) {
                            cy.log(`Route ${routeIndex + 1} (${route.name}) returned status ${status}, retrying...`)
                            cy.wait(1000, { log: true }) // Wait 1 second before retrying
                            retryRequest()
                        } else {
                            throw new Error(`Route ${routeIndex + 1} (${route.name}) did not return 200 within ${timeout}ms. Last status: ${status}`)
                        }
                    }
                })
            }
            retryRequest()
        }
        
        // Helper function to create a route - available to all tests
        this.createRoute = function(routeData) {
            routeMainPage.navigateToRouteMainPage()
            routeMainPage.clickCreateNewRoute()
            newRoutePage.createNewBasicRoute(
                routeData.name,
                routeData.service.name,
                routeData.tags,
                routeData.path,
                routeData.method
            )
            routeDetailDisplayPage.getRouteId().then((routeId) => {
                routeIDs.push(routeId)
                cy.log(`Stored route ID: ${routeId}`)
            })
        }
    })

    after(function() {
        cy.then(() => {
            // Clean up routes first
            if (routeIDs && routeIDs.length > 0) {
                cy.log(`About to cleanup ${routeIDs.length} route(s) and their bound services`)
                cy.wrap(routeIDs).each((routeId) => {
                    cy.deleteRoute(routeId)
                })
            }
            
            if (serviceIDs && serviceIDs.length > 0) {
                cy.log(`About to cleanup ${serviceIDs.length} service(s)`)
                cy.cleanupServices(serviceIDs)
            }
        })
    })

    it('should create first route bound to service successfully', function() {
        this.createRoute(route.routes[0])
    })

    it('should create second route bound to service successfully', function() {
        this.createRoute(route.routes[1])
    })

    it('should verify both routes work correctly via REST calls', function() {
        cy.fixture('server.json').then((server) => {
            this.verifyRoute(route.routes[0], route.routes[0].path, 0, server)
            this.verifyRoute(route.routes[1], route.routes[1].path, 1, server)
        })
    })

    it('should create one route containing 2 paths', function() {
        routeMainPage.navigateToRouteMainPage()
        routeMainPage.clickCreateNewRoute()
        newRoutePage.createNewAdvancedRoute(
            route.routes[2].name,
            route.routes[2].service.name,
            route.routes[2].tags,
            route.routes[2].path,
            route.routes[2].method
        )
        routeDetailDisplayPage.getRouteId().then((routeId) => {
            routeIDs.push(routeId)
            cy.log(`Stored route ID: ${routeId}`)
        })
      
    })

    it('should verify both paths in one route work correctly', function() {
        // Skip this test when running in CI
        // Check Cypress environment variable set from process.env.CI
        if (Cypress.env('CI')) {
            cy.log('Skipping test in CI environment')
            this.skip()
            return
        }
        
        cy.fixture('server.json').then((server) => {
            this.verifyRoute(route.routes[2], route.routes[2].path[0], 2, server)
            this.verifyRoute(route.routes[2], route.routes[2].path[1], 2, server)
        })
    })

})