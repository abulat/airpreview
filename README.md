# airPreview

Tests for the `/bank` endpoint stored in `integration` folder

## How to run
0. You nee to have node v12.8.0 or higher (12.8.0 was used for development)
1. Open the terminal from the `integration` folder and run `npm i`
2. In order to run tests, execute the following command: `npm run test` (In the current version tests will be executed against preview env.)
3. Test reports (html and json) will be automatically created in `integration/mochawesome-report` folder


## Notes
### Test Coverage 
2. Tests do not cover all existing data variants, but try to cover all received requirement. 
3. Most implemented tests can easily be moved down to the unit test level:
    * tests checking size of fields
    * tests checking data formats
    * etc.

### Further development:
1. The solution is really simple. In the future it can be transferred to a more mature test 
framework with an advanced data generation, assertion and reporting capabilities depends on 
business needs and priorities. 
