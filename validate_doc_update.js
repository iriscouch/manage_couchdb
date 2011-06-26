function(newDoc, oldDoc, userCtx, secObj) {
  var ddoc = this;

  if(ddoc.access && ddoc.access.read_only)
    throw {forbidden: "This database is read-only"};
}
