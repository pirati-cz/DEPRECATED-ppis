###
  loads configuration from ~/.ppis.conf or by filename if the name is passed as options
  then updates configuration by settings in ENV
  then updates configuration by parameters from options {} if it is not file
  use newly created configurationObject.promise.then(callback) to wait for configuration to load
###

Q = require('q')

class Configuration

  @defaultConfigurationFile = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
  @defaultConfigurationFile += '/.ppis.conf'

  deferred = Q.defer()

  constructor: (options) ->
    @promise = deferred.promise
    @conf = { # default configuration
      dbSchema: "mongodb",
      dbOptions: {
        url: "mongodb://localhost/ppis"
      }
    }
    @load(options)

  get: (key) ->
    @conf[key]

  set: (key, value) ->
    @conf[key] = value

  load: (options) ->
    if typeof options is 'string'
      filename = options
      options = {}

    filename ?= Configuration.defaultConfigurationFile
    self = @
    @loadFile(filename, true, () ->
      self.loadEnv()
      self.loadJSON(options) if options
      deferred.resolve(self)
    )

  loadFile: (filename, replace, callback) ->
    fs = require('fs')
    self = @
    fs.exists(filename, (exists) ->
      if exists
        json = JSON.parse(fs.readFileSync(filename).toString())
        self.loadJSON(json, replace)
      callback() if callback
    )

  loadEnv: (replace) ->
    if process.env.PPIS_CONF
      @loadJSON(JSON.parse(process.env.PPIS_CONF), replace)

  loadJSON: (json, replace) ->
    if replace
      @conf = json
    else
      Configuration.mergeJSON(@conf, json)
    @conf

  @mergeJSON: (original, update) ->
    for own p of update # p as property
      try
        if update[p].constructor is Object
          original[p] = Configuration.mergeJSON(original[p], update[p])
        else
          original[p] = update[p]
      catch err
        original[p] = update[p]
    original

module.exports = Configuration
