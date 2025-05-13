#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <app_id> e.g. appbundle.json"
  exit 1
fi
appbundle_json="$1"

json_data=$(cat "$appbundle_json")
endpointURL=$(echo "$json_data" | jq -r '.uploadParameters.endpointURL')
key=$(echo "$json_data" | jq -r '.uploadParameters.formData.key')
policy=$(echo "$json_data" | jq -r '.uploadParameters.formData.policy')
x_amz_signature=$(echo "$json_data" | jq -r --arg key "x-amz-signature" '.uploadParameters.formData[$key]')
x_amz_credential=$(echo "$json_data" | jq -r --arg key "x-amz-credential" '.uploadParameters.formData[$key]')
x_amz_date=$(echo "$json_data" | jq -r --arg key "x-amz-date" '.uploadParameters.formData[$key]')
x_amz_security_token=$(echo "$json_data" | jq -r --arg key "x-amz-security-token" '.uploadParameters.formData[$key]')

curl -X POST \
  "$endpointURL" \
  -H "Cache-Control: no-cache" \
  -F "key=$key" \
  -F "content-type=application/octet-stream" \
  -F "policy=$policy" \
  -F "success_action_status="200"" \
  -F "success_action_redirect=" \
  -F "x-amz-signature=$x_amz_signature" \
  -F "x-amz-credential=$x_amz_credential" \
  -F "x-amz-algorithm=AWS4-HMAC-SHA256" \
  -F "x-amz-date=$x_amz_date" \
  -F "x-amz-server-side-encryption=AES256" \
  -F "x-amz-security-token=$x_amz_security_token" \
  -F "file=@$BUNDLE_FILE"
