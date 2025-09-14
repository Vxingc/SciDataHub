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
              {{ blockchainName }} 数据集
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              {{ blockchainName }} 区块链上的公开数据集
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
          <h3 class="mb-0">公开数据集</h3>
          <button class="btn btn-outline-primary" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>返回区块链列表
          </button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3 text-muted">正在加载数据集...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 数据集列表 -->
        <div v-else-if="datasets.length > 0">
          <div class="d-flex align-items-center mb-4">
            <i class="fas fa-globe text-primary me-2"></i>
            <h4 class="mb-0 text-primary">公开数据集</h4>
            <span class="badge bg-primary ms-2">{{ datasets.length }}</span>
          </div>
          
          <!-- 数据集卡片列表 -->
          <div class="dataset-list">
            <div 
              class="dataset-card mb-4" 
              v-for="dataset in datasets" 
              :key="dataset.id"
            >
              <div class="card shadow-sm">
                <div class="card-body">
                  <div class="row align-items-center">
                    <!-- 左侧：数据集基本信息 -->
                    <div class="col-lg-6">
                      <div class="dataset-info">
                        <h5 class="dataset-title mb-2">{{ dataset.fullName || dataset.name }}</h5>
                        <p class="dataset-description text-muted mb-3">{{ dataset.description }}</p>
                        
                        <!-- 数据集标识 -->
                        <div class="dataset-meta mb-3">
                          <small class="text-muted">
                            <i class="fas fa-database me-1"></i>
                            {{ dataset.name }}
                          </small>
                          <small class="text-muted ms-3">
                            <i class="fas fa-user me-1"></i>
                            {{ dataset.owner || '未知作者' }}
                          </small>
                          <small class="text-muted ms-3">
                            <i class="fas fa-calendar-alt me-1"></i>
                            {{ formatDate(dataset.createdAt) }}
                          </small>
                        </div>
                        
                        <!-- 标签区域 -->
                        <div class="dataset-tags d-flex flex-wrap gap-1">
                          <span v-if="dataset.isPublic" class="badge bg-success">公开</span>
                          <span v-if="dataset.canMaskingShare" class="badge bg-info">可脱敏共享</span>
                          <span v-if="dataset.canCustomMaskingTrade" class="badge bg-warning">可定制脱敏交易</span>
                          <span v-if="dataset.canDataService" class="badge bg-primary">可验证数据服务</span>
                        </div>
                        
                        <!-- 功能说明 -->
                        <div v-if="dataset.canMaskingShare || dataset.canCustomMaskingTrade || dataset.canDataService" class="dataset-features mt-2">
                          <div class="d-flex flex-wrap gap-2 small text-muted">
                            <div v-if="dataset.canMaskingShare" class="d-flex align-items-center">
                              <i class="fas fa-shield-alt me-1"></i>
                              <span>支持脱敏共享</span>
                            </div>
                            <div v-if="dataset.canCustomMaskingTrade" class="d-flex align-items-center">
                              <i class="fas fa-exchange-alt me-1"></i>
                              <span>支持定制交易</span>
                            </div>
                            <div v-if="dataset.canDataService" class="d-flex align-items-center">
                              <i class="fas fa-check-circle me-1"></i>
                              <span>支持数据验证</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 中间：预留扩展区域 -->
                    <div class="col-lg-3">
                      <div class="dataset-extension-area">
                        <!-- 预留给图例、统计信息等扩展功能 -->
                        <div class="extension-placeholder">
                          <!-- 后续可在此添加图例、图表等 -->
                        </div>
                      </div>
                    </div>
                    
                    <!-- 右侧：操作按钮 -->
                    <div class="col-lg-3">
                      <div class="dataset-actions text-end">
                        <button class="btn btn-primary" @click="viewDataset(dataset)">
                          <i class="fas fa-eye me-2"></i>查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-5">
          <i class="fas fa-database fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">暂无公开数据集</h4>
          <p class="text-muted">{{ blockchainName }} 区块链上还没有公开的数据集</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavbarDefault from "../../components/NavbarDefault.vue";

import vueMkHeader from "@/assets/img/vue-mk-header.jpg";
import axios from "@/api/axios";

const router = useRouter();
const route = useRoute();
const body = document.getElementsByTagName("body")[0];

// 响应式数据
const blockchainName = ref('');
const datasets = ref([]);
const loading = ref(false);
const error = ref('');

// 获取数据集数据
const fetchDatasets = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`/getPublicDatasets/${blockchainName.value}`);
    if (response.data.success) {
      datasets.value = response.data.data || [];
    } else {
      error.value = response.data.message || '获取数据集失败';
    }
  } catch (err) {
    console.error('获取数据集列表失败', err);
    error.value = '网络错误，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 返回区块链列表
const goBack = () => {
  router.push('/blockchainList');
};

// 查看数据集详情
const viewDataset = (dataset) => {
  // 这里可以跳转到数据集详情页面或显示详情模态框
  console.log('查看数据集详情:', dataset);
  router.push(`/dataset/${blockchainName.value}/${dataset.name}`);
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
  
  // 从路由参数获取区块链名称
  const routeBlockchainName = route.params.blockchainName;
  if (routeBlockchainName) {
    blockchainName.value = routeBlockchainName;
    fetchDatasets();
  } else {
    error.value = '未指定区块链名称';
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

.gap-2 > * {
  margin-right: 0.5rem !important;
  margin-bottom: 0.25rem !important;
}

/* 标签说明区域样式 */
.small {
  font-size: 0.875rem;
}

/* 数据集卡片样式 */
.dataset-list {
  max-width: 100%;
}

.dataset-card {
  transition: all 0.3s ease;
}

.dataset-card:hover {
  transform: translateY(-2px);
}

.dataset-card .card {
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.dataset-info {
  padding-right: 1rem;
}

.dataset-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.dataset-description {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.dataset-meta {
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 0.75rem;
}

.dataset-tags {
  margin-top: 0.5rem;
}

.dataset-features {
  padding-top: 0.5rem;
  border-top: 1px solid #f8f9fa;
}

/* 扩展区域样式 */
.dataset-extension-area {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #f8f9fa;
  border-right: 1px solid #f8f9fa;
  padding: 0 1rem;
}

.extension-placeholder {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.extension-placeholder::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 50%;
}

/* 操作按钮区域 */
.dataset-actions {
  padding-left: 1rem;
}

.btn-group-vertical .btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
}

.btn-group-vertical .btn:not(:last-child) {
  margin-bottom: 0.5rem;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .dataset-extension-area {
    border-left: none;
    border-right: none;
    border-top: 1px solid #f8f9fa;
    border-bottom: 1px solid #f8f9fa;
    margin: 1rem 0;
    min-height: 60px;
  }
  
  .extension-placeholder {
    height: 50px;
  }
  
  .dataset-actions {
    padding-left: 0;
    margin-top: 1rem;
  }
  
  .btn-group-vertical {
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .btn-group-vertical .btn:not(:last-child) {
    margin-bottom: 0;
    margin-right: 0.5rem;
  }
}

@media (max-width: 576px) {
  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }
  
  .gap-1 > * {
    margin-right: 0.125rem !important;
  }
  
  .dataset-title {
    font-size: 1.1rem;
  }
  
  .dataset-description {
    font-size: 0.9rem;
  }
  
  .btn-group-vertical {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-group-vertical .btn:not(:last-child) {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .dataset-extension-area {
    display: none; /* 在小屏幕上隐藏扩展区域 */
  }
  
  .dataset-features {
    margin-top: 0.5rem;
  }
}
</style>