<template>
  <web-layout>
    <template #custdomain>
      <cust-doamin-error />
    </template>
    <template #default>
      <web-header>
        <template #logo="{ goToHome }">
          <img
            src="~~@assets/images/kstation_wells.svg"
            alt="K-Station Wells"
            @click="goToHome()"
          >
        </template>
      </web-header>

      <web-left-drawer />
      <web-tab-view />
      <dev-env-sign :mode="MODE" />
    </template>
    <template #unauthenticated>
      <web-fallback-login />
      <dev-env-sign :mode="MODE" />
    </template>
  </web-layout>
</template>

<script setup>
import {
  useSession, useMeta,
  WebLayout, WebHeader, WebLeftDrawer, WebTabView, WebFallbackLogin, CustDoaminError, DevEnvSign,
} from 'kw-lib';

const {
  isReady,
} = useSession();

await isReady();

const router = useRouter();
const { getUserInfo } = useMeta();

const userInfo = computed(() => getUserInfo());

onActivated(() => {
  if (userInfo?.value?.portalId === 'NO_SESSION' || userInfo?.value?.userId === 'anonymous') router.replace({ name: 'ErrorNotFound' });
});

onMounted(() => {
  if (userInfo?.value?.portalId === 'NO_SESSION' || userInfo?.value?.userId === 'anonymous') router.replace({ name: 'ErrorNotFound' });
});
const { MODE } = import.meta.env;
</script>
