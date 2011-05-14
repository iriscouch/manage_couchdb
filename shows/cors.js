function(doc, req) {
  var ddoc = this
    , result
    ;

  result = {ok:true, time:new Date, doc:doc, req:req};
  result = {ok:true, headers:req.headers};
  return { code: 200
         , headers: { 'Content-Type': 'application/json'
                    , 'Access-Control-Allow-Origin': 'http://localhost:5984'
                    }
         , body: JSON.stringify(result)
         }
}
