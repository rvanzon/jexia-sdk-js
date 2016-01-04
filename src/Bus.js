import EventEmitter from 'events';

/**
 * Global singleton event bus for dataset subscriptions.
 * @extends {EventEmitter}
 */
 class Bus extends EventEmitter {
     /**
      * Create a new Bus object
      */
     constructor() {
         super();
     }
}

let bus = new Bus();
export default bus;
