<template>
  <kw-page
    v-if="!showHomeCard"
    class="flex flex-center"
  >
    <kw-btn
      label="홈 카드 보기"
      style="display: flex;"
      @click="onClickShowHomeCard"
    />
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
import { WebDashboardM, consts } from 'kw-lib';

const { push } = useRouter();
const store = useStore();

const homecards = import.meta.globEager('../modules/common/components/homecard/*.vue');
const components = shallowRef(
  Object.keys(homecards).map((key) => ({
    key,
    component: homecards[key].default,
  })),
);
const showHomeCard = ref(false);

function onClickShowHomeCard() {
  push({ name: consts.ROUTE_HOME_NAME });
  store.commit('app/setLeftExist', false);
  showHomeCard.value = true;
}
</script>
