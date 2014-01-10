'use strict';

var conf = {};
if (process.env.PPIS_CONF === null || process.env.PPIS_CONF === undefined) {
  conf.dbSchema = 'memory';
}

var assert = require('assert');
var should = require('should');
var async = require('async');

var testdata, jack, john;
var User, Group, Permission;
var ppis;

var PPIS = require('..');

// query params helper
function where(property, value, order) {
  var where = {};
  where[property] = value;
  return {
    where: where,
    order: order || 'created_at DESC'
  };
}

// shortcut for getting user by username
function UserByUsername(username, cb) {
  User.findOne(where('username', username), cb);
}
var UserByName = UserByUsername;

// shortcut for getting group by name
function GroupByName(name, cb) {
  Group.findOne(where('name', name), cb);
}

// shortcut for getting permission by name
function PermissionByName(name, cb) {
  Permission.findOne(where('name', name), cb);
}

// should helper for null/undefined
function shouldNotBe(value) {
  (value === null || value === undefined).should.be.ok;
}

// should helper for not null/undefined
function shouldBe(value) {
  (!(value === null || value === undefined)).should.be.ok;
}

// destroys all data from database
function destroyAll(done) {
  User.destroyAll(function() {
    Group.destroyAll(function() {
      Permission.destroyAll(done);
    });
  });
}

function init(done) {
  ppis = new PPIS(conf);
  ppis.promise.then(function(ppis) {
    //console.log(ppis.configuration.conf);
    User = ppis.model.User;
    Group = ppis.model.Group;
    Permission = ppis.model.Permission;
    destroyAll(done);
  });
}

// imports test data into db
function importTestData(done) {
  testdata = require('./testdata');
  john = testdata.users[0];
  jack = testdata.users[1];
  testdata.users.forEach(function (each) {
    var user = new User(each);
    user.save();
  });
  testdata.groups.forEach(function (each) {
    var group = new Group(each);
    group.save();
  });
  testdata.permissions.forEach(function (each) {
    var permission = new Permission(each);
    permission.save();
  });
  done();
}

