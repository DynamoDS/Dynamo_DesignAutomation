#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <activity_id> <activity_alias> <activity_version> e.g. DeleteWallsAppActivity test 1"
  exit 1
fi
activity_id="$1"

if [ -z "$2" ]; then
  echo "Usage: $0 <activity_id> <activity_alias> <activity_version> e.g. DeleteWallsAppActivity test 1"
  exit 1
fi
activity_alias="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <activity_id> <activity_alias> <activity_version> e.g. DeleteWallsAppActivity test 1"
  exit 1
fi
activity_version="$3"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X PATCH \
"https://developer.api.autodesk.com/da/us-east/v3/activities/$activity_id/aliases/$activity_alias" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
        "version": '"$activity_version"'
    }'
