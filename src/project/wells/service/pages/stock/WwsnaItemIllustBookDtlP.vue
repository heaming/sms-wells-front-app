<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaItemIllustBookDtlP - 품목도감상세 팝업(K-W-SV-U-0205P01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--lg"
    size="popup--lg"
  >
    <kw-image-preview
      :images="computedFiles"
      @update:image-index="setImageIndex"
    />
    <template #action>
      <p class="kw-font-dense">
        <span class="kw-fc--positive">{{ imageIndex.curr + 1 }}</span>/{{ imageIndex.total }}
      </p>
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { cloneDeep } from 'lodash-es';

const props = defineProps({
  files: { type: [Array, Object], default: undefined },
});

const computedFiles = computed(() => {
  if (props.files && !Array.isArray(props.files)) return [props.files];
  return props.files;
});

const imageIndex = ref({
  curr: 0,
  total: computedFiles.value?.length,
});

function setImageIndex(index) {
  imageIndex.value = cloneDeep(index);
}

</script>
