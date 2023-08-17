<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : W-SS-U-0085P01 - 대량 업로드 코드 값 조회 팝업
3. 작성자 : 박주형
4. 작성일 : 2023.07.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 필요하대.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <ul class="kw-notification">
      <li>
        대량 접수자료 업로드 파일 작성에 필요한 주요 코드정보를 조회하여, 복사해서 업로드할 엑셀파일에 붙여넣기를 하십시오.
        <kw-icon
          name="info"
          class="ml8"
          tooltip="조회 가능한 코드만 선택 가능합니다."
          style="vertical-align: -2px;"
        />
      </li>
    </ul>
    <kw-form
      :cols="2"
      class="mt30"
      ignore-on-modified
    >
      <kw-form-row>
        <kw-form-item label="대표파트너번호">
          <kw-select
            v-model="userDfn03"
            :options="userDfn03Options"
            @change="onChangeUserDfn03"
          />
          <kw-select
            v-model="prtnrMapngCd"
            :disable="!userDfn03"
            :options="filterePrtnrMapngCd"
          />
          <kw-input
            :model-value="prtnrMapngCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(prtnrMapngCd)"
            />
          </kw-input>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item label="렌탈 할인유형코드">
          <kw-select
            v-model="rentalDscTpCd"
            :options="codes.RENTAL_DSC_TP_CD"
          />
          <kw-input
            :model-value="rentalDscTpCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(rentalDscTpCd)"
            />
          </kw-input>
        </kw-form-item>
        <kw-form-item label="렌탈 할인구분코드">
          <kw-select
            v-model="rentalDscDvCd"
            :options="codes.RENTAL_DSC_DV_CD"
          />
          <kw-input
            :model-value="rentalDscDvCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(rentalDscDvCd)"
            />
          </kw-input>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item label="일시불 할인구분코드">
          <kw-select
            v-model="spayDscDvCd"
            :options="codes.SPAY_DSC_DV_CD"
          />
          <kw-input
            :model-value="spayDscDvCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(spayDscDvCd)"
            />
          </kw-input>
        </kw-form-item>
        <kw-form-item label="일시불 할인율코드">
          <kw-select
            v-model="spayDscrCd"
            :options="codes.SPAY_DSCR_CD"
          />
          <kw-input
            :model-value="spayDscrCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(spayDscrCd)"
            />
          </kw-input>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item label="BS업체구분코드">
          <kw-select
            v-model="bfsvcBzsDvCd"
            :options="codes.BFSVC_BZS_DV_CD"
          />
          <kw-input
            :model-value="bfsvcBzsDvCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(bfsvcBzsDvCd)"
            />
          </kw-input>
        </kw-form-item>
        <kw-form-item label="조달업체구분코드">
          <kw-select
            v-model="splyBzsDvCd"
            :options="codes.SPLY_BZS_DV_CD"
          />
          <kw-input
            :model-value="splyBzsDvCd"
            readonly
          >
            <kw-btn
              class="transparent absolute fit"
              borderless
              @click="writeToClipboard(splyBzsDvCd)"
            />
          </kw-input>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>

<script setup>
import { useCtCode } from '~sms-common/contract/composable';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  parent: {
    type: String,
    default: undefined,
    validator: (val) => [
      'WwctaReceiptBulkUploadMProspectCustomer',
      'WwctaReceiptBulkUploadMInstallLocation',
    ].includes(val),
  },
});

const { codes } = await useCtCode(
  'ALNCMP_DG_PRTNR_MAPNG_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_DSC_TP_CD',
  'SPAY_DSC_DV_CD',
  'SPAY_DSCR_CD',
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
);

const userDfn03 = ref('');
const userDfn03Options = computed(() => {
  if (!Array.isArray(codes.ALNCMP_DG_PRTNR_MAPNG_CD)) {
    return [];
  }

  const options = new Set(codes.ALNCMP_DG_PRTNR_MAPNG_CD.map((code) => code.userDfn03));

  return Array.of(...options.values());
});
const filterePrtnrMapngCd = computed(() => {
  if (!Array.isArray(codes.ALNCMP_DG_PRTNR_MAPNG_CD)) {
    return [];
  }

  return codes.ALNCMP_DG_PRTNR_MAPNG_CD.filter((code) => code.userDfn03 === userDfn03.value);
});
const prtnrMapngCd = ref('');
function onChangeUserDfn03() {
  prtnrMapngCd.value = '';
}

const rentalDscTpCd = ref('');

const rentalDscDvCd = ref('');
const spayDscDvCd = ref('');
const spayDscrCd = ref('');
const bfsvcBzsDvCd = ref('');
const splyBzsDvCd = ref('');

function writeToClipboard(text) {
  window.navigator.clipboard.writeText(text);
}
</script>

<style scoped>
:deep(.kw-field) {
  flex-basis: 100%;
}
</style>
