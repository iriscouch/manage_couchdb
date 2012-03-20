#!/usr/bin/env node
//
// Test the conflict detector

var lib = require('./lib')
var test = lib.test
var util = require('util')
var request = require('request')

test('Conflicts', function(t, type) {
  t.plan(50)

  var conflicts = lib.db + '/_design/'+type + '/_view/conflicts'
  var rnd = Math.random().toString().replace(/^0\./, '')
  var docs = [1, 2, 3].map(function(a) {
    return {'_id':type+a+'_'+rnd, 'value':a}
  })

  var bulk = lib.db + '/_bulk_docs'
  request.post({'url':bulk, 'json':{'docs':docs}}, function(er, res) {
    if(er) throw er
    t.equal(res.statusCode, 201, 'Store the first doc batch')

    var dupes = JSON.parse(JSON.stringify(docs))
    dupes.forEach(function(doc) { doc.value *= 2 })
    request.post({'url':bulk, 'json':{'all_or_nothing':true, 'docs':dupes}}, function(er, res) {
      if(er) throw er
      t.equal(res.statusCode, 201, 'Store the second doc batch')

      request({'url':conflicts+'?reduce=false', 'json':true}, function(er, res) {
        if(er) throw er
        test_doc()
        function test_doc(i) {
          i = i || 0
          var doc = docs[i]
          if(!doc)
            return test_reduce()

          var hits = res.body.rows.filter(function(row) { return row.id == doc._id })

          t.equal(hits.length, 2, 'Two conflict hits for document '+doc._id)
          t.equal(hits[0].key.length, 2, 'First conflict key is a 2-array: '+doc._id)
          t.equal(hits[1].key.length, 2, 'Second conflict key is a 2-array: '+doc._id)

          t.equal(hits[0].key[0], doc._id, 'Conflict first key is the doc id: '+doc._id)
          t.equal(hits[1].key[0], doc._id, 'Conflict second key is the doc id: '+doc._id)
          t.notEqual(hits[0].key[1], hits[1].key[1], 'Conflict revs are dissimilar: '+doc._id)

          var doc1, doc2
          request({'url':lib.db+'/'+doc._id+'?rev='+hits[0].key[1], 'json':true}, function(er, res) {
            if(er) throw er

            t.equal(res.statusCode, 200, 'Got first doc revision: '+doc._id)
            doc1 = res.body

            request({'url':lib.db+'/'+doc._id+'?rev='+hits[1].key[1], 'json':true}, function(er, res) {
              if(er) throw er

              t.equal(res.statusCode, 200, 'Got second doc revision: '+doc._id)
              doc2 = res.body

              t.ok(doc1.value == doc2.value*2 || doc2.value == doc1.value*2,
                   'One doc value is twice the other: '+doc._id)

              test_doc(i+1)
            })
          })
        }
      })
    })
  })

  function test_reduce() {
    request({'url':conflicts+'?group_level=1', 'json':true}, function(er, res) {
      if(er) throw er
      docs.forEach(function(doc) {
        var matched_rows = res.body.rows.filter(function(row) { return row.key[0] == doc._id })
        t.equal(matched_rows.length, 1, 'One unique row for doc: '+doc._id)

        var row = matched_rows[0]
        t.equal(row.key.length, 1, 'Row key length is 1 (group level 1): '+doc._id)
        t.equal(row.value, 2, 'Row indicates two conflicting revisions: '+doc._id)
      })

      return test_include_docs()
    })
  }

  function test_include_docs() {
    request({'url':conflicts+'?reduce=false&include_docs=true', 'json':true}, function(er, res) {
      if(er) throw er

      docs.forEach(function(doc) {
        var rows = res.body.rows.filter(function(row) { return row.key[0] == doc._id })

        t.equal(rows.length, 2, 'Two rows for doc with ?include_docs: '+doc._id)
        var doc1 = rows[0].doc
          , doc2 = rows[1].doc

        t.type(doc1, 'object', 'Got first revision with include_docs: '+doc._id)
        t.type(doc2, 'object', 'Got second revision with include_docs: '+doc._id)

        t.ok(doc1.value == doc2.value*2 || doc2.value == doc1.value*2,
             'One doc value is twice the other with include_docs: '+doc._id)
      })

      t.end()
    })
  }
})
