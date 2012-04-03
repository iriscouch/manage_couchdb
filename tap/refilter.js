#!/usr/bin/env node
//
// Test the regex filter

var lib = require('./lib')
var test = lib.test
var util = require('util')
var request = require('request')

test('Refilter', function(t, type) {
  t.plan(5)

  var rnd = Math.random().toString().replace(/^0\./, '')
  var docs = []
  for(var i = 1; i <= 100; i++)
    docs.push({'type':type, 'run':[type, rnd, i].join('_')})

  request.post({'url':lib.db+'/_bulk_docs', 'json':{'docs':docs}}, function(er, res) {
    if(er)
      throw er

    var feed = lib.db + '/_changes?include_docs=true&filter='+type+'/refilter'
    //feed += '&log=true'
    request({'url':feed, 'json':true}, function(er, res) {
      if(er) throw er
      t.same(res.body.results, [], 'No results for missing "field" and "regex" options')

      feed += '&field=run'
      request({'url':feed, 'json':true}, function(er, res) {
        if(er) throw er
        t.same(res.body.results, [], 'No results for missing "regex" option')

        feed += '&regex=^' + type + '_' + rnd
        request({'url':feed, 'json':true}, function(er, res) {
          if(er) throw er
          t.equal(res.body.results.length, 100, 'Got 100 documents through the filter')

          var ones = feed + '_1'
            , twos = feed + '_(2|87$)'

          request({'url':ones, 'json':true}, function(er, res) {
            if(er) throw er
            var ones_count = 1 + 10 + 1 // 1, 10-19, 100
            t.equal(res.body.results.length, ones_count, 'Got all docs with i starting with 1')

            request({'url':twos, 'json':true}, function(er, res) {
              if(er) throw er
              var twos_count = 1 + 10 + 1 // 2, 20-29, 87
              //console.dir(res.body.results)
              t.equal(res.body.results.length, twos_count, 'Got all docs with i starting with 2, or i == 87')

              t.end()
            })
          })
        })
      })
    })
  })
})

test('Refilter with design docs', function(t, type) {
  t.plan(4)

  var feed = lib.db + '/_changes?include_docs=true&filter='+type+'/refilter&field=run&regex=^'+type
  request({'url':feed, 'json':true}, function(er, res) {
    if(er) throw er

    var changes = res.body.results
    t.ok(changes.length > 0, 'Got some changes through refilter: '+type)
    t.equal(ddocs(changes).length, 0, 'Zero ddocs copied: '+type)

    feed += '&ddocs=true'
    request({'url':feed, 'json':true}, function(er, res) {
      if(er) throw er

      var changes = res.body.results
      t.ok(changes.length > 0, 'Got some changes through refilter with ddocs=true: '+type)
      t.equal(ddocs(changes).length, 2, 'Got couchdb and ecouchdb ddocs through refilter with ddocs=true: '+type)

      t.end()
    })
  })

  function ddocs(changes) {
    return changes.filter(is_ddoc)

    function is_ddoc(change) {
      return change.id == '_design/couchdb' || change.id == '_design/ecouchdb'
    }
  }
})
