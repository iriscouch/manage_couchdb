function(doc, req) {
  // Return a consistent, random subset: between 0% to 100% of the documents. (Design documents and deletes always pass.)
  //

  if(/^_design\//.test(doc._id))
    return true;

  if(doc._deleted) {
    log("Deleted document: " + JSON.stringify(doc));
    return true;
  }

  if(!req.query.p)
    throw new Error("Must supply a 'p' parameter with the fraction of documents to pass [0.0-1.0]");
  
  var p = parseFloat(req.query.p);
  if(!(p >= 0.0 && p <= 1.0)) // Also catches NaN
    throw new Error("Must supply a 'p' parameter with the fraction of documents to pass [0.0-1.0]");

  // Consider the first 8 characters of the doc checksum (for now, taken from _rev) as a real number
  // on the range [0.0, 1.0), i.e. ["00000000", "ffffffff"].
  var ONE = 4294967295; // parseInt("ffffffff", 16);
  var doc_val = parseInt(doc._rev.match(/^\d+-([0-9a-f]{8})/)[1], 16);

  return doc_val <= (ONE * p);
}
