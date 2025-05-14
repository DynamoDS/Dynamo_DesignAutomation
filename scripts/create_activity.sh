#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <nickname> <app_id> <app_alias> <activity_id> e.g. abi_daas_test DeleteWallsApp test DeleteWallsAppActivity"
  exit 1
fi
nickname="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <nickname> <app_id> <app_alias> <activity_id> e.g. abi_daas_test DeleteWallsApp test DeleteWallsAppActivity"
  exit 1
fi
app_id="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <nickname> <app_id> <app_alias> <activity_id> e.g. abi_daas_test DeleteWallsApp test DeleteWallsAppActivity"
  exit 1
fi
app_alias="$3"

if [ -z "$4" ]; then
  echo "Usage: $0 <nickname> <app_id> <app_alias> <activity_id> e.g. abi_daas_test DeleteWallsApp test DeleteWallsAppActivity"
  exit 1
fi
activity_id="$4"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  "https://developer.api.autodesk.com/da/us-east/v3/activities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
        "id": "'"$activity_id"'",
        "commandLine": [ "$(engine.path)\\\\revitcoreconsole.exe /i \"$(args[rvtFile].path)\" /al \"$(appbundles[DeleteWallsApp].path)\"" ],
        "parameters": {
            "rvtFile": {
              "zip": false,
              "ondemand": false,
              "verb": "get",
              "description": "Input Revit model",
              "required": true,
              "localName": "$(rvtFile)"
            },
            "runRequest": {
              "zip": false,
              "ondemand": false,
              "verb": "get",
              "description": "Input Revit model",
              "required": false,
              "localName": "'"$RUN_REQ_FILE"'"
            },
            "pythonLibs": {
              "zip": true,
              "ondemand": false,
              "verb": "get",
              "description": "Python libs",
              "required": false,
              "localName": "'"$PYTHON_FILE"'"
            },
            "result": {
              "zip": false,
              "ondemand": false,
              "verb": "put",
              "description": "Results",
              "required": true,
              "localName": "'"$RESULT_FILE"'"
            },
        },
        "engine": "Autodesk.Revit+2026",
        "appbundles": [ '"'$nickname.$app_id+$app_alias'"' ],
        "description": "Deletes walls from Revit file."
    }' \
    -o activity.json
