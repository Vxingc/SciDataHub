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
              服务订单处理详情
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              数据服务订单的5轮循环执行流程
            </p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div class="container mt-sm-5 mt-3">
    <div class="row">
      <div class="col-12">
        <!-- 页面头部 -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 class="mb-0">服务订单处理详情</h3>
            <p class="text-muted mb-0" v-if="order">订单ID: {{ order.id }}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-info" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt me-2"></i>刷新
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
          <p class="mt-3 text-muted">正在加载服务订单处理详情...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 服务订单处理详情内容 -->
        <div v-else-if="order" class="processing-detail">
          <!-- 订单基本信息 -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>订单基本信息
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td class="fw-bold text-muted">订单标题:</td>
                      <td>{{ order.title }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">服务类型:</td>
                      <td>
                        <span class="badge bg-info">{{ getServiceTypeText(order.serviceType) }}</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">当前状态:</td>
                      <td>
                        <span class="badge" :class="getStatusBadgeClass(order.status)">
                          {{ getStatusText(order.status) }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">数据集:</td>
                      <td>{{ order.datasetName }}</td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td class="fw-bold text-muted">请求者:</td>
                      <td>{{ order.requester }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">数据拥有者:</td>
                      <td>{{ order.datasetOwner }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">创建时间:</td>
                      <td>{{ formatDate(order.created_at) }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 循环进度显示 -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>循环进度
              </h5>
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-info">第 {{ currentCycle }} / {{ totalCycles }} 轮</span>
                <span class="badge bg-success">{{ overallProgress }}% 完成</span>
              </div>
            </div>
            <div class="card-body">
              <!-- 整体进度条 -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold">整体进度</span>
                  <span class="text-muted">{{ overallProgress }}%</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div 
                    class="progress-bar bg-success" 
                    role="progressbar" 
                    :style="{ width: overallProgress + '%' }"
                    :aria-valuenow="overallProgress" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <!-- 当前循环状态 -->
              <div class="row">
                <div class="col-md-6">
                  <div class="current-cycle-status">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-sync-alt me-2"></i>当前循环状态
                    </h6>
                    <div class="status-card p-3 border rounded">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold">第 {{ currentCycle }} 轮</span>
                        <span class="badge" :class="{
                          'bg-success': getCurrentCycleStatus === '已完成',
                          'bg-warning': getCurrentCycleStatus === '等待支付凭证',
                          'bg-info': getCurrentCycleStatus === '等待执行结果'
                        }">
                          {{ getCurrentCycleStatus }}
                        </span>
                      </div>
                      <div class="progress mb-2" style="height: 6px;">
                        <div 
                          class="progress-bar" 
                          :class="{
                            'bg-success': getCurrentCycleStatus === '已完成',
                            'bg-warning': getCurrentCycleStatus === '等待支付凭证',
                            'bg-info': getCurrentCycleStatus === '等待执行结果'
                          }"
                          role="progressbar" 
                          :style="{ width: (hasProvidedResult ? 50 : 0) + (hasSubmittedPayment ? 50 : 0) + '%' }"
                        ></div>
                      </div>
                      <div class="d-flex justify-content-between small text-muted">
                        <span>
                          <i class="fas fa-cogs me-1" :class="{ 'text-success': hasProvidedResult }"></i>
                          执行结果
                        </span>
                        <span>
                          <i class="fas fa-credit-card me-1" :class="{ 'text-success': hasSubmittedPayment }"></i>
                          支付凭证
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 循环历史概览 -->
                <div class="col-md-6">
                  <h6 class="text-secondary mb-3">
                    <i class="fas fa-history me-2"></i>循环历史
                  </h6>
                  <div class="cycle-history-grid">
                    <div 
                      v-for="cycle in cycleHistory.slice(0, 5)" 
                      :key="cycle.cycle"
                      class="cycle-item"
                      :class="{
                        'cycle-completed': cycle.isComplete,
                        'cycle-current': cycle.cycle === currentCycle,
                        'cycle-pending': cycle.cycle > currentCycle
                      }"
                      :title="`第${cycle.cycle}轮: ${cycle.isComplete ? '已完成' : cycle.cycle === currentCycle ? '进行中' : '未开始'}`"
                    >
                      <span class="cycle-number">{{ cycle.cycle }}</span>
                      <i v-if="cycle.isComplete" class="fas fa-check cycle-icon"></i>
                      <i v-else-if="cycle.cycle === currentCycle" class="fas fa-play cycle-icon"></i>
                      <i v-else class="fas fa-clock cycle-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 交互历史时间线 -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-history me-2"></i>交互历史
              </h5>
              <span class="badge bg-primary">{{ interactionHistory.length }} 条记录</span>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div 
                  v-for="(interaction, index) in interactionHistory" 
                  :key="index"
                  class="timeline-item"
                  :class="{ 'timeline-item-current': index === interactionHistory.length - 1 }"
                >
                  <div class="timeline-marker">
                    <i :class="getInteractionIcon(interaction.action)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h6 class="mb-1">{{ getInteractionTitle(interaction.action) }}</h6>
                      <small class="text-muted">{{ formatDate(interaction.timestamp) }}</small>
                    </div>
                    <p class="mb-2">{{ interaction.description }}</p>
                    <div class="timeline-meta">
                      <span class="badge bg-secondary me-2">{{ interaction.actor }}</span>
                      <!-- 显示执行结果和proof -->
                      <div v-if="interaction.executionResult" class="mt-2">
                        <small class="text-muted">加密执行结果:</small>
                        <div class="bg-light p-2 rounded mt-1">
                          <code class="small">{{ interaction.executionResult }}</code>
                        </div>
                      </div>
                      <div v-if="interaction.proof" class="mt-2">
                        <small class="text-muted">ZKVM正确性证明:</small>
                        <div class="bg-light p-2 rounded mt-1" style="max-height: 100px; overflow-y: auto;">
                          <code class="small">{{ interaction.proof }}</code>
                        </div>
                      </div>
                      <div v-if="interaction.paymentProof" class="mt-2">
                        <small class="text-muted">支付凭证:</small>
                        <div class="bg-light p-2 rounded mt-1">
                          <code class="small">{{ interaction.paymentProof }}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作面板 -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-tools me-2"></i>操作面板
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <!-- 数据拥有者操作 -->
                <div class="col-md-6" v-if="authStore.username === order.datasetOwner">
                  <h6 class="text-primary">数据拥有者操作</h6>
                  <div class="mb-3" v-if="!hasProvidedResult">
                    <label class="form-label">提交第{{ currentCycle }}轮加密执行结果</label>
                    <div class="input-group mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newExecutionResult"
                        placeholder="输入加密执行结果 (如: 0x1a2b3c4d...)"
                      >
                    </div>
                    <label class="form-label">ZKVM正确性证明</label>
                    <div class="input-group mb-2">
                      <textarea 
                        class="form-control" 
                        v-model="newProof"
                        rows="3"
                        placeholder="输入base64编码的ZKVM证明..."
                      ></textarea>
                    </div>
                    <button 
                      class="btn btn-primary" 
                      @click="submitExecutionResult"
                      :disabled="!newExecutionResult || !newProof"
                    >
                      <i class="fas fa-upload me-1"></i>提交执行结果
                    </button>
                    <small class="text-muted d-block mt-1">请输入加密执行结果和ZKVM正确性证明</small>
                  </div>
                  <div v-else class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    您已提交了第{{ currentCycle }}轮加密执行结果和正确性证明
                  </div>
                </div>

                <!-- 请求者操作 -->
                <div class="col-md-6" v-if="authStore.username === order.requester">
                  <h6 class="text-success">请求者操作</h6>
                  <div class="mb-3" v-if="hasProvidedResult && !hasSubmittedPayment">
                    <label class="form-label">提交第{{ currentCycle }}轮支付凭证</label>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newPaymentProof"
                        :placeholder="`输入第${currentCycle}轮64位支付凭证...`"
                        maxlength="64"
                      >
                      <button 
                        class="btn btn-success" 
                        @click="submitPaymentProof"
                        :disabled="!newPaymentProof || newPaymentProof.length !== 64"
                      >
                        <i class="fas fa-credit-card me-1"></i>提交
                      </button>
                    </div>
                    <small class="text-muted">请输入64位字符的第{{ currentCycle }}轮支付凭证</small>
                  </div>
                  <div v-else-if="!hasProvidedResult" class="alert alert-info">
                    <i class="fas fa-clock me-2"></i>
                    等待数据拥有者提供第{{ currentCycle }}轮加密执行结果
                  </div>
                  <div v-else-if="hasSubmittedPayment" class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    您已提交了第{{ currentCycle }}轮支付凭证
                  </div>
                </div>

                <!-- 观察者视图 -->
                <div class="col-12" v-if="authStore.username !== order.datasetOwner && authStore.username !== order.requester">
                  <div class="alert alert-info">
                    <i class="fas fa-eye me-2"></i>
                    您正在以观察者身份查看此服务订单的处理详情
                  </div>
                </div>
              </div>

              <!-- 进入下一循环按钮 -->
              <div class="row mt-4" v-if="canProceedToNextCycle">
                <div class="col-12">
                  <div class="alert alert-info">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <i class="fas fa-sync-alt me-2"></i>
                        第{{ currentCycle }}轮已完成，可以进入下一轮循环
                      </div>
                      <button 
                        class="btn btn-info"
                        @click="proceedToNextCycle"
                        v-if="authStore.username === order.datasetOwner"
                      >
                        <i class="fas fa-arrow-right me-1"></i>进入第{{ currentCycle + 1 }}轮
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 完成订单按钮 -->
              <div class="row mt-4" v-if="canCompleteOrder">
                <div class="col-12">
                  <div class="alert alert-success">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <i class="fas fa-check-circle me-2"></i>
                        所有{{ totalCycles }}轮循环已完成，可以完成订单
                      </div>
                      <button 
                        class="btn btn-success"
                        @click="completeOrder"
                        v-if="authStore.username === order.datasetOwner"
                      >
                        <i class="fas fa-flag-checkered me-1"></i>完成订单
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 终止订单按钮 -->
              <div class="row mt-4" v-if="order.status === 'processing' && (authStore.username === order.datasetOwner || authStore.username === order.requester)">
                <div class="col-12">
                  <div class="alert alert-warning">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>终止订单：</strong>{{ authStore.username === order.datasetOwner ? '数据拥有者' : '数据请求者' }}可以随时终止当前服务订单处理
                      </div>
                      <button 
                        class="btn btn-outline-danger"
                        @click="terminateOrder"
                      >
                        <i class="fas fa-stop me-1"></i>终止订单
                      </button>
                    </div>
                    <div class="mt-2">
                      <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        终止订单将立即停止当前处理循环，订单状态将变为已取消。此操作不可撤销，请谨慎操作。
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单不存在 -->
        <div v-else class="text-center py-5">
          <div class="mb-4">
            <i class="fas fa-search fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted">订单不存在</h4>
          <p class="text-muted">请检查订单ID是否正确</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavbarDefault from '@/components/NavbarDefault.vue'
import Header from '@/examples/Header.vue'
import vueMkHeader from '@/assets/img/vue-mk-header.jpg'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const error = ref('')
const order = ref(null)
const interactionHistory = ref([])
const newExecutionResult = ref('')
const newProof = ref('')
const newPaymentProof = ref('')

// 循环执行相关数据
const totalCycles = ref(5) // 总循环次数（服务订单为5轮）
const currentCycle = ref(1) // 当前循环轮次
const cycleHistory = ref([]) // 每轮循环的历史记录

// 基础方法
const goBack = () => {
  router.go(-1)
}

const refreshData = () => {
  loadProcessingDetail()
}

const getServiceTypeText = (type) => {
  const typeMap = {
    'verification': '数据验证',
    'analysis': '数据分析',
    'processing': '数据处理',
    'custom': '定制服务'
  }
  return typeMap[type] || type
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝',
    'cancelled': '已取消',
    'failed': '失败'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    'pending': 'bg-warning',
    'processing': 'bg-info',
    'completed': 'bg-success',
    'rejected': 'bg-danger',
    'cancelled': 'bg-secondary',
    'failed': 'bg-danger'
  }
  return classMap[status] || 'bg-secondary'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadProcessingDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const orderId = route.params.orderId
    if (!orderId) {
      throw new Error('缺少订单ID参数')
    }
    
    // 只有订单2处于处理中状态，其他订单不允许访问服务订单处理详情
    const orderNumber = parseInt(orderId.replace(/\D/g, '')) || 1
    if (orderNumber !== 2) {
      throw new Error('该订单当前不在处理中状态，无法查看服务订单处理详情')
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟数据（只为订单2）
    const mockOrder = generateMockOrder(orderId)
    order.value = mockOrder
    interactionHistory.value = generateMockHistory()
    
    console.log('已加载服务订单处理详情:', mockOrder)
    console.log('交互历史:', interactionHistory.value)
  } catch (err) {
    console.error('Load service processing detail error:', err)
    error.value = err.message || '获取服务订单处理详情失败'
    order.value = null
  } finally {
    loading.value = false
  }
}

// 计算属性
const hasProvidedResult = computed(() => {
  return interactionHistory.value.some(item => 
    item.action === 'execution_result_provided' && item.cycle === currentCycle.value
  )
})

const hasSubmittedPayment = computed(() => {
  return interactionHistory.value.some(item => 
    item.action === 'payment_submitted' && item.cycle === currentCycle.value
  )
})

// 当前循环是否完成
const isCurrentCycleComplete = computed(() => {
  return hasProvidedResult.value && hasSubmittedPayment.value
})

// 是否可以进入下一循环
const canProceedToNextCycle = computed(() => {
  return isCurrentCycleComplete.value && currentCycle.value < totalCycles.value
})

// 是否可以完成整个订单
const canCompleteOrder = computed(() => {
  return currentCycle.value === totalCycles.value && isCurrentCycleComplete.value && order.value?.status === 'processing'
})

// 计算整体进度百分比
const overallProgress = computed(() => {
  const completedCycles = cycleHistory.value.filter(cycle => cycle.isComplete).length
  const currentProgress = isCurrentCycleComplete.value ? 1 : 0
  return Math.round(((completedCycles + currentProgress) / totalCycles.value) * 100)
})

// 获取当前循环状态
const getCurrentCycleStatus = computed(() => {
  if (hasProvidedResult.value && hasSubmittedPayment.value) {
    return '已完成'
  } else if (hasProvidedResult.value) {
    return '等待支付凭证'
  } else {
    return '等待执行结果'
  }
})

// 生成随机字符串
const generateRandomString = (length = 64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成随机执行结果（128位十六进制）
const generateExecutionResult = () => {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成base64编码的zkvm proof
const generateZkvmProof = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  for (let i = 0; i < 256; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  // 添加适当的padding
  while (result.length % 4 !== 0) {
    result += '='
  }
  return result
}

// 生成模拟订单数据
const generateMockOrder = (orderId) => {
  // 定义四个科研领域的数据服务示例
  const researchServices = [
    {
      name: '高能物理实验数据集',
      field: 'physics',
      serviceType: 'analysis',
      title: '粒子对撞数据统计分析服务',
      description: '请求对CERN大型强子对撞机的粒子对撞数据进行统计分析。需要计算不变质量分布、动量谱分析和事件重建算法，用于新粒子发现研究。服务包括数据清洗、特征提取和高级统计分析。',
      serviceConfig: {
        processingType: '粒子物理统计分析',
        outputFormat: 'ROOT/HDF5',
        priority: 'high',
        estimatedTime: '6-8小时'
      }
    },
    {
      name: '临床试验患者数据集',
      field: 'medicine',
      serviceType: 'processing',
      title: '临床数据预处理与特征工程服务',
      description: '对肿瘤临床试验数据进行标准化预处理和特征工程。包括缺失值处理、异常值检测、数据标准化和生物标志物特征提取。为机器学习模型训练提供高质量的数据集。',
      serviceConfig: {
        processingType: '临床数据预处理',
        outputFormat: 'CSV/Parquet',
        priority: 'high',
        estimatedTime: '4-6小时'
      }
    },
    {
      name: '网络安全日志数据集',
      field: 'cybersecurity',
      serviceType: 'verification',
      title: '网络安全事件验证与分类服务',
      description: '对企业网络安全日志进行威胁事件验证和自动分类。包括攻击模式识别、异常流量检测和威胁情报关联分析。为安全运营中心提供实时威胁检测能力。',
      serviceConfig: {
        processingType: '安全事件验证',
        outputFormat: 'JSON/SIEM',
        priority: 'urgent',
        estimatedTime: '2-4小时'
      }
    },
    {
      name: '基因组测序数据集',
      field: 'biology',
      serviceType: 'custom',
      title: '基因组变异注释与功能分析服务',
      description: '对人类基因组测序数据进行变异注释和功能影响分析。包括变异位点识别、基因功能注释、病理性预测和药物敏感性分析。为精准医学和个体化治疗提供科学依据。',
      serviceConfig: {
        processingType: '基因组注释分析',
        outputFormat: 'VCF/GFF3',
        priority: 'normal',
        estimatedTime: '8-12小时'
      }
    }
  ]
  
  // 根据订单ID确定服务类型和数据集，确保与其他页面一致
  const orderNumber = parseInt(orderId.replace(/\D/g, '')) || 1
  const serviceIndex = (orderNumber - 1) % researchServices.length
  const service = researchServices[serviceIndex]
  
  return {
    id: orderId,
    title: service.title,
    description: service.description,
    status: 'processing',
    serviceType: service.serviceType,
    datasetName: service.name,
    requester: 'demoDataRequester',
    datasetOwner: 'demoDataOwner',
    blockchainName: route.params.blockchainName || 'Physics',
    serviceConfig: service.serviceConfig,
    created_at: new Date(Date.now() - (orderNumber * 12 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (orderNumber * 6 * 60 * 60 * 1000)).toISOString()
  }
}

// 生成模拟交互历史
const generateMockHistory = () => {
  const history = [
    {
      timestamp: order.value.created_at,
      action: 'order_created',
      actor: order.value.requester,
      description: '创建了服务订单请求',
      cycle: 0
    },
    {
      timestamp: order.value.updated_at,
      action: 'order_accepted',
      actor: order.value.datasetOwner,
      description: '数据拥有者同意了服务订单请求',
      cycle: 0
    }
  ]
  
  // 生成循环历史记录
  const cycles = []
  // 服务订单2的固定处理进度：已完成2个循环，当前在第3个循环
  const completedCycles = 2
  
  for (let cycle = 1; cycle <= totalCycles.value; cycle++) {
    const cycleData = {
      cycle: cycle,
      isComplete: cycle <= completedCycles,
      resultProvided: false,
      paymentSubmitted: false,
      startTime: new Date(Date.now() - (totalCycles.value - cycle + 1) * 2 * 60 * 60 * 1000).toISOString()
    }
    
    if (cycle <= completedCycles) {
      // 已完成的循环
      const resultTime = new Date(Date.now() - (totalCycles.value - cycle + 1) * 2 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
      const paymentTime = new Date(Date.now() - (totalCycles.value - cycle + 1) * 2 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
      
      history.push({
        timestamp: resultTime,
        action: 'execution_result_provided',
        actor: order.value.datasetOwner,
        executionResult: generateExecutionResult(),
        proof: generateZkvmProof(),
        description: `第${cycle}轮：数据拥有者提供了加密执行结果和正确性证明`,
        cycle: cycle
      })
      
      history.push({
        timestamp: paymentTime,
        action: 'payment_submitted',
        actor: order.value.requester,
        paymentProof: generateRandomString(64),
        description: `第${cycle}轮：请求者提交了支付凭证`,
        cycle: cycle
      })
      
      cycleData.resultProvided = true
      cycleData.paymentSubmitted = true
    } else if (cycle === completedCycles + 1) {
      // 当前正在进行的循环（第3轮）：根据当前用户角色设置状态
      if (authStore.username === 'demoDataRequester') {
        // 数据请求者登录：显示已提供执行结果，等待支付凭证的状态
        const resultTime = new Date(Date.now() - 30 * 60 * 1000).toISOString()
        history.push({
          timestamp: resultTime,
          action: 'execution_result_provided',
          actor: order.value.datasetOwner,
          executionResult: generateExecutionResult(),
          proof: generateZkvmProof(),
          description: `第${cycle}轮：数据拥有者提供了加密执行结果和正确性证明`,
          cycle: cycle
        })
        cycleData.resultProvided = true
        // 等待支付凭证提交
      } else if (authStore.username === 'demoDataOwner') {
        // 数据拥有者登录：显示等待提供执行结果的状态
        // 不添加任何历史记录，等待数据拥有者提交执行结果
      }
    }
    
    cycles.push(cycleData)
  }
  
  // 设置当前循环
  currentCycle.value = completedCycles + 1
  cycleHistory.value = cycles
  
  return history
}

// 操作方法
const submitExecutionResult = async () => {
  if (!newExecutionResult.value || !newProof.value) {
    alert('请输入加密执行结果和ZKVM正确性证明')
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 添加到交互历史
    interactionHistory.value.push({
      timestamp: new Date().toISOString(),
      action: 'execution_result_provided',
      actor: authStore.username,
      executionResult: newExecutionResult.value,
      proof: newProof.value,
      description: `第${currentCycle.value}轮：数据拥有者提供了加密执行结果和正确性证明`,
      cycle: currentCycle.value
    })
    
    // 更新循环历史
    const cycleIndex = cycleHistory.value.findIndex(c => c.cycle === currentCycle.value)
    if (cycleIndex !== -1) {
      cycleHistory.value[cycleIndex].resultProvided = true
    }
    
    newExecutionResult.value = ''
    newProof.value = ''
    alert(`第${currentCycle.value}轮加密执行结果和正确性证明提交成功`)
    console.log(`已提交第${currentCycle.value}轮执行结果`)
  } catch (err) {
    console.error('Submit execution result error:', err)
    alert(err.message || '提交失败')
  }
}

const submitPaymentProof = async () => {
  if (!newPaymentProof.value || newPaymentProof.value.length !== 64) {
    alert('请输入64位字符的支付凭证')
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 添加到交互历史
    interactionHistory.value.push({
      timestamp: new Date().toISOString(),
      action: 'payment_submitted',
      actor: authStore.username,
      paymentProof: newPaymentProof.value,
      description: `第${currentCycle.value}轮：请求者提交了支付凭证`,
      cycle: currentCycle.value
    })
    
    // 更新循环历史
    const cycleIndex = cycleHistory.value.findIndex(c => c.cycle === currentCycle.value)
    if (cycleIndex !== -1) {
      cycleHistory.value[cycleIndex].paymentSubmitted = true
      cycleHistory.value[cycleIndex].isComplete = true
    }
    
    newPaymentProof.value = ''
    alert(`第${currentCycle.value}轮支付凭证提交成功`)
    console.log(`已提交第${currentCycle.value}轮支付凭证`)
  } catch (err) {
    console.error('Submit payment proof error:', err)
    alert(err.message || '提交失败')
  }
}

// 进入下一循环
const proceedToNextCycle = async () => {
  if (!confirm(`确定要进入第${currentCycle.value + 1}轮循环吗？`)) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 进入下一循环
    currentCycle.value += 1
    
    // 添加循环转换记录
    interactionHistory.value.push({
      timestamp: new Date().toISOString(),
      action: 'cycle_started',
      actor: 'system',
      description: `开始第${currentCycle.value}轮循环执行`,
      cycle: currentCycle.value
    })
    
    alert(`已进入第${currentCycle.value}轮循环`)
    console.log(`已进入第${currentCycle.value}轮循环`)
  } catch (err) {
    console.error('Proceed to next cycle error:', err)
    alert(err.message || '进入下一循环失败')
  }
}

const completeOrder = async () => {
  if (!confirm('确定要完成这个服务订单吗？完成后订单状态将变为已完成。')) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新订单状态
    order.value.status = 'completed'
    order.value.updated_at = new Date().toISOString()
    
    // 添加完成记录
    interactionHistory.value.push({
      timestamp: new Date().toISOString(),
      action: 'order_completed',
      actor: 'system',
      description: `所有${totalCycles.value}轮循环完成，服务订单处理完成`,
      cycle: 0
    })
    
    alert('服务订单已完成')
    console.log('服务订单已完成')
  } catch (err) {
    console.error('Complete order error:', err)
    alert(err.message || '完成订单失败')
  }
}

// 终止订单
const terminateOrder = async () => {
  const userRole = authStore.username === order.value.datasetOwner ? '数据拥有者' : '数据请求者'
  const confirmMessage = `确定要终止这个服务订单吗？\n\n作为${userRole}，您有权终止当前服务订单处理。\n\n⚠️ 注意：\n• 终止后订单状态将变为已取消\n• 当前第${currentCycle.value}轮的所有进度将丢失\n• 此操作不可撤销\n\n确定要继续吗？`
  
  if (!confirm(confirmMessage)) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 更新订单状态为已取消
    order.value.status = 'cancelled'
    order.value.updated_at = new Date().toISOString()
    
    // 添加终止记录
    interactionHistory.value.push({
      timestamp: new Date().toISOString(),
      action: 'order_terminated',
      actor: authStore.username,
      description: `${userRole}终止了服务订单，订单在第${currentCycle.value}轮被取消`,
      cycle: currentCycle.value
    })
    
    alert(`服务订单已被${userRole}终止，订单状态已变为已取消`)
    console.log(`服务订单已被${userRole}终止，订单ID: ${order.value.id}`)
    
    // 3秒后自动返回上一页
    setTimeout(() => {
      router.go(-1)
    }, 3000)
    
  } catch (err) {
    console.error('Terminate order error:', err)
    alert(err.message || '终止订单失败')
  }
}

const getInteractionIcon = (action) => {
  const iconMap = {
    'order_created': 'fas fa-plus-circle text-primary',
    'order_accepted': 'fas fa-check-circle text-success',
    'execution_result_provided': 'fas fa-cogs text-info',
    'payment_submitted': 'fas fa-credit-card text-warning',
    'cycle_started': 'fas fa-sync-alt text-primary',
    'order_completed': 'fas fa-flag-checkered text-success',
    'order_terminated': 'fas fa-stop-circle text-danger'
  }
  return iconMap[action] || 'fas fa-circle text-secondary'
}

const getInteractionTitle = (action) => {
  const titleMap = {
    'order_created': '订单创建',
    'order_accepted': '订单接受',
    'execution_result_provided': '提供执行结果',
    'payment_submitted': '提交支付凭证',
    'cycle_started': '循环开始',
    'order_completed': '订单完成',
    'order_terminated': '订单终止'
  }
  return titleMap[action] || action
}

// 生命周期
onMounted(() => {
  loadProcessingDetail()
})
</script>

<style scoped>
.processing-detail {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table td {
  padding: 0.75rem 0.5rem;
}

.table-borderless td {
  border: none;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* 时间线样式 */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.25rem;
  width: 2rem;
  height: 2rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-item-current .timeline-marker {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.timeline-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border-left: 3px solid #e9ecef;
}

.timeline-item-current .timeline-content {
  border-left-color: #007bff;
  background: #e3f2fd;
}

.timeline-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-header h6 {
  margin: 0;
  flex: 1;
}

.timeline-meta {
  margin-top: 0.5rem;
}

code {
  font-size: 0.8rem;
  word-break: break-all;
}

.input-group .form-control {
  font-family: 'Courier New', monospace;
}

.badge {
  font-size: 0.8em;
}

/* 循环历史网格样式 */
.cycle-history-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.cycle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 0.375rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 60px;
}

.cycle-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cycle-completed {
  border-color: #198754;
  background: #d1e7dd;
  color: #0f5132;
}

.cycle-current {
  border-color: #0d6efd;
  background: #cfe2ff;
  color: #084298;
  animation: pulse 2s infinite;
}

.cycle-pending {
  border-color: #6c757d;
  background: #e9ecef;
  color: #495057;
}

.cycle-number {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.cycle-icon {
  font-size: 0.8rem;
  opacity: 0.8;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

/* 状态卡片样式 */
.status-card {
  transition: all 0.3s ease;
}

.status-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cycle-history-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .cycle-item {
    min-height: 50px;
    padding: 0.5rem 0.25rem;
  }
  
  .cycle-number {
    font-size: 0.8rem;
  }
  
  .cycle-icon {
    font-size: 0.7rem;
  }
}
</style>
