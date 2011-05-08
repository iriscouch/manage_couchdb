function(doc) {
  if(doc._conflicts) doc._conflicts.forEach(function(conflicted_revision) {
    var key = [doc._id, conflicted_revision];
    var value = 1; // For counting conflicts`

    emit(key, value);
  })
}
