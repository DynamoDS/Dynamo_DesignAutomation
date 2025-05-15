#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <download_json> e.g. result.json_download.json"
  exit 1
fi
download_json="$1"

json_data=$(cat "$download_json")
signed_download_url=$(echo "$json_data" | jq -r '.url')

curl -X GET \
    "$signed_download_url" \
    -o "$RESULT_FILE"
