import faye from 'faye';

/**
 * Realtime client
 */
export default class RealtimeClient {
    constructor(options) {
        if( !options ) {
            throw new Error('RealtimeClient needs some params');
        }

        this.url = options.url;
        this.token = options.token;
        this.bus = options.bus;

        // Active subscriptions
        this.subscriptions = [];

        // Current subsription
        this.curSubscription = '';

        // Initialize real time client
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

    attachEventHandlers() {
        // Attach handler for new token
        this.bus.on('jexia.auth.token', (data) => { this.onToken(data); });

        // New subscription
        this.bus.on('jexia.dataset.subscription', (data) => { this.onSubscription(data); });
    }

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

    getEventWithoutNamespace(event) {
        let res = event.split('.');
        return res[1];
    }

    setToken(token) {
        this.token = token;
    }
}
