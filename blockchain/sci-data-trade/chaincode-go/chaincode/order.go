package chaincode

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// Order 订单结构体
type Order struct {
	ID           string `json:"id"`
	DatasetHash  string `json:"datasetHash"`
	HashChainEnd string `json:"hashChainEnd"`
	TokenUnit    int    `json:"tokenUnit"`
	Buyer        string `json:"buyer"`
	Seller       string `json:"seller"`
	Status       string `json:"status"` // pending, completed, cancelled
	Timestamp    int64  `json:"timestamp"`
}

// CreateOrder 创建订单
func (s *SmartContract) CreateOrder(ctx contractapi.TransactionContextInterface, datasetHash string, hashChainEnd string, tokenUnit int, buyer string, seller string) (string, error) {
	// 验证数据集存在
	dataset, err := s.GetDataset(ctx, datasetHash)
	if err != nil {
		return "", fmt.Errorf("dataset not found: %v", err)
	}

	// 验证卖家是数据集所有者
	if dataset.Owner != seller {
		return "", fmt.Errorf("seller is not the owner of the dataset")
	}

	// 生成订单ID
	timestamp := time.Now().Unix()
	orderID := datasetHash + "_" + strconv.FormatInt(timestamp, 10)

	// 创建新订单
	newOrder := Order{
		ID:           orderID,
		DatasetHash:  datasetHash,
		HashChainEnd: hashChainEnd,
		TokenUnit:    tokenUnit,
		Buyer:        buyer,
		Seller:       seller,
		Status:       "pending",
		Timestamp:    timestamp,
	}

	// 保存订单
	orderJSON, err := json.Marshal(newOrder)
	if err != nil {
		return "", err
	}

	err = ctx.GetStub().PutState("order_"+orderID, orderJSON)
	if err != nil {
		return "", fmt.Errorf("failed to save order: %v", err)
	}

	return orderID, nil
}

// GetOrder 获取订单信息
func (s *SmartContract) GetOrder(ctx contractapi.TransactionContextInterface, orderID string) (*Order, error) {
	orderJSON, err := ctx.GetStub().GetState("order_" + orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to read order: %v", err)
	}
	if orderJSON == nil {
		return nil, fmt.Errorf("order %s does not exist", orderID)
	}

	var order Order
	err = json.Unmarshal(orderJSON, &order)
	if err != nil {
		return nil, err
	}

	return &order, nil
}

// UpdateOrderStatus 更新订单状态
func (s *SmartContract) UpdateOrderStatus(ctx contractapi.TransactionContextInterface, orderID string, status string) error {
	order, err := s.GetOrder(ctx, orderID)
	if err != nil {
		return err
	}

	order.Status = status
	orderJSON, err := json.Marshal(order)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("order_"+orderID, orderJSON)
}

// CompleteOrder 完成订单交易
func (s *SmartContract) CompleteOrder(ctx contractapi.TransactionContextInterface, orderID string, preImage string) error {
	order, err := s.GetOrder(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status != "pending" {
		return fmt.Errorf("order is not in pending status")
	}

	times, err := ComputeSha256Times(preImage, order.HashChainEnd)
	if err != nil {
		return fmt.Errorf("failed to compute sha256 times: %v", err)
	}

	tokenAmount := times * order.TokenUnit

	buyer, err := s.GetUser(ctx, order.Buyer)
	if err != nil {
		return fmt.Errorf("failed to get buyer: %v", err)
	}

	if tokenAmount > buyer.LockedTokenBalance {
		return fmt.Errorf("insufficient balance: has %d, needs %d", buyer.LockedTokenBalance, tokenAmount)
	}

	// 执行代币转移
	err = s.transferTokens(ctx, order.Buyer, order.Seller, tokenAmount)
	if err != nil {
		return fmt.Errorf("token transfer failed: %v", err)
	}

	// 更新订单状态
	return s.UpdateOrderStatus(ctx, orderID, "completed")
}

// GetAllOrders 获取所有订单
func (s *SmartContract) GetAllOrders(ctx contractapi.TransactionContextInterface) ([]*Order, error) {
	// 使用范围查询获取所有以"order_"开头的键
	resultsIterator, err := ctx.GetStub().GetStateByRange("order_", "order_~")
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %v", err)
	}
	defer resultsIterator.Close()

	var orders []*Order
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var order Order
		err = json.Unmarshal(queryResponse.Value, &order)
		if err != nil {
			return nil, err
		}

		orders = append(orders, &order)
	}

	return orders, nil
}
