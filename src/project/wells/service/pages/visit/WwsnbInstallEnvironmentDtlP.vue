<!-- eslint-disable max-len -->
<!-- eslint-disable vue/no-parsing-error -->
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
            width="100%"
            height="100%"
            fit="contain"
          />
          <ul class="preview-attach__infos">
            <!-- 166730259072721428.jpg -->
            <li class="text-underline cursor-pointer" />
            <div class="ml100 mb5">
              <kw-btn
                dense
                underline
                :label="$t('이미지상세')"
                @click="onClickImgDetail(props.files.istEnvrFileId)"
              />
            </div>
          </ul>
        </div>
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_IST_KIT') }}
        </div>

        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.istKitFileId"
            width="100%"
            height="100%"
            fit="contain"
          />
        </div>
        <!-- kw-image
            :file-uid="props.files.istKitFileId"
          / -->
        <!-- <div style="align-items: center;"> -->
        <div class="ml100 mb5">
          <kw-btn
            :label="$t('이미지상세')"
            dense
            underline
            class="kw-font-caption center ml2"
            @click="onClickImgDetail(props.files.istKitFileId)"
          />
        </div>
        <!-- <kw-image
            :src="props.files.istKitFileId"
          /> -->
      </div>
      <div class="preview-attach col">
        <div class="preview-attach__top">
          {{ $t('MSG_TXT_CELNG') }}
        </div>
        <div class="preview-attach__bottom">
          <kw-image
            :file-uid="props.files.celngFileId"
            width="100%"
            height="100%"
            fit="contain"
          />
          <ul class="preview-attach__infos">
            <!-- 166730259072721428.jpg -->
            <li class="text-underline cursor-pointer" />
            <div class="ml100 mb5">
              <kw-btn
                dense
                underline
                :label="$t('이미지상세')"
                @click="onClickImgDetail(props.files.celngFileId)"
              />
            </div>
          </ul>
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
import { useGlobal } from 'kw-lib';

const { modal } = useGlobal();
const props = defineProps({
  files: { type: Object, default: undefined },
});

async function onClickImgDetail(fileid) {
  await modal({
    component: 'ZwcmzImagePreviewP',
    componentProps: { files: [{ fileUid: fileid.value }] },
  });
}
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
