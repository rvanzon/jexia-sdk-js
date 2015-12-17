# jexia-sdk-js
Official javascript sdk for Jexia

`Warning`: Currently this sdk is under active development. Breaking changes maybe introduced.  

## Installation
```bash
$ npm install jexia-sdk-js
```

## Usage
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {

    // you can start interacting with your app

});
```

# Examples

## Interacting with data sets
Let's say that our data app has a data set `messages`
and a field `value` which contains the actual text

### Creating a message:
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    messages.create({
        value: 'Build RESTful APIs without writing a single line of code'
    })
    .then(function(message) {
        // Message created successfully  
        console.log(message);

    });
});
```

### Deleting a message:
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    messages.delete('56675c4807ad0914ccb8fc8d')
    .then(function(message) {
        // Message deleted successfully  
        console.log(message);

    });
});
```

### Updating a message:
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    messages.update('56675c4807ad0914ccb8fc8d', {
        value: 'Use JEXIA as a Backend and focus on your awesome application'
    })
    .then(function(message) {
        // Message updated successfully  
        console.log(message);

    });
});
```

### Getting a message:
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    messages.get('56675c4807ad0914ccb8fc8d')
    .then(function(message) {
        // Here is the message
        console.log(message);

    });
});
```

## Realtime interaction with dataset
Let's use our previous example which our data app has a data set `messages` and a field `value` but now we want to interact in realtime.

There are 4 type of events that you can subscribe:

| Event name    | Description  |
| ------------- |--------------|
|  \*           | All events   |
| created       | Only created |
| updated       | Only updated |
| deleted       | Only deleted |

### Subscribe to all messages
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    messages.subscribe('*', function(message) {
        // Realtime!
        console.log(message);
    });
});
```

### Subscribe only to created messages
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    // Only when a new message created
    messages.subscribe('created', function(message) {
        console.log(message);
    });
});
```

### Subscribe only to updated messages
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    // Only when a new message updated
    messages.subscribe('updated', function(message) {
        console.log(message);
    });
});
```

### Subscribe only to deleted messages
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    var messages = app.dataset('messages');

    // Only when a new message deleted
    messages.subscribe('deleted', function(message) {
        console.log(message);
    });
});
```

## Build
```
npm run build

```

## Test
```
npm run test

```

## Release History

* 1.0.10 Browser build
* 1.0.9 Fixed bud on subscriptions
* 1.0.8 Npm version
* 1.0.7 Fixed typos
* 1.0.6 Npm version
* 1.0.6 Fixed typos
* 1.0.5 Npm version
* 1.0.4 Changed default refresh session interval
* 1.0.3 Npm version
* 1.0.2 Readme example fixes
* 1.0.1 Readme example fixes
* 1.0.0 Initial release

## Issues
Feel free to submit issues and enhancement requests.

## Contributing
 In general, we follow the "fork-and-pull" Git workflow.

 1. Fork the repo on GitHub
 2. Commit changes to a branch in your fork
 3. Pull request "upstream" with your changes
 4. Merge changes in to "upstream" repo

NOTE: Be sure to merge the latest from "upstream" before making a pull request!

## License

The MIT License (MIT)

Copyright (c) 2015 Jexia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
