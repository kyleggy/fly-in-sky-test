import { gatewayServiceMainPage } from '../../support/pages/gateway_service_main_page'

describe('service gateway grid flow', function() {
    const serviceIDs = []
    const routeIDs = []
    const serviceIDsWithRoutes = [] // Track service IDs that have routes (will be deleted with route)
    let serviceGrids = []
   
    before(function() {
        // Generate a short UUID prefix for this test run
        cy.generateShortUUID().then((namePrefix) => {
            this.namePrefix = namePrefix
            cy.log(`Generated name prefix: ${this.namePrefix}`)
            
            cy.fixture('serviceGrid.json').then(function(serviceGridData) {
                // Add prefix to all service names (first 3 services without routes)
                serviceGrids = serviceGridData.serviceGrid.map((service) => {
                    return {
                        ...service,
                        name: `${this.namePrefix}-${service.name}`
                    }
                })

                cy.log(`About to create ${serviceGrids.length} services without routes`)
                cy.log(`Service names: ${serviceGrids.map(s => s.name).join(', ')}`)

                // Create first 3 services without routes
                cy.wrap(serviceGrids).each((service) => {
                    cy.createService(service).then((response) => {
                        serviceIDs.push(response.body.id)
                        cy.log(`Created service: ${service.name} with ID: ${response.body.id}`)
                    })
                }).then(() => {
                    // After all services are created, create service with route
                    const serviceWithRoute = serviceGridData.serviceWithRoute
                    const serviceData = {
                        ...serviceWithRoute.service,
                        name: `${this.namePrefix}-${serviceWithRoute.service.name}`
                    }
                    
                    cy.log(`Creating service ${serviceData.name} with binding route`)
                    cy.createService(serviceData).then((serviceResponse) => {
                        const serviceId = serviceResponse.body.id
                        serviceIDs.push(serviceId)
                        serviceIDsWithRoutes.push(serviceId) // Track this service as having a route
                        cy.log(`Created service: ${serviceData.name} with ID: ${serviceId}`)
                        
                        // Add this service to serviceGrids array for test cases
                        serviceGrids.push(serviceData)
                        
                        // Create route bound to this service
                        const routeData = {
                            ...serviceWithRoute.route,
                            name: `${this.namePrefix}-route`,
                            service: {
                                id: serviceId
                            }
                        }
                        cy.createRoute(routeData).then((routeResponse) => {
                            routeIDs.push(routeResponse.body.id)
                            cy.log(`Created route: ${routeData.name} with ID: ${routeResponse.body.id}`)
                        })
                    })
                })
            })
        })
    })

    beforeEach(function() {
        gatewayServiceMainPage.navigateToGatewayServiceMainPage();
    })

    after(function() {
        cy.then(() => {
            // Clean up routes first (this will also delete services bound to routes)
            if (routeIDs && routeIDs.length > 0) {
                cy.log(`About to cleanup ${routeIDs.length} route(s) and their bound services`)
                cy.wrap(routeIDs).each((routeId) => {
                    // Get the service ID from the route, then delete route and service
                    cy.deleteRouteAndBindingService(routeId)
                })
            }
            
            // Clean up remaining services (first 3 services without routes)
            // Filter out services that have routes (they're already deleted)
            const servicesToCleanup = serviceIDs.filter(id => !serviceIDsWithRoutes.includes(id))
            if (servicesToCleanup && servicesToCleanup.length > 0) {
                cy.log(`About to cleanup ${servicesToCleanup.length} service(s) without routes`)
                cy.cleanupServices(servicesToCleanup)
            }
        })
    })

    it('filter by fullname should display the correct services', function() {
        const serviceName = serviceGrids[0].name;
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(serviceName);
        gatewayServiceMainPage.verifyRowCountInGrid(1);
        gatewayServiceMainPage.verifyRowNameInGrid(serviceName);
    })

    it('filter by contain name should display the correct services', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.verifyRowCountInGrid(4);
        gatewayServiceMainPage.verifyRowCountAndNameStartsWithInGrid(this.namePrefix, 4);
    })

    it('filter by contain name and protocol should display the correct services', function() {
        const protocol = 'http';
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByNameAndProtocol(this.namePrefix, protocol);
        gatewayServiceMainPage.verifyRowCountInGrid(2);
        gatewayServiceMainPage.verifyRowCountAndProtocolInGrid(this.namePrefix, protocol, 2);
    })

    it('order by name should display the correct order of services', function() {
        const serviceNames = serviceGrids.map(service => service.name)
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.orderByByName();
        gatewayServiceMainPage.verifyRowCountInGrid(4);
        gatewayServiceMainPage.verifyOrderByByName(serviceNames);
    })

    it('should disable a service successfully from grid', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.verifyToggleUncheckedAfterDisableService(serviceGrids[1].name);
    })

    it('should delete a service successfully from grid', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.deleteService(serviceGrids[0].name);
        gatewayServiceMainPage.verifyRowCountStartsWithInGrid(this.namePrefix, 3);
    })

    it('should not allow to delete a service binding with route from grid', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.verifyServiceBindWithRouteNotAllowedDelete(serviceGrids[3].name);
    })

})