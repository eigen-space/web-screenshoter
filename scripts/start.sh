#!/bin/bash

chmod -R 755 /opt/services/screenshoter
cd /opt/services/screenshoter/
yarn
nohup node ./server.js > screenshoter.out &
echo 'started...'

cp /opt/services/screenshoter/config/nginx/sites-available/* /etc/nginx/sites-available
sudo service nginx reload