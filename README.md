# DynamoRevit for Design Automation
This repo contains supporting files, scripts and documentation that can help streamline onboarding and running Dynamo graphs in Design automation for Revit.

## Overview of the standard design automation process

- Create an `AppBundle`, a collection of dlls that represents a revit cloud addin.
- Publish an `Activity`, metadata that describes some of the characteristics of the job that will run your AppBundle, like the inputs and outputs.
- Upload files to `Cloud Storage`, the files that will be referenced by the Activity.
- Submit a `WorkItem`, a job.
- Download the `Results`.

https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/

## Prerequisites

- Go to [APS Developer portal](https://aps.autodesk.com/).
- Create an app.
- Grab the Client ID anc Client Secret, export `CLIENT_ID` and `CLIENT_SECRET` as environment variables and/or save it in `.env` file. (Copy `.env.example` and save it as `.env`)

> [!TIP]
>
> - [dotenv](https://www.npmjs.com/package/dotenv) can be used to load .env in .js files
> - [direnv](https://direnv.net/) can be used to load .env as environment variables.

## Scripts

- You use these [bash scripts](/scripts/) to perform all of the tasks listed above. e.g. `./scripts/get_appbundles.sh`. Requires [jq](https://jqlang.org/).
- You can also use this [js script](./design_automation.js) for all the update tasks once the resources are created. e.g `node design_automation.js all`.
- You can also use postman collection from [here](https://github.com/autodesk-platform-services/aps-tutorial-postman/tree/master/DA4Revit/collections).

### How to run design_automation.js
- Install [nodejs](https://nodejs.org/en/download) and run `npm install`
- Populate/customize the .env.example file with your APS data.
- Run `node design_automation.js all` to set up all tasks (from 2 to 8)
- You can also run individual tasks, by specifying one or more of the following arguments: 
  - `nick`- Creates a nickname
  - `bundle`- Creates an app bundle 
  - `activity` - Creates an activity
  - `rvt` - Uploads the revit file
  - `python` - Uploads the pythonDependencies.zip
  - `run` - Uploads the run.json request
  - `work` - Creates and submits a WorkItem request
  - `result` - Polls for results (ands saves the results locally log.txt, result.json and result.rvt)

## Tasks

For general instructions see the [Walkthrough](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/)

- Task 1 - [Convert Revit Add-in](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step1-convert-addin/)
  - The adding is already created and you can download it from [DynamoRevitDA.zip](./da_files/DynamoRevitDA.zip)

  - If you need to use python nodes please also download [pythonDependencies.zip](./da_files/pythonDependencies.zip)

  `download_artifacts.sh`
- Task 2 – [Obtain an Access Token](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step2-create-forge-app/) `get_access_token.sh`
- Task 3 – [Create a Nickname](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step3-create-nickname/) `create_nickname.sh`
- Task 4 – [Upload the AppBundle](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step4-publish-appbundle/)
  - Register the AppBundle `register_appbundle.sh`
  - Upload the AppBundle. Use [DynamoRevitDA.zip](./da_files/DynamoRevitDA.zip). `upload_appbundle.sh` 
  - Create an alias for the AppBundle. `create_appbuldle_alias.sh`
  - Create a new version of the AppBundle. `update_appbundle.sh`
  - Point the alias to the new version of the AppBundle. `update_appbundle_alias.sh`
- Task 5 – [Publish an Activity](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step5-publish-activity/) `create_activity.sh` `create_activity_alias.sh`
  - parameters - the DynamoAddin requires the following parameters (but not limited to):
    - An `.rvt` file (get parameter) on which to operate (will be automatically opened as the current revit model). You can use [DeleteWalls.rvt](./DeleteWalls.rvt) as an example.
    - A `run.json` file (get parameter). This must respect the Player specifications for a GraphRunRequest. You can use [run.json](./da_files/run.json) as an example.
    - A `pythonDependencies.zip` (get paramter). This zip can be downloaded from [pythonDependencies.zip](./da_files/pythonDependencies.zip). It contains the Python.Included.dll and Python.ScyPy.dll normally included with Dynamo out of the box. These must be uploaded separately from Dynamo because they are too large to bundle up with the DynamoAddin (DesignAutomation has a size limit on the AppBundles you can upload set at 100 MB).
    - A `result.json` (put parameter) can be included. This file will contain the graph run output (as produced by Dynamo Player).
    - A `result.rvt` (put parameter) can be included in order to download it. This file will contain the provided revit model after the dynamo run.

    Here is an example of an activity:
    ```shell
    curl -X POST  'https://developer.api.autodesk.com/da/us-east/v3/activities'  -H 'Content-Type: application/json'  -H 'Authorization: Bearer dummy_token'  -d '{
            "id": "DeleteWallsActivity13",
            "commandLine": [ "$(engine.path)\\\\revitcoreconsole.exe /i \"$(args[rvtFile].path)\" /al \"$(appbundles[DynamoDATest].path)\"" ],
            "parameters": {
             "rvtFile": {
                "zip": false,
                "ondemand": false,
                "verb": "get",
                "description": "Input Revit model",
                "required": true,
                "localName": "$(rvtFile)"
              },
             "runRequest": {
                "zip": false,
                "ondemand": false,
                "verb": "get",
                "description": "Input Revit model",
                "required": false,
                "localName": "run.json"
              },
              "pythonLibs": {
                "zip": true,
                "ondemand": false,
                "verb": "get",
                "description": "Python libs",
                "required": false,
                "localName": "pythonDependencies"
              },
              "dynResult": {
                "zip": false,
                "ondemand": false,
                "verb": "put",
                "description": "Results",
                "required": false,
                "localName": "result.json"
              },
              "rvtResult": {
                "zip": false,
                "ondemand": false,
                "verb": "put",
                "description": "Results",
                "required": false,
                "localName": "result.rvt"
              }
            },
            "engine": "Autodesk.Revit+2026",
            "appbundles": [ "DynamoDATest.DynamoDATest+test" ],
            "description": "Deletes walls from Revit file."
          }'
    ```

- Task 6 – [Prepare Cloud Storage](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step6-prepare-cloud-storage/) `create_bucket.sh` `create_signed_upload_url.sh` `complete_upload.sh`
  - The get parameters described at the previous step must be uploaded as individual files:
    - The `.rvt` file
    - The `run.json` file
    - The `run.dyn` file
    - The `pythonpythonDependencies.zip`

- Task 7 - [Submit a WorkItem](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step7-post-workitem/) `create_activity.sh` `create_activity_alias.sh`

  Here is an example of an activity:

  ```shell
    curl -X POST \
      'https://developer.api.autodesk.com/da/us-east/v3/workitems' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <ACCESS_TOKEN>' \
      -d '{
            "activityId": "DynamoDATest.DeleteWallsActivity7+test",
            "arguments": {
              "rvtFile": {
                "url": "urn:adsk.objects:os.object:dynamodatestbucket/DeleteWalls.rvt",
                  "verb": "get",
                  "headers": {
                    "Authorization": "Bearer <ACCESS_TOKEN>"
                  }
              },
              "runRequest": {
                "url": "urn:adsk.objects:os.object:dynamodatestbucket/run.json",
                  "verb": "get",
                  "headers": {
                    "Authorization": "Bearer <ACCESS_TOKEN>"
                  }
              },
              "pythonLibs": {
                "url": "urn:adsk.objects:os.object:dynamodatestbucket/da_files/pythonDependencies.zip",
                  "verb": "get",
                  "headers": {
                    "Authorization": "Bearer <ACCESS_TOKEN>"
                  }
              },
              "dynResult": {
                  "url": `urn:adsk.objects:os.object:dynamodatestbucket/result.json`,
                  "verb": "put",
                  "headers": {
                      "Authorization": `Bearer ${access_token}`
                  }
              },
              "rvtResult": {
                  "url": `urn:adsk.objects:os.object:dynamodatestbucket/result.rvt`,
                  "verb": "put",
                  "headers": {
                      "Authorization": `Bearer ${access_token}`
                  }
              }
            }
          }'
  ```

  - Get workitem status `get_workitem_status.sh`
  - Download report. Report will look like [this](./examples/report.txt) `download_report.sh`

- Task 8 - [Download the Results](https://aps.autodesk.com/en/docs/design-automation/v3/tutorials/revit/step8-download-results/) `create_signed_download_url.sh` `download_result.sh`
  Result will look like [this](./examples/result.json)

> [!TIP]
> You can also see your AppBundles, Activities and WorkItems in [Design Automation Tools](https://da-manager.autodesk.io/) portal.
> ![result](./images/result.png)

> [!TIP]
> You can browse your APS resources in VSCode with [Autodesk Platform Services](https://marketplace.visualstudio.com/items?itemName=petrbroz.vscode-forge-tools) extension.
> ![vscode-extension](./images/vscode-extension.png)
