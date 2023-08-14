<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbHomecarePhotoDtlP - 홈케어사진상세 팝업(K-W-SV-U-0183P01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl"
    :label="$t('MSG_TXT_HCR_PHO_DTL')"
  >
    <div class="row q-gutter-y-lg">
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_NEAR_PHO_FRONT') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.nearFrontFileId"
          />
          <!-- <kw-image
            :src="props.files.nearFrontFileId"
          /> -->
        </div>
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_NEAR_PHO_BACK') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.nearBackFileId"
          />
          <!-- <kw-image
            :src="props.files.nearBackFileId"
          /> -->
        </div>
      </div>
    </div>
    <div class="row q-gutter-y-lg">
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_DISTANT_PHO_FRONT') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.distantFrontFileId"
          />
          <!-- <kw-image
            :src="props.files.distantFrontFileId"
          /> -->
        </div>
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_DISTANT_PHO_BACK') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.distantBackFileId"
          />
          <!-- <kw-image
            :src="props.files.distantBackFileId"
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
            nearFrontFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 가까이찍은사진(전)
            nearBackFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 가까이찍은사진(후)
            distantFrontFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 멀리찍은사진(전)
            distantBackFileId: 'FIL-3BB339A0-0001-4F6C-8A34-19391E8B6DB3', 멀리찍은사진(후)
          },
      },
*/
</script>
