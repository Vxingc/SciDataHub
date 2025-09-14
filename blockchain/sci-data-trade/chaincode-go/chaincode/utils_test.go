package chaincode

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRandStr(t *testing.T) {
	str := RandStr(10)
	t.Logf("str: %s", str)
	require.Equal(t, 10, len(str))
}

func TestGenerateHashChain(t *testing.T) {
	hashChain := GenerateHashChain(10)
	t.Logf("hashChain: %v", hashChain)
	require.Equal(t, 10, len(hashChain))
}

func TestComputeSha256Times(t *testing.T) {
	hashChain := GenerateHashChain(10)
	t.Logf("hashChain: %v", hashChain)
	require.Equal(t, 10, len(hashChain))
	for i := 1; i < 10; i++ {
		count, err := ComputeSha256Times(hashChain[0], hashChain[i])
		require.NoError(t, err)
		require.Equal(t, i, count)
	}
}
