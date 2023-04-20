<template>
  <mobile-layout>
    <mobile-stack-view />
    <web-router-view />
  </mobile-layout>
</template>

<script setup>
import {
  useSession,
  MobileLayout, MobileStackView, WebRouterView,
} from 'kw-lib';

const {
  isReady,
} = useSession();

await isReady();
</script>
