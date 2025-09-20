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
              服务订单管理
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              管理您的数据服务订单
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
          <h3 class="mb-0">服务订单</h3>
          <div class="d-flex gap-2">
            <button class="btn btn-info" @click="refreshOrders" :disabled="loading">
              <i class="fas fa-sync-alt me-2"></i>刷新
            </button>
            <button class="btn btn-outline-primary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>返回
            </button>
          </div>
        </div>
        
        <!-- 筛选和搜索区域 -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">订单状态</label>
                <select class="form-select" v-model="filters.status" @change="applyFilters">
                  <option value="">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="processing">处理中</option>
                  <option value="completed">已完成</option>
                  <option value="rejected">已拒绝</option>
                  <option value="cancelled">已取消</option>
                  <option value="failed">失败</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">服务类型</label>
                <select class="form-select" v-model="filters.serviceType" @change="applyFilters">
                  <option value="">全部类型</option>
                  <option value="verification">数据验证</option>
                  <option value="analysis">数据分析</option>
                  <option value="processing">数据处理</option>
                  <option value="custom">自定义服务</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">搜索</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="搜索订单标题或数据集名称..."
                    v-model="filters.search"
                    @input="applyFilters"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="clearFilters">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-2">
                <label class="form-label">视图模式</label>
                <div class="btn-group w-100" role="group">
                  <button 
                    type="button" 
                    class="btn" 
                    :class="viewMode === 'my' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="setViewMode('my')"
                  >
                    我的订单
                  </button>
                  <button 
                    type="button" 
                    class="btn" 
                    :class="viewMode === 'received' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="setViewMode('received')"
                  >
                    收到的订单
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3 text-muted">正在加载服务订单...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-5">
          <div class="mb-4">
            <i class="fas fa-clipboard-list fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted">暂无服务订单</h4>
          <p class="text-muted">{{ viewMode === 'my' ? '您还没有创建任何服务订单' : '您还没有收到任何服务订单' }}</p>
        </div>

        <!-- 订单列表 -->
        <div v-else>
          <div class="d-flex align-items-center mb-4">
            <i class="fas fa-list text-primary me-2"></i>
            <h4 class="mb-0 text-primary">{{ viewMode === 'my' ? '我的服务订单' : '收到的服务订单' }}</h4>
            <span class="badge bg-primary ms-2">{{ filteredOrders.length }}</span>
          </div>
          
          <!-- 订单卡片列表 -->
          <div class="orders-list">
            <div 
              class="order-card mb-4" 
              v-for="order in filteredOrders" 
              :key="order.id"
            >
              <div class="card shadow-sm">
                <div class="card-body">
                  <div class="row align-items-center">
                    <!-- 左侧：订单基本信息 -->
                    <div class="col-lg-8">
                      <div class="order-info">
                        <div class="d-flex align-items-center mb-2">
                          <h5 class="order-title mb-0 me-3">{{ order.title }}</h5>
                          <span 
                            class="badge" 
                            :class="getStatusBadgeClass(order.status)"
                          >
                            {{ getStatusText(order.status) }}
                          </span>
                        </div>
                        
                        <p class="order-description text-muted mb-3">{{ order.description || '无描述' }}</p>
                        
                        <!-- 订单详情 -->
                        <div class="order-meta mb-3">
                          <div class="row g-2">
                            <div class="col-md-6">
                              <small class="text-muted">
                                <i class="fas fa-database me-1"></i>
                                数据集：{{ order.datasetName }}
                              </small>
                            </div>
                            <div class="col-md-6">
                              <small class="text-muted">
                                <i class="fas fa-user me-1"></i>
                                {{ viewMode === 'my' ? '数据拥有者' : '请求者' }}：{{ viewMode === 'my' ? order.datasetOwner : order.requester }}
                              </small>
                            </div>
                            <div class="col-md-6">
                              <small class="text-muted">
                                <i class="fas fa-cogs me-1"></i>
                                服务类型：{{ getServiceTypeText(order.serviceType) }}
                              </small>
                            </div>
                            <div class="col-md-6">
                              <small class="text-muted">
                                <i class="fas fa-calendar-alt me-1"></i>
                                创建时间：{{ formatDate(order.created_at) }}
                              </small>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 服务配置信息 -->
                        <div v-if="order.serviceConfig" class="service-config mb-3">
                          <small class="text-muted d-block mb-1">
                            <i class="fas fa-wrench me-1"></i>服务配置：
                          </small>
                          <div class="bg-light p-2 rounded">
                            <pre class="mb-0 small">{{ JSON.stringify(order.serviceConfig, null, 2) }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 右侧：操作按钮 -->
                    <div class="col-lg-4">
                      <div class="order-actions text-end">
                        <div class="btn-group-vertical w-100" role="group">
                          <!-- 查看详情按钮 -->
                          <router-link 
                            :to="`/serviceOrderDetail/${order.blockchainName}/${order.id}`"
                            class="btn btn-outline-info btn-sm mb-2 text-decoration-none"
                          >
                            <i class="fas fa-eye me-1"></i>查看详情
                          </router-link>
                          
                          <!-- 状态管理按钮（仅数据拥有者可见） -->
                          <div v-if="viewMode === 'received' && canManageOrder(order)" class="mb-2">
                            <div class="dropdown">
                              <button 
                                class="btn btn-outline-warning btn-sm dropdown-toggle w-100" 
                                type="button" 
                                :id="'statusDropdown' + order.id"
                                data-bs-toggle="dropdown"
                              >
                                <i class="fas fa-edit me-1"></i>更新状态
                              </button>
                              <ul class="dropdown-menu" :aria-labelledby="'statusDropdown' + order.id">
                                <li v-if="order.status === 'pending'">
                                  <a class="dropdown-item" href="#" @click="updateOrderStatus(order, 'processing')">
                                    <i class="fas fa-play me-2"></i>开始处理
                                  </a>
                                </li>
                                <li v-if="order.status === 'processing'">
                                  <a class="dropdown-item" href="#" @click="updateOrderStatus(order, 'completed')">
                                    <i class="fas fa-check me-2"></i>标记完成
                                  </a>
                                </li>
                                <li v-if="['pending', 'processing'].includes(order.status)">
                                  <a class="dropdown-item" href="#" @click="updateOrderStatus(order, 'cancelled')">
                                    <i class="fas fa-times me-2"></i>取消订单
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          
                          <!-- 删除按钮（仅订单创建者或数据拥有者可见） -->
                          <button 
                            v-if="canDeleteOrder(order)"
                            class="btn btn-outline-danger btn-sm"
                            @click="deleteOrder(order)"
                          >
                            <i class="fas fa-trash me-1"></i>删除订单
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 订单详情模态框 -->
  <div class="modal fade" id="orderDetailsModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">服务订单详情</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedOrder">
          <div class="row">
            <div class="col-md-6">
              <h6>基本信息</h6>
              <table class="table table-sm">
                <tr>
                  <td><strong>订单ID:</strong></td>
                  <td>{{ selectedOrder.id }}</td>
                </tr>
                <tr>
                  <td><strong>标题:</strong></td>
                  <td>{{ selectedOrder.title }}</td>
                </tr>
                <tr>
                  <td><strong>状态:</strong></td>
                  <td>
                    <span 
                      class="badge" 
                      :class="getStatusBadgeClass(selectedOrder.status)"
                    >
                      {{ getStatusText(selectedOrder.status) }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>服务类型:</strong></td>
                  <td>{{ getServiceTypeText(selectedOrder.serviceType) }}</td>
                </tr>
                <tr>
                  <td><strong>创建时间:</strong></td>
                  <td>{{ formatDate(selectedOrder.created_at) }}</td>
                </tr>
                <tr>
                  <td><strong>更新时间:</strong></td>
                  <td>{{ formatDate(selectedOrder.updated_at) }}</td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>相关信息</h6>
              <table class="table table-sm">
                <tr>
                  <td><strong>区块链:</strong></td>
                  <td>{{ selectedOrder.blockchainName }}</td>
                </tr>
                <tr>
                  <td><strong>数据集:</strong></td>
                  <td>{{ selectedOrder.datasetName }}</td>
                </tr>
                <tr>
                  <td><strong>数据拥有者:</strong></td>
                  <td>{{ selectedOrder.datasetOwner }}</td>
                </tr>
                <tr>
                  <td><strong>请求者:</strong></td>
                  <td>{{ selectedOrder.requester }}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="row mt-3" v-if="selectedOrder.description">
            <div class="col-12">
              <h6>描述</h6>
              <p class="text-muted">{{ selectedOrder.description }}</p>
            </div>
          </div>
          
          <div class="row mt-3" v-if="selectedOrder.serviceConfig">
            <div class="col-12">
              <h6>服务配置</h6>
              <div class="bg-light p-3 rounded">
                <pre>{{ JSON.stringify(selectedOrder.serviceConfig, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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
const orders = ref([])
const selectedOrder = ref(null)
const viewMode = ref('my') // 'my' 或 'received'

// 筛选条件
const filters = reactive({
  status: '',
  serviceType: '',
  search: ''
})

// 获取状态优先级（数字越小优先级越高）
const getStatusPriority = (status) => {
  const priorityMap = {
    'pending': 1,     // 待处理 - 最高优先级
    'processing': 2,  // 处理中 - 第二优先级
    'completed': 3,   // 已完成
    'rejected': 4,    // 已拒绝
    'cancelled': 5,   // 已取消
    'failed': 6       // 失败
  }
  return priorityMap[status] || 7
}

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 状态筛选
  if (filters.status) {
    result = result.filter(order => order.status === filters.status)
  }
  
  // 服务类型筛选
  if (filters.serviceType) {
    result = result.filter(order => order.serviceType === filters.serviceType)
  }
  
  // 搜索筛选
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    result = result.filter(order => 
      order.title.toLowerCase().includes(searchTerm) ||
      order.datasetName.toLowerCase().includes(searchTerm) ||
      (order.description && order.description.toLowerCase().includes(searchTerm))
    )
  }
  
  // 按状态优先级和创建时间排序
  result.sort((a, b) => {
    // 首先按状态优先级排序
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status)
    if (priorityDiff !== 0) {
      return priorityDiff
    }
    
    // 状态相同时，按创建时间倒序排序（最新的在前）
    return new Date(b.created_at) - new Date(a.created_at)
  })
  
  return result
})

// 方法
const goBack = () => {
  router.go(-1)
}

const setViewMode = (mode) => {
  viewMode.value = mode
  loadOrders()
}

const applyFilters = () => {
  // 筛选逻辑已在计算属性中处理
}

const clearFilters = () => {
  filters.status = ''
  filters.serviceType = ''
  filters.search = ''
}

const refreshOrders = () => {
  loadOrders()
}

// 生成模拟数据的辅助函数
const generateMockOrders = () => {
  const mockOrders = []
  
  // 创建4个不同科研领域的数据服务订单示例
  const fixedStatuses = ['pending', 'processing', 'completed', 'failed']
  
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
  
  // 生成4个订单，每个对应一个科研领域
  for (let i = 0; i < 4; i++) {
    const service = researchServices[i]
    const status = fixedStatuses[i]
    
    mockOrders.push({
      id: `service_${(i + 1).toString().padStart(3, '0')}`,
      title: service.title,
      description: service.description,
      status: status,
      serviceType: service.serviceType,
      datasetName: service.name,
      requester: 'demoDataRequester',
      datasetOwner: 'demoDataOwner',
      blockchainName: route.params.blockchainName || 'Physics',
      serviceConfig: service.serviceConfig,
      created_at: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - (4 - i - 1) * 12 * 60 * 60 * 1000).toISOString()
    })
  }

  return mockOrders
}

