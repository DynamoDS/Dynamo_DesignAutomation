#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <activity_id> <activity_alias> e.g. DeleteWallsAppActivity 1 test"
  exit 1
fi
activity_id="$1"

if [ -z "$1" ]; then
  echo "Usage: $0 <activity_id> <activity_version> <activity_alias> e.g. DeleteWallsAppActivity 1 test"
  exit 1
fi
activity_version="$2"

if [ -z "$3" ]; then
  echo "Usage: $0 <activity_id> <activity_version> <activity_alias> e.g. DeleteWallsAppActivity 1 test"
  exit 1
fi
activity_alias="$3"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  "https://developer.api.autodesk.com/da/us-east/v3/activities/$activity_id/aliases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
      "version": "'"$activity_version"'",
      "id": "'"$activity_alias"'",
    }'
