#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <workitem_id> e.g. aa698c9fb29b4edfb7b01979aeba1e95"
  exit 1
fi
workitem_id="$1"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X GET \
  "https://developer.api.autodesk.com/da/us-east/v3/workitems/$workitem_id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -o "workitem_${workitem_id}.json"
