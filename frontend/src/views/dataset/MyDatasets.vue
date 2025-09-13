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
              科研数据集
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              {{ blockchainName }} 管理我的科研数据集
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
          <h3 class="mb-0">科研数据集</h3>
          <button class="btn btn-outline-primary" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>返回区块链列表
          </button>
        </div>
        
        <div class="text-center mb-5">
          <button class="btn btn-upload btn-lg px-5 py-3 shadow-lg" @click="router.push('/adddataset')">
            <i class="fas fa-cloud-upload-alt me-3"></i>
            <span class="fw-bold">新建数据集</span>
          </button>
          <!-- <p class="text-muted mt-2 mb-0">上传您的科研数据集到区块链</p> -->
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
          <!-- 私有数据集 -->
          <div v-if="privateDatasets.length > 0" class="mb-5">
            <div class="d-flex align-items-center mb-3">
              <i class="fas fa-lock text-secondary me-2"></i>
              <h4 class="mb-0 text-secondary">私有数据集</h4>
              <span class="badge bg-secondary ms-2">{{ privateDatasets.length }}</span>
            </div>
            <div class="card border-secondary">
              <div class="card-body">
                <div class="row">
                  <div 
                    class="col-md-6 col-lg-4 mb-4" 
                    v-for="dataset in privateDatasets" 
                    :key="dataset.id"
                  >
                    <div class="card h-100 shadow-sm border-secondary">
                      <div class="card-body">
                        <h5 class="card-title mb-3">{{ dataset.fullName || dataset.name }}</h5>
                        <p class="card-text text-muted mb-3">{{ dataset.description }}</p>
                                                
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <small class="text-muted">
                            <i class="fas fa-database me-1"></i>
                            {{ dataset.name }}
                          </small>
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-secondary" @click="editDataset(dataset)">
                              <i class="fas fa-edit me-1"></i>编辑
                            </button>
                            <button class="btn btn-sm btn-primary" @click="viewDataset(dataset)">
                              查看详情
                            </button>
                          </div>
                        </div>
                        
                        <!-- 标签区域 -->
                        <div class="d-flex flex-wrap gap-1">
                          <span class="badge bg-secondary">私有</span>
                          <span v-if="dataset.canMaskingShare" class="badge bg-info">可脱敏共享</span>
                          <span v-if="dataset.canCustomMaskingTrade" class="badge bg-warning">可定制脱敏交易</span>
                          <span v-if="dataset.canDataService" class="badge bg-primary">可验证数据服务</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 公开数据集 -->
          <div v-if="publicDatasets.length > 0">
            <div class="d-flex align-items-center mb-3">
              <i class="fas fa-globe text-success me-2"></i>
              <h4 class="mb-0 text-success">公开数据集</h4>
              <span class="badge bg-success ms-2">{{ publicDatasets.length }}</span>
            </div>
            <div class="card border-success">
              <div class="card-body">
                <div class="row">
                  <div 
                    class="col-md-6 col-lg-4 mb-4" 
                    v-for="dataset in publicDatasets" 
                    :key="dataset.id"
                  >
                    <div class="card h-100 shadow-sm border-success">
                      <div class="card-body">
                        <h5 class="card-title mb-3">{{ dataset.fullName || dataset.name }}</h5>
                        <p class="card-text text-muted mb-3">{{ dataset.description }}</p>                      
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <small class="text-muted">
                            <i class="fas fa-database me-1"></i>
                            {{ dataset.name }}
                          </small>
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-secondary" @click="editDataset(dataset)">
                              <i class="fas fa-edit me-1"></i>编辑
                            </button>
                            <button class="btn btn-sm btn-primary" @click="viewDataset(dataset)">
                              查看详情
                            </button>
                          </div>
                        </div>
                        
                        <!-- 标签区域 -->
                        <div class="d-flex flex-wrap gap-1">
                          <span class="badge bg-success">公开</span>
                          <span v-if="dataset.canMaskingShare" class="badge bg-info">可脱敏共享</span>
                          <span v-if="dataset.canCustomMaskingTrade" class="badge bg-warning">可定制脱敏交易</span>
                          <span v-if="dataset.canDataService" class="badge bg-primary">可验证数据服务</span>
                        </div>
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
          <h4 class="text-muted">暂无数据集</h4>
          <p class="text-muted">您在 {{ blockchainName }} 区块链上还没有创建任何数据集</p>
          <button class="btn btn-primary" @click="createDataset">
            <i class="fas fa-plus me-2"></i>创建数据集
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
const userName = ref('');
const datasets = ref([]);
const loading = ref(false);
const error = ref('');

// 计算属性：按公开状态分类数据集
const privateDatasets = computed(() => {
  return datasets.value.filter(dataset => !dataset.isPublic);
});

const publicDatasets = computed(() => {
  return datasets.value.filter(dataset => dataset.isPublic);
});

// 获取数据集数据
const fetchDatasets = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`/getAlldatasetsByOwner/${userName.value}`);
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
  console.log('查看数据集详情:', dataset.blockchainName+"/"+dataset.name);
  router.push(`/dataset/${dataset.blockchainName}/${dataset.name}`);
};

// 编辑数据集
const editDataset = (dataset) => {
  // 跳转到数据集编辑页面
  console.log('编辑数据集:', dataset);
  router.push(`/dataset/edit/${dataset.blockchainName}/${dataset.name}`);
};

// 创建新数据集
const createDataset = () => {
  // 跳转到数据集创建页面
  console.log('创建新数据集');
  // router.push(`/dataset/create/${blockchainName.value}`);
};

onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
  
  // 从认证store获取当前登录用户的用户名
  if (authStore.isLoggedIn && authStore.username) {
    userName.value = authStore.username;
    console.log('当前登录用户:', userName.value);
    fetchDatasets();
  } else {
    error.value = '用户未登录或用户信息获取失败';
    console.error('用户未登录或用户信息获取失败');
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

/* 按钮组样式 */
.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:last-child) {
  margin-right: 0.25rem;
}

/* 上传按钮样式 */
.btn-upload {
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
  background: linear-gradient(45deg, #0056b3, #004085);
}

.btn-upload:active {
  transform: translateY(0);
}

.btn-upload::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-upload:hover::before {
  left: 100%;
}

/* 分类框样式 */
.dataset-section {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dataset-section:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 响应式标签布局 */
@media (max-width: 576px) {
  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }
  
  .gap-1 > * {
    margin-right: 0.125rem !important;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn:not(:last-child) {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
  
  .btn-upload {
    font-size: 1rem;
    padding: 0.75rem 2rem !important;
  }
}
</style>