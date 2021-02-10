# Lighthouse URL-comparison tool

Run two URLs through a series of [Lighthouse](https://github.com/GoogleChrome/lighthouse) performance tests. After the tests have finished, the median run for each URL will be flagged for comparison.

## Usage

```
./run.sh -f "<firstUrl>" -s "<secondUrl>" -n <numRuns>
```
- `-f` is the first URL
- `-s` is the second URL
- `-n` is the number of Lighthouse runs for each URL (should be an integer with no quotes)

You need Docker. We recommend shutting down other programs on your machine before running this script to free up as many resources as possible.

## Why

Running Lighthouse via DevTools has some problems. First, test runs can be affected by varying browser settings, extensions, etc. Second, running multiple tests (to eventually take the median or average) and recording the results can be tedious, especially when comparing two or more URLs. Third, calculating a mean or median has to be done manually (and as you can see [here](https://github.com/GoogleChrome/lighthouse/blob/c6e14d7c8629c17284c1f773dd6bc8bc61221a47/lighthouse-core/lib/median-run.js#L38-L47), it's not all that straightforward!).

This script aims to simplify things. Feed in two URLs and a desired number of runs, and you'll get a folder full of detailed Lighthouse results, plus a marker denoting each URL's median run. Lighthouse CLI runs the tests, meaning user-specific browser settings won't affect the results.

(Note: This repo does not account for all possible test variances. Read [this doc](https://github.com/GoogleChrome/lighthouse/blob/master/docs/variability.md) for more on that topic.)

## Special thanks

This repo is heavily dependent on the [`docker-google-lighthouse`](https://github.com/femtopixel/docker-google-lighthouse) image ([MIT license](https://github.com/femtopixel/docker-google-lighthouse/blob/master/LICENSE.md)). It's wonderful in how it abstracts away the Chrome configuration process. Consider making a donation to this project (here is [one way](https://www.patreon.com/jaymoulin)).