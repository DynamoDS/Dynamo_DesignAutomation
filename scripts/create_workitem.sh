#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <nickname> <activity_id> <activity_alias> <bucket_key> e.g. abi_daas_test DeleteWallsActivity test abi_daas_test_bucket"
  exit 1
fi
nickname="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <nickname> <activity_id> <activity_alias> <bucket_key> e.g. abi_daas_test DeleteWallsActivity test abi_daas_test_bucket"
  exit 1
fi
activity_id="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <nickname> <activity_id> <activity_alias> <bucket_key> e.g. abi_daas_test DeleteWallsActivity test abi_daas_test_bucket"
  exit 1
fi
activity_alias="$3"

if [ -z "$4" ]; then
  echo "Usage: $0 <nickname> <activity_id> <activity_alias> <bucket_key> e.g. abi_daas_test DeleteWallsActivity test abi_daas_test_bucket"
  exit 1
fi
bucket_key="$4"

access_token=$($(dirname "$0")/get_access_token.sh)
timestamp=$(date +%s)

curl -X POST \
  'https://developer.api.autodesk.com/da/us-east/v3/workitems' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $access_token" \
  -d '{
        "activityId": "'"$nickname.$activity_id+$activity_alias"'",
        "arguments": {
          "rvtFile": {
            "url": '"'urn:adsk.objects:os.object:$bucket_key/$RVT_FILE'"',
              "verb": "get",
              "headers": {
                "Authorization": '"'Bearer $access_token'"'
              }
          },
          "runRequest": {
            "url": "'"urn:adsk.objects:os.object:$bucket_key/$RUN_REQ_FILE"'",
              "verb": "get",
              "headers": {
                  "Authorization": '"'Bearer $access_token'"'
              }
          },
          "pythonLibs": {
            "url": "'"urn:adsk.objects:os.object:$bucket_key/$PYTHON_FILE"'",
              "verb": "get",
              "headers": {
                  "Authorization": '"'Bearer $access_token'"'
              }
          },

          "result": {
            "url": "'"urn:adsk.objects:os.object:$bucket_key/$RESULT_FILE"'",
            "verb": "put",
            "headers": {
              "Authorization": '"'Bearer $access_token'"'
            }
          }
        }
      }' \
    -o "workitem_${timestamp}.json"
