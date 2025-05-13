const FormData = require('form-data');
const fs = require('fs');
const { Base64 } = require('js-base64');
const path = require('path');
const axios = require('axios');

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let uploadBundle, uploadRvt, uploadPython, uploadPackages, uploadRunReq, uploadDyn, uploadSetup, generateToken, work, submitActivity, pollResult;

for (let ii = 0; ii < process.argv.length; ii++) {
    if (process.argv[ii].includes("all")) {
        uploadBundle = uploadRvt = uploadPython = uploadRunReq = generateToken = work = submitActivity = pollResult = uploadSetup = true;
        break;
    }
    if (process.argv[ii].includes("bundle")) {
        uploadBundle = true;
    } else if (process.argv[ii].includes("rvt")) {
        uploadRvt = true;
    } else if (process.argv[ii].includes("python")) {
        uploadPython = true;
    } else if (process.argv[ii].includes("run")) {
        uploadRunReq = true;
    } else if (process.argv[ii].includes("token")) {
        generateToken = true;
    } else if (process.argv[ii].includes("activity")) {
        submitActivity = true;
    } else if (process.argv[ii].includes("result")) {
        pollResult = true;
    } else if (process.argv[ii].includes("dyn")) {
        uploadDyn = true;
    } else if (process.argv[ii].includes("setup")) {
        uploadSetup = true;
    } else if (process.argv[ii].includes("packages")) {
        uploadPackages = true;
    } else if (process.argv[ii].includes("work")) {
        work = true;
    }
}

if (fs.existsSync('.env.example')) {
    console.log('Loading environment variables from .env file');
    require('dotenv').config({ path: ['.env.example', '.env'] });
}

const bundlePath = path.join(process.env.DA_FOLDER, process.env.BUNDLE_FILE);
const pythonPath = path.join(process.env.DA_FOLDER, process.env.PYTHON_FILE);
const runReqPath = path.join(process.env.DA_FOLDER, process.env.RUN_REQ_FILE);
const dynPath = path.join(process.env.DA_FOLDER, process.env.DYN_FILE);
const setupPath = path.join(process.env.DA_FOLDER, process.env.SETUP_FILE);
const rvtPath = path.join(process.env.DA_FOLDER, process.env.RVT_FILE);
const packagesPath = path.join(process.env.DA_FOLDER, process.env.PACKAGES_FILE);
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function uploadZip(presignedUrl, filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const fileSize = fs.statSync(filePath).size;
        const fileName = path.basename(filePath);
        const extension = path.extname(filePath);

        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: fileStream,
            headers: {
                'Content-Type': extension == '.zip' ? 'application/zip' : 'application/octet-stream',
                'Content-Length': fileSize.toString(),
                'Content-Disposition': `attachment; filename="${fileName}"`
            },
            duplex: 'half'
        });

        if (response.ok) {
            console.log('Zip file uploaded successfully.');
        } else {
            console.error('Error uploading zip file:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error uploading zip file:', error);
    }
}

async function getAccessToken() {
    const authString = Base64.encode(`${clientId}:${clientSecret}`);
    let response = await fetch(`https://developer.api.autodesk.com/authentication/v2/token?grant_type=client_credentials&scope=code:all bucket:create bucket:read data:create data:write data:read`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    );
    let body = await response.json();
    return body.access_token;
}

