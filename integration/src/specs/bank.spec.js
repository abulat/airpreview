const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const generate = require('../data/generator');
const config = require('../config.json');

chai.use(chaiHttp);

describe('Bank >', () => {
    const endpointBankPath = '/bank';
    const bankServerUrl = `${config.environments[global.env]}`;

    describe('Generic validations >', () => {
        // Strict schema validation is missing. Requests with extra payload properties should be rejected. 
        it('should return an error on sending request with extra (not supported) properties', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('US'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'US', 'BJ'),
                aba: generate.aba(),
                test: {test: ''}
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                })
        });

        it('should return an error on sending request with empty payload', (done) => {
            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                })
        });

        it('should return an error on sending request without payload', (done) => {
            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                })
        });

        it('should NOT allow to save data from unknown country', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('BY'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'BY', 'BJ'),
                aba: generate.aba()
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error').contain('should be one of \'US\', \'AU\', or \'CN\'');

                    done();
                })
        });

        it('should NOT allow to save data without the payment_method', (done) => {
            const payload = {
                bank_country_code: generate.bankCountryCode('US'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'US', 'BJ'),
                aba: generate.aba()
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error').eql('\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\'');

                    done();
                })
        });

        it('should NOT allow to save data without the account_name', (done) => {
            const country = 'US';
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode(country),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'CN', 'BJ'),
                aba: generate.aba()
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error').eql('\'account_name\' is required');

                    done();
                })
        })

        describe('SWIFT validation > ', () => {
            it('should save valid local bank details without swift code', (done) => {
                const payload = {
                    payment_method: generate.paymentMethod('local'),
                    bank_country_code: generate.bankCountryCode('US'),
                    account_name: generate.accountName(10),
                    account_number: generate.accountNumber({country: 'US'}),
                    aba: generate.aba()
                };

                chai.request(bankServerUrl)
                    .post(endpointBankPath)
                    .send(payload)
                    .end((err, res) => {
                        res.should.have.status(200)

                        done();
                    })
            });

            it('should NOT allow to save, if the swift code (8) is not valid for the given bank country code', (done) => {
                const country = 'US';
                const payload = {
                    payment_method: generate.paymentMethod('swift'),
                    bank_country_code: generate.bankCountryCode(country),
                    account_name: generate.accountName(10),
                    account_number: generate.accountNumber({country: 'US'}),
                    swift_code: generate.swiftCode('ICBC', 'CN', 'BJ'),
                    aba: generate.aba()
                }

                chai.request(bankServerUrl)
                    .post(endpointBankPath)
                    .send(payload)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.have.property('error').eql(`The swift code is not valid for the given bank country code: ${country}`);

                        done();
                    })
            })

            it('should NOT allow to save, if the swift code (11) is not valid for the given bank country code', (done) => {
                const country = 'US';
                const payload = {
                    payment_method: generate.paymentMethod('swift'),
                    bank_country_code: generate.bankCountryCode(country),
                    account_name: generate.accountName(10),
                    account_number: generate.accountNumber({country: 'US'}),
                    swift_code: generate.swiftCode('ICBC', 'CN', 'BJ', 'XXX'),
                    aba: generate.aba()
                }

                chai.request(bankServerUrl)
                    .post(endpointBankPath)
                    .send(payload)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.have.property('error').eql(`The swift code is not valid for the given bank country code: ${country}`);

                        done();
                    })
            })

            it('should NOT post with too short swift code', (done) => {
                const payload = {
                    payment_method: generate.paymentMethod('swift'),
                    bank_country_code: generate.bankCountryCode('US'),
                    account_name: generate.accountName(10),
                    account_number: generate.accountNumber({country: 'US'}),
                    swift_code: generate.swiftCode('IC', 'US', 'BJ'),
                    aba: generate.aba()
                }

                chai.request(bankServerUrl)
                    .post(endpointBankPath)
                    .send(payload)
                    .end((err, res) => {
                        res.should.have.status(400)
                        res.body.should.have.property('error').eql('Length of \'swift_code\' should be either 8 or 11');

                        done();
                    })
            });

            it('should NOT allow to save, if the swift code is not provided', (done) => {
                const payload = {
                    payment_method: generate.paymentMethod('swift'),
                    bank_country_code: generate.bankCountryCode('US'),
                    account_name: generate.accountName(10),
                    account_number: generate.accountNumber({country: 'US'}),
                    aba: generate.aba()
                }

                chai.request(bankServerUrl)
                    .post(endpointBankPath)
                    .send(payload)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.have.property('error').eql('\'swift_code\' is required when payment method is \'SWIFT\'');

                        done();
                    })
            })
        })
    })

    describe('US specific >', () => {
        it('should save valid US swift bank details', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('US'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'US', 'BJ'),
                aba: generate.aba()
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(200)

                    done();
                })
        });

        // Test fails due to the bug. Endpoint allows to save data without providing 'aba' property.
        // According to the specification abd is "mandatory when bank country is US"
        it('should NOT save US bank details without aba', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('US'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'US', 'BJ'),
            };

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                })
        });

        it('should NOT save US bank details with aba longer than 9 chars', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('US'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'US'}),
                swift_code: generate.swiftCode('ICBC', 'US', 'BJ'),
                aba: generate.aba(15)
            };

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error').eql('Length of \'aba\' should be 9');

                    done();
                })
        });
    })

    describe('AU specific >', () => {
        it('should save valid AU bank details', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('AU'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'AU'}),
                swift_code: generate.swiftCode('ICBC', 'AU', 'BJ', 'XXX'),
                bsb: generate.bsb()
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(200)

                    done();
                })
        });

        it('should NOT save AU bank details without bsb', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('AU'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'AU'}),
                swift_code: generate.swiftCode('ICBC', 'AU', 'BJ', 'XXX'),
            }

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error').eql('\'bsb\' is required when bank country code is \'AU\'');

                    done();
                })
        });
    });

    describe('CN specific >', () => {
        // Test fails due to a wrong validation of the account_number property.
        // The following response message received:
        // Length of account_number should be between 7 and 11 when bank_country_code is 'US'
        // According ot the specification: "for CN, account number is 8-20 character long, can be any character"
        it('should save valid CN bank details', (done) => {
            const payload = {
                payment_method: generate.paymentMethod('swift'),
                bank_country_code: generate.bankCountryCode('CN'),
                account_name: generate.accountName(10),
                account_number: generate.accountNumber({country: 'CN'}),
                swift_code: generate.swiftCode('ICBC', 'CN', 'BJ', 'XXX'),
            };

            chai.request(bankServerUrl)
                .post(endpointBankPath)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(200)

                    done();
                })
        });
    });
});
