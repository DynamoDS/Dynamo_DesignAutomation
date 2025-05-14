#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <workitem_status_json> <file> e.g. workitem_aa698c9fb29b4edfb7b01979aeba1e95.json"
  exit 1
fi
workitem_status_json="$1"

json_data=$(cat "$workitem_status_json")
report_url=$(echo "$json_data" | jq -r '.reportUrl')

curl -X GET \
    "$report_url" \
    -o report.txt
