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
import { WebDashboardM, consts, http, useGlobal } from 'kw-lib';

const { push } = useRouter();
const store = useStore();
const { modal } = useGlobal();

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
const user = store.getters['meta/getUserInfo'];
if (user.userId !== 'anonymous' && user.portalId !== 'NO_SESSION') {
  onClickShowHomeCard();
}

async function openEntryNotices() {
  const res = await http.get('/sflex/common/common/entry-notice');
  const modals = res.data;
  modals.forEach((m) => {
    modal({
      component: `${m.pageSourceId}`,
    }).catch(() => {
      // 파일명이 없을 때 오류나면 그냥 아무것도 안띄워주는 것으로.
      // 나중에 alert 처리할지?
    });
  });
}

onMounted(() => {
  openEntryNotices();
});
</script>