describe('PPIS', function() {

  before(function (done) {
    init(done);
  });

  describe('Model', function(){

    describe('CRUD - Read', function(){

      before(importTestData);

      it('should read one user', function(done) {
        UserByName("jack", function (err, user) {
          shouldNotBe(err);
          shouldBe(user);
          user.should.be.an.instanceof(User);
          user.should.have.property('username', jack.username);
          user.should.have.property('fullname', jack.fullname);
          user.should.have.property('rank', jack.rank);
          user.should.have.property('email', jack.email);
          done();
        });
      });

      it('should read one group', function(done) {
        GroupByName("Members", function (err, group) {
          shouldNotBe(err);
          shouldBe(group);
          group.should.be.an.instanceof(Group);
          group.should.have.property('name', "Members");
          done();
        });
      });

      it('should read one permission', function(done) {
        PermissionByName("deletegroup", function (err, permission) {
          shouldNotBe(err);
          shouldBe(permission);
          permission.should.be.an.instanceof(Permission);
          permission.should.have.property('name', "deletegroup");
          done();
        });
      });

      it('should read all users', function(done) {
      User.all(function (err, users) {
        shouldNotBe(err);
          shouldBe(users);
          users.should.be.an.Array.and.have.a.lengthOf(2);
          done();
        });
      });

      it('should read all groups', function(done) {
        Group.all(function (err, groups) {
          shouldNotBe(err);
          shouldBe(groups);
          groups.should.be.an.Array.and.have.a.lengthOf(3);
          done();
        });
      });

      it('should read all permissions', function(done) {
        Permission.all(function (err, permissions) {
          shouldNotBe(err);
          shouldBe(permissions);
          permissions.should.be.an.Array.and.have.a.lengthOf(4);
          done();
        });
      });

    });

    describe('CRUD - Create', function() {
      it('should create user', function(done) {
        var jane = new User({
          username: "jane",
          fullname: "Jane Doe",
          rank:     "member",
          email:    "jane.doe@example.com"
        });
        jane.save(function(err) {
          shouldNotBe(err);
          UserByName("jane", function (err, user) {
            shouldNotBe(err);
            shouldBe(user);
            user.should.be.an.instanceof(User);
            user.should.have.property('username', jane.username);
            user.should.have.property('fullname', jane.fullname);
            user.should.have.property('rank', jane.rank);
            user.should.have.property('email', jane.email);
            done();
          });
        });
      });

      it('should create group', function(done) {
        var banned = new Group({
          name: "Banned",
        });
        banned.save(function(err) {
          shouldNotBe(err);
          GroupByName("Banned", function (err, group) {
            shouldNotBe(err);
            shouldBe(group);
            group.should.be.an.instanceof(Group);
            group.should.have.property('name', banned.name);
            done();
          });
        });
      });

      it('should create permission', function(done) {
        var adduser = new Permission({
          name: "createuser",
        });
        adduser.save(function(err) {
          shouldNotBe(err);
          PermissionByName("createuser", function (err, permission) {
            shouldNotBe(err);
            shouldBe(permission);
            permission.should.be.an.instanceof(Permission);
            permission.should.have.property('name', adduser.name);
            done();
          });
        });
      });

    });

    describe('CRUD - Update', function() {
      it('should update user', function(done) {
        var id = null;
        UserByName("jane", function (err, user) {
          shouldNotBe(err);
          shouldBe(user);
          user.should.be.an.instanceof(User);
          user.fullname = 'Jane Sparrow';
          id = user['id'];
          user.save(function(err) {
            shouldNotBe(err);
            UserByName("jane", function (err, user) {
              shouldNotBe(err);
              shouldBe(user);
              user.should.have.property('fullname', "Jane Sparrow");
              user['id'].toString().should.equal(id.toString());
              done();
            });
          });
        });
      });

      it('should update group', function(done) {
        var id = null;
        GroupByName("Moderators", function (err, group) {
          shouldNotBe(err);
          shouldBe(group);
          group.should.be.an.instanceof(Group);
          group.should.have.property('name', "Moderators");
          group.name = 'Fascists';
          id = group['id'];
          group.save(function(err) {
            shouldNotBe(err);
            GroupByName("Fascists", function (err, group) {
              shouldNotBe(err);
              shouldBe(group);
              group.should.have.property('name', "Fascists");
              group['id'].toString().should.equal(id.toString());
              done();
            });
          });
        });
      });

      it('should update permission', function(done) {
        var id = null;
        PermissionByName("readgroup", function (err, permission) {
          shouldNotBe(err);
          shouldBe(permission);
          permission.should.be.an.instanceof(Permission);
          permission.should.have.property('name', "readgroup");
          permission.name = 'read_group';
          id = permission['id'];
          permission.save(function(err) {
            shouldNotBe(err);
            PermissionByName("read_group", function (err, permission) {
              shouldNotBe(err);
              shouldBe(permission);
              permission.should.have.property('name', "read_group");
              permission['id'].toString().should.equal(id.toString());
              done();
            });
          });
        });
      });

    });

    describe('CRUD - Delete', function() {

      it('should delete user', function(done) {
        UserByName("jane", function (err, user) {
          shouldNotBe(err);
          shouldBe(user);
          user.should.be.an.instanceof(User);
          user.destroy(function(err) {
            shouldNotBe(err);
            UserByName("jane", function (err, user) {
              shouldNotBe(err);
              shouldNotBe(user);
              done();
            });
          });
        });
      });

      it('should delete group', function(done) {
        GroupByName("Banned", function (err, group) {
          shouldNotBe(err);
          shouldBe(group);
          group.should.be.an.instanceof(Group);
          group.destroy(function(err) {
            shouldNotBe(err);
            GroupByName("Banned", function (err, group) {
              shouldNotBe(err);
              shouldNotBe(group);
              done();
            });
          });
        });
      });

      it('should delete permission', function(done) {
        var id = null;
        PermissionByName("createuser", function (err, permission) {
          shouldNotBe(err);
          shouldBe(permission);
          permission.should.be.an.instanceof(Permission);
          permission.destroy(function(err) {
            shouldNotBe(err);
            PermissionByName("createuser", function (err, permission) {
              shouldNotBe(err);
              shouldNotBe(permission);
              done();
            });
          });
        });
      });

    });

    describe('Relations', function() {

      it('should relate user and group n2n', function(done) {
        UserByName("john", function (err, john) { // find user john
          shouldNotBe(err);
          shouldBe(john);
          john.should.be.an.instanceof(User);
          GroupByName("Members", function (err, group) { // find group Members
            shouldNotBe(err);
            shouldBe(group);
            group.should.be.an.instanceof(Group);
            john.groups.add(group, function (err) { // add john to group Members through user model
              shouldNotBe(err);
              john.groups(function (err, groups) { // find john groups
                shouldNotBe(err);
                shouldBe(groups);
                groups.should.be.an.Array.and.have.a.lengthOf(1);
                UserByName("jack", function (err, jack) { // find user jack
                  shouldNotBe(err);
                  shouldBe(jack);
                  group.users.add(jack, function (err) { // add jack to Members through group model
                    shouldNotBe(err);
                    group.users(function (err, users) { // find group users
                      shouldNotBe(err);
                      shouldBe(users);
                      users.should.be.an.Array.and.have.a.lengthOf(2);
                      async.auto({
                        save_john: function (cb) { john.save(cb); },
                        save_jack: function (cb) { jack.save(cb); },
                        save_group: function (cb) { group.save(cb); },
                      }, function (err, result) { // save updated data
                        shouldNotBe(err);
                        UserByName("john", function (err, john) { // find user john
                          shouldNotBe(err);
                          shouldBe(john);
                          john.should.be.an.instanceof(User);
                          john.groups(function (err, groups) { // find john's groups
                            shouldNotBe(err);
                            shouldBe(groups);
                            groups.should.be.an.Array.and.have.a.lengthOf(1);
                            UserByName("jack", function (err, jack) { // find user jack
                              shouldNotBe(err);
                              shouldBe(jack);
                              jack.should.be.an.instanceof(User);
                              jack.groups(function (err, groups) { // find jack's groups
                                shouldNotBe(err);
                                shouldBe(groups);
                                groups.should.be.an.Array.and.have.a.lengthOf(1);
                                GroupByName("Members", function (err, group) { // find group Members
                                  shouldNotBe(err);
                                  shouldBe(group);
                                  group.should.be.an.instanceof(Group);
                                  group.users(function (err, users) { // find group's users
                                    shouldNotBe(err);
                                    shouldBe(users);
                                    users.should.be.an.Array.and.have.a.lengthOf(2);
                                    done();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

/*

  TODO:

    CRUD for User, Group, Permission..........4/6
  Read..................................done
  Create................................done
      validations.......................not yet
  Update................................done
      validations.......................not yet
  Delete................................done
    Relations.................................1/3
  n2n User to Group.....................done
  n2n Group Permission..................not yet
  n2n User Permission...................not yet
    Auth......................................0
        Password..............................0
      create............................not yet
      check.............................not yet
        User.isAllowedTo/can..................not yet
        Group.isAllowedTo/can.................not yet
  Session...............................not yet

*/