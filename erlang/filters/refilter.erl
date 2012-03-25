% Typical req.query (at a minimum, the "filter" parameter will be there):
%
% {[ { <<"filter">>, <<"usagemover/field_regex">> }
%  , { <<"field">> , <<"_id">> }
%  , { <<"regex">> , <<"^a">> }
%  , { <<"log">>   , true } % (optional)
% ]}

fun({Doc}, {Req})
    -> {Query} = couch_util:get_value(<<"query">>, Req)

    % Unfortunately, building a function for every execution (i.e. once per doc) imposes a steep
    % performance penalty. I tried the process dictionary to memoize it but that didn't help.
    % So, uncomment this to activate logging. In the Javascript version, performance is secondary,
    % so it should support logging by default.
    %, Logger = case couch_util:get_value(<<"log">>, Query)
    %    of true      -> fun(F, A) -> Log(lists:flatten(io_lib:format(F, A))) end
    %    ; <<"true">> -> fun(F, A) -> Log(lists:flatten(io_lib:format(F, A))) end
    %    ; _          -> fun(_F, _A) -> ok end
    %    end

    , Field = couch_util:get_value(<<"field">>, Query)
    , Regex = couch_util:get_value(<<"regex">>, Query)
    %, Logger("Running: Id=~p\nReq=~p", [Id, Req])

    , case is_binary(Field) andalso is_binary(Regex)
        of false ->
            %Logger("Invalid parameters: Field=~p Regex=~p", [Field, Regex]),
            exit({invalid_query, <<"Required field and regex parameter">>})
        ; true
            %Logger("Field=~p Regex=~p", [Field, Regex]),
            -> Is_match = case couch_util:get_value(Field, Doc)
                of undefined ->
                    %Logger("Doc ~s has no field ~s", [Id, Field]),
                    false
                ; Non_bin when not is_binary(Non_bin) ->
                    %Logger("Doc ~s field ~s is not a string: ~p", [Id, Field, Non_bin]),
                    false
                ; Value ->
                    %Logger("Testing '~s' to '~s'", [Value, Regex]),
                    case re:run(Value, Regex, [])
                        of nomatch ->
                            %Logger("No match: ~s", [Id]),
                            false
                        ; _ ->
                            %Logger("Match: ~s", [Id]),
                            true
                        end
                end

            % Matches of course pass. But if the match fails and ddocs are requested, pass any ddocs.
            , case Is_match
                of true -> true
                ;  false
                    -> Id = couch_util:get_value(<<"_id">>, Doc)
                    , DDocs = couch_util:get_value(<<"ddocs">>, Query)
                    , Is_ddocs = DDocs =:= true orelse DDocs =:= <<"true">>
                    , case {Is_ddocs, Id}
                        of {true, <<"_design/", _/binary>>} -> true
                        ;  _                                -> false
                        end
                end
        end
    end
.

% vim: sts=4 sw=4 et
