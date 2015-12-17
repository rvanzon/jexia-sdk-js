import EventEmitter from 'events';

/**
 * Bus
 * @extends {EventEmitter}
 */
 class Bus extends EventEmitter {
    constructor() {
        super();
    }
}

// Singleton
let bus = new Bus();
export default bus;
