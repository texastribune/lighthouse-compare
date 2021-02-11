#!/bin/bash

# Process CLI arguments
while getopts ":f:s:n:" opt; do
  case $opt in
    f) firstUrl="$OPTARG";;
    s) secondUrl="$OPTARG";;
    n) numRuns="$OPTARG";;
  esac
done

# Remove old reports
rm -rf reports/

# Run Lighthouse
for ((run = 1; run <= $numRuns; run++)); do
  echo "Starting Lighthouse run $run on $firstUrl ..."
  docker run -it --rm \
    --volume=/$(pwd)/reports/first-url:/home/chrome/reports/ \
    --name=lighthouse \
    --cap-add=SYS_ADMIN \
    femtopixel/google-lighthouse $firstUrl --quiet --only-categories=performance --skip-audits=full-page-screenshot --output html,json --output-path=run-$run

  echo "Starting Lighthouse run $run on $secondUrl ..."
  docker run -it --rm \
    --volume=/$(pwd)/reports/second-url:/home/chrome/reports/ \
    --name=lighthouse \
    --cap-add=SYS_ADMIN \
    femtopixel/google-lighthouse $secondUrl --quiet --only-categories=performance --skip-audits=full-page-screenshot --output html,json --output-path=run-$run
done

# Find the median run for each URL
echo "Finding the median runs ..."
docker build -f Dockerfile.median -t lh-median .
docker run --rm \
  --volume=/$(pwd):/app \
  --name=lh-median lh-median
