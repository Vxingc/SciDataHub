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
              发起数据服务请求
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
          <h3 class="mb-0">数据服务请求</h3>
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
                    <span v-if="dataset.canDataService" class="badge bg-primary">可验证数据服务</span>
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
                  <i class="fas fa-cogs me-2"></i>数据服务请求配置
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
                    placeholder="请描述您的数据服务需求和用途"
                  ></textarea>
                </div>

                <!-- 查询请求配置 -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">
                      <i class="fas fa-filter me-2 text-info"></i>查询条件配置
                    </h6>
                    <button 
                      class="btn btn-sm btn-success" 
                      @click="addQueryRule"
                      :disabled="submitting"
                    >
                      <i class="fas fa-plus me-2"></i>添加查询条件
                    </button>
                  </div>

                  <!-- 查询规则列表 -->
                  <div v-if="requestForm.queryRules.length === 0" class="text-center py-4 bg-light rounded">
                    <i class="fas fa-info-circle text-muted fa-2x mb-2"></i>
                    <p class="text-muted mb-0">暂无查询条件，点击上方按钮添加</p>
                  </div>

                  <div v-else>
                    <div 
                      v-for="(rule, index) in requestForm.queryRules" 
                      :key="rule.id"
                      class="query-rule-item mb-3 p-3 border rounded"
                    >
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <h6 class="mb-0 text-info">条件 {{ index + 1 }}</h6>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="removeQueryRule(index)"
                          :disabled="submitting"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>

                      <div class="row">
                        <!-- 字段名称 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>字段名称</strong>
                          </label>
                          <input 
                            v-model="rule.fieldName" 
                            type="text" 
                            class="form-control form-control-sm" 
                            placeholder="如: name, age, email"
                          />
                        </div>

                        <!-- 数据类型 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>数据类型</strong>
                          </label>
                          <select 
                            v-model="rule.dataType" 
                            class="form-select form-select-sm"
                            @change="onDataTypeChange(rule)"
                          >
                            <option value="">请选择类型</option>
                            <option value="string">字符串</option>
                            <option value="number">数值</option>
                          </select>
                        </div>

                        <!-- 操作符 -->
                        <div class="col-md-4 mb-3">
                          <label class="form-label small">
                            <strong>操作符</strong>
                          </label>
                          <select 
                            v-model="rule.operator" 
                            class="form-select form-select-sm"
                            :disabled="!rule.dataType"
                            @change="onOperatorChange(rule)"
                          >
                            <option value="">请选择操作符</option>
                            <template v-if="rule.dataType === 'string'">
                              <option value="equals">等于</option>
                              <option value="contains">包含</option>
                            </template>
                            <template v-if="rule.dataType === 'number'">
                              <option value="equals">等于</option>
                              <option value="gt">大于</option>
                              <option value="gte">大于等于</option>
                              <option value="lt">小于</option>
                              <option value="lte">小于等于</option>
                              <option value="between">介于</option>
                            </template>
                          </select>
                        </div>
                      </div>

                      <!-- 条件值配置 -->
                      <div v-if="rule.operator" class="condition-config">
                        <!-- 字符串条件 -->
                        <div v-if="rule.dataType === 'string'" class="row">
                          <div class="col-12">
                            <label class="form-label small">
                              <strong>条件值</strong>
                            </label>
                            <input 
                              v-model="rule.value" 
                              type="text" 
                              class="form-control form-control-sm" 
                              :placeholder="getStringPlaceholder(rule.operator)"
                            />
                          </div>
                        </div>

                        <!-- 数值条件 -->
                        <div v-if="rule.dataType === 'number'" class="row">
                          <div v-if="rule.operator === 'between'" class="col-md-6">
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
                          <div v-if="rule.operator === 'between'" class="col-md-6">
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
                          <div v-if="rule.operator !== 'between'" class="col-md-6">
                            <label class="form-label small">
                              <strong>数值</strong>
                            </label>
                            <input 
                              v-model.number="rule.value" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="输入数值"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 计算请求配置 -->
                <div class="mb-4">
                  <div class="mb-3">
                    <h6 class="mb-3">
                      <i class="fas fa-code me-2 text-warning"></i>计算代码配置
                    </h6>
                    <div class="alert alert-info" role="alert">
                      <i class="fas fa-info-circle me-2"></i>
                      请输入Rust代码来定义您的计算逻辑。代码将在安全的沙箱环境中执行。
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="rustCode" class="form-label">
                      <strong><i class="fab fa-rust me-2 text-warning"></i>Rust计算代码</strong>
                    </label>
                    <div class="code-editor-container">
                      <textarea 
                        id="rustCode"
                        v-model="requestForm.rustCode" 
                        class="form-control code-editor" 
                        rows="15" 
                        placeholder="// 请输入您的Rust计算代码
// 示例：
use serde_json::Value;

fn main() {
    // 您的计算逻辑
    println!(&quot;Hello, Data Service!&quot;);
}

