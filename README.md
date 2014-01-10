ppis
----

# Pirate Party Information System

This is an alpha version of the core application package as a base for further development.

## CONFIGURATION

Configuration is in JSON format.

Configuration object loads from ~/.ppis.conf if exists.
Then updates the configuration by PPIS_CONF environment variable.
Then updates the configuration by options or by filename passed to constructor of PPIS.

Example of the configuration:
``` javascript
{
    "dbSchema": "mongodb",
    "dbOptions": {
        "url": "mongodb://localhost/ppis"
    }
}
```

For CLI or REST api (separate packages) you can use system env settings:
``` bash
PPIS_CONF='{ "dbOptions": { "url": "mongodb://localhost/ppis_test" }}' ppis get permissions
```

## USAGE

``` javascript
var PPIS = require('ppis');                     // load module
var ppis = new PPIS('./my_ppis.conf');          // instantiate and load config from custom configuration file
  ppis.promise.then(function(ppis) {            // wait for object to load
    ppis.api.users(function (err, users) {      // get all users by api
      console.log(users);                       // write results to console
    });
  });
```

## TODO

 - revise premises and use premises for api and model calls
 - Auth, Session and Permissions checks
 - Cover all not yet covered code by tests

## LICENSE

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
