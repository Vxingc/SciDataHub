package chaincode_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-chaincode-go/v2/shim"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
	"github.com/hyperledger/fabric-protos-go-apiv2/ledger/queryresult"
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

// TestGetUser 测试获取用户信息
func TestGetUser(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	expectedUser := &chaincode.User{Username: "testuser", TokenBalance: 100}
	bytes, err := json.Marshal(expectedUser)
	require.NoError(t, err)

	// 测试成功获取用户
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	user, err := smartContract.GetUser(transactionContext, "testuser")
	require.NoError(t, err)
	require.Equal(t, expectedUser, user)

	// 测试用户不存在
	chaincodeStub.GetStateReturns(nil, nil)
	user, err = smartContract.GetUser(transactionContext, "nonexistent")
	require.Error(t, err)
	require.Contains(t, err.Error(), "does not exist")
	require.Nil(t, user)

	// 测试GetState失败
	chaincodeStub.GetStateReturns(nil, fmt.Errorf("failed to read"))
	user, err = smartContract.GetUser(transactionContext, "testuser")
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to read user")
	require.Nil(t, user)
}

// TestUpdateUser 测试更新用户信息
func TestUpdateUser(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	user := &chaincode.User{Username: "testuser", TokenBalance: 200}
	smartContract := chaincode.SmartContract{}

	// 测试成功更新
	err := smartContract.UpdateUser(transactionContext, user)
	require.NoError(t, err)

	// 测试PutState失败
	chaincodeStub.PutStateReturns(fmt.Errorf("failed to put state"))
	err = smartContract.UpdateUser(transactionContext, user)
	require.Error(t, err)
}

// TestGetTokenBalance 测试获取代币余额
func TestGetTokenBalance(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	user := &chaincode.User{Username: "testuser", TokenBalance: 150}
	bytes, err := json.Marshal(user)
	require.NoError(t, err)

	// 测试成功获取余额
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	balance, err := smartContract.GetTokenBalance(transactionContext, "testuser")
	require.NoError(t, err)
	require.Equal(t, 150, balance)

	// 测试用户不存在
	chaincodeStub.GetStateReturns(nil, nil)
	balance, err = smartContract.GetTokenBalance(transactionContext, "nonexistent")
	require.Error(t, err)
	require.Equal(t, 0, balance)
}

// TestSetTokenBalance 测试设置代币余额
func TestSetTokenBalance(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	user := &chaincode.User{Username: "testuser", TokenBalance: 100}
	bytes, err := json.Marshal(user)
	require.NoError(t, err)

	// 测试成功设置余额
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	err = smartContract.SetTokenBalance(transactionContext, "testuser", 300)
	require.NoError(t, err)

	// 测试用户不存在
	chaincodeStub.GetStateReturns(nil, nil)
	err = smartContract.SetTokenBalance(transactionContext, "nonexistent", 300)
	require.Error(t, err)
}

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

// TestCreateOrder 测试创建订单
func TestCreateOrder(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	dataset := &chaincode.Dataset{Hash: "testhash", Owner: "seller"}
	datasetBytes, err := json.Marshal(dataset)
	require.NoError(t, err)

	smartContract := chaincode.SmartContract{}

	// 测试成功创建订单
	chaincodeStub.GetStateReturns(datasetBytes, nil)
	orderID, err := smartContract.CreateOrder(transactionContext, "testhash", "hashchainend", 10, "buyer", "seller")
	require.NoError(t, err)
	require.NotEmpty(t, orderID)
	require.Contains(t, orderID, "testhash")

	// 测试数据集不存在
	chaincodeStub.GetStateReturns(nil, nil)
	orderID, err = smartContract.CreateOrder(transactionContext, "nonexistent", "hashchainend", 10, "buyer", "seller")
	require.Error(t, err)
	require.Contains(t, err.Error(), "dataset not found")
	require.Empty(t, orderID)

	// 测试卖家不是数据集所有者
	chaincodeStub.GetStateReturns(datasetBytes, nil)
	orderID, err = smartContract.CreateOrder(transactionContext, "testhash", "hashchainend", 10, "buyer", "wrongseller")
	require.Error(t, err)
	require.Contains(t, err.Error(), "seller is not the owner")
	require.Empty(t, orderID)

	// 测试PutState失败
	chaincodeStub.GetStateReturns(datasetBytes, nil)
	chaincodeStub.PutStateReturns(fmt.Errorf("failed to save order"))
	orderID, err = smartContract.CreateOrder(transactionContext, "testhash", "hashchainend", 10, "buyer", "seller")
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to save order")
	require.Empty(t, orderID)
}

