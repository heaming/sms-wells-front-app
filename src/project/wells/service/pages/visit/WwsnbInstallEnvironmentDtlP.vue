<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbInstallEnvironmentDtlP - 설치환경상세 팝업(K-W-SV-U-0214P01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl"
    :label="$t('MSG_TXT_IST_ENVR_DTL')"
  >
    <div class="row q-gutter-x-lg">
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_IST_ENVR') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.istEnvrFileId"
          />
          <!-- <kw-image
            :src="props.files.istEnvrFileId"
          /> -->
        </div>
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_IST_KIT') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.istKitFileId"
          />
          <!-- <kw-image
            :src="props.files.istKitFileId"
          /> -->
        </div>
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_CELNG') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.celngFileId"
          />
          <!-- <kw-image
            :src="props.files.celngFileId"
          /> -->
        </div>
      </div>
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

const props = defineProps({
  files: { type: Object, default: undefined },
});

/*
Props 설정
Props: {
        files:
          {
            istEnvrFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 설치환경
            istKitFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 설치키트
            celngFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 천장
          },
      },
*/
</script>
