var test = require('selenium-webdriver/testing'),
    chai = require("chai"),
    extend = require('node.extend'),
    webdriver = require("selenium-webdriver"),
    chaiAsPromised = require('chai-as-promised'),
    chaiWebdriver = require('chai-webdriver');

module.exports = function() {
    // cache this object so all the tests can require it and guarantee that it
    // is initialized, but only the first import will actually run the initialization
    // logic.
    if (this.exported) {
        return this;
    }

    require('../app')(true);

    extend(this, test);

    // expose some members on the local scope so we can write helper functions
    // that use them without saving the scope
    var driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.phantomjs()).
        build();
    this.driver = driver;

    var expect = chai.expect;
    this.expect = expect;

    var describe = this.describe;
    var beforeEach = this.beforeEach;
    var it = this.it;

    // set up chai extensions
    chai.use(chaiAsPromised);
    chai.use(chaiWebdriver(driver));

    //variable to use in tests
    var host = 'http://localhost:3002/';
    this.host = host;

    // helper functions
    this.forPage = function(page, doTests) {
        describe('/' + page, function() {
            beforeEach(function() {
                driver.get(host + page);
            });

            doTests();
        });
    };

    this.testTitle = function(expected) {
        it('should have the correct title', function() {
            driver.getTitle().then(function(title) {
                expect(title).to.equal('Pythius | ' + expected);
            });
        })
    };

    this.parseJSONResponse = function(callback) {
        driver.findElement(webdriver.By.tagName("pre")).getInnerHtml().then(function(html) {
            callback(JSON.parse(html));
        });
    };

    this.fullURLForEndpoint = function(endpoint) {
        if (host.endsWith("/") && endpoint.startsWith("/")) {
            // trim off the slash, since our host starts with it
            endpoint = endpoint.substring(1);
        } else if (!(host.endsWith("/") || endpoint.startsWith("/"))) {
            // neither of them have slashes, so add it on to the endpoint
            endpoint = "/" + endpoint;
        }

        return host + endpoint;
    };

    this.expectJSONAndNoErr = function(res){
        this.expect(typeof res).to.equal('object');
        this.expect(res).to.not.have.property("err");
   };

    this.exported = true;
    return this;
};
