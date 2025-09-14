package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// SmartContract 智能合约结构体
type SmartContract struct {
	contractapi.Contract
}

// InitLedger 初始化账本
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
