const execSync = require('child_process').execSync

const cmd = `docker build -t ${process.env.npm_package_name}:${process.env.npm_package_version} .`
console.log('executing: ' + cmd)
execSync(cmd, {stdio: [0, 1, 2]})
