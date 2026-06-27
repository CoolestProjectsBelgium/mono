#!/bin/bash

 npm i -g @nestjs/cli

# build database package
npm run build --workspace=packages/database

# build the api cli
npm run build --workspace=apps/api

# load test db
npm run seed-db --workspace=apps/api


# Start Admin app
cd apps/admin
npm run run:dev &

# Start API backend
#cd /apps/api
#npm run run:dev &

# Keep container running
wait