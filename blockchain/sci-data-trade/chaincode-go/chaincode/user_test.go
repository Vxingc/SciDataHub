package chaincode_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode"
	"github.com/infolab-bcg/SciDataHub/blockchain/sci-data-trade/chaincode-go/chaincode/mocks"
	"github.com/stretchr/testify/require"
)

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
