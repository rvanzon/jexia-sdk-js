import Promise from 'bluebird';
import Auth from './Auth.js';
import Dataset from './Dataset.js';
import RealtimeClient from './RealtimeClient.js';
import Bus from './Bus.js';

/**
 * JexiaClient is the main client for our library
 */
export default class JexiaClient {
    constructor(options) {
        if(!options) throw new Error('Error constructing JexiaClient: Not enought params');

        /** @type {string} */
        this.appId = options.appId;

        /** @type {string} */
        this.appKey = options.appKey;

        /** @type {string} */
        this.appSecret = options.appSecret;

        if (!this.appId || !this.appKey || !this.appSecret) {
            throw new Error('Please provide your jexia app id, app key and app secret');
        }

        // We ask JEXIA for a token and then we initialize evetything
        return new Promise( (resolve,reject) => {
            // Assign event bus
            this.bus = Bus;

            // Assign auth
            this.auth = new Auth({
                url: 'http://' + this.appId + '.app.jexia.com/',
                key: this.appKey,
                secret: this.appSecret,
                client: this
            });

            // Get the token and proceed
            this.auth.init().then( auth => {

                // Assign app info
                this.app = {
                    id: this.appId,
                    key: this.appKey,
                    secret: this.appSecret
                };

                // Assign realtime client
                this.rtc = new RealtimeClient({
                    url: 'http://rtc.jexia.com/rtc',
                    token: auth.token,
                    bus: this.bus
                });

                // Assign dataset
                this.dataset = (name) => {
                    return new Dataset(name, this);
                }

                // Everything ok
                resolve(this);
            },
            (error) => {
                throw new Error(error);
            });
        });
    }
}
