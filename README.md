# About

Screenshoter is a service to make html page screenshots based on puppeteer.

# Start

```
$ git clone https://github.com/cybernated/web-screenshoter.git
$ cd web-screenshoter
$ npm install
$ npm start --port 3030
```

You can check the availability of the service at the link `http://127.0.0.1:3030`

# API

`GET /` to check status service.

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