#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <bucket_key> e.g. abi_daas_test_bucket"
  exit 1
fi
bucket_key="$1"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  'https://developer.api.autodesk.com/oss/v2/buckets' \
  -H "Authorization: Bearer $access_token" \
  -H 'Content-Type: application/json' \
  -H 'x-ads-region: US' \
      -d '{
          "bucketKey": "'"$bucket_key"'",
          "access": "full",
          "policyKey": "transient"
      }' \
    -o bucket.json
