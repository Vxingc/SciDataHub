#!/bin/bash

function start() {
    pushd test-network
    ./network.sh up createChannel -ca
    ./network.sh deployCC -ccn scidatahub -ccp ../sci-data-trade/chaincode-go -ccl go
    popd
}

function stop() {
    pushd test-network
    ./network.sh down
    popd
}

arg=$1
if [ "$arg" == "start" ]; then
    start
elif [ "$arg" == "stop" ]; then
    stop
elif [ "$arg" == "restart" ]; then
    stop
    start
else
    echo "Usage: ./run.sh start|stop|restart"
    exit 1
fi