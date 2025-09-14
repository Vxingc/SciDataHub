package chaincode_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-protos-go-apiv2/ledger/queryresult"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode/mocks"
	"github.com/stretchr/testify/require"
)

// TestGetDataset 测试获取数据集信息
func TestGetDataset(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	expectedDataset := &chaincode.Dataset{Hash: "testhash", Owner: "testowner"}
	bytes, err := json.Marshal(expectedDataset)
	require.NoError(t, err)

	// 测试成功获取数据集
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	dataset, err := smartContract.GetDataset(transactionContext, "testhash")
	require.NoError(t, err)
	require.Equal(t, expectedDataset, dataset)

	// 测试数据集不存在
	chaincodeStub.GetStateReturns(nil, nil)
	dataset, err = smartContract.GetDataset(transactionContext, "nonexistent")
	require.Error(t, err)
	require.Contains(t, err.Error(), "does not exist")
	require.Nil(t, dataset)

	// 测试GetState失败
	chaincodeStub.GetStateReturns(nil, fmt.Errorf("failed to read"))
	dataset, err = smartContract.GetDataset(transactionContext, "testhash")
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to read dataset")
	require.Nil(t, dataset)
}

// TestAddDataset 测试添加数据集
func TestAddDataset(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	smartContract := chaincode.SmartContract{}

	// 测试成功添加数据集
	chaincodeStub.GetStateReturns(nil, nil) // 数据集不存在
	err := smartContract.AddDataset(transactionContext, "newhash", "newowner")
	require.NoError(t, err)

	// 测试数据集已存在
	existingDataset := &chaincode.Dataset{Hash: "existinghash", Owner: "owner"}
	bytes, err := json.Marshal(existingDataset)
	require.NoError(t, err)
	chaincodeStub.GetStateReturns(bytes, nil)
	err = smartContract.AddDataset(transactionContext, "existinghash", "newowner")
	require.Error(t, err)
	require.Contains(t, err.Error(), "already exists")

	// 测试PutState失败
	chaincodeStub.GetStateReturns(nil, nil)
	chaincodeStub.PutStateReturns(fmt.Errorf("failed to put state"))
	err = smartContract.AddDataset(transactionContext, "newhash", "newowner")
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to put dataset")
}

// TestGetDatasetOwner 测试获取数据集所有者
func TestGetDatasetOwner(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	dataset := &chaincode.Dataset{Hash: "testhash", Owner: "testowner"}
	bytes, err := json.Marshal(dataset)
	require.NoError(t, err)

	// 测试成功获取所有者
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	owner, err := smartContract.GetDatasetOwner(transactionContext, "testhash")
	require.NoError(t, err)
	require.Equal(t, "testowner", owner)

	// 测试数据集不存在
	chaincodeStub.GetStateReturns(nil, nil)
	owner, err = smartContract.GetDatasetOwner(transactionContext, "nonexistent")
	require.Error(t, err)
	require.Equal(t, "", owner)
}

// TestGetAllDatasets 测试获取所有数据集
func TestGetAllDatasets(t *testing.T) {
	dataset := &chaincode.Dataset{Hash: "testhash", Owner: "testowner"}
	bytes, err := json.Marshal(dataset)
	require.NoError(t, err)

	iterator := &mocks.StateQueryIterator{}
	iterator.HasNextReturnsOnCall(0, true)
	iterator.HasNextReturnsOnCall(1, false)
	iterator.NextReturns(&queryresult.KV{Value: bytes}, nil)

	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	// 测试成功获取所有数据集
	chaincodeStub.GetStateByRangeReturns(iterator, nil)
	smartContract := &chaincode.SmartContract{}
	datasets, err := smartContract.GetAllDatasets(transactionContext)
	require.NoError(t, err)
	require.Equal(t, []*chaincode.Dataset{dataset}, datasets)

	// 测试迭代器Next失败
	iterator.HasNextReturns(true)
	iterator.NextReturns(nil, fmt.Errorf("failed retrieving next item"))
	datasets, err = smartContract.GetAllDatasets(transactionContext)
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed retrieving next item")
	require.Nil(t, datasets)

	// 测试GetStateByRange失败
	chaincodeStub.GetStateByRangeReturns(nil, fmt.Errorf("failed retrieving all datasets"))
	datasets, err = smartContract.GetAllDatasets(transactionContext)
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to get datasets")
	require.Nil(t, datasets)
}
