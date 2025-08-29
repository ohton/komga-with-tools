#!/bin/sh
docker compose down
docker compose pull komga
docker compose up -d
# docker image prune
