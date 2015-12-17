import request from 'request';
import Promise from 'bluebird';

/**
 * Authorization
 */
export default class Auth {
    constructor(options) {
        if( !options ) {
            throw new Error('Auth needs some params');
        }

        this.url = options.url;
        this.key = options.key;
        this.secret = options.secret;
        this.client = options.client;
        this.bus = options.client.bus;

        this.token = '';
        this.refreshToken = '';

        // 1 hour and 50 minutes; JEXIA token expires in 2 hours
        this.autoRefresh(1000 * 60 * 110);
    }

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

    getToken() {
        return this.token;
    }

    getRefreshToken() {
        return this.refreshToken;
    }

    setToken(token) {
        this.token = token;
    }

    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }

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
