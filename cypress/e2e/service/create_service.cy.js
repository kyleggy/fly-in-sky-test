import { newGatewayServicePage } from '../../support/pages/new_gateway_service_page'
import { gatewayServiceMainPage } from '../../support/pages/gateway_service_main_page'
import { serviceDetailDisplayPage } from '../../support/pages/service_detail_display_page'

describe('create gateway service flow', function() {    
    const serviceIDs = []

    before(function() {
        // Generate a short UUID prefix for this test run
        cy.generateShortUUID().then((namePrefix) => {
            this.namePrefix = namePrefix
        })
    })

    beforeEach(function() {
        cy.fixture('service.json').then((serviceData) => {
            // Create service object with prefixed names
            this.service = {
                serviceFullURL: {
                    ...serviceData.serviceFullURL,
                    name: `${this.namePrefix}-${serviceData.serviceFullURL.name}`
                },
                serviceManual: {
                    ...serviceData.serviceManual,
                    name: `${this.namePrefix}-${serviceData.serviceManual.name}`
                }
            }
        })
    })

    after(function() {
        cy.then(() => {
            cy.cleanupServices(serviceIDs || [])
        })
    })

    it('should create a service from full URL', function() {
        gatewayServiceMainPage.navigateToGatewayServiceMainPage()
        gatewayServiceMainPage.clickCreateNewGatewayService()
        newGatewayServicePage.createNewGatewayServiceFromFullURL(this.service.serviceFullURL.url, this.service.serviceFullURL.name)
        return serviceDetailDisplayPage.getServiceId().then((serviceId) => {
            serviceIDs.push(serviceId)
            cy.log(`Stored service ID from full URL: ${serviceId}`)
        })
    })

    it('should create a service from manual configuration', function() {
        gatewayServiceMainPage.navigateToGatewayServiceMainPage()
        gatewayServiceMainPage.clickCreateNewGatewayService()
        newGatewayServicePage.createNewGatewayServiceFromManualConfiguration(this.service.serviceManual.protocol, this.service.serviceManual.host, this.service.serviceManual.path, this.service.serviceManual.port, this.service.serviceManual.name)
        return serviceDetailDisplayPage.getServiceId().then((serviceId) => {
            serviceDetailDisplayPage.verifyServiceDetails(this.service.serviceManual)
            serviceIDs.push(serviceId)
            cy.log(`Stored service ID from manual configuration: ${serviceId}`)
        })
    })

   it('should not allow duplicate service name', function() {
    gatewayServiceMainPage.navigateToGatewayServiceMainPage()
    gatewayServiceMainPage.clickCreateNewGatewayService()
    newGatewayServicePage.createNewGatewayServiceFromFullURLWithoutVerify(this.service.serviceFullURL.url, this.service.serviceFullURL.name)
    newGatewayServicePage.verifyServiceCreationError(this.service.serviceFullURL.name)
   })

})