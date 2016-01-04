import faye from 'faye';

/**
 * Managing real time events
 */
export default class RealtimeClient {

    /**
     * Create a new RealTimeClient object with some initial values.
     * @param {Object} options - Initial options object
     * @param {string} options.url - url
     * @param {string} options.token - token
     * @param {string} options.bus - {@link Bus}
     * @return {Promise<JexiaClient, Error>}
     */
    constructor(options) {
        if( !options ) {
            throw new Error('RealtimeClient needs some params');
        }

        /** @type {string} */
        this.url = options.url;

        /** @type {string} */
        this.token = options.token;

        /** @type {Object} */
        this.bus = options.bus;

        // Active subscriptions
        /** @type {Array} */
        this.subscriptions = [];

        // Current subsription
        /** @type {string} */
        this.curSubscription = '';

        // Initialize real time client
        /** @type {Object} */
        this.faye = new faye.Client(this.url);

        // Set auth token
        this.faye.addExtension({
            outgoing: (message, cb) => {
                if (message.channel !== '/meta/subscribe') return cb(message);

                message.ext = message.ext || {};
                message.ext.token = this.token;
                cb(message);
            }
        });
        // Attach the handlers
        this.attachEventHandlers();
    }

    /**
     * Attach responsible event handlers
     * @listens {jexia.auth.token} - New token
     * @listens {jexia.dataset.subscription} - New dataset subsciption
     */
    attachEventHandlers() {
        // Attach handler for new token
        this.bus.on('jexia.auth.token', (data) => { this.onToken(data); });

        // New subscription
        this.bus.on('jexia.dataset.subscription', (data) => { this.onSubscription(data); });
    }

    /**
     * Responsible for handling a new subscription
     * @param {Object} data - Subscription response
     */
    onSubscription(data) {
        let name = data.dataset,
            event = data.event,
            channel = '/' + data.app.id + '/' + name + '/' + data.app.key;

        let subscription = this.faye.subscribe(channel, (data) => {
            let curEvent = this.getEventWithoutNamespace(event);
            if( data.type === curEvent || curEvent === '*' ) {
                this.curSubscription = event;
                this.bus.emit(event, data);
            }
        });

        this.subscriptions.push({
            data: {
                app: data.app,
                dataset: name,
                event: event,
                channel: channel
            },
            subscription: subscription
        });
    }

    /**
     * Responsible for handling a new token
     * @param {Object} data - Subscription response
     */
    onToken(data) {
        this.setToken(data.token);

        this.curSubscription = '';
        this.subscriptions.forEach(item => {

            // Unsubscribe first
            this.faye.unsubscribe(item.data.channel);

            // Subscribe again
            item.subscription = this.faye.subscribe(item.data.channel, (data) => {
                let curEvent = this.getEventWithoutNamespace(item.data.event);

                if( data.type === curEvent || curEvent === '*' ) {
                    if( this.curSubscription !== item.data.event) {
                        this.curSubscription = item.data.event;
                        this.bus.emit(item.data.event, data);
                    }
                }
            });
        });
    }

    /**
     * get event name without namespace
     * @param {string} event - Event with namespace attached
     * @return {string} event - Event without namespace
     */
    getEventWithoutNamespace(event) {
        let res = event.split('.');
        return res[1];
    }

    /**
     * Set the current token
     * @param {string} token - token
     */
    setToken(token) {
        this.token = token;
    }
}
