<template>
  <nav class="navbar navbar-expand-lg top-0" :class="{
    'z-index-3 w-100 shadow-none navbar-transparent position-absolute my-3':
      props.transparent,
    'my-3 blur border-radius-lg z-index-3 py-2 shadow py-2 start-0 end-0 mx-4 position-absolute mt-4':
      props.sticky,
    'navbar-light bg-white py-3': props.light,
    ' navbar-dark bg-gradient-dark z-index-3 py-3': props.dark
  }">
    <div :class="props.transparent || props.light || props.dark
      ? 'container'
      : 'container-fluid px-0'
      ">
      <RouterLink class="navbar-brand d-none d-md-block" :class="[
        (props.transparent && textDark.value) || !props.transparent
          ? 'text-dark font-weight-bolder ms-sm-3'
          : 'text-white font-weight-bolder ms-sm-3'
      ]" :to="{ name: 'home' }" rel="tooltip" title="Designed and Coded by Creative Tim" data-placement="bottom">
        SciDataHub
      </RouterLink>
      <RouterLink class="navbar-brand d-block d-md-none" :class="props.transparent || props.dark
        ? 'text-white'
        : 'font-weight-bolder ms-sm-3'
        " to="/" rel="tooltip" title="Designed and Coded by Creative Tim" data-placement="bottom">
        SciDataHub
      </RouterLink>

      <button class="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse"
        data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon mt-2">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </span>
      </button>
      <div class="collapse navbar-collapse w-100 pt-3 pb-2 py-lg-0" id="navigation">
        <ul class="navbar-nav navbar-nav-hover ms-auto">

          <li class="nav-item mx-2">
            <RouterLink to="/blockchainList" class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()">
              <i class="material-icons opacity-9 me-2 text-xl" :class="getTextColor()">format_list_bulleted</i>
              区块链列表
            </RouterLink>
          </li>
          
          <li class="nav-item mx-2">
            <RouterLink :to="`/mydatasets/${authStore.username}`" class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()">
              <i class="material-icons opacity-9 me-2 text-xl" :class="getTextColor()">list_alt</i>
              我的科研数据集
            </RouterLink>
          </li>
          <!-- 修改数据交易订单icon为合适icon -->
          <li class="nav-item mx-2">
            <RouterLink to="/tradeOrders/Physics" class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()">
              <i class="material-icons opacity-9 me-2 text-xl" :class="getTextColor()">swap_horiz</i>
              数据交易订单
            </RouterLink>
          </li>

          <li class="nav-item mx-2">
            <RouterLink to="/serviceOrders/Physics" class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()">
              <i class="material-icons opacity-9 me-2 text-xl" :class="getTextColor()">query_stats</i>
              数据服务订单
            </RouterLink>
          </li>


          <li class="nav-item mx-2">
            <RouterLink to="/finance" class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()">
              <i class="material-icons opacity-9 me-2 text-xl" :class="getTextColor()">account_balance_wallet</i>
              资金管理
            </RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav d-lg-block d-none">
          <li class="nav-item">
            <RouterLink v-if="!authStore.isLoggedIn" :to="{ name: 'login' }"
              class="btn btn-sm mb-0 bg-gradient-success">
              登录
            </RouterLink>
            <button v-else class="btn btn-sm mb-0 bg-gradient-danger" @click="handleLogout">
              登出
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <!-- End Navbar -->
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref, watch, computed } from "vue";
import { useWindowsWidth } from "@/assets/js/useWindowsWidth";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

// images
import ArrDark from "@/assets/img/down-arrow-dark.svg";
import downArrow from "@/assets/img/down-arrow.svg";
import DownArrWhite from "@/assets/img/down-arrow-white.svg";


const props = defineProps({
  action: {
    type: Object,
    route: String,
    color: String,
    label: String,
    default: () => ({
      route: "login",
      color: "bg-gradient-success",
      label: "登录"
    })
  },
  transparent: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  dark: {
    type: Boolean,
    default: false
  },
  sticky: {
    type: Boolean,
    default: false
  },
  darkText: {
    type: Boolean,
    default: false
  }
});

// set arrow  color
function getArrowColor() {
  if (props.transparent && textDark.value) {
    return ArrDark;
  } else if (props.transparent) {
    return DownArrWhite;
  } else {
    return ArrDark;
  }
}

// set text color
const getTextColor = () => {
  let color;
  if (props.transparent && textDark.value) {
    color = "text-dark";
  } else if (props.transparent) {
    color = "text-white";
  } else {
    color = "text-dark";
  }

  return color;
};

// set nav color on mobile && desktop

let textDark = ref(props.darkText);
const { type } = useWindowsWidth();

if (type.value === "mobile") {
  textDark.value = true;
} else if (type.value === "desktop" && textDark.value == false) {
  textDark.value = false;
}

watch(
  () => type.value,
  (newValue) => {
    if (newValue === "mobile") {
      textDark.value = true;
    } else {
      textDark.value = false;
    }
  }
);

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'home' });
};
</script>
