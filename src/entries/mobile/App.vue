<template>
  <mobile-layout>
    <mobile-stack-view />
  </mobile-layout>
</template>

<script setup>
import {
  useSession,
  MobileLayout, MobileStackView,
} from 'kw-lib';

const {
  isReady,
} = useSession();

await isReady();
</script>
