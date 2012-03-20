#!/usr/bin/env node
//
// Test the rewrites.

var lib = require('./lib')
var test = lib.test
var util = require('util')
var request = require('request')

var TEST_DB = 'test_manage_couchdb'

test('Database rewrite', function(t, type) {
  t.plan(8)

  var db = lib.db + '/_design/'+type+'/_rewrite/_db'

  request({'url':db, 'json':true}, function(er, res) {
    if(er) throw er
    t.equal(res.statusCode, 200, 'Hit the _db rewrite')
    t.equal(res.body.db_name, TEST_DB, '_db rewrite goes to the db')

    request({'url':db+'/', 'json':true}, function(er, res) {
      if(er) throw er
      t.equal(res.statusCode, 200, 'Hit the _db/ rewrite')
      t.equal(res.body.db_name, TEST_DB, '_db/ rewrite goes to the db')

      request({'url':db+'///', 'json':true}, function(er, res) {
        if(er) throw er
        t.equal(res.statusCode, 200, 'Hit the _db/// rewrite')
        t.equal(res.body.db_name, TEST_DB, '_db/// rewrite goes to the db')

        request({'url':db+'/_design/'+type, 'json':true}, function(er, res) {
          if(er) throw er
          var languages = {'couchdb':'javascript', 'ecouchdb':'erlang'}
            , language = languages[type]

          t.equal(res.statusCode, 200, 'Hit the _db/doc_id rewrite')
          t.equal(res.body.language, language, '_db/doc_id gets the right ddoc: '+type)

          t.end()
        })
      })
    })
  })
})

test('Design doc rewrite', function(t, type) {
  t.plan(8)

  var ddoc = lib.db + '/_design/'+type+'/_rewrite/_ddoc'

  request({'url':ddoc, 'json':true}, function(er, res) {
    if(er) throw er
    t.equal(res.statusCode, 200, 'Hit the _ddoc rewrite')
    t.equal(res.body._id, '_design/'+type, '_ddoc got this design document: '+type)

    request({'url':ddoc+'/', 'json':true}, function(er, res) {
      if(er) throw er
      t.equal(res.statusCode, 200, 'Hit the _ddoc/ rewrite')
      t.equal(res.body._id, '_design/'+type, '_ddoc/ got this design document: '+type)

      request({'url':ddoc+'///', 'json':true}, function(er, res) {
        if(er) throw er
        t.equal(res.statusCode, 200, 'Hit the _ddoc/// rewrite')
        t.equal(res.body._id, '_design/'+type, '_ddoc/// got this design document: '+type)

        request({'url':ddoc+'/attachment.html', 'json':true}, function(er, res) {
          if(er) throw er
          t.equal(res.statusCode, 404, 'Hit the _ddoc/attachment.html rewrite')
          t.equal(res.body.reason, 'Document is missing attachment', '_ddoc/attachment.html is an attachment')

          t.end()
        })
      })
    })
  })
})

test('CouchDB rewrite', function(t, type) {
  t.plan(4)

  var couch = lib.db + '/_design/'+type+'/_rewrite/_couchdb'

  request({'url':couch, 'json':true}, function(er, res) {
    if(er) throw er
    t.equal(res.statusCode, 200, 'Hit the _couchdb rewrite')
    t.equal(res.body.couchdb, 'Welcome', '_couchdb rewrite goes to CouchDB')

    request({'url':couch+'/'+TEST_DB, 'json':true}, function(er, res) {
      if(er) throw er
      t.equal(res.statusCode, 200, 'Hit the _couchdb/db rewrite')
      t.equal(res.body.db_name, TEST_DB, '_couchdb/db rewrite goes to the db')

      t.end()
    })
  })
})
