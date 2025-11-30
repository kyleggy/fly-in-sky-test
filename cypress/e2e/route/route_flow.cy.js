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
            // Return the chainable so it can be used with .then()
            let storedRouteId
            return routeDetailDisplayPage.getRouteId().then((routeId) => {
                storedRouteId = routeId
                routeIDs.push(routeId)
                cy.log(`Stored route ID: ${routeId}`)
            }).then(() => {
                // Wrap the routeId in cy.wrap() after cy.log() completes
                return cy.wrap(storedRouteId)
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
        this.createRoute(route.routes[0]).then((routeIDs) => {
            cy.log(`Route IDs: ${routeIDs}`)
            routeDetailDisplayPage.verifyRouteDetails(route.routes[0])
        })
    })

    it('should create second route bound to service successfully', function() {
        this.createRoute(route.routes[1]).then((routeIDs) => {
            cy.log(`Route IDs: ${routeIDs}`)
            routeDetailDisplayPage.verifyRouteDetails(route.routes[1])
        })
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
        }).then((routeIDs) => {
            cy.log(`Route IDs: ${routeIDs}`)
            routeDetailDisplayPage.verifyRouteDetails(route.routes[2])
           
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
            // Get the routeId for the route with 2 paths (should be at index 2 in routeIDs)
            const routeId = routeIDs[2] // Route with 2 paths is the third route created
            cy.log(`Verifying Kong Gateway readiness for route ID: ${routeId}`)
            
            // Wait for Kong Gateway to be ready - verify route exists via Admin API with retry logic
            const startTime = Date.now()
            const timeout = 30000 // 30 seconds timeout
            const maxAttempts = 10
            let attemptCount = 0
            
            const retryRequest = () => {
                const elapsedTime = Date.now() - startTime
                attemptCount++
                
                if (elapsedTime >= timeout || attemptCount > maxAttempts) {
                    cy.log(`Warning: Route readiness check timeout/failed after ${attemptCount} attempts, proceeding anyway`)
                    return
                }
                
                cy.request({
                    url: `${server.protocol}://${server.host}:${server.adminPort}/routes/${routeId}`,
                    failOnStatusCode: false
                }).then((response) => {
                    if (response.status === 200) {
                        cy.log(`Kong Gateway route is ready (attempt ${attemptCount}), proceeding with path verification`)
                        expect(response.body.paths).to.include(route.routes[2].path[0])
                        expect(response.body.paths).to.include(route.routes[2].path[1])
                    } else if (Date.now() - startTime < timeout && attemptCount < maxAttempts) {
                        cy.log(`Route readiness check attempt ${attemptCount}/${maxAttempts} returned status ${response.status}, retrying...`)
                        cy.wait(1000, { log: true })
                        retryRequest()
                    } else {
                        cy.log(`Warning: Route readiness check failed after ${attemptCount} attempts (status ${response.status}), proceeding anyway`)
                    }
                })
            }
            
            retryRequest()
            
            // Proceed with path verification after readiness check
            cy.then(() => {
                this.verifyRoute(route.routes[2], route.routes[2].path[0], 2, server)
                this.verifyRoute(route.routes[2], route.routes[2].path[1], 2, server)
            })
        })
    })

})