const loadOrders = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟数据
    const allMockData = generateMockOrders()
    
    console.log('=== 服务订单加载调试信息 ===')
    console.log(`总共生成订单数量: ${allMockData.length}`)
    console.log(`当前用户: ${authStore.username}`)
    console.log(`视图模式: ${viewMode.value}`)
    console.log('所有订单信息:', allMockData.map(order => ({
      id: order.id,
      requester: order.requester,
      datasetOwner: order.datasetOwner,
      status: order.status
    })))
    
    // 根据视图模式筛选订单
    let filteredData = []
    if (viewMode.value === 'my') {
      // 我的订单：显示当前用户作为请求者的订单
      filteredData = allMockData.filter(order => order.requester === authStore.username)
      console.log(`筛选条件: requester === '${authStore.username}'`)
    } else {
      // 收到的订单：显示当前用户作为数据拥有者的订单
      filteredData = allMockData.filter(order => order.datasetOwner === authStore.username)
      console.log(`筛选条件: datasetOwner === '${authStore.username}'`)
    }
    
    console.log(`筛选后订单数量: ${filteredData.length}`)
    console.log('筛选后的订单:', filteredData.map(order => ({
      id: order.id,
      requester: order.requester,
      datasetOwner: order.datasetOwner,
      status: order.status
    })))
    
    orders.value = filteredData
    
    console.log(`最终加载 ${filteredData.length} 个${viewMode.value === 'my' ? '我的' : '收到的'}服务订单`)
    console.log('=== 调试信息结束 ===')
  } catch (err) {
    console.error('Load orders error:', err)
    error.value = err.message || '获取订单列表失败'
    orders.value = []
  } finally {
    loading.value = false
  }
}

