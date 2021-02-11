const fs = require('fs');
const path = require('path');

const { computeMedianRun } = require('lighthouse/lighthouse-core/lib/median-run.js');

const reportsDirPath = path.join(process.cwd(), 'reports');
const firstUrlDirPath = path.join(reportsDirPath, 'first-url');
const secondUrlDirPath = path.join(reportsDirPath, 'second-url');

function getJsonFileNames(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      const jsonFileNames = files.filter(file => file.includes('.json'));
      const sortedFileNames = jsonFileNames.sort();
      return resolve(sortedFileNames);
    });
  });
}

function getRunsData(basePath, fileNames) {
  const runsDataPromises = fileNames.map(fileName => {
    const filePath = path.join(basePath, fileName);

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(JSON.parse(data.toString()));
      });
    });
  });

  return Promise.all(runsDataPromises);
}

function getMedianFilePrefix(allRuns, medianRun) {
  const medianIndex = allRuns.findIndex(run => run === medianRun);
  return `run-${medianIndex + 1}.report`;
}

function renameMedianRun(writePath, filePrefix) {
  const renamePromises = [
    new Promise((resolve, reject) => {
      const oldHtmlPath = path.join(writePath, `${filePrefix}.html`);
      const newHtmlPath = oldHtmlPath.replace('.report.', '.report.median.');

      fs.rename(oldHtmlPath, newHtmlPath, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }),
    new Promise((resolve, reject) => {
      const oldJsonPath = path.join(writePath, `${filePrefix}.json`);
      const newJsonPath = oldJsonPath.replace('.report.', '.report.median.');

      fs.rename(oldJsonPath, newJsonPath, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    })
  ];
  
  return Promise.all(renamePromises);
}

(async () => {
  try {
    const [
      firstUrlFileNames,
      secondUrlFileNames,
    ] = await Promise.all([
      getJsonFileNames(firstUrlDirPath),
      getJsonFileNames(secondUrlDirPath),
    ]);

    const [
      firstUrlRuns,
      secondUrlRuns,
    ] = await Promise.all([
      getRunsData(firstUrlDirPath, firstUrlFileNames),
      getRunsData(secondUrlDirPath, secondUrlFileNames),
    ]);

    const firstUrlMedianRun = computeMedianRun(firstUrlRuns);
    const secondUrlMedianRun = computeMedianRun(secondUrlRuns);

    const firstUrlMedianRunFilePrefix = getMedianFilePrefix(
      firstUrlRuns,
      firstUrlMedianRun
    );
    const secondUrlMedianRunFilePrefix = getMedianFilePrefix(
      secondUrlRuns,
      secondUrlMedianRun
    );

    await Promise.all([
      renameMedianRun(firstUrlDirPath, firstUrlMedianRunFilePrefix),
      renameMedianRun(secondUrlDirPath, secondUrlMedianRunFilePrefix),
    ]);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();