// TestGetOrder 测试获取订单信息
func TestGetOrder(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	expectedOrder := &chaincode.Order{
		ID:           "testorder",
		DatasetHash:  "testhash",
		HashChainEnd: "hashchainend",
		TokenUnit:    10,
		Buyer:        "buyer",
		Seller:       "seller",
		Status:       "pending",
		Timestamp:    1234567890,
	}
	bytes, err := json.Marshal(expectedOrder)
	require.NoError(t, err)

	// 测试成功获取订单
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	order, err := smartContract.GetOrder(transactionContext, "testorder")
	require.NoError(t, err)
	require.Equal(t, expectedOrder, order)

	// 测试订单不存在
	chaincodeStub.GetStateReturns(nil, nil)
	order, err = smartContract.GetOrder(transactionContext, "nonexistent")
	require.Error(t, err)
	require.Contains(t, err.Error(), "does not exist")
	require.Nil(t, order)

	// 测试GetState失败
	chaincodeStub.GetStateReturns(nil, fmt.Errorf("failed to read"))
	order, err = smartContract.GetOrder(transactionContext, "testorder")
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to read order")
	require.Nil(t, order)
}

// TestUpdateOrderStatus 测试更新订单状态
func TestUpdateOrderStatus(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	order := &chaincode.Order{
		ID:           "testorder",
		DatasetHash:  "testhash",
		HashChainEnd: "hashchainend",
		TokenUnit:    10,
		Buyer:        "buyer",
		Seller:       "seller",
		Status:       "pending",
		Timestamp:    1234567890,
	}
	bytes, err := json.Marshal(order)
	require.NoError(t, err)

	// 测试成功更新状态
	chaincodeStub.GetStateReturns(bytes, nil)
	smartContract := chaincode.SmartContract{}
	err = smartContract.UpdateOrderStatus(transactionContext, "testorder", "completed")
	require.NoError(t, err)

	// 测试订单不存在
	chaincodeStub.GetStateReturns(nil, nil)
	err = smartContract.UpdateOrderStatus(transactionContext, "nonexistent", "completed")
	require.Error(t, err)

	// 测试PutState失败
	chaincodeStub.GetStateReturns(bytes, nil)
	chaincodeStub.PutStateReturns(fmt.Errorf("failed to put state"))
	err = smartContract.UpdateOrderStatus(transactionContext, "testorder", "completed")
	require.Error(t, err)
}

// TestTransferTokens 测试代币转移
func TestTransferTokens(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	fromUser := &chaincode.User{Username: "sender", TokenBalance: 100}
	toUser := &chaincode.User{Username: "receiver", TokenBalance: 50}
	fromBytes, err := json.Marshal(fromUser)
	require.NoError(t, err)
	toBytes, err := json.Marshal(toUser)
	require.NoError(t, err)

	smartContract := chaincode.SmartContract{}

	// 测试成功转移代币
	chaincodeStub.GetStateReturnsOnCall(0, fromBytes, nil) // 获取发送方
	chaincodeStub.GetStateReturnsOnCall(1, toBytes, nil)   // 获取接收方
	err = smartContract.TransferTokens(transactionContext, "sender", "receiver", 30)
	require.NoError(t, err)

	// 测试余额不足
	chaincodeStub.GetStateReturnsOnCall(2, fromBytes, nil)
	err = smartContract.TransferTokens(transactionContext, "sender", "receiver", 150)
	require.Error(t, err)
	require.Contains(t, err.Error(), "insufficient balance")

	// 测试发送方不存在
	chaincodeStub.GetStateReturnsOnCall(3, nil, nil)
	err = smartContract.TransferTokens(transactionContext, "nonexistent", "receiver", 30)
	require.Error(t, err)
	require.Contains(t, err.Error(), "sender not found")

	// 测试接收方不存在
	chaincodeStub.GetStateReturnsOnCall(4, fromBytes, nil)
	chaincodeStub.GetStateReturnsOnCall(5, nil, nil)
	err = smartContract.TransferTokens(transactionContext, "sender", "nonexistent", 30)
	require.Error(t, err)
	require.Contains(t, err.Error(), "receiver not found")
}

