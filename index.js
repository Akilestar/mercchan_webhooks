const express = require('express');
const app = express();
const { exec } = require('child_process');
require('dotenv').config();
const repoName = process.env.repoName;
const repoDir = process.env.repoDir;
const appPort = process.env.appPort;

app.use(express.json());

//Github Payload
app.post('/payload', async (request, response) => {
  response.send('POST Request');

  //GitHub Post
  const repo = request.body.repository.name;
  const resURL = request.body.repository.url;
  console.log(`POST from ${resURL}`);

  if (repo === repoName) {
    console.log('pulling code from GitHub...');

    try {
      // reset any changes that have been made locally
      exec(`git -C ${repoDir} reset --hard`, execCallback);

      // and ditch any files that have been added locally too
      exec(`git -C ${repoDir} clean -df`, execCallback);

      // now pull down the latest
      exec(`git -C ${repoDir} pull -f`, execCallback);

      // and npm install with --production
      exec(`npm -C ${repoDir} install`, execCallback);

      console.log(`${repo} Updated`);
    } catch {
      console.log('Error: Unable to execute git');
    }
  }
});
//Custom Command POST Request
app.post('/command', async (request, response) => {
  response.send('POST Request');
  console.log(request.body.cli.toString());

  try {
    const cli = request.body.cli.toString();
    const action = request.body.action.toString();
    const processName = request.body.processName.toString();
    const output = `${cli} ${action} ${processName}`;
    console.log(`Executing ${output}`);
    exec(output, execCallback);
  } catch {
    console.log('Error: Unable to execute command');
  }
});

app.listen(appPort);
console.log(`Server listening for payload on port ${appPort}`);

function execCallback(err, stdout, stderr) {
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);
}
