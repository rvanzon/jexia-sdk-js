import request from 'request';
import faye from 'faye';
import Promise from 'bluebird';

/**
 * Dataset
 */
export default class Dataset {
    constructor(name, client) {
        if( !name || !client ) throw new Error('Dataset needs some params');

        this.name = name;
        this.auth = client.auth;
        this.app = client.app;
        this.rtc = client.rtc;
        this.bus = client.bus;
    }

    list() {
        return this.request({
            method: 'GET',
            data: '',
            id: ''
        });
    }

    query(params) {
        return this.request({
            method: 'GET',
            data: '',
            id: '',
            qs: params
        });
    }

    count() {
        return new Promise((resolve, reject) => {
            this.request({
                method: 'GET',
                data: '',
                id: '',
                qs: {
                    jexia_info: true
                }
            }).then( (data) => {
                resolve(data.info.total);
            }, (error) => {
                reject(error);
            });
        });
    }

    create(data) {
        return this.request({
            method: 'POST',
            data: data,
            id: ''
        });
    }

    update(id, data) {
        return this.request({
            method: 'PUT',
            data: data,
            id: id
        });
    }

    delete(id) {
        return this.request({
            method: 'DELETE',
            data: '',
            id: id
        });
    }

    getUrl() {
        return this.auth.url + this.name + '/';
    }

    getEventNamespace(event) {
        return this.name + '.' + event;
    }

    request(params) {
        if( !params) throw new Error('Not enought params for request');

        let method = params.method,
            data = params.data,
            id = params.id,
            qs = {};

        if( typeof params.qs !== "undefined" ) {
            qs = params.qs;
        }

        return new Promise((resolve, reject) => {
            request({
                url: this.getUrl() + id,
                qs: qs,
                rejectUnauthorized: false,
                method: method,
                json: data,
                headers: {
                    'Authorization': 'Bearer ' + this.auth.getToken()
                }
            }, (error, response, body) => {

                if( error ) {
                    reject(error);
                }

                if(body && body.message) {
                    reject(body.message);
                }

                resolve(body);
            });
        });
    }

    /**
     * Subscribe to realtime notfications
     * The event name can be:
     * 1. None => Any kind of activity
     * 2. '*' => Any kind of activity
     * 3. 'created' => Only created rows
     * 4. 'updated' => Only updated rows
     * 5. 'deleted' => Only deleted rows
     * @returns {Object} Dataset
     */
    subscribe(...args) {
        let event = '',
            cb = function callback() {};

        // Listen all events
        if(args.length === 1) {
            event = '*';
            cb = args[0];
        } else if(args.length === 2) {
            event = args[0];
            cb = args[1];
        } else {
            throw new Error('Not enough parameters for subscription');
        }

        // Attach the callback
        this.bus.on(this.getEventNamespace(event), cb);

        // Emit new subscription
        this.bus.emit('jexia.dataset.subscription', {
            app: this.app,
            dataset: this.name,
            event: this.getEventNamespace(event)
        });

        // Chainning
        return this;
    }

    unsubscribe(...args) {
        let event = '',
            cb = function callback() {};

        if(args.length === 1) {
            event = '*';
            cb = args[0];
        } else if(args.length === 2) {
            event = args[0];
            cb = args[1];
        } else {
            throw new Error('Not enough parameters for subscription');
        }

        this.bus.removeListener(this.getEventNamespace(event), cb);
    }

}
