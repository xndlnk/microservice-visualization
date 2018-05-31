const execSync = require('child_process').execSync
const spawnSync = require('child_process').spawnSync
const fs = require('fs')
const log = require('npmlog')
const rimraf = require('rimraf')
const configRepository = require('../config/configRepository')

// imports the repository of the given service by clone or fetch.
// returns a local path to the repository.
function importRepository (serviceName, repositoryUrl) {
  if (isNoValidRepository(repositoryUrl)) {
    log.info('git', 'cannot import because repository is NOT valid: %s', repositoryUrl)
    return null
  } else {
    log.info('git', 'repository is valid: %s', repositoryUrl)
    if (isCloned(serviceName)) {
      return updateRepository(serviceName, repositoryUrl)
    } else {
      return cloneRepository(serviceName, repositoryUrl)
    }
  }
}

function isNoValidRepository (repositoryUrl) {
  let result = spawnSync('git', ['ls-remote', repositoryUrl])
  return result.status
}

function isCloned (serviceName) {
  return fs.existsSync(getLocalServicePath(serviceName) + '/.git')
}

function updateRepository (serviceName, repositoryUrl) {
  const localServicePath = getLocalServicePath(serviceName)
  const pullCommand = 'pull -v origin develop'

  log.info('git', 'pulling repository %s', repositoryUrl)
  let result = execSync('git --git-dir=' + localServicePath + '/.git --work-tree=' + localServicePath + ' ' + pullCommand)
  if (!result.status) {
    return localServicePath
  } else {
    log.error('git', 'could not fetch source from repository %s', repositoryUrl)
    return null
  }
}

function cloneRepository (serviceName, repositoryUrl) {
  if (!fs.existsSync(getSourceFolder())) {
    fs.mkdirSync(getSourceFolder())
  }

  let localServicePath = getLocalServicePath(serviceName)
  fs.mkdirSync(localServicePath)

  log.info('git', 'cloning repository %s', repositoryUrl)
  let result = spawnSync('git', ['clone', '-b', 'develop', '--depth', '1', repositoryUrl, localServicePath])
  if (result.status) {
    log.error('git', 'could not clone source from repository %s', repositoryUrl)
    return null
  } else {
    return localServicePath
  }
}

function getLocalServicePath (serviceName) {
  return getSourceFolder() + '/' + serviceName
}

function clearAll () {
  rimraf.sync(getSourceFolder())
}

function getSourceFolder () {
  return configRepository.getSourceFolder()
}

function clearRepository (serviceName) {
  rimraf.sync(getLocalServicePath(serviceName))
}

module.exports = {
  importRepository,
  clearRepository,
  clearAll
}
