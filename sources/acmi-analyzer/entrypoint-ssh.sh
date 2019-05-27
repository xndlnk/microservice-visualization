#!/bin/bash
SSH_DIR=/root/.ssh
if [ ! -d $SSH_DIR ]
  then
    mkdir -p ${SSH_DIR}
    echo -n $SSH_PRIVATE_KEY > ${SSH_DIR}/id_rsa
    echo -n $SSH_KNOWN_HOSTS > ${SSH_DIR}/known_hosts
    chmod 0700 ${SSH_DIR}/
    chmod 0600 ${SSH_DIR}/id_rsa
fi
./entrypoint.sh