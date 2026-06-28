#!/bin/bash

 npm i -g @nestjs/cli

# build database package
npm run build --workspace=packages/database

# build the api cli
npm run build --workspace=apps/api

# load test db
npm run seed-db --workspace=apps/api

# Start Admin app
npm run start:dev  --workspace=apps/admin &

# Start API backend
npm run start:dev --workspace=apps/api &

# Start Static apps
npm run start:dev --workspace=apps/eventguide -- -p 3002 &
npm run start:dev --workspace=apps/presentation -- -p 3003 &
npm run start:dev --workspace=apps/registration -- -p 3004 &
npm run start:dev --workspace=apps/voting -- -p 3005 &

# Keep container running
wait