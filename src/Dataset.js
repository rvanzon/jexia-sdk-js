import request from 'request';
import faye from 'faye';
import Promise from 'bluebird';

/**
 * Dataset CRUD operations and realtime subscriptions
 */
export default class Dataset {

    /**
     * Create a dataset object with some initial values.
     * @param {string} name - Name of the dataset
     * @param {Object} client - {@link JexiaClient}
     */
    constructor(name, client) {
        if( !name || !client ) throw new Error('Dataset needs some params');

        /** @type {string} */
        this.name = name;

        /** @type {Object} */
        this.auth = client.auth;

        /** @type {Object} */
        this.app = client.app;

        /** @type {Object} */
        this.rtc = client.rtc;

        /** @type {Object} */
        this.bus = client.bus;
    }

    /**
     * List all records
     * @return {Promise<Array, Error>}
     * @example
     * dataset.list().then(function(res) {
     *    console.log(res);
     * });
     */
    list() {
        return this.request({
            method: 'GET',
            data: '',
            id: ''
        });
    }

    /**
     * Query a dataset with query parameters
     * @param {Object} params - query params
     * @return {Promise<Array, Error>}
     * @example
     * dataset.query({limit: 1}).then(function(res) {
     *    console.log(res);
     * });
     */
    query(params) {
        return this.request({
            method: 'GET',
            data: '',
            id: '',
            qs: params
        });
    }

    /**
     * Get information about the dataset, such as total records
     * @return {Promise<Object, Error>}
     * @example
     * dataset.info().then(function(res) {
     *    console.log(res);
     * });
     */
    info() {
        return new Promise((resolve, reject) => {
            this.request({
                method: 'GET',
                data: '',
                id: '',
                qs: {
                    jexia_info: true
                }
            }).then( (body) => {
                resolve(body.info);
            }, (error) => {
                reject(error);
            });
        });
    }

    /**
     * Create a new record on the dataset
     * @param {Object} data - Row data
     * @return {Promise<Object, Error>}
     * @example
     * dataset.create({value: test}).then(function(res) {
     *    console.log(res);
     * });
     */
    create(data) {
        return this.request({
            method: 'POST',
            data: data,
            id: ''
        });
    }

    /**
     * Update a record on the dataset
     * @param {string} id - record id
     * @param {Object} data - Data to update
     * @return {Promise<Object, Error>}
     * @example
     * dataset.update('s6svsrw452rwfs', {value: test}).then(function(res) {
     *    console.log(res);
     * });
     */
    update(id, data) {
        return this.request({
            method: 'PUT',
            data: data,
            id: id
        });
    }

    /**
     * Delete a record from the dataset
     * @param {string} id - record id
     * @return {Promise<Object, Error>}
     * @example
     * dataset.delete('s6svsrw452rwfs').then(function(res) {
     *    console.log(res);
     * });
     */
    delete(id) {
        return this.request({
            method: 'DELETE',
            data: '',
            id: id
        });
    }

    /**
     * Get a record from a dataset
     * @param {string} id - record id
     * @return {Promise<Object, Error>}
     * @example
     * dataset.get('s6svsrw452rwfs').then(function(res) {
     *    console.log(res);
     * });
     */
    get(id) {
        return this.request({
            method: 'GET',
            data: '',
            id: id
        });
    }

    /**
     * Get dataset url
     * @private
     * @return {string} url
     */
    getUrl() {
        return this.auth.url + this.name + '/';
    }

    /**
     * Get dataset namespace
     * @private
     * @return {string} url
     */
    getEventNamespace(event) {
        return this.name + '.' + event;
    }

    /**
     * Http request
     * @private
     * @return {Promise<Request, Error>}
     */
    request(params) {
        if( !params) throw new Error('Not enought params for request');

        let method = params.method,
            data = params.data,
            id = params.id,
            qs = {};

        // Query params
        if( typeof params.qs !== 'undefined' ) {
            qs = params.qs;
        }

        return new Promise((resolve, reject) => {
            request({
                url: this.getUrl() + id,
                qs: qs,
                rejectUnauthorized: false,
                method: method,
                json: data || true && method !== 'DELETE',
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

				if( typeof body === 'string' ) {
					body = JSON.parse(body);
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
     * @param {...args} args - Event name and callback function
     * @emits {jexia.dataset.subscription} emit a new subscription event
     * @returns {Object} Dataset
     * @example
     * Subscribe to all events:
     * dataset.subscribe(function(data) {
     *     console.log(data);
     * });
     *
     * Subscribe to created events:
     * dataset.subscribe('created', function(data) {
     *     console.log(data);
     * });
     *
     * Subscribe to updated events:
     * dataset.subscribe('updated', function(data) {
     *     console.log(data);
     * });
     *
     * Subscribe to deleted events:
     * dataset.subscribe('deleted', function(data) {
     *     console.log(data);
     * });
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
    /**
     * Unsubscribe from realtime notfications
     * @param {...args} args - Event name and callback function
     * @example
     * dataset.unsubscribe(function(data) {
     *     console.log(data);
     * });
     */
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
            throw new Error('Not enough parameters to unsubscribe');
        }

        this.bus.removeListener(this.getEventNamespace(event), cb);
    }
}
