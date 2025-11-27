<template>
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <Header>
    <div class="page-header align-items-start min-vh-100" :style="{
      backgroundImage:
        'url(https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80)'
    }" loading="lazy">
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container my-auto">
        <div class="row">
          <div class="col-lg-4 col-md-8 col-12 mx-auto">
            <div class="card z-index-0 fadeIn3 fadeInBottom">
              <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                <div class="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
                  <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">
                    登录
                  </h4>
                  <h6 class="text-white font-weight-bolder text-center mt-2 mb-0">
                    请输入您的用户名和密码
                  </h6>
                </div>
              </div>
              <div class="card-body">
                <form @submit.prevent="login" class="text-start">
                  <div class="input-group input-group-outline my-3">
                    <label for="username" class="form-label"></label>
                    <input id="username" type="text" class="form-control" v-model="username" placeholder="输入用户名"
                      required />
                  </div>
                  <div class="input-group input-group-outline mb-3">
                    <label for="password" class="form-label"></label>
                    <input id="password" :type="showPassword ? 'text' : 'password'" class="form-control"
                      v-model="password" placeholder="输入密码" required />
                  </div>
                  <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="showPasswordSwitch"
                      v-model="showPassword" />
                    <label class="form-check-label" for="showPasswordSwitch">显示密码</label>
                  </div>

                  <div class="text-center">
                    <button type="submit" class="btn btn-success btn-lg w-100 my-2 mb-2">登录</button>
                    <button @click="register" type="button" class="btn btn-primary btn-lg w-100 my-2">注册</button>
                    <button @click="handleDemoDataOwnerLogin" type="button" class="btn btn-secondary btn-lg w-100 my-2">演示账户登录-数据拥有者</button>
                    <button @click="handleDemoDataRequesterLogin" type="button" class="btn btn-dark btn-lg w-100 my-2">演示账户登录-数据请求者</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Header>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import NavbarDefault from "../../components/NavbarDefault.vue";
import Header from "@/examples/Header.vue";

import axios from '../../api/axios';

const authStore = useAuthStore();
const router = useRouter();
const $notify = inject('$notify');

const username = ref('');
const password = ref('');
const showPassword = ref(false);



const login = async () => {
  try {
    const response = await axios.post('/login', {
      username: username.value,
      password: password.value
    });
    
    if (response.data.success) {
      authStore.login(response.data.user);
      $notify.success('登录成功！');
      router.push({ name: 'home' });
    } else {
      $notify.error('登录失败：' + response.data.message);
    }
  } catch (error) {
    console.error('登录错误:', error);
    $notify.error('登录失败，请检查网络连接');
  }
};

const register = async () => {
  try {
    const response = await axios.post('/register', {
      username: username.value,
      password: password.value
    });
    
    if (response.data.success) {
      $notify.success('注册成功！请登录');
      // 清空表单
      username.value = '';
      password.value = '';
    } else {
      $notify.error('注册失败：' + response.data.message);
    }
  } catch (error) {
    console.error('注册错误:', error);
    $notify.error('注册失败，请检查网络连接');
  }
};

const handleDemoDataOwnerLogin = async () => {
  // 自动填充数据拥有者演示账户信息
  username.value = 'demoDataOwner';
  password.value = 'demoDataOwner';
  
  // 触发登录请求
  try {
    const response = await axios.post('/login', {
      username: username.value,
      password: password.value
    });
    
    if (response.data.success) {
      authStore.login(response.data.user);
      $notify.success('数据拥有者演示账户登录成功！');
      router.push({ name: 'home' });
    } else {
      $notify.error('数据拥有者演示账户登录失败：' + response.data.message);
    }
  } catch (error) {
    console.error('数据拥有者演示账户登录错误:', error);
    $notify.error('数据拥有者演示账户登录失败，请检查网络连接');
  }
};

const handleDemoDataRequesterLogin = async () => {
  // 自动填充数据请求者演示账户信息
  username.value = 'demoDataRequester';
  password.value = 'demoDataRequester';
  
  // 触发登录请求
  try {
    const response = await axios.post('/login', {
      username: username.value,
      password: password.value
    });
    
    if (response.data.success) {
      authStore.login(response.data.user);
      $notify.success('数据请求者演示账户登录成功！');
      router.push({ name: 'home' });
    } else {
      $notify.error('数据请求者演示账户登录失败：' + response.data.message);
    }
  } catch (error) {
    console.error('数据请求者演示账户登录错误:', error);
    $notify.error('数据请求者演示账户登录失败，请检查网络连接');
  }
};
</script>

<style scoped>
.page-header {
  background-size: cover;
  background-position: center;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: none;
}

.card-body {
  padding: 2rem;
}

.input-group-outline {
  position: relative;
}

.input-group-outline .form-control {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.input-group-outline .form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-outline .form-label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.375rem 0.75rem;
  pointer-events: none;
  transition: 0.15s ease-in-out;
  color: #6c757d;
}

.input-group-outline .form-control:focus~.form-label,
.input-group-outline .form-control:not(:placeholder-shown)~.form-label {
  top: -1.25rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #007bff;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}
</style>
