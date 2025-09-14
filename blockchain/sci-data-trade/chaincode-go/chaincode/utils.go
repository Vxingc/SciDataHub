package chaincode

import (
	"crypto/sha256"
	"fmt"
	"math/rand/v2"
)

func RandStr(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	if length <= 0 {
		return ""
	}

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.IntN(len(charset))]
	}
	return string(b)
}

func GenerateHashChain(length int) (hashChain []string) {
	hashChain = make([]string, length)
	secret := RandStr(64)
	for i := 0; i < length; i++ {
		tempHash := sha256.Sum256([]byte(secret))
		hashChain[i] = fmt.Sprintf("%x", tempHash)
		secret = fmt.Sprintf("%x", tempHash)
	}
	return hashChain
}

// ComputeSha256 计算SHA256哈希链
func ComputeSha256Times(preImage string, hash string) (int, error) {
	var count int
	var tempHash string
	const MAX = 200
	for i := 0; i < MAX; i++ {
		if hash == tempHash {
			return count, nil
		}
		tempHash = fmt.Sprintf("%x", sha256.Sum256([]byte(preImage)))
		preImage = tempHash
		count++
	}
	return -1, fmt.Errorf("hash not found")
}
