# Refilter: Fast CouchDB filters using regular expressions

Refilter is an Erlang (native) Couch app useful for filtered replication or `_changes` feeds. Just provide:

* The **key** in the document
* A **regex** it should match

Refilter will *pass* documents that match.

## Example

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
