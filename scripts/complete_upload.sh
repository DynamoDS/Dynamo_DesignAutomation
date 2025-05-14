#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <bucket_key> <object_key> <upload_json>" e.g. abi_daas_test_bucket DeleteFiles.rvt DeleteFiles.rvt_upload.json
  exit 1
fi
bucket_key="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <bucket_key> <object_key> <upload_json>" e.g. abi_daas_test_bucket DeleteFiles.rvt DeleteFiles.rvt_upload.json
  exit 1
fi
object_key="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <bucket_key> <object_key> <upload_json>" e.g. abi_daas_test_bucket DeleteFiles.rvt DeleteFiles.rvt_upload.json
  exit 1
fi
upload_json="$3"

json_data=$(cat "$upload_json")
upload_key=$(echo "$json_data" | jq -r '.uploadKey')

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  "https://developer.api.autodesk.com/oss/v2/buckets/$bucket_key/objects/$object_key/signeds3upload" \
  -H "Authorization: Bearer $access_token" \
  -H 'Content-Type: application/json' \
  -d '{
        "uploadKey": "'"$upload_key"'"
    }' \
    -o "${object_key}_upload_complete.json"
