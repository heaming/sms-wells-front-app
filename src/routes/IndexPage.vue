<template>
  <kw-page
    v-if="!showHomeCard"
    class="flex flex-center"
  >
    <!--    <kw-btn-->
    <!--      label="홈 카드 보기"-->
    <!--      style="display: flex;"-->
    <!--      @click="onClickShowHomeCard"-->
    <!--    />-->
    <img
      src="~~@assets/images/home.png"
      width="1100"
      alt="KSS Wells"
    >
  </kw-page>
  <div
    v-else
    class="row"
    style="width: 100%;"
  >
    <web-dashboard-m
      :imported-components="components"
    />
  </div>
</template>

<script setup>
import { WebDashboardM, useMeta,
  // , consts
} from 'kw-lib';

const { replace } = useRouter();
// const store = useStore();

const homecards = import.meta.globEager('../modules/common/components/homecard/*.vue');
const components = shallowRef(
  Object.keys(homecards).map((key) => ({
    key,
    component: homecards[key].default,
  })),
);
const showHomeCard = ref(false);

const { getUserInfo } = useMeta();

const userInfo = computed(() => getUserInfo());

onActivated(() => {
  if (userInfo?.value?.portalId === 'NO_SESSION' || userInfo?.value?.userId === 'anonymous') replace({ name: 'ErrorNotFound' });
});

onMounted(() => {
  if (userInfo?.value?.portalId === 'NO_SESSION' || userInfo?.value?.userId === 'anonymous') replace({ name: 'ErrorNotFound' });
});

// function onClickShowHomeCard() {
//   push({ name: consts.ROUTE_HOME_NAME });
//   store.commit('app/setLeftExist', false);
//   showHomeCard.value = true;
// }
</script>
