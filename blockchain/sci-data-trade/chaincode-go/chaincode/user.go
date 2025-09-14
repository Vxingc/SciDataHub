package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// User 用户结构体
type User struct {
	Username           string `json:"username"`
	TokenBalance       int    `json:"tokenBalance"`
	LockedTokenBalance int    `json:"lockedTokenBalance"`
}

// AddUser 添加用户
func (s *SmartContract) AddUser(ctx contractapi.TransactionContextInterface, username string, tokenBalance int) error {
	user := User{
		Username:           username,
		TokenBalance:       tokenBalance,
		LockedTokenBalance: 0,
	}
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState("user_"+username, userJSON)
}

// GetUser 获取用户信息
func (s *SmartContract) GetUser(ctx contractapi.TransactionContextInterface, username string) (*User, error) {
	userJSON, err := ctx.GetStub().GetState("user_" + username)
	if err != nil {
		return nil, fmt.Errorf("failed to read user: %v", err)
	}
	if userJSON == nil {
		return nil, fmt.Errorf("user %s does not exist", username)
	}

	var user User
	err = json.Unmarshal(userJSON, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// updateUser 更新用户信息
func (s *SmartContract) updateUser(ctx contractapi.TransactionContextInterface, user *User) error {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState("user_"+user.Username, userJSON)
}

// GetTokenBalance 获取用户代币余额
func (s *SmartContract) GetTokenBalance(ctx contractapi.TransactionContextInterface, username string) (int, error) {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return 0, err
	}
	return user.TokenBalance, nil
}

// GetLockedTokenBalance 获取用户锁定代币余额
func (s *SmartContract) GetLockedTokenBalance(ctx contractapi.TransactionContextInterface, username string) (int, error) {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return 0, err
	}
	return user.LockedTokenBalance, nil
}

// SetTokenBalance 设置用户代币余额
func (s *SmartContract) SetTokenBalance(ctx contractapi.TransactionContextInterface, username string, balance int) error {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return err
	}
	user.TokenBalance = balance
	return s.updateUser(ctx, user)
}

// AddTokenBalance 增加用户代币余额
func (s *SmartContract) AddTokenBalance(ctx contractapi.TransactionContextInterface, username string, balance int) error {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return err
	}
	user.TokenBalance += balance
	return s.updateUser(ctx, user)
}

// TransferLockedTokenBalance 将代币转移到锁定余额
func (s *SmartContract) TransferLockedTokenBalance(ctx contractapi.TransactionContextInterface, username string, balance int) error {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return err
	}
	if user.TokenBalance < balance {
		return fmt.Errorf("insufficient balance: has %d, needs %d", user.TokenBalance, balance)
	}
	user.TokenBalance -= balance
	user.LockedTokenBalance += balance
	return s.updateUser(ctx, user)
}

// transferTokens 转移代币
func (s *SmartContract) transferTokens(ctx contractapi.TransactionContextInterface, from string, to string, amount int) error {
	// 获取发送方用户
	fromUser, err := s.GetUser(ctx, from)
	if err != nil {
		return fmt.Errorf("sender not found: %v", err)
	}

	// 检查余额
	if fromUser.LockedTokenBalance < amount {
		return fmt.Errorf("insufficient balance: has %d, needs %d", fromUser.LockedTokenBalance, amount)
	}

	// 获取接收方用户
	toUser, err := s.GetUser(ctx, to)
	if err != nil {
		return fmt.Errorf("receiver not found: %v", err)
	}

	// 执行转账
	fromUser.LockedTokenBalance -= amount
	toUser.TokenBalance += amount

	// 更新用户状态
	err = s.updateUser(ctx, fromUser)
	if err != nil {
		return fmt.Errorf("failed to update sender: %v", err)
	}

	err = s.updateUser(ctx, toUser)
	if err != nil {
		return fmt.Errorf("failed to update receiver: %v", err)
	}

	return nil
}
