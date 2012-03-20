fun({Doc})
    -> case couch_util:get_value(<<"_conflicts">>, Doc)
        of undefined -> ok
        ; Conflicts
            -> Doc_id = couch_util:get_value(<<"_id">>, Doc)
            , Emit_rev = fun(Rev)
                % Emit a value that will pull the correct revision for ?include_docs=true.
                -> Emit( [Doc_id, Rev], {[ {<<"_id">>,Doc_id}, {<<"_rev">>,Rev} ]} )
                %, Key = [ Doc_id, Rev ]
                %, Value = {[ {<<"_id">>,Doc_id}, {<<"_rev">>,Rev} ]}
                %, Emit(Key, Value)
                end

            % First emit the "winning" revision.
            , Emit_rev(couch_util:get_value(<<"_rev">>, Doc))

            % Next, emit all revisions properly recorded as a conflict.
            , lists:foreach(Emit_rev, Conflicts)
        end
    end
.
