% Typical req.query (at a minimum, the "filter" parameter will be there):
%
% {[ { <<"filter">>, <<"usagemover/field_regex">> }
%  , { <<"field">> , <<"_id">> }
%  , { <<"regex">> , <<"^a">> }
%  , { <<"log">>   , true } % (optional)
% ]}

fun({Doc}, {Req}) -> ok
    , Id = couch_util:get_value(<<"_id">>, Doc)
    , {Query} = couch_util:get_value(<<"query">>, Req)
    , L = case couch_util:get_value(<<"log">>, Query)
        of true      -> fun(F, A) -> Log(lists:flatten(io_lib:format(F, A))) end
        ; <<"true">> -> fun(F, A) -> Log(lists:flatten(io_lib:format(F, A))) end
        ; _          -> fun(_F, _A) -> ok end
        end

    , Field = couch_util:get_value(<<"field">>, Query)
    , Regex = couch_util:get_value(<<"regex">>, Query)
    , L("Running: Id=~p\nReq=~p", [Id, Req])

    , case is_binary(Field) andalso is_binary(Regex)
        of false -> ok
            , L("Invalid parameters: Field=~p Regex=~p", [Field, Regex])
            , exit({invalid_query, <<"Required field and regex parameter">>})
        ; true -> ok
            , L("Field=~p Regex=~p", [Field, Regex])
            , case couch_util:get_value(Field, Doc)
                of undefined -> ok
                    , L("Doc ~s has no field ~s", [Id, Field])
                    , false
                ; Non_bin when not is_binary(Non_bin) -> ok
                    , L("Doc ~s field ~s is not a string: ~p", [Id, Field, Non_bin])
                    , false
                ; Value -> ok
                    , L("Testing '~s' to '~s'", [Value, Regex])
                    , {ok, Pattern} = re:compile(Regex)
                    , case re:run(Value, Pattern, [])
                        of nomatch -> ok
                            , L("No match: ~s", [Id])
                            , false
                        ; _ -> ok
                            , L("Match: ~s", [Id])
                            , true
                        end
                end
        end
    end
.

% vim: sts=4 sw=4 et
