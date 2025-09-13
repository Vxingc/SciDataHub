package chaincode

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

// User 用户结构体
type User struct {
	Username     string `json:"username"`
	TokenBalance int    `json:"tokenBalance"`
}

// Dataset 数据集结构体
type Dataset struct {
	Hash  string `json:"hash"`
	Owner string `json:"owner"`
}

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

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	// 初始化用户
	users := []User{
		{Username: "demoDataRequester", TokenBalance: 100},
		{Username: "demoDataOwner", TokenBalance: 100},
	}

	for _, user := range users {
		userJSON, err := json.Marshal(user)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState("user_"+user.Username, userJSON)
		if err != nil {
			return fmt.Errorf("failed to put user %s: %v", user.Username, err)
		}
	}

	// 初始化数据集
	datasetHashes := []string{
		"822a5f5e4d0d8455397d757cc661c67160a8ac7e5e91533832c45acb5b657b76",
		"3241c39511b4abbd22eb82c86839996d51f3cb7497c9fbab44491fe772eaed22",
		"8a9e2ebf763531a6d28da34a01976d3ed393be0b98e3ff4310d492f1f1cfaff4",
		"bd84a6cfb79adfb3c1a2a5cd496e613b23c16a88f3fa87165d6da3ca17b98688",
		"991b22a282592412804e0893d4ec155f930a7edc1b5e595794a16deb02e9d6d3",
		"751f3b68bb5d8b1c8b9ba439307e9d515d1813ec755240be44bbd549dca530c9",
		"160c8267dcf84a4bada2f74503319cf0b8b7162cfb43e27d974568eca0451e89",
		"c5e4347ad503d184e9a15836bc33b450d465486aa907e8918b0a17864f1d978e",
		"0a1bb72f403014af6f77fb935c5a6245f15320f5c531b7f4f327d6469cd94ca4",
		"74dc9bf8b4b5404fcbd8d68bd71dcc72f2e74e11ca5b2d003f30df13b0ed007b",
		"32facf9051a4b40323115e9cb683956edcb337b10c129308a83b2d9298676e54",
		"653b20ee85c9158f3096f7ef4f36ca7e23dd99ce8d9bc53bd860ae99120d5ac1",
		"4fcf03fee3c20ad9531355c5f94895f86782ff8ededd1a523776178133773898",
		"e86c0e58e5fbd459d741d29489e9c338d92e812d6de50e4a39999bdc2b912722",
		"e5495814efbcc8f153e38b4353985447f3720fb56a64768ad00854c39fb566bb",
		"ee92ea5b3e5b1e53c58c23f5a9293cf647b7a258378d258ced5229cc26ef33b8",
		"67ecaba6a9937da257ab7ac9b82ddbede83eed4fe1e247233593bb714e86aab5",
		"a30c7378cfb66a6d09691d12e3927e3cc8bb2cc91710589358dca1f99ab44111",
		"799081ae12206764821a4084318cf448abc546f7780d2cf8c6971b7071a39d50",
		"ad16f90aca34b9438d1a4efb708fd9eb7eaf65d48ef2313cac40ad4e0478a0a0",
		"3e09b7e71c53a7f3cab08f455a979e45b8d9a103e658c2c00fc7a135aece8e7d",
		"3be127ef5fb16ad0646d51356e225e33f16516994f84e3634ec8cf1af41dd541",
		"a8e9fc3016d89f5efbe379642d792795d218072346d09b01ba38960f93514ba4",
		"ada41bc42814b8df18ea65842fe3bc536b57968bf5123004294cf4c1a3cde164",
		"ea7cd165efab5979574370d5558a090848f225809e516f2e165f4bd5fdf2cb3a",
	}

	for _, hash := range datasetHashes {
		dataset := Dataset{
			Hash:  hash,
			Owner: "demoDataOwner",
		}
		datasetJSON, err := json.Marshal(dataset)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState("dataset_"+hash, datasetJSON)
		if err != nil {
			return fmt.Errorf("failed to put dataset %s: %v", hash, err)
		}
	}

	// 初始化订单列表为空
	emptyOrders := []Order{}
	ordersJSON, err := json.Marshal(emptyOrders)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState("orders", ordersJSON)
	if err != nil {
		return fmt.Errorf("failed to initialize orders: %v", err)
	}

	return nil
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

