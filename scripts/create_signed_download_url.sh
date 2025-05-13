#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <bucket_key> <object_key> e.g. abi_daas_test_bucket result.json"
  exit 1
fi
bucket_key="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <bucket_key> <object_key> e.g. abi_daas_test_bucket result.json"
  exit 1
fi
object_key="$2"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X GET \
  "https://developer.api.autodesk.com/oss/v2/buckets/$bucket_key/objects/$object_key/signeds3download" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -o "${object_key}_download.json"