const viewOrderDetails = (order) => {
  selectedOrder.value = order
  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'))
  modal.show()
}

const updateOrderStatus = async (order, newStatus) => {
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新本地订单状态
    const orderIndex = orders.value.findIndex(o => o.id === order.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex] = { 
        ...orders.value[orderIndex], 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
    }
    
    // 显示成功消息
    alert(`订单状态已更新为：${getStatusText(newStatus)}`)
    console.log(`订单 ${order.id} 状态已更新为: ${newStatus}`)
  } catch (err) {
    console.error('Update order status error:', err)
    alert(err.message || '更新订单状态失败')
  }
}

const deleteOrder = async (order) => {
  if (!confirm(`确定要删除订单「${order.title}」吗？此操作不可撤销。`)) {
    return
  }
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 从本地列表中移除订单
    orders.value = orders.value.filter(o => o.id !== order.id)
    alert('订单删除成功')
    console.log(`订单 ${order.id} 已删除`)
  } catch (err) {
    console.error('Delete order error:', err)
    alert(err.message || '删除订单失败')
  }
}

const canManageOrder = (order) => {
  // 只有数据拥有者可以管理订单状态
  return order.datasetOwner === authStore.username
}

const canDeleteOrder = (order) => {
  // 订单创建者或数据拥有者可以删除订单
  return order.requester === authStore.username || order.datasetOwner === authStore.username
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

const getServiceTypeText = (serviceType) => {
  const typeMap = {
    'verification': '数据验证',
    'analysis': '数据分析',
    'processing': '数据处理',
    'custom': '自定义服务'
  }
  return typeMap[serviceType] || serviceType
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-card {
  transition: transform 0.2s ease-in-out;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-title {
  color: #344767;
  font-weight: 600;
}

.order-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.order-meta small {
  font-size: 0.8rem;
}

.service-config pre {
  font-size: 0.75rem;
  max-height: 150px;
  overflow-y: auto;
}

.btn-group-vertical .btn {
  border-radius: 0.375rem !important;
  margin-bottom: 0.25rem;
}

.btn-group-vertical .btn:last-child {
  margin-bottom: 0;
}

.orders-list {
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
</style>