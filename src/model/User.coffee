module.exports = (User) ->
  # your model functions here

  User.prototype.getUppercaseUsername = () ->
    @username.toUpperCase()
