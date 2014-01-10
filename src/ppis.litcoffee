The **PPIS** class, aka core class of Pirate Party Information System
It instantiates configuration, model and api objects as its instance
variables.

Import Q library to add promises and deferring

    Q = require('q')

    class PPIS

The `deferred` variable for promising

      deferred = Q.defer()

Define `self` to be used for passing `this` down the scope

      self = null

Initalize PPIS. Load configuration, initiate Model with database and
instantiate API object.

      constructor: (@options) ->
        @promise = deferred.promise
        self = @
        @initConfiguration(@options).then(() ->
          self.initModel().then(() ->
            self.initApi().then(() ->
              deferred.resolve(self)
            )
          )
        )

Load configuration

      initConfiguration: (options) ->
        Configuration = require('./configuration')
        self.configuration = new Configuration(options)
        self.configuration.promise

Instantiate Model (and database)

      initModel: () ->
        Model = require('./model/index')
        self.model = new Model(self)
        self.model.promise

Instantiate API

      initApi: () ->
        API = require('./api')
        self.api = new API(self)
        self.api.promise

Export PPIS class by this module

    module.exports = PPIS
