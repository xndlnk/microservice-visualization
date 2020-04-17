const execSync = require('child_process').execSync

const cmd = `docker run -p 8080:8080 -d --env-file .env ${process.env.npm_package_name}:${process.env.npm_package_version}`
console.log('executing: ' + cmd)
execSync(cmd, {stdio: [0, 1, 2]})
