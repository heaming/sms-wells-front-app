<template>
  <tablet-layout>
    <template #default>
      <tablet-left-drawer />
      <tablet-stack-view v-if="!isPopup" />
      <web-router-view v-if="isPopup" />
    </template>
    <template #unauthenticated>
      <tablet-fallback-login
        tenant-id="TNT_WELLS"
        portal-id="MBL_DEF"
      />
    </template>
  </tablet-layout>
</template>

<script setup>
import {
  useSession,
  TabletLayout, TabletLeftDrawer, TabletStackView, TabletFallbackLogin,
} from 'kw-lib';

const route = useRouter();
const isPopup = computed(() => {
  if (route.currentRoute.meta?.menuUid) return false;
  return true;
});

const {
  isReady,
} = useSession();

await isReady();
</script>
