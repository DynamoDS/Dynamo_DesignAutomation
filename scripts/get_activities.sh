#!/usr/bin/env bash

access_token=$($(dirname "$0")/get_access_token.sh)

curl -X GET \
  "https://developer.api.autodesk.com/da/us-east/v3/activities" \
  -H "Authorization: Bearer $access_token"
