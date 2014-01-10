module.exports = (Group) ->
  # your model functions here

  Group.prototype.getUppercaseName = () ->
    @name.toUpperCase()

