<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNZ
2. 프로그램 ID : WwsnzSignPreviewP -  서명 미리보기 팝업
3. 작성자 : KJ
4. 작성일 : 2023.08.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서명 미리보기 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--lg"
    :title="$t('서명')"
  >
    <kw-action-top>
      <kw-select
        v-model="ratioValue"
        :options="ratioOption"
        option-value="val"
        option-label="label"
        dense
        @update:model-value="zoomTo"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        icon="minus_24"
        dense
        secondary
        :label="$t('MSG_BTN_RDCT')"
        @click="zoomOut"
      />
      <kw-btn
        icon="plus_24"
        dense
        secondary
        :label="$t('MSG_BTN_ENLRGE')"
        @click="zoomIn"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
    </kw-action-top>
    <div
      class="gallery_area"
    >
      <div
        id="gallery-container"
      >
        <div id="gallery">
          <ul class="pictures">
            <img
              v-show="false"
              :src="signSrc"
              :data-original="signSrc"
              alt=""
            >
          </ul>
        </div>
      </div>
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line import/no-extraneous-dependencies
import Viewer from 'viewerjs';
import { isEmpty } from 'lodash-es';

const props = defineProps({
  sign: { type: String, default: null },
});

const ratioValue = ref(1);
const ratioOption = ref([
  { label: '100%', val: 1 },
  { label: '75%', val: 0.75 },
  { label: '50%', val: 0.5 },
]);

const viewerRef = ref();

const signSrc = computed(() => {
  if (isEmpty(props.sign)) return '';
  return `data:image/png;base64,${props.sign}`;
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

function zoomIn() {
  viewerRef?.value?.zoom(0.1);
}

function zoomOut() {
  viewerRef?.value?.zoom(-0.1);
}

function zoomTo() {
  viewerRef?.value?.zoomTo(ratioValue.value);
}

function makeViewer() {
  const gallery = document.getElementById('gallery');
  viewerRef.value = new Viewer(gallery, {
    inline: true,
    toolbar: false,
    backdrop: false,
    navbar: false,
    title: false,
    button: false,
    transition: false,
    container: '#gallery_container',
    fullscreen: false,
  });

  viewerRef?.value?.show();
}

onMounted(async () => {
  makeViewer();
});

onBeforeUnmount(() => {
  viewerRef?.value?.destroy();
});
</script>
