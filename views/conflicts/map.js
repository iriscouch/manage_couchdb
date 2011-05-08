function(doc) {
  if(doc._conflicts) {

    function emit_rev(rev) {
      var key = [doc._id, rev];

      // Create a value that will pull the correct revision when ?include_docs=true is specified.
      var value = { "_id": doc._id, "_rev": rev };

      emit(key, value);
    }

    // First emit the "winning" revision.
    emit_rev(doc._rev);

    // Next emit all the revisions properly recorded as a conflict.
    for(var a = 0; a < doc._conflicts.length; a++)
      emit_rev(doc._conflicts[a]);
  }
}
