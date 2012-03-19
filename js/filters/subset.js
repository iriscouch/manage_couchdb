function(doc, req) {
  // Return a consistent, random subset: between 0% to 100% of the documents. (Design documents and deletes always pass.)
  //

  if(/^_design\//.test(doc._id))
    return true;

  if(doc._deleted)
    return true;

  var p;

  if(req.query.p) {
    p = parseFloat(req.query.p);
    if(!(p >= 0.0 && p <= 1.0)) // Also catches NaN
      throw new Error("Parameter 'p' must be fraction of documents to pass [0.0-1.0]");
  }
  else if(req.query.expect || req.query.e) {
    // Set the fraction to that which will produce the expected document count.
    p = parseInt(req.query.expect || req.query.e);
    if(!(p <= 0) && !(p >= 0)) // NaN
      throw new Error("Parameter 'e' must be fraction of documents to pass [0.0-1.0]");

    p = Math.floor(p);
    if(p > req.info.doc_count)
      throw new Error("DB has " + req.info.doc_count + " docs, not expected " + p);

    // Set it to the needed percentage.
    p = p / req.info.doc_count;
  }
  else
    throw new Error("Required 'p' parameter (fraction [0.0-1.0]) or 'expect' parameter (desired doc count)");

  // Consider the first 8 characters of the doc checksum (for now, taken from _rev) as a real number
  // on the range [0.0, 1.0), i.e. ["00000000", "ffffffff"].
  var doc_key = req.query.key || '_rev';
  var doc_val = doc[doc_key];
  var hex_re  = req.query.re || (doc_key === '_rev' ? /^\d+-([0-9a-f]{8})/ : /^([0-9a-f]{8})/);

  if(typeof hex_re === 'string')
    hex_re = new RegExp(hex_re);

  doc_val = parseInt(hex_re.exec(doc_val)[1], 16);

  var ONE = 4294967295; // parseInt("ffffffff", 16);
  return doc_val <= (ONE * p);
}
