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

	// smartContract := chaincode.SmartContract{}

	// 测试成功完成订单
	chaincodeStub.GetStateReturnsOnCall(0, orderBytes, nil)  // 获取订单
	chaincodeStub.GetStateReturnsOnCall(1, buyerBytes, nil)  // 获取买方
	chaincodeStub.GetStateReturnsOnCall(2, sellerBytes, nil) // 获取卖方
	chaincodeStub.GetStateReturnsOnCall(3, orderBytes, nil)  // 更新订单状态时再次获取
	// err = smartContract.CompleteOrder(transactionContext, "testorder")
	require.NoError(t, err)

	// 测试订单状态不是pending
	completedOrder := *order
	completedOrder.Status = "completed"
	completedOrderBytes, err := json.Marshal(&completedOrder)
	require.NoError(t, err)
	chaincodeStub.GetStateReturnsOnCall(4, completedOrderBytes, nil)
	// err = smartContract.CompleteOrder(transactionContext, "testorder")
	require.Error(t, err)
	require.Contains(t, err.Error(), "not in pending status")

	// 测试订单不存在
	chaincodeStub.GetStateReturnsOnCall(5, nil, nil)
	// err = smartContract.CompleteOrder(transactionContext, "nonexistent")
	require.Error(t, err)
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
