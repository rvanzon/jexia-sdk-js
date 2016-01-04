import request from 'request';
import Promise from 'bluebird';

/**
 * Managing the session between jexia-sdk-js and Jexia.
 */
export default class Auth {

    /**
     * Create a new Auth object with some initial values.
     * @param {Object} options - Initial options object
     * @param {string} options.url - Authentication app url
     * @param {string} options.key - Authentication app key
     * @param {string} options.secret - Authentication app secret
     * @param {Object} options.client - {@link JexiaClient}
     */
    constructor(options) {
        if( !options ) {
            throw new Error('Auth needs some params');
        }

        /** @type {string} */
        this.url = options.url;

        /** @type {string} */
        this.key = options.key;

        /** @type {string} */
        this.secret = options.secret;

        /** @type {Object} */
        this.client = options.client;

        /** @type {Object} */
        this.bus = options.client.bus;

        /** @type {string} */
        this.token = '';

        /** @type {string} */
        this.refreshToken = '';

        // 1 hour and 50 minutes; JEXIA token expires in 2 hours
        this.autoRefresh(1000 * 60 * 110);
    }

    /**
     * Initialize a new session between jexia-sdk-js and Jexia
     * @return {Promise<Auth, Error>}
     */
    init() {
        return new Promise((resolve, reject) => {
            request({
                url: this.url,
                qs: {},
                rejectUnauthorized: false,
                method: 'POST',
                json: {
                    key: this.key,
                    secret: this.secret
                }
            }, (error, response, body) => {
                if(error) {
                    reject(error);
                } else {
                    if(body && body.message) {
                        reject(body.message);
                    }
                    this.setToken(body.token);
                    this.setRefreshToken(body.refresh_token);

                    resolve(this);
                }
            });
        });
    }

    /**
     * Get current token
     * @return {string} Current token
     */
    getToken() {
        return this.token;
    }

    /**
     * Get current refresh token
     * @return {string} Current refresh token
     */
    getRefreshToken() {
        return this.refreshToken;
    }

    /**
     * Set current token
     * @param {string} token - the new token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Set current refresh token
     * @param {string} refreshToken - the new token
     */
    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Refresh the session after a given time delay
     * @param {number} delay - delay in milliseconds
     * @emits {jexia.auth.token} emit an authentication event when we successfully refreshed the session with Jexia
     */
    autoRefresh(delay) {
        setInterval( () => {
            request({
                url: this.url,
                qs: {},
                rejectUnauthorized: false,
                method: 'PATCH',
                json: {
                    refresh_token: this.refreshToken
                },
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            }, (error, response, body) => {
                if(error) {
                    throw new Error(error);
                }
                // Set new tokens
                this.setToken(body.token);
                this.setRefreshToken(body.refresh_token);

                // Inform the bus that we have a new token
                this.bus.emit('jexia.auth.token', {
                    token: this.getToken(),
                    refreshToken: this.getRefreshToken()
                });
            });
        }, delay);
    }
}
