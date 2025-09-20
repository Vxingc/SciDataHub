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
              交易订单详情
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              查看定制脱敏数据交易订单的详细信息
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
            <h3 class="mb-0">交易订单详情</h3>
            <p class="text-muted mb-0" v-if="order">订单ID: {{ order.id }}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-info" @click="refreshOrder" :disabled="loading">
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
          <p class="mt-3 text-muted">正在加载订单详情...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 订单详情内容 -->
        <div v-else-if="order" class="order-detail">
          <!-- 基本信息卡片 -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>基本信息
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
                      <td class="fw-bold text-muted">订单状态:</td>
                      <td>
                        <span class="badge" :class="getStatusBadgeClass(order.status)">
                          {{ getStatusText(order.status) }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">数据集名称:</td>
                      <td>
                        <router-link 
                          :to="`/dataset/${order.blockchainName}/${order.datasetName}`"
                          class="text-decoration-none"
                        >
                          {{ order.datasetName }}
                          <i class="fas fa-external-link-alt ms-1 small"></i>
                        </router-link>
                      </td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-muted">区块链:</td>
                      <td>{{ order.blockchainName }}</td>
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
                    <tr>
                      <td class="fw-bold text-muted">更新时间:</td>
                      <td>{{ formatDate(order.updated_at) }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单描述 -->
          <div class="card mb-4" v-if="order.description">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-file-alt me-2"></i>订单描述
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-0">{{ order.description }}</p>
            </div>
          </div>

          <!-- 脱敏规则详情 -->
          <div class="card mb-4" v-if="order.maskingRules && order.maskingRules.length > 0">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-shield-alt me-2"></i>脱敏规则详情
              </h5>
              <span class="badge bg-primary">{{ order.maskingRules.length }} 条规则</span>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th width="10%">#</th>
                      <th width="25%">字段名称</th>
                      <th width="15%">数据类型</th>
                      <th width="20%">约束类型</th>
                      <th width="30%">约束值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(rule, index) in order.maskingRules" :key="index">
                      <td>
                        <span class="badge bg-secondary">{{ index + 1 }}</span>
                      </td>
                      <td>
                        <code class="text-primary">{{ rule.keyName }}</code>
                      </td>
                      <td>
                        <span class="badge" :class="rule.dataType === 'string' ? 'bg-info' : 'bg-success'">
                          {{ rule.dataType === 'string' ? '字符串' : '数值' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-warning text-dark">
                          {{ getConstraintTypeText(rule.constraintType) }}
                        </span>
                      </td>
                      <td>
                        <span v-if="rule.constraintType === 'range'" class="text-muted">
                          <strong>{{ rule.minValue }}</strong> ~ <strong>{{ rule.maxValue }}</strong>
                        </span>
                        <span v-else class="text-muted">
                          <strong>{{ rule.constraintValue }}</strong>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-cogs me-2"></i>订单操作
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <!-- 状态管理（仅数据拥有者可见） -->
                  <div v-if="canManageOrder" class="mb-3">
                    <label class="form-label">订单操作</label>
                    <div class="d-flex flex-wrap gap-2">
                      <!-- 待处理状态的操作 -->
                      <template v-if="order.status === 'pending'">
                        <button 
                          class="btn btn-success btn-sm"
                          @click="acceptOrder"
                        >
                          <i class="fas fa-check me-1"></i>同意订单
                        </button>
                        <button 
                          class="btn btn-outline-danger btn-sm"
                          @click="rejectOrder"
                        >
                          <i class="fas fa-times me-1"></i>拒绝订单
                        </button>
                      </template>
                      
                      <!-- 处理中状态的操作 -->
                      <template v-if="order.status === 'processing'">
                        <router-link 
                          :to="`/tradeOrderProcessingDetail/${order.blockchainName}/${order.id}`"
                          class="btn btn-primary btn-sm text-decoration-none"
                        >
                          <i class="fas fa-cogs me-1"></i>处理详情
                        </router-link>
                      </template>
                      
                      <!-- 已完成状态的操作 -->
                      <template v-if="order.status === 'completed'">
                        <span class="text-success small me-3">
                          <i class="fas fa-check-circle me-1"></i>订单已完成
                        </span>
                      </template>
                      
                      <!-- 已拒绝状态的操作 -->
                      <template v-if="order.status === 'rejected'">
                        <span class="text-danger small">
                          <i class="fas fa-times-circle me-1"></i>订单已拒绝
                        </span>
                      </template>
                    </div>
                  </div>
                  
                  <!-- 非数据拥有者的提示 -->
                  <div v-else-if="order.requester === authStore.username" class="mb-3">
                    <label class="form-label">订单状态</label>
                    <p class="text-muted small mb-0">
                      <i class="fas fa-info-circle me-1"></i>
                      只有数据拥有者可以处理订单
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <!-- 其他操作 -->
                  <div class="mb-3">
                    <label class="form-label">其他操作</label>
                    <div class="d-flex flex-wrap gap-2">
                      <!-- 导出信息 - 所有状态都可用 -->
                      <button class="btn btn-outline-info btn-sm" @click="exportOrderInfo">
                        <i class="fas fa-download me-1"></i>导出信息
                      </button>
                      
                      <!-- 下载交互历史 - 仅已完成状态 -->
                      <button 
                        v-if="order.status === 'completed'"
                        class="btn btn-outline-success btn-sm"
                        @click="downloadInteractionHistory"
                      >
                        <i class="fas fa-history me-1"></i>下载交互历史
                      </button>
                      
                      <!-- 处理详情 - 处理中状态 -->
                      <router-link 
                        v-if="order.status === 'processing'"
                        :to="`/tradeOrderProcessingDetail/${order.blockchainName}/${order.id}`"
                        class="btn btn-outline-primary btn-sm text-decoration-none"
                      >
                        <i class="fas fa-cogs me-1"></i>查看处理详情
                      </router-link>
                      
                      <!-- 删除订单 - 根据状态和权限 -->
                      <button 
                        v-if="canDeleteOrder && ['completed', 'cancelled', 'failed'].includes(order.status)"
                        class="btn btn-outline-danger btn-sm"
                        @click="deleteOrder"
                      >
                        <i class="fas fa-trash me-1"></i>删除订单
                      </button>
                      
                      <!-- 处理中订单不能删除的提示 -->
                      <span 
                        v-else-if="canDeleteOrder && ['pending', 'processing'].includes(order.status)"
                        class="text-muted small"
                      >
                        <i class="fas fa-lock me-1"></i>处理中的订单无法删除
                      </span>
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

// 计算属性
const canManageOrder = computed(() => {
  return order.value && order.value.datasetOwner === authStore.username
})

const canDeleteOrder = computed(() => {
  return order.value && (
    order.value.requester === authStore.username || 
    order.value.datasetOwner === authStore.username
  )
})

// 生成模拟订单数据
const generateMockOrder = (orderId) => {
  const statuses = ['pending', 'processing', 'completed', 'cancelled']
  
  // 定义四个科研领域的数据集示例
  const researchDatasets = [
    {
      name: '高能物理实验数据集',
      field: 'physics',
      title: '粒子对撞实验脱敏数据请求',
      description: '请求获取CERN大型强子对撞机实验的脱敏数据，用于暗物质研究。需要对实验参数、设备信息等敏感数据进行定制化脱敏处理，确保实验室机密信息安全的同时保持数据的科学价值。该请求包含对实验地点、探测器类型、束流能量和对撞频率等关键参数的精确约束。'
    },
    {
      name: '临床试验患者数据集',
      field: 'medicine',
      title: '癌症治疗临床数据脱敏请求',
      description: '申请获取肿瘤临床试验的脱敏患者数据，用于机器学习模型训练。需要严格保护患者隐私信息，包括个人身份、联系方式等，同时保留治疗效果和生物标志物数据的完整性。该请求包含对患者诊断、治疗方案、年龄范围、肿瘤大小和医院科室等信息的详细约束。'
    },
    {
      name: '网络安全日志数据集',
      field: 'cybersecurity',
      title: '网络攻击检测数据脱敏请求',
      description: '请求获取企业网络安全事件的脱敏日志数据，用于威胁检测算法研究。需要对IP地址、用户名、系统路径等敏感信息进行脱敏，保护企业网络架构隐私的同时保持攻击模式特征。该请求包含对攻击类型、源国家、端口号、载荷大小和漏洞编号等关键信息的精确约束。'
    },
    {
      name: '基因组测序数据集',
      field: 'biology',
      title: '遗传疾病研究数据脱敏请求',
      description: '申请获取人类基因组测序的脱敏数据，用于遗传疾病关联性分析。需要对个体身份信息进行严格脱敏，同时保留基因变异位点和表型数据，确保遗传隐私保护和科研数据可用性的平衡。该请求包含对基因符号、染色体位置、等位基因频率、测序深度、表型分类和人群组别等关键信息的详细约束。'
    }
  ]
  
  // 根据订单ID确定状态和数据集，确保与列表页面一致
  const orderNumber = parseInt(orderId.replace(/\D/g, '')) || 1
  const datasetIndex = (orderNumber - 1) % researchDatasets.length
  const statusIndex = (orderNumber - 1) % statuses.length
  
  const dataset = researchDatasets[datasetIndex]
  
  return {
    id: orderId,
    title: dataset.title,
    description: dataset.description,
    status: statuses[statusIndex],
    datasetName: dataset.name,
    requester: 'demoDataRequester',
    datasetOwner: 'demoDataOwner',
    blockchainName: route.params.blockchainName || 'Physics',
    maskingRules: generateDomainSpecificMaskingRules(dataset.field),
    created_at: new Date(Date.now() - (orderNumber * 12 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - ((orderNumber - 1) * 6 * 60 * 60 * 1000)).toISOString()
  }
}

// 方法
const goBack = () => {
  router.go(-1)
}

const refreshOrder = () => {
  loadOrderDetail()
}

const loadOrderDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const orderId = route.params.orderId
    if (!orderId) {
      throw new Error('缺少订单ID参数')
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟数据
    const mockOrder = generateMockOrder(orderId)
    order.value = mockOrder
    
    console.log('已加载交易订单详情:', mockOrder)
  } catch (err) {
    console.error('Load order detail error:', err)
    error.value = err.message || '获取订单详情失败'
    order.value = null
  } finally {
    loading.value = false
  }
}

const acceptOrder = async () => {
  if (!confirm('确定要同意这个交易订单吗？同意后将开始脱敏处理流程。')) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新订单状态为处理中
    order.value.status = 'processing'
    order.value.updated_at = new Date().toISOString()
    
    // 初始化交互历史
    if (!order.value.interactionHistory) {
      order.value.interactionHistory = []
    }
    
    order.value.interactionHistory.push({
      timestamp: new Date().toISOString(),
      action: 'order_accepted',
      actor: authStore.username,
      description: '数据拥有者同意了交易订单请求'
    })
    
    alert('交易订单已同意，请前往处理详情页面进行后续操作')
    console.log(`交易订单 ${order.value.id} 已被同意`)
  } catch (err) {
    console.error('Accept order error:', err)
    alert(err.message || '同意订单失败')
  }
}

const rejectOrder = async () => {
  if (!confirm('确定要拒绝这个交易订单吗？拒绝后订单将被关闭。')) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新订单状态为已拒绝
    order.value.status = 'rejected'
    order.value.updated_at = new Date().toISOString()
    
    // 初始化交互历史
    if (!order.value.interactionHistory) {
      order.value.interactionHistory = []
    }
    
    order.value.interactionHistory.push({
      timestamp: new Date().toISOString(),
      action: 'order_rejected',
      actor: authStore.username,
      description: '数据拥有者拒绝了交易订单请求'
    })
    
    alert('交易订单已拒绝')
    console.log(`交易订单 ${order.value.id} 已被拒绝`)
  } catch (err) {
    console.error('Reject order error:', err)
    alert(err.message || '拒绝订单失败')
  }
}

const deleteOrder = async () => {
  if (!confirm(`确定要删除订单「${order.value.title}」吗？此操作不可撤销。`)) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    alert('订单删除成功')
    console.log(`交易订单 ${order.value.id} 已删除`)
    
    // 返回上一页
    router.go(-1)
  } catch (err) {
    console.error('Delete order error:', err)
    alert(err.message || '删除订单失败')
  }
}

const exportOrderInfo = () => {
  const orderInfo = {
    基本信息: {
      订单ID: order.value.id,
      标题: order.value.title,
      状态: getStatusText(order.value.status),
      数据集: order.value.datasetName,
      请求者: order.value.requester,
      数据拥有者: order.value.datasetOwner,
      创建时间: formatDate(order.value.created_at),
      更新时间: formatDate(order.value.updated_at)
    },
    描述: order.value.description,
    脱敏规则: order.value.maskingRules.map((rule, index) => ({
      序号: index + 1,
      字段名: rule.keyName,
      数据类型: rule.dataType === 'string' ? '字符串' : '数值',
      约束类型: getConstraintTypeText(rule.constraintType),
      约束值: rule.constraintType === 'range' 
        ? `${rule.minValue} ~ ${rule.maxValue}` 
        : rule.constraintValue
    }))
  }
  
  const dataStr = JSON.stringify(orderInfo, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `交易订单_${order.value.id}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  console.log('订单信息已导出')
}

const downloadInteractionHistory = () => {
  // 模拟交互历史数据
  const historyData = {
    订单ID: order.value.id,
    订单标题: order.value.title,
    生成时间: new Date().toISOString(),
    交互历史: order.value.interactionHistory || [
      {
        timestamp: order.value.created_at,
        action: 'order_created',
        actor: order.value.requester,
        description: '创建了交易订单'
      },
      {
        timestamp: order.value.updated_at,
        action: 'order_accepted',
        actor: order.value.datasetOwner,
        description: '数据拥有者同意了订单'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: 'data_subset_provided',
        actor: order.value.datasetOwner,
        encryptedSubsetAddress: generateRandomString(64),
        description: '数据拥有者提供了加密数据子集地址'
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        action: 'payment_submitted',
        actor: order.value.requester,
        paymentProof: generateRandomString(64),
        description: '请求者提交了支付凭证'
      },
      {
        timestamp: new Date().toISOString(),
        action: 'order_completed',
        actor: 'system',
        description: '交易订单处理完成'
      }
    ]
  }
  
  const dataStr = JSON.stringify(historyData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `交互历史_${order.value.id}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  alert('交互历史已下载')
  console.log('交互历史已下载')
}

// 生成基于科研领域的脱敏规则
const generateDomainSpecificMaskingRules = (field) => {
  const rules = []
  
  switch (field) {
    case 'physics':
      // 物理学实验数据脱敏规则
      rules.push(
        {
          keyName: 'experiment_location',
          dataType: 'string',
          constraintType: 'equals',
          constraintValue: 'CERN-LHC'
        },
        {
          keyName: 'detector_type',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: 'ATLAS'
        },
        {
          keyName: 'beam_energy',
          dataType: 'number',
          constraintType: 'range',
          minValue: 6500,
          maxValue: 7000
        },
        {
          keyName: 'collision_frequency',
          dataType: 'number',
          constraintType: 'range',
          minValue: 25,
          maxValue: 40
        }
      )
      break
      
    case 'medicine':
      // 临床医学数据脱敏规则
      rules.push(
        {
          keyName: 'patient_diagnosis',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: '肺癌'
        },
        {
          keyName: 'treatment_protocol',
          dataType: 'string',
          constraintType: 'equals',
          constraintValue: 'FOLFOX'
        },
        {
          keyName: 'patient_age',
          dataType: 'number',
          constraintType: 'range',
          minValue: 45,
          maxValue: 75
        },
        {
          keyName: 'tumor_size_mm',
          dataType: 'number',
          constraintType: 'range',
          minValue: 20,
          maxValue: 80
        },
        {
          keyName: 'hospital_department',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: '肿瘤科'
        }
      )
      break
      
    case 'cybersecurity':
      // 网络空间安全数据脱敏规则
      rules.push(
        {
          keyName: 'attack_type',
          dataType: 'string',
          constraintType: 'equals',
          constraintValue: 'SQL_INJECTION'
        },
        {
          keyName: 'source_country',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: 'CN'
        },
        {
          keyName: 'port_number',
          dataType: 'number',
          constraintType: 'range',
          minValue: 80,
          maxValue: 8080
        },
        {
          keyName: 'payload_size_bytes',
          dataType: 'number',
          constraintType: 'range',
          minValue: 1024,
          maxValue: 65536
        },
        {
          keyName: 'vulnerability_cve',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: 'CVE-2023'
        }
      )
      break
      
    case 'biology':
      // 生物学基因数据脱敏规则
      rules.push(
        {
          keyName: 'gene_symbol',
          dataType: 'string',
          constraintType: 'equals',
          constraintValue: 'BRCA1'
        },
        {
          keyName: 'chromosome',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: 'chr17'
        },
        {
          keyName: 'allele_frequency',
          dataType: 'number',
          constraintType: 'range',
          minValue: 0.01,
          maxValue: 0.05
        },
        {
          keyName: 'read_depth',
          dataType: 'number',
          constraintType: 'range',
          minValue: 30,
          maxValue: 100
        },
        {
          keyName: 'phenotype_category',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: '遗传性乳腺癌'
        },
        {
          keyName: 'population_group',
          dataType: 'string',
          constraintType: 'equals',
          constraintValue: 'East_Asian'
        }
      )
      break
      
    default:
      // 默认通用规则
      rules.push(
        {
          keyName: 'data_field',
          dataType: 'string',
          constraintType: 'contains',
          constraintValue: '研究'
        },
        {
          keyName: 'value_range',
          dataType: 'number',
          constraintType: 'range',
          minValue: 0,
          maxValue: 100
        }
      )
  }
  
  return rules
}

// 生成随机64位字符串
const generateRandomString = (length = 64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
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
    'cancelled': 'bg-secondary',
    'failed': 'bg-danger'
  }
  return classMap[status] || 'bg-secondary'
}

const getConstraintTypeText = (constraintType) => {
  const typeMap = {
    'equals': '等于',
    'contains': '包含',
    'range': '范围',
    'min': '最小值',
    'max': '最大值'
  }
  return typeMap[constraintType] || constraintType
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
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

code {
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.badge {
  font-size: 0.8em;
}

.btn-sm {
  font-size: 0.875rem;
}

.table-responsive {
  border-radius: 0.375rem;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.025);
}
</style>
