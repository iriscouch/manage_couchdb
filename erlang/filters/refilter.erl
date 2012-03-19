% Typical req.query (at a minimum, the "filter" parameter will be there):
%
% { [ { <<"filter">>, <<"usagemover/field_regex">> }
%   , { <<"field">> , <<"_id">> }
%   , { <<"regex">> , <<"^a">> }
%   , { <<"log">>   , true } % (optional)
%   ]
% }
fun({Doc}, {Req})
    -> ok
    , Id = couch_util:get_value(<<"_id">>, Doc)
    , {Query} = couch_util:get_value(<<"query">>, Req)
    , L = case couch_util:get_value(<<"log">>, Query)
        of true
            -> fun(F, A) -> Log(lists:flatten(io_lib:format(F, A))) end
        ; _
            -> fun(_F, _A) -> ok end
        end
    , L("Running: Id=~p\nReq=~p", [Id, Req])
    , case { couch_util:get_value(<<"field">>, Query)
           , couch_util:get_value(<<"regex">>, Query)
           }
        of {Field, Regex} when not is_binary(Field) orelse not is_binary(Regex)
            -> L("Invalid field or regex parameter: Field=~p Regex=~p", [Field, Regex])
            , exit({invalid_query, <<"Required field and regex parameter">>})
        ; {Field, Regex}
            -> L("Field=~p Regex=~p", [Field, Regex])
            , case couch_util:get_value(Field, Doc)
                of undefined
                    -> L("Doc ~s has no field ~s", [Id, Field])
                    , false
                ; BadValue when not is_binary(BadValue)
                    -> L("Doc ~s field ~s is not a string: ~p", [Id, Field, BadValue])
                    , false
                ; FieldValue
                    -> L("Testing '~s' against '~s'", [FieldValue, Regex])
                    , {ok, Pattern} = re:compile(binary_to_list(Regex))
                    , case re:run(FieldValue, Pattern, [])
                        of nomatch
                            -> L("No match: ~s", [Id])
                            , false
                        ; _
                            -> L("Match: ~s", [Id])
                            , true
                        end
                end
        end
end
.

% vim: sts=4 sw=4 et
