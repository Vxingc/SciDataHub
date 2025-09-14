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
              发起定制化脱敏数据请求
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
          <h3 class="mb-0">定制化脱敏数据请求</h3>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-info" 
              @click="generateTestRequest"
              :disabled="submitting || !dataset"
            >
              <i class="fas fa-magic me-2"></i>生成测试请求
            </button>
            <button class="btn btn-outline-primary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>返回
            </button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3 text-muted">正在加载数据集信息...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 请求表单 -->
        <div v-else class="row">
          <!-- 左侧：数据集信息 -->
          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-database me-2"></i>数据集信息
                </h5>
              </div>
              <div class="card-body">
                <div v-if="dataset">
                  <h6 class="text-primary mb-3">{{ dataset.fullName || dataset.name }}</h6>
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    <span v-if="dataset.isPublic" class="badge bg-success">公开</span>
                    <span v-if="dataset.canCustomMaskingTrade" class="badge bg-warning">可定制脱敏交易</span>
                  </div>
                  <p class="text-muted small mb-3">{{ dataset.description }}</p>
                  
                  <div class="mb-2">
                    <strong><i class="fas fa-user me-2 text-primary"></i>数据拥有者：</strong>
                    <span class="text-muted">{{ dataset.owner }}</span>
                  </div>
                  <div class="mb-2">
                    <strong><i class="fas fa-link me-2 text-primary"></i>区块链：</strong>
                    <span class="text-muted">{{ blockchainName }}</span>
                  </div>
                  <div class="mb-2">
                    <strong><i class="fas fa-calendar-alt me-2 text-primary"></i>创建时间：</strong>
                    <span class="text-muted">{{ formatDate(dataset.created_at) }}</span>
                  </div>
                </div>
                <div v-else class="text-center py-3">
                  <i class="fas fa-info-circle text-muted"></i>
                  <p class="text-muted mb-0">数据集信息加载中...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：请求表单 -->
          <div class="col-lg-8">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-edit me-2"></i>定制化脱敏请求配置
                </h5>
              </div>
              <div class="card-body">
                <!-- 基本信息 -->
                <div class="mb-4">
                  <label for="requestTitle" class="form-label">
                    <strong><i class="fas fa-tag me-2 text-primary"></i>请求标题</strong>
                  </label>
                  <input 
                    id="requestTitle"
                    v-model="requestForm.title" 
                    type="text" 
                    class="form-control" 
                    placeholder="请输入请求标题"
                  />
                </div>

                <div class="mb-4">
                  <label for="requestDescription" class="form-label">
                    <strong><i class="fas fa-info-circle me-2 text-primary"></i>请求描述</strong>
                  </label>
                  <textarea 
                    id="requestDescription"
                    v-model="requestForm.description" 
                    class="form-control" 
                    rows="3" 
                    placeholder="请描述您的数据需求和用途"
                  ></textarea>
                </div>

                <!-- 脱敏配置区域 -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">
                      <i class="fas fa-shield-alt me-2 text-warning"></i>数据脱敏配置
                    </h6>
                    <button 
                      class="btn btn-sm btn-success" 
                      @click="addMaskingRule"
                      :disabled="submitting"
                    >
                      <i class="fas fa-plus me-2"></i>添加脱敏规则
                    </button>
                  </div>

                  <!-- 脱敏规则列表 -->
                  <div v-if="requestForm.maskingRules.length === 0" class="text-center py-4 bg-light rounded">
                    <i class="fas fa-info-circle text-muted fa-2x mb-2"></i>
                    <p class="text-muted mb-0">暂无脱敏规则，点击上方按钮添加</p>
                  </div>

                  <div v-else>
                    <div 
                      v-for="(rule, index) in requestForm.maskingRules" 
                      :key="rule.id"
                      class="masking-rule-item mb-3 p-3 border rounded"
                    >
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <h6 class="mb-0 text-primary">规则 {{ index + 1 }}</h6>
                        <button 
                          class="btn btn-sm btn-danger delete-rule-btn" 
                          @click="removeMaskingRule(index)"
                          :disabled="submitting"
                          title="删除此规则"
                        >
                          ×
                        </button>
                      </div>

                      <div class="row">
                        <!-- Key名称 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>Key名称</strong>
                          </label>
                          <input 
                            v-model="rule.keyName" 
                            type="text" 
                            class="form-control form-control-sm" 
                            placeholder="如: name, age, email"
                          />
                        </div>

                        <!-- Key类型 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>数据类型</strong>
                          </label>
                          <select 
                            v-model="rule.keyType" 
                            class="form-select form-select-sm"
                            @change="onKeyTypeChange(rule)"
                          >
                            <option value="">请选择类型</option>
                            <option value="string">字符串</option>
                            <option value="number">数值</option>
                          </select>
                        </div>

                        <!-- 约束类型 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>约束类型</strong>
                          </label>
                          <select 
                            v-model="rule.constraintType" 
                            class="form-select form-select-sm"
                            :disabled="!rule.keyType"
                            @change="onConstraintTypeChange(rule)"
                          >
                            <option value="">请选择约束</option>
                            <template v-if="rule.keyType === 'string'">
                              <option value="equals">等于</option>
                              <option value="contains">包含子串</option>
                            </template>
                            <template v-if="rule.keyType === 'number'">
                              <option value="range">范围</option>
                              <option value="min">最小值</option>
                              <option value="max">最大值</option>
                            </template>
                          </select>
                        </div>
                      </div>

                      <!-- 约束值配置 -->
                      <div v-if="rule.constraintType" class="constraint-config">
                        <!-- 字符串约束 -->
                        <div v-if="rule.keyType === 'string'" class="row">
                          <div class="col-12">
                            <label class="form-label small">
                              <strong>
                                {{ rule.constraintType === 'equals' ? '等于值' : '包含子串' }}
                              </strong>
                            </label>
                            <input 
                              v-model="rule.constraintValue" 
                              type="text" 
                              class="form-control form-control-sm" 
                              :placeholder="rule.constraintType === 'equals' ? '输入完全匹配的值' : '输入要包含的子串'"
                            />
                          </div>
                        </div>

                        <!-- 数值约束 -->
                        <div v-if="rule.keyType === 'number'" class="row">
                          <div v-if="rule.constraintType === 'range'" class="col-md-6">
                            <label class="form-label small">
                              <strong>最小值</strong>
                            </label>
                            <input 
                              v-model.number="rule.minValue" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="输入最小值"
                            />
                          </div>
                          <div v-if="rule.constraintType === 'range'" class="col-md-6">
                            <label class="form-label small">
                              <strong>最大值</strong>
                            </label>
                            <input 
                              v-model.number="rule.maxValue" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="输入最大值"
                            />
                          </div>
                          <div v-if="rule.constraintType === 'min'" class="col-md-6">
                            <label class="form-label small">
                              <strong>最小值</strong>
                            </label>
                            <input 
                              v-model.number="rule.minValue" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="输入最小值"
                            />
                          </div>
                          <div v-if="rule.constraintType === 'max'" class="col-md-6">
                            <label class="form-label small">
                              <strong>最大值</strong>
                            </label>
                            <input 
                              v-model.number="rule.maxValue" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="输入最大值"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 提交按钮 -->
                <div class="d-flex justify-content-end gap-2">
                  <button 
                    class="btn btn-secondary" 
                    @click="resetForm"
                    :disabled="submitting"
                  >
                    <i class="fas fa-undo me-2"></i>重置
                  </button>
                  <button 
                    class="btn btn-primary" 
                    @click="submitRequest"
                    :disabled="submitting || !isFormValid"
                  >
                    <i class="fas fa-paper-plane me-2"></i>
                    {{ submitting ? '提交中...' : '发起请求' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import NavbarDefault from "../../../components/NavbarDefault.vue";
import Header from "../../../examples/Header.vue";

import vueMkHeader from "@/assets/img/vue-mk-header.jpg";
import axios from "@/api/axios";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const body = document.getElementsByTagName("body")[0];
const $notify = inject('$notify');

// 响应式数据
const blockchainName = ref('');
const datasetName = ref('');
const dataset = ref(null);
const loading = ref(false);
const error = ref('');
const submitting = ref(false);

// 请求表单
const requestForm = ref({
  title: '',
  description: '',
  maskingRules: []
});

// 脱敏规则ID计数器
const ruleIdCounter = ref(0);

// 获取数据集详情
const fetchDatasetDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`/getDatasetByDatasetName/${blockchainName.value}/${datasetName.value}`);
    if (response.data.success && response.data.data) {
      dataset.value = response.data.data;
      
      // 检查是否支持定制脱敏交易
      if (!dataset.value.canCustomMaskingTrade) {
        error.value = '该数据集不支持定制脱敏交易功能';
      }
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

// 添加脱敏规则
const addMaskingRule = () => {
  const newRule = {
    id: ++ruleIdCounter.value,
    keyName: '',
    keyType: '',
    constraintType: '',
    constraintValue: '',
    minValue: null,
    maxValue: null
  };
  requestForm.value.maskingRules.push(newRule);
};

// 移除脱敏规则
const removeMaskingRule = (index) => {
  requestForm.value.maskingRules.splice(index, 1);
};

// Key类型变化处理
const onKeyTypeChange = (rule) => {
  // 重置约束相关字段
  rule.constraintType = '';
  rule.constraintValue = '';
  rule.minValue = null;
  rule.maxValue = null;
};

// 约束类型变化处理
const onConstraintTypeChange = (rule) => {
  // 重置约束值
  rule.constraintValue = '';
  rule.minValue = null;
  rule.maxValue = null;
};

// 表单验证
const isFormValid = computed(() => {
  if (!requestForm.value.title.trim() || !requestForm.value.description.trim()) {
    return false;
  }
  
  if (requestForm.value.maskingRules.length === 0) {
    return false;
  }
  
  // 验证每个规则
  return requestForm.value.maskingRules.every(rule => {
    if (!rule.keyName.trim() || !rule.keyType || !rule.constraintType) {
      return false;
    }
    
    if (rule.keyType === 'string') {
      return rule.constraintValue && rule.constraintValue.trim();
    }
    
    if (rule.keyType === 'number') {
      if (rule.constraintType === 'range') {
        return rule.minValue !== null && rule.maxValue !== null && rule.minValue <= rule.maxValue;
      } else if (rule.constraintType === 'min') {
        return rule.minValue !== null;
      } else if (rule.constraintType === 'max') {
        return rule.maxValue !== null;
      }
    }
    
    return false;
  });
});

// 重置表单
const resetForm = () => {
  requestForm.value = {
    title: '',
    description: '',
    maskingRules: []
  };
  ruleIdCounter.value = 0;
};

// 一键生成测试请求
const generateTestRequest = () => {
  if (!dataset.value) return;
  
  // 重置表单
  resetForm();
  
  // 填充基本信息
  requestForm.value.title = `${dataset.value.fullName || dataset.value.name} - 定制脱敏数据请求测试`;
  requestForm.value.description = `这是一个针对数据集"${dataset.value.fullName || dataset.value.name}"的定制脱敏数据请求测试。该请求包含了所有类型的脱敏规则示例，用于验证系统的完整功能。请求方希望获得经过特定条件筛选和脱敏处理的数据子集，以满足数据分析和研究需求。`;
  
  // 生成所有类型的脱敏规则
  const testRules = [
    // 字符串 - 等于
    {
      id: ++ruleIdCounter.value,
      keyName: 'name',
      keyType: 'string',
      constraintType: 'equals',
      constraintValue: '张三',
      minValue: null,
      maxValue: null
    },
    // 字符串 - 包含子串
    {
      id: ++ruleIdCounter.value,
      keyName: 'email',
      keyType: 'string',
      constraintType: 'contains',
      constraintValue: '@gmail.com',
      minValue: null,
      maxValue: null
    },
    // 数值 - 范围
    {
      id: ++ruleIdCounter.value,
      keyName: 'age',
      keyType: 'number',
      constraintType: 'range',
      constraintValue: '',
      minValue: 18,
      maxValue: 65
    },
    // 数值 - 最小值
    {
      id: ++ruleIdCounter.value,
      keyName: 'salary',
      keyType: 'number',
      constraintType: 'min',
      constraintValue: '',
      minValue: 5000,
      maxValue: null
    },
    // 数值 - 最大值
    {
      id: ++ruleIdCounter.value,
      keyName: 'score',
      keyType: 'number',
      constraintType: 'max',
      constraintValue: '',
      minValue: null,
      maxValue: 100
    },
    // 字符串 - 等于（另一个示例）
    {
      id: ++ruleIdCounter.value,
      keyName: 'department',
      keyType: 'string',
      constraintType: 'equals',
      constraintValue: '技术部',
      minValue: null,
      maxValue: null
    },
    // 字符串 - 包含子串（另一个示例）
    {
      id: ++ruleIdCounter.value,
      keyName: 'address',
      keyType: 'string',
      constraintType: 'contains',
      constraintValue: '北京',
      minValue: null,
      maxValue: null
    }
  ];
  
  requestForm.value.maskingRules = testRules;
  
  // 显示成功提示
  $notify.success('测试请求已自动生成，包含所有类型的脱敏规则示例');
};

// 提交请求
const submitRequest = async () => {
  if (!isFormValid.value) {
    $notify.error('请完善表单信息');
    return;
  }

  submitting.value = true;
  
  try {
    // 构建请求数据
    const requestData = {
      title: requestForm.value.title.trim(),
      description: requestForm.value.description.trim(),
      blockchainName: blockchainName.value,
      datasetName: datasetName.value,
      datasetOwner: dataset.value.owner,
      requester: authStore.username,
      maskingRules: requestForm.value.maskingRules.map(rule => ({
        keyName: rule.keyName.trim(),
        keyType: rule.keyType,
        constraintType: rule.constraintType,
        constraintValue: rule.constraintValue ? rule.constraintValue.trim() : undefined,
        minValue: rule.minValue,
        maxValue: rule.maxValue
      }))
    };

    console.log('提交定制脱敏请求:', requestData);
    
    // 这里调用后端API
    const response = await submitCustomMaskingRequest(requestData);
    
    if (response.success) {
      $notify.success('定制脱敏请求已提交成功');
      resetForm();
      // 可以跳转到请求列表页面
      // router.push('/my-requests');
    } else {
      $notify.error('请求提交失败：' + response.message);
    }
  } catch (err) {
    console.error('提交请求失败', err);
    $notify.error('网络错误，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 提交定制脱敏请求的API调用（简单的接口函数）
const submitCustomMaskingRequest = async (requestData) => {
  // 这里是简单的接口函数，实际需要根据后端API实现
  const response = await axios.post('/submitCustomMaskingRequest', requestData);
  return response.data;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
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

.gap-2 > * {
  margin-right: 0.5rem !important;
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

/* 表单样式 */
.form-control, .form-select {
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* 脱敏规则容器样式 - 移除高度限制，让其自然扩展 */

.masking-rule-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6 !important;
  transition: border-color 0.3s ease;
}

.masking-rule-item:hover {
  border-color: #86b7fe !important;
}

/* 约束配置区域 */
.constraint-config {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  padding: 1rem;
}

/* 卡片头部样式 */
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

/* 小号表单控件 */
.form-control-sm, .form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
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
  
  .col-lg-4, .col-lg-8 {
    margin-bottom: 1rem;
  }
  
  
  .constraint-config {
    padding: 0.75rem;
  }
}

/* 禁用按钮样式 */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 删除按钮样式 */
.delete-rule-btn {
  width: 32px;
  height: 32px;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 18px;
  font-weight: bold;
  color: white !important;
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  line-height: 1;
}

.delete-rule-btn:hover {
  background-color: #c82333 !important;
  border-color: #bd2130 !important;
  color: white !important;
}

.delete-rule-btn:active {
  background-color: #bd2130 !important;
  border-color: #b21f2d !important;
}
</style>