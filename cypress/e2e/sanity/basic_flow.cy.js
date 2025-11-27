import { workspacePage } from "../../support/pages/workspace_page"
import { overviewPage } from "../../support/pages/overview_page"
import { newGatewayServicePage } from "../../support/pages/new_gateway_service_page"
import { newRoutePage } from "../../support/pages/new_route_page"
import { routeDetailDisplayPage } from "../../support/pages/route_detail_page"
import { serviceDetailDisplayPage } from "../../support/pages/service_detail_display_page"
import { gatewayServiceMainPage } from "../../support/pages/gateway_service_main_page"
import { routeMainPage } from "../../support/pages/route_main_page"

describe('basic flow', function() {
    const routeIDs = []
    const serviceIDs = []

    before(function() {
        // Generate a short UUID prefix for this test run
        cy.generateShortUUID().then((namePrefix) => {
            this.namePrefix = namePrefix
        })
    })

    beforeEach(function() {
        cy.fixture('sanity.json').then((sanityData) => {
            // Create sanity object with prefixed names
            this.sanity = {
                service: {
                    ...sanityData.service,
                    name: `${this.namePrefix}-${sanityData.service.name}`
                },
                route: {
                    ...sanityData.route,
                    name: `${this.namePrefix}-${sanityData.route.name}`,
                    service: `${this.namePrefix}-${sanityData.route.service}`
                }
            }
        })
    })

    after(function() {
        cy.then(() => {
            cy.cleanupRoutes(routeIDs || []).then(() => {
                cy.cleanupServices(serviceIDs || [])
            })
        })
    })

    it('should add a gateway service', function() {
        //workspacePage.navigateToWorkspace()
        //workspacePage.clickDefaultWorkspaceLink()
        //overviewPage.addGatewayService()
        gatewayServiceMainPage.navigateToGatewayServiceMainPage()
        gatewayServiceMainPage.clickCreateNewGatewayService()
        newGatewayServicePage.createNewGatewayServiceFromFullURL(this.sanity.service.url, this.sanity.service.name)
        return serviceDetailDisplayPage.getServiceId().then((serviceId) => {
            serviceIDs.push(serviceId)
            cy.log(`Stored service ID: ${serviceId}`)
        })
    })

    it('should add a router', function() {
        //overviewPage.navigateToOverview()
        //overviewPage.addRouter()
        routeMainPage.navigateToRouteMainPage()
        routeMainPage.clickCreateNewRoute()
        newRoutePage.createNewBasicRoute(
            this.sanity.route.name,
            this.sanity.route.service,
            this.sanity.route.tags,
            this.sanity.route.path,
            this.sanity.route.method
        )
        return routeDetailDisplayPage.getRouteId().then((routeId) => {
            routeIDs.push(routeId)
            cy.log(`Stored route ID: ${routeId}`)
        })
    })

    it('should verify the route is working', function() {
        cy.fixture('server.json').then((server) => {
            const serviceURL = server.protocol + "://" + server.host + ":" + server.serverPort + this.sanity.route.path;
            cy.log(serviceURL)
            
            const startTime = Date.now()
            const timeout = 15000 // 15 seconds
            
            const retryRequest = () => {
                cy.request({
                    method: 'GET',
                    url: serviceURL,
                    failOnStatusCode: false,
                    timeout: timeout
                }).then((response) => {
                    if (response.status === 200) {
                        expect(response.status).to.eq(200)
                        // Verify response contains expected Bing content
                        const responseText = response.body.toString().toLowerCase()
                        expect(responseText).to.include('bing')
                    } else if (Date.now() - startTime < timeout) {
                        cy.wait(1000, { log: false }) // Wait 1 second before retrying
                        retryRequest()
                    } else {
                        throw new Error(`Request did not return 200 within ${timeout}ms. Last status: ${response.status}`)
                    }
                })
            }
        
            retryRequest()
        })
    })


})