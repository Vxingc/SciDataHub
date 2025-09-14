package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// Dataset 数据集结构体
type Dataset struct {
	Hash  string `json:"hash"`
	Owner string `json:"owner"`
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
