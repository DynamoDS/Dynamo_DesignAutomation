#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <nickname>"
  exit 1
fi
nickname="$1"

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X PATCH \
  https://developer.api.autodesk.com/da/us-east/v3/forgeapps/me \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d '{"nickname": "'"$nickname"'"}'
