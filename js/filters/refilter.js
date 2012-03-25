// Typical req.query (at a minimum, the "filter" parameter will be there):
//
// { "filter": "couchdb/refilter"
// , "field" : "_id"
// , "regex" : "^a"
// , "log"   : true
// }

function(doc, req) {
  var field = req.query.field
    , regex = req.query.regex
    , is_ddocs = (req.query.ddocs == 'true' || req.query.ddocs == true)

  logger('Running: id=%s req=%o', doc._id, req)

  if(is_ddocs && doc._id.match(/^_design\//)) {
    logger('Passing design doc: %s', doc._id)
    return true
  }

  // It seems like throw causes a 500 in CouchDB.
  if(typeof field != 'string') {
    //throw new Error('Required "field" string parameter')
    log('ERROR: invalid_query: Required "field" string parameter')
    return false
  }

  if(typeof regex != 'string') {
    //throw new Error('Required "regex" string parameter')
    log('ERROR: invalid_query: Required "regex" string parameter')
    return false
  }

  logger('field=%s regex=%s', field, regex)

  var value = doc[field]

  if(typeof value == 'undefined') {
    logger('Doc %s has no field %s', doc._id, field)
    return false
  }

  if(typeof value != 'string') {
    logger('Doc %s field %s is not a string: %o', doc._id, field, value)
    return false
  }

  logger("Testing '%s' to '%s'", value, regex)
  regex = new RegExp(regex)
  if(! value.match(regex)) {
    logger('No match: %s', doc._id)
    return false
  } else {
    logger('Match: %s', doc._id)
    return true
  }

  function logger(message) {
    if(!req.query.log)
      return

    var params = Array.prototype.slice.apply(arguments, [1])
    if(params.length > 0)
      message += ' <- ' + JSON.stringify(params)

    log(message)
  }
}

// vim: sts=2 sw=2 et
