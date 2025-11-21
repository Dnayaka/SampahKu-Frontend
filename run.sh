#!/bin/bash

FRONTEND_IMAGE="frontend_img"
FRONTEND_CONTAINER="frontend_app"
NETWORK_NAME="universal_net"
API_CONTAINER_NAME="universal_api"

# Build image
docker build -t $FRONTEND_IMAGE .

# Run container di network yang sama
docker run -d \
    --name $FRONTEND_CONTAINER \
    --network $NETWORK_NAME \
    -e NEXT_PUBLIC_API_URL="http://$API_CONTAINER_NAME:8000" \
    -p 8484:8484 \
    $FRONTEND_IMAGE

echo "Frontend berjalan di http://localhost:8484"
echo "Terhubung ke backend container $API_CONTAINER_NAME di network $NETWORK_NAME"
