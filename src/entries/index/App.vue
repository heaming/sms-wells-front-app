<template>
  <web-layout>
    <template #default>
      <web-header>
        <template #logo>
          <img
            src="~~@assets/images/logo_wells.svg"
            alt="KSS빨간펜"
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
  WebLayout, WebHeader, WebLeftDrawer, WebTabView, WebFallbackLogin,
} from 'kw-lib';

const {
  isReady,
} = useSession();

await isReady();
</script>
