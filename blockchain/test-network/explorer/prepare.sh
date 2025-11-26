#!/bin/bash

# get filename from ../organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/
filename=$(ls ../organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/)

# insert into test-network.json
# 				"path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/$filename"
# 将原来的"msp/keystore/*" 替换为 "msp/keystore/$filename"

sed -i "s#msp/keystore/.*\"#msp/keystore/$filename\"#g" connection-profile/test-network.json