(async () => {

    if (generateToken) {
        var token = await getAccessToken();
        fs.writeFileSync('token.json', token);
    }

    var access_token = fs.readFileSync(path.join(__dirname, 'token.json'), 'utf8');
    console.log("using token " + access_token);

    /*
        let response = await fetch(`https://developer.api.autodesk.com/da/us-east/v3/appbundles`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: "{\r\n                \"id\": \"DynamoDATest\",\r\n                \"engine\": \"Autodesk.Revit+2026\",\r\n                \"description\": \"Dynamo DA\"\r\n            }"
            }
        );
        let body = await response.json();
    */

    const buundleApp = "DynamoDATest";
    if (uploadBundle) {
        // Create new version of the bundle and write metadata to bundle.json
        let response = await fetch(`https://developer.api.autodesk.com/da/us-east/v3/appbundles/${buundleApp}/versions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: "{\r\n                \"id\": null,\r\n                \"engine\": \"Autodesk.Revit+2026\",\r\n                \"description\": \"Dynamo DA\"\r\n            }"
            }
        );
        let bundle = await response.json();
        console.log(JSON.stringify(bundle));
        fs.writeFileSync('bundle.json', JSON.stringify(bundle));

        let form = new FormData();
        const formData = bundle.uploadParameters.formData;
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                form.append(key, formData[key]);
            }
        }
        form.append('file', fs.createReadStream(bundlePath));

        try {
            const response = await axios.post(bundle.uploadParameters.endpointURL, form, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            console.log(response);
        } catch (ex) {
            console.log(ex);
        }

        try {
            var res = await axios.patch(`https://developer.api.autodesk.com/da/us-east/v3/appbundles/${buundleApp}/aliases/test`,
                { "version": bundle.version },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${access_token}`
                    }
                });
            console.log(res.data);
        } catch (ex) {
            console.log(ex);
        }
    }

    if (uploadPackages) {
        let response2 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.PACKAGES_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData = await response2.json();
        console.log(formData);

        await uploadZip(formData.urls[0], packagesPath);

        const data = {
            "uploadKey": formData.uploadKey
        };
        var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.PACKAGES_FILE}/signeds3upload`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );
    }

    if (uploadPython) {
        let response2 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.PYTHON_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData = await response2.json();
        console.log(formData);

        await uploadZip(formData.urls[0], pythonPath);

        const data = {
            "uploadKey": formData.uploadKey
        };
        var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.PYTHON_FILE}/signeds3upload`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );
    }

    if (uploadRvt) {
        let response3 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.RVT_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData3 = await response3.json();
        console.log(formData3);

        try {

            await uploadZip(formData3.urls[0], rvtPath);

            const data = {
                "uploadKey": formData3.uploadKey
            };
            var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.RVT_FILE}/signeds3upload`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(ree);

        } catch (error) {
            console.error('Error uploading file:', error.message);
        }

    }

    if (uploadRunReq) {
        let response23 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.RUN_REQ_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData4 = await response23.json();
        console.log(formData4);

        try {
            const presignedUrl = formData4.urls[0];
            const fileStream = fs.readFileSync(runReqPath, 'utf8');
            var dat = JSON.parse(fileStream);
            const axiosResponse = await axios.put(presignedUrl, dat, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.info(axiosResponse);

            const data = {
                "uploadKey": formData4.uploadKey
            };
            var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.RUN_REQ_FILE}/signeds3upload`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(ree);

        } catch (error) {
            console.error('Error uploading file:', error.message);
        }
    }

    if (uploadDyn) {
        let response23 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.DYN_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData4 = await response23.json();
        console.log(formData4);

        try {
            const presignedUrl = formData4.urls[0];
            const fileStream = fs.readFileSync(dynPath, 'utf8');
            var dat = JSON.parse(fileStream);
            const axiosResponse = await axios.put(presignedUrl, dat, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.info(axiosResponse);

            const data = {
                "uploadKey": formData4.uploadKey
            };
            var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.DYN_FILE}/signeds3upload`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(ree);

        } catch (error) {
            console.error('Error uploading file:', error.message);
        }
    }

    if (uploadSetup) {
        let response23 = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.SETUP_FILE}/signeds3upload`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        let formData4 = await response23.json();
        console.log(formData4);

        try {
            const presignedUrl = formData4.urls[0];
            const fileStream = fs.readFileSync(setupPath, 'utf8');
            var dat = JSON.parse(fileStream);
            const axiosResponse = await axios.put(presignedUrl, dat, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.info(axiosResponse);

            const data = {
                "uploadKey": formData4.uploadKey
            };
            var ree = await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.SETUP_FILE}/signeds3upload`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(ree);

        } catch (error) {
            console.error('Error uploading file:', error.message);
        }
    }

    const activityId = "DeleteWallsActivity20";
    const activityAlias = "test";
    if (submitActivity) {

        try {
            var delResp = await axios.delete(`https://developer.api.autodesk.com/da/us-east/v3/activities/${activityId}`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            console.log(aliasResp);
        } catch(err){
            console.log(err);
        }

        const data = {
            "id": activityId,
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
                "required": true,
                "localName": process.env.RUN_REQ_FILE
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
                "localName": process.env.RESULT_FILE
              },
              "rvtResult": {
                "zip": false,
                "ondemand": false,
                "verb": "put",
                "description": "Results",
                "required": false,
                "localName": process.env.RVT_RESULT_FILE
              }
            },
            "engine": "Autodesk.Revit+2026",
            "appbundles": [ "DynamoDATest.DynamoDATest+test" ],
            "description": "Deletes walls from Revit file."
          };
        try {
            var resp = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/activities',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(resp);

            var aliasResp = await axios.post(`https://developer.api.autodesk.com/da/us-east/v3/activities/${activityId}/aliases`,
                {
                    "version": 1,
                    "id": activityAlias
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    } 
                }
            );
            console.log(aliasResp);
        } catch (err) { 
            console.log(err);
         }
    }

    let workResp = "";
    if (work) {
        const data = {
            "activityId": `DynamoDATest.${activityId}+${activityAlias}`,
            "arguments": {
                "rvtFile": {
                    "url": `urn:adsk.objects:os.object:${process.env.OSS_BUCKET_NAME}/${process.env.RVT_FILE}`,
                    "verb": "get",
                    "headers": {
                        "Authorization": `Bearer ${access_token}`
                    }
                },
                "runRequest": {
                    "url": `urn:adsk.objects:os.object:${process.env.OSS_BUCKET_NAME}/${process.env.RUN_REQ_FILE}`,
                    "verb": "get",
                    "headers": {
                        "Authorization": `Bearer ${access_token}`
                    }
                },
                "pythonLibs": {
                    "url": `urn:adsk.objects:os.object:${process.env.OSS_BUCKET_NAME}/${process.env.PYTHON_FILE}`,
                    "verb": "get",
                    "headers": {
                        "Authorization": `Bearer ${access_token}`
                    }
                },
                "dynResult": {
                    "url": `urn:adsk.objects:os.object:${process.env.OSS_BUCKET_NAME}/${process.env.RESULT_FILE}`,
                    "verb": "put",
                    "headers": {
                        "Authorization": `Bearer ${access_token}`
                    }
                },
                "rvtResult": {
                    "url": `urn:adsk.objects:os.object:${process.env.OSS_BUCKET_NAME}/${process.env.RVT_RESULT_FILE}`,
                    "verb": "put",
                    "headers": {
                        "Authorization": `Bearer ${access_token}`
                    }
                }
            }
        };
        try {
            var resp = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            console.log(resp);
            workResp = resp.data;
        } catch (err) { 
            console.log(err);
         }
    }

    if (pollResult) {
        try {
            const inProgress = "inprogress";
            var data = { 'status': inProgress };
            while (true) {
                var xx = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${workResp.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                });
                data = xx.data;
                if (data.status !== inProgress && data.status !== "pending") {
                    break;
                }
                console.log(data);
                await sleep(5000);
            }

            console.log(data.reportUrl)
            var data = await fetch(data.reportUrl);
            var result = await data.text();
            fs.writeFileSync('log.txt', result);
        } catch (ex) {
            console.log(ex);
        }

        try {
            var rsp = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${process.env.OSS_BUCKET_NAME}/objects/${process.env.RESULT_FILE}/signeds3download`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            });

            const response = await axios.get(rsp.data.url);
            fs.writeFileSync('result.json', JSON.stringify(response.data));
        } catch (ex) {
            console.log(ex);
        }
    }
})();
