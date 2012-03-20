#!/bin/sh
#
# Deploy the couchapp

[ -z "$couch" ] && couch="$1"
[ -z "$couch" ] && couch="http://localhost:5984"

if [ -z "$skip" ]; then
  if [ "$1" = "skip" ]; then
    skip="true"
    shift
  fi
fi

db="test_manage_couchdb"
if ! curl --fail --silent "$couch"; then
  echo "Failed to access CouchDB at $couch. Set \$couch first." >&2
  exit 1
fi

set -e

if [ -z "$skip" ]; then
  curl --fail --silent -XPUT "$couch/_config/native_query_servers/erlang" -d '"{couch_native_process, start_link, []}"'

  curl --silent -XDELETE "$couch/$db"
  curl --fail --silent -XPUT "$couch/$db"

  kanso push "js" "$couch/$db"
  kanso push "erlang" "$couch/$db"
fi

export couch
export db
if [ -f "$1" ]; then
  node "$1"
else
  tap --stderr ./tap
fi
