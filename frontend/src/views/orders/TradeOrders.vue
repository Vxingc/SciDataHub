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
              交易订单管理
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              管理您的定制脱敏数据交易订单
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
          <h3 class="mb-0">交易订单</h3>
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
                  <option value="cancelled">已取消</option>
                  <option value="failed">失败</option>
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
              <div class="col-md-3">
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
          <p class="mt-3 text-muted">正在加载交易订单...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-5">
          <div class="mb-4">
            <i class="fas fa-exchange-alt fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted">暂无交易订单</h4>
          <p class="text-muted">{{ viewMode === 'my' ? '您还没有创建任何交易订单' : '您还没有收到任何交易订单' }}</p>
        </div>

        <!-- 订单列表 -->
        <div v-else>
          <div class="d-flex align-items-center mb-4">
            <i class="fas fa-list text-primary me-2"></i>
            <h4 class="mb-0 text-primary">{{ viewMode === 'my' ? '我的交易订单' : '收到的交易订单' }}</h4>
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
                                <i class="fas fa-shield-alt me-1"></i>
                                脱敏规则：{{ order.maskingRules ? order.maskingRules.length : 0 }} 条
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
                        
                        <!-- 脱敏规则预览 -->
                        <div v-if="order.maskingRules && order.maskingRules.length > 0" class="masking-rules mb-3">
                          <small class="text-muted d-block mb-1">
                            <i class="fas fa-mask me-1"></i>脱敏规则预览：
                          </small>
                          <div class="bg-light p-2 rounded">
                            <div class="d-flex flex-wrap gap-1">
                              <span 
                                v-for="(rule, index) in order.maskingRules.slice(0, 3)" 
                                :key="index"
                                class="badge bg-secondary"
                              >
                                {{ rule.keyName }}
                              </span>
                              <span v-if="order.maskingRules.length > 3" class="badge bg-info">
                                +{{ order.maskingRules.length - 3 }} 更多
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 右侧：操作按钮 -->
                    <div class="col-lg-4">
                      <div class="order-actions text-end">
                        <div class="btn-group-vertical w-100" role="group">
                          <!-- 查看详情按钮 -->
                          <button 
                            class="btn btn-outline-info btn-sm mb-2"
                            @click="viewOrderDetails(order)"
                          >
                            <i class="fas fa-eye me-1"></i>查看详情
                          </button>
                          
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
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">交易订单详情</h5>
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
          
          <div class="row mt-3" v-if="selectedOrder.maskingRules && selectedOrder.maskingRules.length > 0">
            <div class="col-12">
              <h6>脱敏规则详情</h6>
              <div class="table-responsive">
                <table class="table table-sm table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>规则编号</th>
                      <th>字段名称</th>
                      <th>数据类型</th>
                      <th>约束类型</th>
                      <th>约束值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(rule, index) in selectedOrder.maskingRules" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td><code>{{ rule.keyName }}</code></td>
                      <td>
                        <span class="badge" :class="rule.dataType === 'string' ? 'bg-info' : 'bg-success'">
                          {{ rule.dataType === 'string' ? '字符串' : '数值' }}
                        </span>
                      </td>
                      <td>{{ getConstraintTypeText(rule.constraintType) }}</td>
                      <td>
                        <span v-if="rule.constraintType === 'range'">
                          {{ rule.minValue }} - {{ rule.maxValue }}
                        </span>
                        <span v-else>
                          {{ rule.constraintValue }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
  search: ''
})

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 状态筛选
  if (filters.status) {
    result = result.filter(order => order.status === filters.status)
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
  filters.search = ''
}

const refreshOrders = () => {
  loadOrders()
}

const loadOrders = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 检查是否有 blockchainName 参数
    const blockchainName = route.params.blockchainName
    if (!blockchainName) {
      throw new Error('缺少区块链参数，请从正确的入口访问订单页面')
    }
    
    let apiUrl = ''
    
    if (viewMode.value === 'my') {
      // 获取我创建的订单
      apiUrl = `/api/trade-orders/${blockchainName}/requester`
    } else {
      // 获取我收到的订单（作为数据拥有者）
      apiUrl = `/api/trade-orders/${blockchainName}/owner/${authStore.username}`
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      orders.value = data.data || []
    } else {
      throw new Error(data.message || '获取订单列表失败')
    }
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
    const blockchainName = route.params.blockchainName
    if (!blockchainName) {
      throw new Error('缺少区块链参数')
    }
    
    const response = await fetch(`/api/trade-orders/${blockchainName}/${order.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      // 更新本地订单状态
      const orderIndex = orders.value.findIndex(o => o.id === order.id)
      if (orderIndex !== -1) {
        orders.value[orderIndex] = { ...orders.value[orderIndex], ...data.data }
      }
      
      // 显示成功消息
      alert(`订单状态已更新为：${getStatusText(newStatus)}`)
    } else {
      throw new Error(data.message || '更新订单状态失败')
    }
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
    const blockchainName = route.params.blockchainName
    if (!blockchainName) {
      throw new Error('缺少区块链参数')
    }
    
    const response = await fetch(`/api/trade-orders/${blockchainName}/${order.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      // 从本地列表中移除订单
      orders.value = orders.value.filter(o => o.id !== order.id)
      alert('订单删除成功')
    } else {
      throw new Error(data.message || '删除订单失败')
    }
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

.masking-rules .badge {
  font-size: 0.7rem;
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

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}
</style>