var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , utils = require('./utils')

module.exports = function (root, dir, settings, doc, callback) {
  var app_settings = settings['traditional-couchapp'] || {}
  if(typeof app_settings == 'string')
    app_settings = {'path':app_settings}

  // Load the couchapp from a specified subdirectory ("." by default).
  var app_dir = app_settings.path || '.'
  dir = path.join(dir, app_dir)

  fs.readdir(dir, function (err, files) {
    if (err)
      return callback(err)

    // remove hidden files and .json config files
    files = files.filter(function (f) {
      // don't add configuration files
      if (f === 'kanso.json' || f === 'couchapp.json')
          return false

      // don't add other kanso packages directly
      if (f === 'packages')
          return false

      // don't add hidden files with preceeding '.'
      return f[0] !== '.'
    })

    async.forEach(files,
      function (f, cb) {
        var p = path.join(dir, f)

        if (f === '_attachments')
          utils.loadAttachments(dir + '/_attachments', p, doc, cb)
        else if(f === '_docs') {
          console.error('Additional docs unsupported: ' + p)
          return cb()
        } else
          utils.loadFiles(dir, p, doc, cb)
      },
      function (err) {
        callback(err, doc)
      })
  })
}
