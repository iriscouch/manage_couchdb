function(newDoc, oldDoc, userCtx, secObj) {
  var ddoc = this;

  secObj.admins = secObj.admins || {};
  secObj.admins.names = secObj.admins.names || [];
  secObj.admins.roles = secObj.admins.roles || [];

  var IS_DB_ADMIN = false;
  var i;

  if(userCtx.roles.indexOf('_admin') !== -1)
    IS_DB_ADMIN = true;
  if(secObj.admins.names.indexOf(userCtx.name) !== -1)
    IS_DB_ADMIN = true;
  for(i = 0; i < userCtx.roles; i++)
    if(secObj.admins.roles.indexOf(userCtx.roles[i]) !== -1)
      IS_DB_ADMIN = true;

  if(ddoc.access && ddoc.access.read_only)
    if(IS_DB_ADMIN)
      log('Admin change on read-only db: ' + newDoc._id);
    else
      throw {forbidden: "This database is read-only"};
}
