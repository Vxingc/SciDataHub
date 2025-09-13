package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode"
)

func main() {
	tokenChaincode, err := contractapi.NewChaincode(&chaincode.SmartContract{})
	if err != nil {
		log.Panicf("Error creating data trading chaincode: %v", err)
	}

	if err := tokenChaincode.Start(); err != nil {
		log.Panicf("Error starting data trading chaincode: %v", err)
	}
}
