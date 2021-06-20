const crypto = require('crypto');
const faker = require('faker');
const paymentMethod = require('./fixtures/payment-method.json');
const bankCountry = require('./fixtures/bank-country-code.json');

module.exports = {
    randomAlphanumericString(length = 10) {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').toUpperCase().substring(0, length);
    },

    randomNumberWithinRange(min, max, decimals) {
        const maxBytes = 6;
        const maxDecimals = 281474976710656;
        const randomBytes = Number.parseInt(crypto.randomBytes(maxBytes).toString('hex'), 16);

        return decimals ? Number((randomBytes / maxDecimals * (max - min + 1) + min).toFixed(decimals)) : Math.floor(randomBytes / maxDecimals * (max - min + 1) + min);
    },

    /**
     *
     * @param {'local'|'swift'} method - payment method
     * @return {string}
     */
    paymentMethod(method = 'local') {
        return paymentMethod[method];
    },

    bankCountryCode(country) {
        return bankCountry[country];
    },

    accountName(maxSize = 2) {
        return faker.name.lastName().substring(0, maxSize);
    },

    accountNumber(opts = {}) {
        let number;
        if (opts.country && !opts.size) {
            switch (opts.country) {
                case 'US':
                    number = this.randomNumberWithinRange(1, 99999999999999999);
                    break;
                case 'AU':
                    number = this.randomNumberWithinRange(6, 999999999);
                    break;
                case 'CN':
                    number = this.randomNumberWithinRange(8, 99999999999999999999);
                    break;
            }
        } else {
            number = this.randomNumberWithinRange(1, opts.size);
        }

        return `${number}`;
    },


    swiftCode(bankCode, bankCountryCode, locationCode, bankBranchCode = '') {
        return `${bankCode}${bankCountryCode}${locationCode}${bankBranchCode}`;
    },

    bsb(maxLength = 6) {
        return this.randomAlphanumericString(maxLength);
    },

    aba(maxLength = 9) {
        return this.randomAlphanumericString(maxLength);
    }
}
