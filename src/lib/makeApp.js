var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

module.exports = function(State, Actions, Projections) {
  var app = {};

  app._State = State;
  app._Actions = Actions;
  app._Projections = Projections;

  app = assign(app, EventEmitter.prototype, {
    emitChange: function() {
      this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    }
  });

  app._state = State.initial();

  app.state = function() {
    return this._state;
  };

  app.reset = function() {
    this._state = State.initial();
  };

  app.actions = {};

  Object.keys(Actions).forEach(function(fnName) {
    app.actions[fnName] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(app._state);
      app._state = Actions[fnName].apply(Actions, args);
      app.emitChange();
    };
  });

  app.projections = {};

  Object.keys(Projections).forEach(function(fnName) {
    app.projections[fnName] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(app._state);
      return Projections[fnName].apply(Projections, args);
    };
  });

  return app;
};
