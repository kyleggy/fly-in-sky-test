import { gatewayServiceMainPage } from '../../support/pages/gateway_service_main_page'

describe('service gateway grid flow', function() {
    const serviceIDs = []
   
    before(function() {
        // Generate a short UUID prefix for this test run
        cy.generateShortUUID().then((namePrefix) => {
            this.namePrefix = namePrefix
            cy.log(`Generated name prefix: ${this.namePrefix}`)
            
            cy.fixture('serviceGrid.json').then(function(serviceGridData) {
                // Add prefix to all service names
                this.serviceGrids = serviceGridData.serviceGrid.map((service) => {
                    return {
                        ...service,
                        name: `${this.namePrefix}-${service.name}`
                    }
                })

                cy.log(`About to create ${this.serviceGrids.length} services`)
                cy.log(`Service names: ${this.serviceGrids.map(s => s.name).join(', ')}`)

                // Create all services from the grid (only once for the entire describe block)
                cy.wrap(this.serviceGrids).each((service) => {
                    cy.createService(service).then((response) => {
                        serviceIDs.push(response.body.id)
                        cy.log(`Created service: ${service.name} with ID: ${response.body.id}`)
                    })
                })
            })
        })
    })

    beforeEach(function() {
        // Reconstruct serviceGrids from fixture with prefix for each test to avoid serviceGrid object cannot be found by each test
        cy.fixture('serviceGrid.json').then(function(serviceGridData) {
            if (this.namePrefix) {
                this.serviceGrids = serviceGridData.serviceGrid.map((service) => {
                    return {
                        ...service,
                        name: `${this.namePrefix}-${service.name}`
                    }
                })
            } else {
                this.serviceGrids = serviceGridData.serviceGrid
            }
        })
        gatewayServiceMainPage.navigateToGatewayServiceMainPage();
    })

    after(function() {
        cy.then(() => {
            cy.log(`About to cleanup ${serviceIDs.length} services`)
            cy.cleanupServices(serviceIDs || [])
        })
    })

    it('filter by fullname should display the correct services', function() {
        const serviceName = this.serviceGrids[0].name;
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(serviceName);
        gatewayServiceMainPage.verifyRowCountInGrid(1);
        gatewayServiceMainPage.verifyRowNameInGrid(serviceName);
    })

    it('filter by contain name should display the correct services', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.verifyRowCountInGrid(4);
        gatewayServiceMainPage.verifyRowCountStartsWithInGrid(this.namePrefix, 4);
    })

    it('order by name should display the correct order of services', function() {
        const serviceNames = this.serviceGrids.map(service => service.name)
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.orderByByName();
        gatewayServiceMainPage.verifyRowCountInGrid(4);
        gatewayServiceMainPage.verifyOrderByByName(serviceNames);
    })

    it('should delete a service successfully from grid', function() {
        gatewayServiceMainPage.clickFilterButton();
        gatewayServiceMainPage.setFilterByName(this.namePrefix);
        gatewayServiceMainPage.deleteService(this.serviceGrids[0].name);
        gatewayServiceMainPage.verifyRowCountStartsWithInGrid(this.namePrefix, 3);
    })

})