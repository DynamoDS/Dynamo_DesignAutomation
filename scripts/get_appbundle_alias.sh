#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <app_id> e.g. DeleteWallsApp"
  exit 1
fi
app_id="$1"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X GET \
  "https://developer.api.autodesk.com/da/us-east/v3/appbundles/$app_id/aliases" \
  -H "Authorization: Bearer $access_token"
