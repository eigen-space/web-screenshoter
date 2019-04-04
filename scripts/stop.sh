#!/bin/bash

read port <<< $(lsof -i :3030 | grep -v 'PID'| awk '{print $2}')
echo $port

if [ -z "$port" ]
  then
    echo "No argument supplied"
fi