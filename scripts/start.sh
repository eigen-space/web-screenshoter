#!/bin/bash

chmod -R u=rwX,g=rwX,o=rX /opt/screenshoter/
cd /opt/screenshoter/
yarn && nohup node ../server.js &