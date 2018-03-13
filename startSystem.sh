#!/bin/bash

# Move to the Project path
cd /Users/omarbs/Development/Blockchain/Ethereum/SportsPool/

# We kill any instance of the Blockchain and start it
killall node
testrpc&

# We kill any instance of the mongodb, create dir in case it doesnt exist and start db
killall mongod
mkdir data
mongod --port 27017 --dbpath ./data &

# Wait a few sec until db is up and set it up
sleep 5
node server/db_setup.js &
# sleep 5

# We compile contract and deploy
(truffle compile && truffle migrate --development --reset)&

# Kill mongodb and start with auth
# killall mongod
# sleep 5
# mongod --auth --port 27017 --dbpath ./data &

# Wait a few sec until db is up and fill it up
sleep 10
node server/db_fill.js &

# Build and start node.js server
npm run build&
sleep 5
npm run start&
