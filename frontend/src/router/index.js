import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../stores/auth';
import HomeView from "../views/Home/HomeView.vue";
import MarketView from "../views/Market/MarketView.vue";
import LoginView from "../views/Login/LoginView.vue";
import BuyView from "../views/Order/BuyView.vue";
import SellView from "../views/Order/SellView.vue";
import FinanceView from "../views/Finance/FinanceView.vue";
import CreateOrder from "../views/Market/CreateOrder.vue";
import SellOrder from "../views/Order/SellOrder.vue";
import BuyOrder from "../views/Order/BuyOrder.vue";
import AddDataset from "../views/dataset/AddDataset.vue";
import BlockchainList from "../views/blockchain/BlockchainList.vue";
import MyDatasets from "../views/dataset/MyDatasets.vue";
import PublicDatasets from "../views/dataset/PublicDatasets.vue";
import DatasetView from "../views/dataset/DatasetView.vue";
import DatasetEdit from "../views/dataset/DatasetEdit.vue";
import RequestDataTrade from "../views/dataset/dataTrade/RequestDataTrade.vue";
import RequestDataService from "../views/dataset/dataService/RequestDataService.vue";
import TradeOrders from "../views/orders/TradeOrders.vue";
import ServiceOrders from "../views/orders/ServiceOrders.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/blockchainList",
      name: "blockchainList",
      component: BlockchainList,
      meta: { requiresAuth: true },
    },
    {
      path: "/publicDataset/:blockchainName",
      name: "publicDataset",
      component: PublicDatasets,
      meta: { requiresAuth: true },
    },
    {
      path: "/mydatasets/:name",
      name: "MyDataset",
      component: MyDatasets,
      meta: { requiresAuth: true },
    },
    {
      path: "/dataset/:blockchainName/:name",
      name: "Dataset",
      component: DatasetView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dataset/edit/:blockchainName/:name",
      name: "DatasetEdit",
      component: DatasetEdit,
      meta: { requiresAuth: true },
    },
    {
      path: "/dataset/requestDataTrade/:blockchainName/:name",
      name: "RequestDataTrade",
      component: RequestDataTrade,
      meta: { requiresAuth: true },
    },
    {
      path: "/dataset/requestDataService/:blockchainName/:name",
      name: "RequestDataService",
      component: RequestDataService,
      meta: { requiresAuth: true },
    },
    {
      path: "/tradeOrders/:blockchainName",
      name: "tradeOrders",
      component: TradeOrders,
      meta: { requiresAuth: true },
    },
    {
      path: "/serviceOrders/:blockchainName",
      name: "serviceOrders",
      component: ServiceOrders,
      meta: { requiresAuth: true },
    },
    {
      path: "/market",
      name: "market",
      component: MarketView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dataset/:id',
      name: 'CreateOrder',
      component: CreateOrder,
      meta: { requiresAuth: true },
    },

    {
      path: '/buyorder/:id',
      name: 'BuyOrder',
      component: BuyOrder,
      meta: { requiresAuth: true },
    },
    {
      path: '/sellorder/:id',
      name: 'SellOrder',
      component: SellOrder,
      meta: { requiresAuth: true },
    },
    {
      path: "/buy",
      name: "buy",
      component: BuyView,
      meta: { requiresAuth: true },
    },
    {
      path: "/sell",
      name: "sell",
      component: SellView,
      meta: { requiresAuth: true },
    },
    {
      path: "/finance",
      name: "finance",
      component: FinanceView,
      meta: { requiresAuth: true },
    },
    {
      path: "/adddataset",
      name: "adddataset",
      component: AddDataset,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isLoggedIn = authStore.isLoggedIn;

  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
