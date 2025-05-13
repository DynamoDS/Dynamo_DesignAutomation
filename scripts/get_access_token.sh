#!/usr/bin/env bash

base_64_encoded=$(echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64)

response=$(curl "https://developer.api.autodesk.com/authentication/v2/token" \
  -X "POST" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $base_64_encoded" \
  -d "grant_type=client_credentials" \
  -d "scope=code:all bucket:create bucket:read data:create data:write data:read")

access_token=$(echo $response | jq --raw-output '.access_token')
echo $access_token
