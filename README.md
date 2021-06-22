# airPreview

Tests for the `/bank` endpoint stored in `integration` folder

## How to run
0. You need to have node v12.8.0 or higher (12.8.0 was used for development)
1. Open the terminal from the `integration` folder and run `npm i`
2. In order to run tests, execute the following commands: 
    * `npm run test -- --env=${specified in the config.json environment: demo|preview}`
    * `npm run test-preview` - runs tests against demo environment 
    * `npm run test-demo` - runs tests against preview environment 
3. Test reports (html and json) will be automatically created in `integration/mochawesome-report` folder


## Notes
### Test Coverage 
2. Tests do not cover all existing data variants but cover received requirements. 
3. Most implemented tests can easily be moved down to the unit test level:
    * tests checking size of fields
    * tests checking data formats
    * etc.

### Discovered issues
1. Strict schema validation is missing. Requests with extra payload properties should be rejected.
2. /bank endpoint allows to save data without providing 'aba' property for US country.
3. Wrong validation of the account_number property for CN country.

NOTE 1: regression tests created (after the bug fixes all tests will have to become automagically green)
NOTE 2: the following improvement can be useful: do not break the payload validation on the first error and provide an array with full list of existing issues 

### Further development:
1. The solution is really simple. In the future it can be transferred to a more mature test 
framework with an advanced data generation, assertion and reporting capabilities depends on 
business needs and priorities. 
