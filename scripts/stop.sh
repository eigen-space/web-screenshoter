#!/bin/bash

read port <<< $(lsof -i :3030 | grep -v 'PID'| awk '{print $2}')
echo $port
kill $port