function(doc) {
  (doc._conflicts || []).forEach(function(conflict) {
    emit([doc._id, conflict], 1);
  })
}