// 数据处理函数示例
fn process_data(data: &Value) -> Value {
    // 在这里实现您的数据处理逻辑
    data.clone()
}"
                        spellcheck="false"
                      ></textarea>
                    </div>
                  </div>

                  <!-- 代码模板按钮 -->
                  <div class="mb-3">
                    <label class="form-label small">
                      <strong>快速模板</strong>
                    </label>
                    <div class="d-flex flex-wrap gap-2">
                      <button 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="insertTemplate('basic')"
                        type="button"
                      >
                        <i class="fas fa-file-code me-1"></i>基础模板
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="insertTemplate('statistics')"
                        type="button"
                      >
                        <i class="fas fa-chart-bar me-1"></i>统计分析
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="insertTemplate('filter')"
                        type="button"
                      >
                        <i class="fas fa-filter me-1"></i>数据过滤
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="insertTemplate('aggregation')"
                        type="button"
                      >
                        <i class="fas fa-layer-group me-1"></i>数据聚合
                      </button>
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
  queryRules: [],
  rustCode: ''
});

// 查询规则ID计数器
const ruleIdCounter = ref(0);

// 获取数据集详情
const fetchDatasetDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`/getDatasetByDatasetName/${blockchainName.value}/${datasetName.value}`);
    if (response.data.success && response.data.data) {
      dataset.value = response.data.data;
      
      // 检查是否支持数据服务
      if (!dataset.value.canDataService) {
        error.value = '该数据集不支持数据服务功能';
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

// 表单验证
const isFormValid = computed(() => {
  if (!requestForm.value.title.trim() || !requestForm.value.description.trim()) {
    return false;
  }
  
  // 至少需要有查询条件或计算代码其中之一
  const hasValidQuery = requestForm.value.queryRules.length > 0 && 
    requestForm.value.queryRules.every(rule => {
      if (!rule.fieldName.trim() || !rule.dataType || !rule.operator) {
        return false;
      }
      
      if (rule.dataType === 'string') {
        return rule.value && rule.value.trim();
      }
      
      if (rule.dataType === 'number') {
        if (rule.operator === 'between') {
          return rule.minValue !== null && rule.maxValue !== null && rule.minValue <= rule.maxValue;
        } else {
          return rule.value !== null && rule.value !== '';
        }
      }
      
      return false;
    });
  
  const hasValidCode = requestForm.value.rustCode && requestForm.value.rustCode.trim();
  
  return hasValidQuery || hasValidCode;
});

// 添加查询规则
const addQueryRule = () => {
  const newRule = {
    id: ++ruleIdCounter.value,
    fieldName: '',
    dataType: '',
    operator: '',
    value: '',
    minValue: null,
    maxValue: null
  };
  requestForm.value.queryRules.push(newRule);
};

// 移除查询规则
const removeQueryRule = (index) => {
  requestForm.value.queryRules.splice(index, 1);
};

// 数据类型变化处理
const onDataTypeChange = (rule) => {
  // 重置操作符相关字段
  rule.operator = '';
  rule.value = '';
  rule.minValue = null;
  rule.maxValue = null;
};

// 操作符变化处理
const onOperatorChange = (rule) => {
  // 重置条件值
  rule.value = '';
  rule.minValue = null;
  rule.maxValue = null;
};

// 获取字符串操作符的占位符
const getStringPlaceholder = (operator) => {
  const placeholders = {
    equals: '输入完全匹配的值',
    contains: '输入要包含的子串'
  };
  return placeholders[operator] || '输入条件值';
};

// 插入代码模板
const insertTemplate = (templateType) => {
  const templates = {
    basic: `use serde_json::Value;

fn main() {
    println!("数据服务计算开始");
    
    // 在这里添加您的计算逻辑
    let result = process_data();
    
    println!("计算结果: {:?}", result);
}

fn process_data() -> Value {
    // 实现您的数据处理逻辑
    serde_json::json!({
        "status": "success",
        "message": "计算完成"
    })
}`,

    statistics: `use serde_json::Value;
use std::collections::HashMap;

fn main() {
    println!("开始统计分析");
    
    let stats = calculate_statistics();
    println!("统计结果: {:?}", stats);
}

fn calculate_statistics() -> Value {
    // 统计分析逻辑
    let mut stats = HashMap::new();
    
    // 示例：计算平均值、最大值、最小值等
    stats.insert("count", 0);
    stats.insert("sum", 0);
    stats.insert("average", 0.0);
    stats.insert("max", 0);
    stats.insert("min", 0);
    
    serde_json::to_value(stats).unwrap()
}`,

    filter: `use serde_json::Value;

fn main() {
    println!("开始数据过滤");
    
    let filtered_data = filter_data();
    println!("过滤完成，结果数量: {}", filtered_data.as_array().unwrap().len());
}

fn filter_data() -> Value {
    // 数据过滤逻辑
    let mut filtered_results = Vec::new();
    
    // 示例：根据条件过滤数据
    // for item in data_items {
    //     if meets_condition(&item) {
    //         filtered_results.push(item);
    //     }
    // }
    
    serde_json::json!(filtered_results)
}

fn meets_condition(item: &Value) -> bool {
    // 定义过滤条件
    true
}`,

    aggregation: `use serde_json::Value;
use std::collections::HashMap;

fn main() {
    println!("开始数据聚合");
    
    let aggregated_data = aggregate_data();
    println!("聚合结果: {:?}", aggregated_data);
}

fn aggregate_data() -> Value {
    // 数据聚合逻辑
    let mut groups = HashMap::new();
    
    // 示例：按字段分组聚合
    // for item in data_items {
    //     let key = item["group_field"].as_str().unwrap();
    //     let entry = groups.entry(key).or_insert(Vec::new());
    //     entry.push(item);
    // }
    
    // 对每个分组进行聚合计算
    let mut result = HashMap::new();
    for (key, values) in groups {
        result.insert(key, aggregate_group(values));
    }
    
    serde_json::to_value(result).unwrap()
}

fn aggregate_group(values: Vec<Value>) -> Value {
    // 对分组进行聚合计算
    serde_json::json!({
        "count": values.len(),
        "items": values
    })
}`
  };

  if (templates[templateType]) {
    requestForm.value.rustCode = templates[templateType];
    $notify.success(`已插入${templateType === 'basic' ? '基础' : templateType === 'statistics' ? '统计分析' : templateType === 'filter' ? '数据过滤' : '数据聚合'}模板`);
  }
};

// 重置表单
const resetForm = () => {
  requestForm.value = {
    title: '',
    description: '',
    queryRules: [],
    rustCode: ''
  };
  ruleIdCounter.value = 0;
};

// 一键生成测试请求
const generateTestRequest = () => {
  if (!dataset.value) return;
  
  // 重置表单
  resetForm();
  
  // 填充基本信息
  requestForm.value.title = `${dataset.value.fullName || dataset.value.name} - 数据服务请求测试`;
  requestForm.value.description = `这是一个针对数据集"${dataset.value.fullName || dataset.value.name}"的数据服务请求测试。该请求包含了查询条件和计算代码的完整示例，用于验证系统的数据服务能力。`;
  
  // 生成测试查询规则
  const testRules = [
    {
      id: ++ruleIdCounter.value,
      fieldName: 'name',
      dataType: 'string',
      operator: 'contains',
      value: '张',
      minValue: null,
      maxValue: null
    },
    {
      id: ++ruleIdCounter.value,
      fieldName: 'age',
      dataType: 'number',
      operator: 'between',
      value: '',
      minValue: 18,
      maxValue: 65
    },
    {
      id: ++ruleIdCounter.value,
      fieldName: 'email',
      dataType: 'string',
      operator: 'equals',
      value: 'test@example.com',
      minValue: null,
      maxValue: null
    }
  ];
  
  requestForm.value.queryRules = testRules;
  
  // 生成测试计算代码
  requestForm.value.rustCode = `use serde_json::Value;
use std::collections::HashMap;

fn main() {
    println!("开始数据服务计算测试");
    
    let result = analyze_dataset();
    println!("分析结果: {:?}", result);
}

fn analyze_dataset() -> Value {
    // 数据集分析逻辑
    let mut analysis = HashMap::new();
    
    // 模拟数据统计
    analysis.insert("total_records", 1000);
    analysis.insert("valid_records", 950);
    analysis.insert("invalid_records", 50);
    analysis.insert("completion_rate", 95.0);
    
    serde_json::to_value(analysis).unwrap()
}`;
  
  $notify.success('已生成完整的数据服务请求测试，包含查询条件和计算代码示例');
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
      requester: authStore.username
    };

    console.log('提交数据服务请求:', requestData);
    
    // 这里调用后端API
    const response = await submitDataServiceRequest(requestData);
    
    if (response.success) {
      $notify.success('数据服务请求已提交成功');
      resetForm();
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

// 提交数据服务请求的API调用
const submitDataServiceRequest = async (requestData) => {
  const response = await axios.post('/submitDataServiceRequest', requestData);
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
  
  .col-lg-4, .col-lg-8 {
    margin-bottom: 1rem;
  }
}

/* 禁用按钮样式 */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 查询规则容器样式 */
.query-rule-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6 !important;
  transition: border-color 0.3s ease;
}

.query-rule-item:hover {
  border-color: #86b7fe !important;
}

/* 条件配置区域 */
.condition-config {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  padding: 1rem;
}

/* 代码编辑器样式 */
.code-editor-container {
  position: relative;
}

.code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  resize: vertical;
  min-height: 300px;
}

.code-editor:focus {
  background-color: #ffffff;
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* 小号表单控件 */
.form-control-sm, .form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}
</style>