#!/bin/bash

cd /opt/services/screenshoter/dist
yarn
chmod -R 755 /opt/services/screenshoter
nohup node ./server.js > screenshoter.out &
echo 'started...'

cp /opt/services/screenshoter/dist/config/nginx/sites-available/* /etc/nginx/sites-available
sudo service nginx reload