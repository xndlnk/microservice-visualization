require('dotenv').config()

// TODO: as a library, the config should be configured via an API

function getSourceFolder () {
  return process.env.SOURCE_FOLDER
}

function getGitRepositoryPrefix () {
  return process.env.GIT_REPOSITORY_PREFIX
}

function getConsulPath () {
  return process.env.CONSUL_PATH
}

function getRabbitMqPath () {
  return process.env.RABBITMQ_PATH
}

function getIgnoredServices () {
  if (process.env.IGNORED_SERVICES) {
    return process.env.IGNORED_SERVICES.split(',').map(item => item.trim())
  } else {
    return null
  }
}

module.exports = {
  getSourceFolder,
  getConsulPath,
  getRabbitMqPath,
  getIgnoredServices,
  getGitRepositoryPrefix
}
