Schema = require('jugglingdb').Schema
Q = require('q')

class Model

  deferred = Q.defer()
  self = null

  @Text = Schema.Text

  constructor: (@ppis) ->
    @promise = deferred.promise
    self = @
    @models = []
    @plural = {}

    conf = @ppis.configuration
    @setupDb(conf.get 'dbSchema', conf.get 'dbOptions')

    @addModelUser().then(() ->
      self.addModelGroup().then(() ->
        self.addModelPermission().then(() ->
          self.setupModelRelations()
          deferred.resolve(self)
        )
      )
    )

  setupDb: (schema, options) ->
    @db = new Schema(schema, options)

  addModel: (modelName, plural, schema) ->
    model = this[modelName] = @db.define(modelName, schema)
    @models.push(modelName) if modelName not in @models
    model.plural = plural
    @plural[plural] = model

  loadModelFunctions: (modelName, where) ->
    fnDeferred = Q.defer()
    where ?= './'
    filename = where+modelName
    self = this
    require("fs").exists(filename+'.js', (exists) ->
      model = self[modelName]
      if exists and model
        require(filename)(model)
      fnDeferred.resolve(model)
    )
    fnDeferred.promise

  addModelUser: () ->
    fnDeferred = Q.defer()
    @addModel('User', 'Users', {
      username:   String,
      fullname:   String,
      rank:       String,
      email:      String,
      created_at: { type: Date, default: () -> new Date },
      updated_at: { type: Date, default: () -> new Date }
    })
    @User.validatesUniquenessOf('username', { message: 'username is not unique' })
    @loadModelFunctions('User').then(() -> fnDeferred.resolve())
    fnDeferred.promise

  addModelGroup: () ->
    fnDeferred = Q.defer()
    @addModel('Group', 'Groups', {
      name:       String,
      created_at: { type: Date, default: () -> new Date },
      updated_at: { type: Date, default: () -> new Date }
    })
    @Group.validatesUniquenessOf('name', { message: 'name is not unique' })
    @loadModelFunctions('Group').then(() -> fnDeferred.resolve())
    fnDeferred.promise

  addModelPermission: () ->
    fnDeferred = Q.defer()
    @addModel('Permission', 'Permissions', {
      name:       String,
      created_at: { type: Date, default: () -> new Date },
      updated_at: { type: Date, default: () -> new Date }
    })
    @Permission.validatesUniquenessOf('name', { message: 'name is not unique' })
    @loadModelFunctions('Permission').then(() -> fnDeferred.resolve())
    fnDeferred.promise

  setupModelRelations: () ->
    # user group n2n
    @User.hasAndBelongsToMany(@Group, { as: 'groups', model: 'Group', linkTable: 'UserGroup' })
    @Group.hasAndBelongsToMany(@User, { as: 'users', model: 'User', linkTable: 'UserGroup' })
    # group permission n2n
    @Group.hasAndBelongsToMany(@Permission, { as: 'permissions', model: 'Permission', linkTable: 'GroupPermission' })
    @Permission.hasAndBelongsToMany(@Group, { as: 'users', model: 'Group', linkTable: 'GroupPermission' })
    # user permission n2n
    @User.hasAndBelongsToMany(@Permission, { as: 'permissions', model: 'Permission', linkTable: 'UserPermission' })
    @Permission.hasAndBelongsToMany(@User, { as: 'users', model: 'User', linkTable: 'UserPermission' })

module.exports = Model
