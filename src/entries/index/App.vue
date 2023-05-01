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
    </template>
    <template #unauthenticated>
      <web-fallback-login />
    </template>
  </web-layout>
</template>

<script setup>
import {
  useSession,
  WebLayout, WebHeader, WebLeftDrawer, WebTabView, WebFallbackLogin, CustDoaminError,
} from 'kw-lib';

const {
  isReady,
} = useSession();

await isReady();
</script>
