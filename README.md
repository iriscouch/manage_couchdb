# Manage CouchDB: Common CouchDB management and maintenance tools

Manage CouchDB is a Couch app ("design document") to do all the common stuff we all need.

It has identical implementations in **JavaScript** (for clarity and portability) and **Erlang** (for performance). Both implementations pass the same test suite.

Just drop it in your database (the id is `_design/couchdb` for JavaScript, and `_design/ecouchdb` for Erlang) to get several features.

## A view of all conflicts

Use `?group_level=1` to get a conflict count for each document

Use `?reduce=false` to get one row per `[id,revision]` pair.

Use `?reduce=false&include_docs=true` to get every conflicted revision in one big batch.

## An easy-to-use validation function

To make a database read-only, edit this design document (e.g. `_design/couchdb`), and set `.access.read_only` = **true**.

When a database is read-only, normal users *may not* modify any documents. Admins *may* make changes, but a note is placed in the CouchDB log file.

## Refilter: a powerful regular-expression filter function

The filter function, `refilter`, is great for filtered replication or `_changes` feeds. Just provide:

* The **key** in the document
* A **regex** it should match

Refilter will *pass* documents that match.

### Refilter example

Suppose your documents have a *created_at* value, with a timestamp.

    { "_id": "example_doc"
    , "created_at": "2011-06-19T00:42:20.079Z"
    , "value": 23
    }

To get *documents from June this year and last*, drop this document in the `_replicator` database.

    { "_id": "docs created in June"
    , "source": "the_big_database"
    , "target": "june"
    , "filter": "ecouchdb/refilter"
    , "query_params": { "field": "created_at"
                      , "regex": "^(2011|2012)-06"
                      }
    }

## Small print

JavaScript and Erlang are not quite at parity at present. I am working on it though!
