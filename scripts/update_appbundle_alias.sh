#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <app_id> <app_alias> <app_version> e.g. DeleteWallsApp test 2"
  exit 1
fi
app_id="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <app_id> <app_alias> <app_version> e.g. DeleteWallsApp test 2"
  exit 1
fi
app_alias="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <app_id> <app_alias> <app_version> e.g. DeleteWallsApp test 2"
  exit 1
fi
app_version="$3"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X PATCH \
"https://developer.api.autodesk.com/da/us-east/v3/appbundles/$app_id/aliases/$app_alias" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
        "version": "'"$app_version"'"
      }'
