#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <app_id> <app_alias> e.g. DeleteWallsApp test"
  exit 1
fi
app_id="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <app_id> <app_alias> e.g. DeleteWallsApp test"
  exit 1
fi
app_alias="$2"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  "https://developer.api.autodesk.com/da/us-east/v3/appbundles/$app_id/aliases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
      "version": "1",
      "id": "'"$app_alias"'"
    }'
