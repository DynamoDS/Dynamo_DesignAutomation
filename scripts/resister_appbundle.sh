#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <app_id> e.g. DeleteWallsApp"
  exit 1
fi
app_id="$1"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X POST \
  "https://developer.api.autodesk.com/da/us-east/v3/appbundles" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'"$app_id"'",
    "engine": "Autodesk.Revit+2026",
    "description": "Delete Walls AppBundle based on Revit 2026"
    }' \
  -o appbundle.json
