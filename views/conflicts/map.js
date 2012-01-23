function(doc) {
  if(doc._conflicts) {
    // First emit the "winning" revision.
    emit_rev(doc._rev)

    // Next emit all the revisions properly recorded as a conflict.
    for(var a = 0; a < doc._conflicts.length; a++)
      emit_rev(doc._conflicts[a])
  }

  function emit_rev(rev) {
    // Emit a value that will pull the correct revision for ?include_docs=true.
    var key = [doc._id, rev]
      , value = { "_id": doc._id, "_rev": rev }

    emit(key, value)
  }
}
