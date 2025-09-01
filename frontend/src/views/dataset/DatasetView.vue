<template>
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <Header>
    <div class="page-header min-vh-50" :style="`background-image: url(${vueMkHeader})`" loading="lazy">
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1 class="text-white pt-3 mt-n5 me-2" :style="{ display: 'inline-block ' }">
              数据集详情
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              {{ blockchainName }} - {{ datasetName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div class="container mt-sm-5 mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="mb-0">数据集详情</h3>
          <button class="btn btn-outline-primary" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>返回
          </button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3 text-muted">正在加载数据集详情...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 数据集详情 -->
        <div v-else-if="dataset" class="row">
          <!-- 左侧：数据集基本信息 -->
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h4 class="card-title mb-0">{{ dataset.fullName || dataset.name }}</h4>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-if="dataset.isPublic" class="badge bg-success">公开</span>
                    <span v-else class="badge bg-secondary">私有</span>
                    <span v-if="dataset.canMaskingShare" class="badge bg-info">可脱敏共享</span>
                    <span v-if="dataset.canCustomMaskingTrade" class="badge bg-warning">可定制脱敏交易</span>
                    <span v-if="dataset.canDataService" class="badge bg-primary">可验证数据服务</span>
                  </div>
                </div>
                
                <div class="row mb-4">
                  <div class="col-md-6">
                    <p class="mb-2">
                      <strong><i class="fas fa-database me-2 text-primary"></i>数据集名称：</strong>
                      <span class="text-muted">{{ dataset.name }}</span>
                    </p>
                    <p class="mb-2">
                      <strong><i class="fas fa-user me-2 text-primary"></i>所有者：</strong>
                      <span class="text-muted">{{ dataset.owner }}</span>
                    </p>
                    <p class="mb-2">
                      <strong><i class="fas fa-link me-2 text-primary"></i>区块链：</strong>
                      <span class="text-muted">{{ blockchainName }}</span>
                    </p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-2">
                      <strong><i class="fas fa-calendar-alt me-2 text-primary"></i>创建时间：</strong>
                      <span class="text-muted">{{ formatDate(dataset.created_at) }}</span>
                    </p>
                    <p class="mb-2">
                      <strong><i class="fas fa-calendar-alt me-2 text-primary"></i>更新时间：</strong>
                      <span class="text-muted">{{ formatDate(dataset.updated_at) }}</span>
                    </p>
                  </div>
                </div>

                <div class="mb-4">
                  <strong><i class="fas fa-info-circle me-2 text-primary"></i>描述：</strong>
                  <p class="text-muted mt-2">{{ dataset.description || '暂无描述' }}</p>
                </div>

                <div class="mb-4">
                  <strong><i class="fas fa-info-circle me-2 text-primary"></i>哈希：</strong>
                  <p class="text-muted mt-2">{{ dataset.hash || '暂无哈希' }}</p>
                </div>

              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮区域 -->
          <div class="col-lg-4">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-cogs me-2"></i>可用操作
                </h5>
              </div>
              <div class="card-body">
                <!-- 下载脱敏数据集按钮 -->
                <div v-if="dataset.canMaskingShare" class="mb-3">
                  <button 
                    class="btn btn-info w-100" 
                    @click="downloadMaskingDataset"
                    :disabled="!dataset.maskingDatasetIPFSAddress"
                  >
                    <i class="fas fa-download me-2"></i>
                    下载脱敏数据集
                  </button>
                  <small v-if="!dataset.maskingDatasetIPFSAddress" class="text-muted d-block mt-1">
                    脱敏数据集尚未生成
                  </small>
                </div>

                <!-- 发起定制脱敏交易按钮 -->
                <div v-if="dataset.canCustomMaskingTrade" class="mb-3">
                  <button 
                    class="btn btn-warning w-100" 
                    @click="initiateMaskingTrade"
                  >
                    <i class="fas fa-handshake me-2"></i>
                    发起定制脱敏交易
                  </button>
                </div>

                <!-- 验证数据服务按钮 -->
                <div v-if="dataset.canDataService" class="mb-3">
                  <button 
                    class="btn btn-primary w-100" 
                    @click="requestDataService"
                  >
                    <i class="fas fa-shield-alt me-2"></i>
                    请求验证数据服务
                  </button>
                </div>

                <!-- 如果没有可用操作 -->
                <div v-if="!dataset.canMaskingShare && !dataset.canCustomMaskingTrade && !dataset.canDataService" class="text-center text-muted">
                  <i class="fas fa-info-circle fa-2x mb-3"></i>
                  <p>该数据集暂无可用操作</p>
                </div>
            
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-5">
          <i class="fas fa-database fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">数据集未找到</h4>
          <p class="text-muted">请检查数据集名称和区块链名称是否正确</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import NavbarDefault from "../../components/NavbarDefault.vue";
import Header from "../../examples/Header.vue";

import vueMkHeader from "@/assets/img/vue-mk-header.jpg";
import axios from "@/api/axios";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const body = document.getElementsByTagName("body")[0];

// 响应式数据
const blockchainName = ref('');
const datasetName = ref('');
const dataset = ref(null);
const loading = ref(false);
const error = ref('');

// 获取数据集详情
const fetchDatasetDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`/getDatasetByDatasetName/${blockchainName.value}/${datasetName.value}`);
    if (response.data.success && response.data.data ) {
      dataset.value = response.data.data;
    } else {
      error.value = response.data.message || '数据集获取失败';
    }
  } catch (err) {
    console.error('获取数据集详情失败', err);
    error.value = '网络错误，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 下载脱敏数据集
const downloadMaskingDataset = () => {
  if (dataset.value.maskingDatasetIPFSAddress) {
    // 这里可以实现下载逻辑，比如打开IPFS链接或调用下载API
    window.open(`https://ipfs.io/ipfs/${dataset.value.maskingDatasetIPFSAddress}`, '_blank');
  }
};

// 发起定制脱敏交易
const initiateMaskingTrade = () => {
  // 这里可以跳转到交易页面或打开交易模态框
  console.log('发起定制脱敏交易:', dataset.value);
  router.push(`/dataset/requestDataTrade/${blockchainName.value}/${datasetName.value}`);
};

// 请求验证数据服务
const requestDataService = () => {
  // 这里可以跳转到数据服务页面或打开服务请求模态框
  console.log('请求验证数据服务:', dataset.value);
  router.push(`/dataset/requestDataService/${blockchainName.value}/${datasetName.value}`);
};

// 在IPFS上查看
const viewOnIPFS = () => {
  if (dataset.value.ipfsAddress) {
    window.open(`https://ipfs.io/ipfs/${dataset.value.ipfsAddress}`, '_blank');
  }
};

// 分享数据集
const shareDataset = () => {
  // 这里可以实现分享功能，比如复制链接到剪贴板
  const shareUrl = `${window.location.origin}/dataset/${blockchainName.value}/${datasetName.value}`;
  copyToClipboard(shareUrl);
};

// 复制到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // 这里可以显示成功提示
    console.log('已复制到剪贴板:', text);
  }).catch(err => {
    console.error('复制失败:', err);
  });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
  
  // 从路由参数获取区块链名称和数据集名称
  blockchainName.value = route.params.blockchainName || '';
  datasetName.value = route.params.name || '';
  
  if (blockchainName.value && datasetName.value) {
    fetchDatasetDetails();
  } else {
    error.value = '缺少必要的参数：区块链名称或数据集名称';
  }
});

onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* 标签样式优化 */
.badge {
  font-size: 0.7rem;
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
}

.gap-1 > * {
  margin-right: 0.25rem !important;
  margin-bottom: 0.25rem !important;
}

/* 按钮样式 */
.btn {
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

/* 输入组样式 */
.input-group .form-control {
  border-radius: 0.375rem 0 0 0.375rem;
}

.input-group .btn {
  border-radius: 0 0.375rem 0.375rem 0;
}

/* 卡片头部样式 */
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }
  
  .gap-1 > * {
    margin-right: 0.125rem !important;
  }
  
  .btn {
    font-size: 0.9rem;
  }
  
  .col-lg-8, .col-lg-4 {
    margin-bottom: 1rem;
  }
}

/* 操作按钮特殊样式 */
.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
  color: #212529;
}

/* 禁用按钮样式 */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>