// TestCompleteOrder 测试完成订单
func TestCompleteOrder(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	order := &chaincode.Order{
		ID:           "testorder",
		DatasetHash:  "testhash",
		HashChainEnd: "hashchainend",
		TokenUnit:    10,
		Buyer:        "buyer",
		Seller:       "seller",
		Status:       "pending",
		Timestamp:    1234567890,
	}
	orderBytes, err := json.Marshal(order)
	require.NoError(t, err)

	buyer := &chaincode.User{Username: "buyer", TokenBalance: 100}
	seller := &chaincode.User{Username: "seller", TokenBalance: 50}
	buyerBytes, err := json.Marshal(buyer)
	require.NoError(t, err)
	sellerBytes, err := json.Marshal(seller)
	require.NoError(t, err)

	smartContract := chaincode.SmartContract{}

	// 测试成功完成订单
	chaincodeStub.GetStateReturnsOnCall(0, orderBytes, nil)  // 获取订单
	chaincodeStub.GetStateReturnsOnCall(1, buyerBytes, nil)  // 获取买方
	chaincodeStub.GetStateReturnsOnCall(2, sellerBytes, nil) // 获取卖方
	chaincodeStub.GetStateReturnsOnCall(3, orderBytes, nil)  // 更新订单状态时再次获取
	err = smartContract.CompleteOrder(transactionContext, "testorder")
	require.NoError(t, err)

	// 测试订单状态不是pending
	completedOrder := *order
	completedOrder.Status = "completed"
	completedOrderBytes, err := json.Marshal(&completedOrder)
	require.NoError(t, err)
	chaincodeStub.GetStateReturnsOnCall(4, completedOrderBytes, nil)
	err = smartContract.CompleteOrder(transactionContext, "testorder")
	require.Error(t, err)
	require.Contains(t, err.Error(), "not in pending status")

	// 测试订单不存在
	chaincodeStub.GetStateReturnsOnCall(5, nil, nil)
	err = smartContract.CompleteOrder(transactionContext, "nonexistent")
	require.Error(t, err)
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

// TestGetAllOrders 测试获取所有订单
func TestGetAllOrders(t *testing.T) {
	order := &chaincode.Order{
		ID:           "testorder",
		DatasetHash:  "testhash",
		HashChainEnd: "hashchainend",
		TokenUnit:    10,
		Buyer:        "buyer",
		Seller:       "seller",
		Status:       "pending",
		Timestamp:    1234567890,
	}
	bytes, err := json.Marshal(order)
	require.NoError(t, err)

	iterator := &mocks.StateQueryIterator{}
	iterator.HasNextReturnsOnCall(0, true)
	iterator.HasNextReturnsOnCall(1, false)
	iterator.NextReturns(&queryresult.KV{Value: bytes}, nil)

	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	// 测试成功获取所有订单
	chaincodeStub.GetStateByRangeReturns(iterator, nil)
	smartContract := &chaincode.SmartContract{}
	orders, err := smartContract.GetAllOrders(transactionContext)
	require.NoError(t, err)
	require.Equal(t, []*chaincode.Order{order}, orders)

	// 测试迭代器Next失败
	iterator.HasNextReturns(true)
	iterator.NextReturns(nil, fmt.Errorf("failed retrieving next item"))
	orders, err = smartContract.GetAllOrders(transactionContext)
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed retrieving next item")
	require.Nil(t, orders)

	// 测试GetStateByRange失败
	chaincodeStub.GetStateByRangeReturns(nil, fmt.Errorf("failed retrieving all orders"))
	orders, err = smartContract.GetAllOrders(transactionContext)
	require.Error(t, err)
	require.Contains(t, err.Error(), "failed to get orders")
	require.Nil(t, orders)
}
