// Testing library
//

module.exports = { 'test': test
                 , 'couch': process.env.couch
                 , 'db'   : process.env.couch + '/' + process.env.db
                 }

var tap = require('tap')

// Run each test twice
function test(description, callback) {
  var names = ['couchdb', 'ecouchdb']
  names.forEach(function(name) {
    tap.test(description+': '+name, function(t) {
      callback(t, name)
    })
  })
}

if(require.main === module)
  tap.test('Test environment', function(t) {
    t.plan(2)
    t.ok(process.env.couch, 'Couch is defined')
    t.ok(process.env.db, 'Database is defined')
  })