// UpdateUser 更新用户信息
func (s *SmartContract) UpdateUser(ctx contractapi.TransactionContextInterface, user *User) error {
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

// SetTokenBalance 设置用户代币余额
func (s *SmartContract) SetTokenBalance(ctx contractapi.TransactionContextInterface, username string, balance int) error {
	user, err := s.GetUser(ctx, username)
	if err != nil {
		return err
	}
	user.TokenBalance = balance
	return s.UpdateUser(ctx, user)
}

// GetDataset 获取数据集信息
func (s *SmartContract) GetDataset(ctx contractapi.TransactionContextInterface, hash string) (*Dataset, error) {
	datasetJSON, err := ctx.GetStub().GetState("dataset_" + hash)
	if err != nil {
		return nil, fmt.Errorf("failed to read dataset: %v", err)
	}
	if datasetJSON == nil {
		return nil, fmt.Errorf("dataset %s does not exist", hash)
	}

	var dataset Dataset
	err = json.Unmarshal(datasetJSON, &dataset)
	if err != nil {
		return nil, err
	}

	return &dataset, nil
}

// AddDataset 添加数据集
func (s *SmartContract) AddDataset(ctx contractapi.TransactionContextInterface, hash string, owner string) error {
	// 检查数据集是否已存在
	existing, err := s.GetDataset(ctx, hash)
	if err == nil && existing != nil {
		return fmt.Errorf("dataset %s already exists", hash)
	}

	// 创建新数据集
	dataset := Dataset{
		Hash:  hash,
		Owner: owner,
	}

	datasetJSON, err := json.Marshal(dataset)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState("dataset_"+hash, datasetJSON)
	if err != nil {
		return fmt.Errorf("failed to put dataset: %v", err)
	}

	return nil
}

// GetDatasetOwner 获取数据集所有者
func (s *SmartContract) GetDatasetOwner(ctx contractapi.TransactionContextInterface, hash string) (string, error) {
	dataset, err := s.GetDataset(ctx, hash)
	if err != nil {
		return "", err
	}
	return dataset.Owner, nil
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

// TransferTokens 转移代币
func (s *SmartContract) TransferTokens(ctx contractapi.TransactionContextInterface, from string, to string, amount int) error {
	// 获取发送方用户
	fromUser, err := s.GetUser(ctx, from)
	if err != nil {
		return fmt.Errorf("sender not found: %v", err)
	}

	// 检查余额
	if fromUser.TokenBalance < amount {
		return fmt.Errorf("insufficient balance: has %d, needs %d", fromUser.TokenBalance, amount)
	}

	// 获取接收方用户
	toUser, err := s.GetUser(ctx, to)
	if err != nil {
		return fmt.Errorf("receiver not found: %v", err)
	}

	// 执行转账
	fromUser.TokenBalance -= amount
	toUser.TokenBalance += amount

	// 更新用户状态
	err = s.UpdateUser(ctx, fromUser)
	if err != nil {
		return fmt.Errorf("failed to update sender: %v", err)
	}

	err = s.UpdateUser(ctx, toUser)
	if err != nil {
		return fmt.Errorf("failed to update receiver: %v", err)
	}

	return nil
}

// CompleteOrder 完成订单交易
func (s *SmartContract) CompleteOrder(ctx contractapi.TransactionContextInterface, orderID string) error {
	order, err := s.GetOrder(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status != "pending" {
		return fmt.Errorf("order is not in pending status")
	}

	// 执行代币转移
	err = s.TransferTokens(ctx, order.Buyer, order.Seller, order.TokenUnit)
	if err != nil {
		return fmt.Errorf("token transfer failed: %v", err)
	}

	// 更新订单状态
	return s.UpdateOrderStatus(ctx, orderID, "completed")
}

// GetAllDatasets 获取所有数据集
func (s *SmartContract) GetAllDatasets(ctx contractapi.TransactionContextInterface) ([]*Dataset, error) {
	// 使用范围查询获取所有以"dataset_"开头的键
	resultsIterator, err := ctx.GetStub().GetStateByRange("dataset_", "dataset_~")
	if err != nil {
		return nil, fmt.Errorf("failed to get datasets: %v", err)
	}
	defer resultsIterator.Close()

	var datasets []*Dataset
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var dataset Dataset
		err = json.Unmarshal(queryResponse.Value, &dataset)
		if err != nil {
			return nil, err
		}

		datasets = append(datasets, &dataset)
	}

	return datasets, nil
}

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
