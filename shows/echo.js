function(doc, req) {
  var ddoc = this
    , result
    ;

  result = {doc:doc, req:req};
  return { code: 200
         , headers: { 'Content-Type': 'application/json'
                    }
         , body: JSON.stringify(result)
         }
}
