const express = require('express');
const { appName } = require('~/config').default;
const gitData = require('~/core-services/getGitData');
const { version } = require('../../package.json');
const getCommitSlug = require('./getCommitSlug');

const app = express();
const env = app.get('env');

async function getAppInfo() {
  const commitSlug = await getCommitSlug();
  const gitInfo = await gitData();
  return new Promise((resolve) => {
    resolve({
      title: appName,
      environment: env,
      version,
      commit: commitSlug || gitInfo.long,
    });
  });
}

module.exports = getAppInfo;
