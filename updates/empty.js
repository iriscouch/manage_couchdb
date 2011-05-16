function(doc, req) {
  var ddoc = this
    , result
    ;

  doc = doc || {"_id":req.uuid};
  doc.stamp = new Date;

  result = {doc:doc, req:req};
  return [ doc, { code: 200
                , headers: { 'Content-Type': 'application/json'
                           }
                , body: JSON.stringify(result)
                }
         ]
}
