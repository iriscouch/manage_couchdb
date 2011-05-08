function(doc) {
  if(doc._conflicts) {

    function emit_rev(rev) {
      var value = 1; // The fast built-in _sum reduction will result in a count of conflicted revisions.
      var key = [doc._id, rev];

      emit(key, value);
    }

    // First emit the "winning" revision.
    emit_rev(doc._rev);

    // Next emit all the revisions properly recorded as a conflict.
    for(var a = 0; a < doc._conflicts.length; a++)
      emit_rev(doc._conflicts[a]);
  }
}
