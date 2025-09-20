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
              服务订单详情
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              查看数据服务订单的详细信息
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
            <h3 class="mb-0">服务订单详情</h3>
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
                      <td class="fw-bold text-muted">服务类型:</td>
                      <td>
                        <span class="badge bg-primary">
                          {{ getServiceTypeText(order.serviceType) }}
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
                      <td class="fw-bold text-muted">区块链:</td>
                      <td>{{ order.blockchainName }}</td>
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

          <!-- 服务配置详情 -->
          <div class="card mb-4" v-if="order.serviceConfig">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-cogs me-2"></i>服务配置详情
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr v-if="order.serviceConfig.processingType">
                      <td class="fw-bold text-muted">处理类型:</td>
                      <td>{{ order.serviceConfig.processingType }}</td>
                    </tr>
                    <tr v-if="order.serviceConfig.outputFormat">
                      <td class="fw-bold text-muted">输出格式:</td>
                      <td>
                        <span class="badge bg-info">{{ order.serviceConfig.outputFormat }}</span>
                      </td>
                    </tr>
                    <tr v-if="order.serviceConfig.priority">
                      <td class="fw-bold text-muted">优先级:</td>
                      <td>
                        <span class="badge" :class="getPriorityBadgeClass(order.serviceConfig.priority)">
                          {{ getPriorityText(order.serviceConfig.priority) }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr v-if="order.serviceConfig.estimatedTime">
                      <td class="fw-bold text-muted">预计时间:</td>
                      <td>{{ order.serviceConfig.estimatedTime }}</td>
                    </tr>
                    <tr v-if="order.serviceConfig.maxRecords">
                      <td class="fw-bold text-muted">最大记录数:</td>
                      <td>{{ order.serviceConfig.maxRecords.toLocaleString() }}</td>
                    </tr>
                    <tr v-if="order.serviceConfig.includeMetadata !== undefined">
                      <td class="fw-bold text-muted">包含元数据:</td>
                      <td>
                        <span class="badge" :class="order.serviceConfig.includeMetadata ? 'bg-success' : 'bg-secondary'">
                          {{ order.serviceConfig.includeMetadata ? '是' : '否' }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              
              <!-- 完整配置JSON -->
              <div class="mt-3">
                <h6 class="text-muted">完整配置信息:</h6>
                <div class="bg-light p-3 rounded">
                  <pre class="mb-0 small">{{ JSON.stringify(order.serviceConfig, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 执行进度 -->
          <div class="card mb-4" v-if="order.status === 'processing'">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-tasks me-2"></i>执行进度
              </h5>
            </div>
            <div class="card-body">
              <div class="progress mb-3">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="`width: ${order.progress || 45}%`"
                >
                  {{ order.progress || 45 }}%
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <small class="text-muted">当前阶段:</small>
                  <p class="mb-0">{{ order.currentStage || '数据预处理' }}</p>
                </div>
                <div class="col-md-4">
                  <small class="text-muted">已处理记录:</small>
                  <p class="mb-0">{{ (order.processedRecords || 12450).toLocaleString() }}</p>
                </div>
                <div class="col-md-4">
                  <small class="text-muted">预计剩余时间:</small>
                  <p class="mb-0">{{ order.remainingTime || '1.5小时' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-tools me-2"></i>订单操作
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
                          :to="`/serviceOrderProcessingDetail/${order.blockchainName}/${order.id}`"
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
                        :to="`/serviceOrderProcessingDetail/${order.blockchainName}/${order.id}`"
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
  const statuses = ['pending', 'processing', 'completed', 'cancelled', 'failed']
  const serviceTypes = ['verification', 'analysis', 'processing', 'custom']
  const datasetNames = ['用户行为数据集', '销售数据集', '医疗数据集', '金融数据集', '物联网数据集']
  const priorities = ['low', 'normal', 'high', 'urgent']
  const outputFormats = ['JSON', 'CSV', 'XML', 'Parquet']
  
  // 根据订单ID确定状态和服务类型，确保与列表页面一致
  // 提取订单ID中的数字部分来确定索引
  const orderNumber = parseInt(orderId.replace(/\D/g, '')) || 1
  const statusIndex = (orderNumber - 1) % statuses.length
  const serviceTypeIndex = (orderNumber - 1) % serviceTypes.length
  const datasetIndex = (orderNumber - 1) % datasetNames.length
  
  const serviceType = serviceTypes[serviceTypeIndex]
  const status = statuses[statusIndex]
  
  return {
    id: orderId,
    title: `数据服务请求 - ${Math.random().toString(36).substring(2, 10)}`,
    description: `这是一个${getServiceTypeText(serviceType)}的详细服务请求。该请求需要对指定数据集进行专业的数据处理和分析工作。服务将采用先进的算法和技术，确保处理结果的准确性和可靠性。请求方希望通过此服务获得高质量的数据分析结果，用于支持业务决策和战略规划。整个服务过程将严格遵循数据安全和隐私保护的相关规定。`,
    status: status,
    serviceType: serviceType,
    datasetName: datasetNames[datasetIndex],
    requester: 'demoDataRequester',  // 固定为演示数据请求者
    datasetOwner: 'demoDataOwner',   // 固定为演示数据拥有者
    blockchainName: route.params.blockchainName || 'Physics',
    serviceConfig: {
      processingType: serviceType === 'verification' ? '数据完整性验证' : 
                     serviceType === 'analysis' ? '深度数据分析' :
                     serviceType === 'processing' ? '数据清洗与转换' : '定制化数据处理',
      outputFormat: outputFormats[Math.floor(Math.random() * outputFormats.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      estimatedTime: ['30分钟', '1-2小时', '2-4小时', '4-8小时', '1-2天'][Math.floor(Math.random() * 5)],
      maxRecords: Math.floor(Math.random() * 1000000) + 10000,
      includeMetadata: Math.random() > 0.5,
      compressionEnabled: Math.random() > 0.3,
      encryptionLevel: ['none', 'basic', 'advanced'][Math.floor(Math.random() * 3)]
    },
    progress: status === 'processing' ? Math.floor(Math.random() * 80) + 10 : null,
    currentStage: status === 'processing' ? ['数据预处理', '核心算法执行', '结果验证', '报告生成'][Math.floor(Math.random() * 4)] : null,
    processedRecords: status === 'processing' ? Math.floor(Math.random() * 50000) + 5000 : null,
    remainingTime: status === 'processing' ? ['30分钟', '1小时', '1.5小时', '2小时'][Math.floor(Math.random() * 4)] : null,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
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
    
    console.log('已加载服务订单详情:', mockOrder)
  } catch (err) {
    console.error('Load order detail error:', err)
    error.value = err.message || '获取订单详情失败'
    order.value = null
  } finally {
    loading.value = false
  }
}

const acceptOrder = async () => {
  if (!confirm('确定要同意这个订单吗？同意后将开始处理流程。')) {
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
      description: '数据拥有者同意了订单请求'
    })
    
    alert('订单已同意，请前往处理详情页面进行后续操作')
    console.log(`服务订单 ${order.value.id} 已被同意`)
  } catch (err) {
    console.error('Accept order error:', err)
    alert(err.message || '同意订单失败')
  }
}

const rejectOrder = async () => {
  if (!confirm('确定要拒绝这个订单吗？拒绝后订单将被关闭。')) {
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
      description: '数据拥有者拒绝了订单请求'
    })
    
    alert('订单已拒绝')
    console.log(`服务订单 ${order.value.id} 已被拒绝`)
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
    console.log(`服务订单 ${order.value.id} 已删除`)
    
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
      服务类型: getServiceTypeText(order.value.serviceType),
      数据集: order.value.datasetName,
      请求者: order.value.requester,
      数据拥有者: order.value.datasetOwner,
      创建时间: formatDate(order.value.created_at),
      更新时间: formatDate(order.value.updated_at)
    },
    描述: order.value.description,
    服务配置: order.value.serviceConfig
  }
  
  if (order.value.status === 'processing') {
    orderInfo.执行进度 = {
      完成百分比: `${order.value.progress}%`,
      当前阶段: order.value.currentStage,
      已处理记录: order.value.processedRecords,
      预计剩余时间: order.value.remainingTime
    }
  }
  
  const dataStr = JSON.stringify(orderInfo, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `服务订单_${order.value.id}.json`
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
        description: '创建了服务订单'
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
        description: '订单处理完成'
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

// 生成随机64位字符串
const generateRandomString = (length = 64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const viewProcessLog = () => {
  // 模拟处理日志
  const logData = {
    订单ID: order.value.id,
    日志生成时间: new Date().toISOString(),
    处理日志: [
      { 时间: '2024-01-15 10:00:00', 阶段: '订单接收', 状态: '成功', 描述: '订单已接收，开始验证参数' },
      { 时间: '2024-01-15 10:01:00', 阶段: '参数验证', 状态: '成功', 描述: '服务配置参数验证通过' },
      { 时间: '2024-01-15 10:02:00', 阶段: '数据预处理', 状态: '进行中', 描述: '正在加载和预处理数据集' },
      { 时间: '2024-01-15 10:05:00', 阶段: '核心处理', 状态: order.value.status === 'completed' ? '成功' : '进行中', 描述: '执行核心算法处理' }
    ]
  }
  
  if (order.value.status === 'failed') {
    logData.处理日志.push({ 
      时间: '2024-01-15 10:08:00', 
      阶段: '错误处理', 
      状态: '失败', 
      描述: '处理过程中遇到错误，请检查数据格式' 
    })
  } else if (order.value.status === 'completed') {
    logData.处理日志.push({ 
      时间: '2024-01-15 10:15:00', 
      阶段: '结果生成', 
      状态: '成功', 
      描述: '处理完成，结果文件已生成' 
    })
  }
  
  const dataStr = JSON.stringify(logData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `处理日志_${order.value.id}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  alert('处理日志已下载')
  console.log('处理日志已下载')
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

const getServiceTypeText = (serviceType) => {
  const typeMap = {
    'verification': '数据验证',
    'analysis': '数据分析',
    'processing': '数据处理',
    'custom': '自定义服务'
  }
  return typeMap[serviceType] || serviceType
}

const getPriorityText = (priority) => {
  const priorityMap = {
    'low': '低',
    'normal': '普通',
    'high': '高',
    'urgent': '紧急'
  }
  return priorityMap[priority] || priority
}

const getPriorityBadgeClass = (priority) => {
  const classMap = {
    'low': 'bg-secondary',
    'normal': 'bg-primary',
    'high': 'bg-warning',
    'urgent': 'bg-danger'
  }
  return classMap[priority] || 'bg-secondary'
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

.progress {
  height: 1.5rem;
}

.progress-bar {
  font-size: 0.9rem;
  font-weight: 600;
}

pre {
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.8em;
}

.btn-sm {
  font-size: 0.875rem;
}

.small {
  font-size: 0.8rem;
}
</style>
