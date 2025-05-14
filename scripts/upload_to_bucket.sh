#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <upload_json> <file> e.g. DeleteWalls.rvt_upload.json DeleteWalls.rvt"
  exit 1
fi
upload_json="$1"

json_data=$(cat "$upload_json")
signed_upload_url=$(echo "$json_data" | jq -r '.url')

if [ -z "$2" ]; then
  echo "Usage: $0 <upload_json> <file> e.g. DeleteWalls.rvt_upload.json DeleteWalls.rvt"
  exit 1
fi
file="$2"

curl -X PUT \
  "$signed_upload_url" \
  -H "Content-Type: application/octet-stream" --data-binary "@$file"
