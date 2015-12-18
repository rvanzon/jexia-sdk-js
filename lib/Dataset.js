'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _faye = require('faye');

var _faye2 = _interopRequireDefault(_faye);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Dataset
 */

var Dataset = (function () {
    function Dataset(name, client) {
        _classCallCheck(this, Dataset);

        if (!name || !client) throw new Error('Dataset needs some params');

        this.name = name;
        this.auth = client.auth;
        this.app = client.app;
        this.rtc = client.rtc;
        this.bus = client.bus;
    }

    _createClass(Dataset, [{
        key: 'list',
        value: function list() {
            return this.request({
                method: 'GET',
                data: '',
                id: ''
            });
        }
    }, {
        key: 'query',
        value: function query(params) {
            return this.request({
                method: 'GET',
                data: '',
                id: '',
                qs: params
            });
        }
    }, {
        key: 'info',
        value: function info() {
            var _this = this;

            return new _bluebird2.default(function (resolve, reject) {
                _this.request({
                    method: 'GET',
                    data: '',
                    id: '',
                    qs: {
                        jexia_info: true
                    }
                }).then(function (body) {
                    resolve(body.info);
                }, function (error) {
                    reject(error);
                });
            });
        }
    }, {
        key: 'create',
        value: function create(data) {
            return this.request({
                method: 'POST',
                data: data,
                id: ''
            });
        }
    }, {
        key: 'update',
        value: function update(id, data) {
            return this.request({
                method: 'PUT',
                data: data,
                id: id
            });
        }
    }, {
        key: 'delete',
        value: function _delete(id) {
            return this.request({
                method: 'DELETE',
                data: '',
                id: id
            });
        }
    }, {
        key: 'getUrl',
        value: function getUrl() {
            return this.auth.url + this.name + '/';
        }
    }, {
        key: 'getEventNamespace',
        value: function getEventNamespace(event) {
            return this.name + '.' + event;
        }
    }, {
        key: 'request',
        value: function request(params) {
            var _this2 = this;

            if (!params) throw new Error('Not enought params for request');

            var method = params.method,
                data = params.data,
                id = params.id,
                qs = {};

            // Query params
            if (typeof params.qs !== 'undefined') {
                qs = params.qs;
            }

            return new _bluebird2.default(function (resolve, reject) {
                (0, _request3.default)({
                    url: _this2.getUrl() + id,
                    qs: qs,
                    rejectUnauthorized: false,
                    method: method,
                    json: data || true,
                    headers: {
                        'Authorization': 'Bearer ' + _this2.auth.getToken()
                    }
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    }

                    if (body && body.message) {
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

    }, {
        key: 'subscribe',
        value: function subscribe() {
            var event = '',
                cb = function callback() {};

            // Listen all events

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length === 1) {
                event = '*';
                cb = args[0];
            } else if (args.length === 2) {
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
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            var event = '',
                cb = function callback() {};

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            if (args.length === 1) {
                event = '*';
                cb = args[0];
            } else if (args.length === 2) {
                event = args[0];
                cb = args[1];
            } else {
                throw new Error('Not enough parameters for subscription');
            }

            this.bus.removeListener(this.getEventNamespace(event), cb);
        }
    }]);

    return Dataset;
})();

exports.default = Dataset;