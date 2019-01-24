#!/bin/bash

chmod -R 755 /opt/screenshoter
cd /opt/screenshoter/
yarn && nohup node ../server.js &