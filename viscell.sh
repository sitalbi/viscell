#!/bin/bash

#######################################
# Executable of the Viscell application
#######################################

# navigate to the client directory
cd client;

# check if node is installed
if ! [ -x "$(command -v npm)" ]; then

    if [ -x "$(command -v apt-get)" ]; then
        sudo apt-get install npm;
    else
        echo 'Error: npm is not installed.' >&2
        exit 1
    fi
fi

# install the dependencies
npm install;

# start the client
npm start;