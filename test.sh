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

echo "# Looking for CouchDB"
db="test_manage_couchdb"
if ! curl --fail --silent "$couch"; then
  echo "Failed to access CouchDB at $couch. Set \$couch first." >&2
  exit 1
fi
echo

set -e

if [ -z "$skip" ]; then
  echo "# Configuring CouchDB"
  curl --fail --silent -XPUT "$couch/_config/native_query_servers/erlang" -d '"{couch_native_process, start_link, []}"'

  curl --silent -XDELETE "$couch/$db"
  curl --fail --silent -XPUT "$couch/$db"

  echo
  echo "# Pushing JavaScript app"
  kanso push "js" "$couch/$db"

  echo
  echo "# Pushing Erlang app"
  kanso push "erlang" "$couch/$db"
fi

export couch
export db

echo
echo "# Running TAP test suite"

if [ -f "$1" ]; then
  node "$1"
else
  tap --stderr ./tap
fi
