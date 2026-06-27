#!/bin/bash

# build database package
npm run build --workspace=packages/database

# Start Admin app
cd apps/admin
npm run run:dev &

# Start API backend
#cd /apps/api
#npm run run:dev &

# Keep container running
wait