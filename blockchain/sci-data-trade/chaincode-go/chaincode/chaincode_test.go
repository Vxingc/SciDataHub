package chaincode_test

import (
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-chaincode-go/v2/shim"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode/mocks"
	"github.com/stretchr/testify/require"
)

//go:generate counterfeiter -o mocks/transaction.go -fake-name TransactionContext . transactionContext
type transactionContext interface {
	contractapi.TransactionContextInterface
}

//go:generate counterfeiter -o mocks/chaincodestub.go -fake-name ChaincodeStub . chaincodeStub
type chaincodeStub interface {
	shim.ChaincodeStubInterface
}

//go:generate counterfeiter -o mocks/statequeryiterator.go -fake-name StateQueryIterator . stateQueryIterator
type stateQueryIterator interface {
	shim.StateQueryIteratorInterface
}

// TestInitLedger 测试账本初始化
func TestInitLedger(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	smartContract := chaincode.SmartContract{}
	err := smartContract.InitLedger(transactionContext)
	require.NoError(t, err)

	// 测试PutState失败的情况
	chaincodeStub.PutStateReturns(fmt.Errorf("failed inserting key"))
	err = smartContract.InitLedger(transactionContext)
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to put user")
}
