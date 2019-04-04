# About [![Build Status](http://ci.smekalka.com/buildStatus/icon?job=ams.web-screenshoter)](http://ci.smekalka.com/view/AMS/job/ams.web-screenshoter/)

Screenshoter is a service to make html page screenshots based on puppeteer.

# Getting started

1. `yarn`
2. `yarn start --port 3030`

You can check the availability of the service at the link `http://127.0.0.1:3030`

# API

`GET /` to check service status.

`POST /make` to transform code. 

- Content-Type: application/json
- Input interface: 

    | Parameter | Type | Required | Description |
    | ------ | ------ | ------ | ------ |
    | html | string | true | html page for creating screenshot |

- Output interface:

    | Parameter | Type | Required | Description |
    | ------ | ------ | ------ | ------ |
    | screenshot | { type: 'Buffer', data: number[] } | true | screenshot html page |
