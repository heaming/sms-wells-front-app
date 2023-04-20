<template>
  <mobile-layout>
    <mobile-stack-view v-if="!isPopup" />
    <web-router-view v-if="isPopup" />
  </mobile-layout>
</template>

<script setup>
import {
  useSession,
  MobileLayout, MobileStackView, WebRouterView,
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
