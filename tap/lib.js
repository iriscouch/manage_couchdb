// Testing library
//

module.exports = { 'test': test
                 }

var tap = require('tap')

// Run each test twice
function test(description, callback) {
  var names = ['couchdb', 'ecouchdb']
  names.forEach(function(name) {
    var id = '_design/'+name
      , ddoc = process.env.couchdb + '/' + process.env.db + '/' + id

    tap.test(description+': '+name, function(t) {
      callback(t, ddoc)
    })
  })
}

if(require.main === module)
  tap.test('Test environment', function(t) {
    t.plan(2)
    t.ok(process.env.couch, 'Couch is defined')
    t.ok(process.env.db, 'Database is defined')
  })
