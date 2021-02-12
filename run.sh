#!/bin/bash

CYAN='\033[0;36m'
NO_COLOR='\033[0m'

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
  echo -e "${CYAN}Starting Lighthouse run $run on $firstUrl...${NO_COLOR}"
  docker run -it --rm \
    --volume=/$(pwd)/reports/first-url:/home/chrome/reports/ \
    --name=lighthouse \
    --cap-add=SYS_ADMIN \
    femtopixel/google-lighthouse $firstUrl --quiet --only-categories=performance --skip-audits=full-page-screenshot --output html,json --output-path=run-$run

  echo -e "${CYAN}Starting Lighthouse run $run on $secondUrl...${NO_COLOR}"
  docker run -it --rm \
    --volume=/$(pwd)/reports/second-url:/home/chrome/reports/ \
    --name=lighthouse \
    --cap-add=SYS_ADMIN \
    femtopixel/google-lighthouse $secondUrl --quiet --only-categories=performance --skip-audits=full-page-screenshot --output html,json --output-path=run-$run
done

# Find the median run for each URL
echo -e "${CYAN}Finding the median runs...${NO_COLOR}"
docker build -f Dockerfile.median -t lh-median .
docker run --rm \
  --volume=/$(pwd):/app \
  --name=lh-median lh-median

echo -e "${CYAN}Done!${NO_COLOR}"