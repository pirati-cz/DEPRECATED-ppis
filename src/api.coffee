Q = require('q')

class API

  deferred = Q.defer()

  constructor: (@ppis) ->
    @promise = deferred.promise
    @model = @ppis.model
    deferred.resolve(@)

  @queryOptions: (where, order) ->
    where = JSON.parse(where) if (typeof where is 'string')
    return {
	    where: where || {},
	    order: order || 'created_at DESC'
    }

  get: (model, where, order, callback) ->
    model = @model[model] if typeof model is 'string'
    model.all(API.queryOptions(where, order), (err, data) -> callback(err, data))

  getOne: (model, where, order, callback) ->
    model = @model[model] if typeof model is 'string'
    model.findOne(API.queryOptions(where, order), (err, data) -> callback(err, data))

  users: (callback) ->
    @model.User.all((err, data) -> callback(err, data))

  groups: (callback) ->
    @model.Group.all((err, data) -> callback(err, data))

  permissions: (callback) ->
    @model.Permission.all((err, data) -> callback(err, data))

  userById: (id, callback) ->
    @model.User.findById(id, (err, user) -> callback(err, user))

  userByUsername: (username, callback) ->
    @model.User.findByUsername(username, (err, user) -> callback(err, user))

module.exports = API