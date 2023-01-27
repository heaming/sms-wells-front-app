<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardDtlM - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom">
      <div class="kw-stepper-headingtext">
        <h2 class="h2-small">
          {{ pdBas.pdNm }}({{ pdBas.pdCd }})
          <p>
            <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
              /  {{ pdBas.fstRgstUsrNm }}</span><span>
              {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
              / {{ pdBas.fnlMdfcUsrNm }}</span>
          </p>
        </h2>
        <wwpdc-standard-dtl-m-contents
          v-model:pd-cd="currentPdCd"
          v-model:init-data="initData"
          :codes="codes"
          :temp-save-yn="props.tempSaveYn"
        />
        <div class="button-set--bottom">
          <div class="button-set--bottom-right">
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              class="ml8"
              primary
              @click="onClickUpdate"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcStandardDtlMContents from './WwpdcStandardDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const route = useRoute();
const router = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;

const currentPdCd = ref();
const prdPropGroups = ref({});
const pdBas = ref({});
const initData = ref({});

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'COD_PRDT_STT',
  'SELL_CHNL_DV_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
  'SV_PRD_UNIT_CD',
  'SV_VST_PRD_CD',
);

async function onClickUpdate() {
  const { pdCd } = props;
  router.push({ path: '/product/wwpdc-standard-mgt', query: { pdCd, tempSaveYn: 'N' } });
}

async function fetchData() {
  const res = await dataService.get(`/sms/common/product/standards/${currentPdCd.value}`);
  console.log('WwpdcStandardDtlM - fetchProduct - res.data', res.data);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  initData.value[bas] = res.data[bas];
  initData.value[dtl] = res.data[dtl];
  initData.value[ecom] = res.data[ecom];
  initData.value[prcd] = res.data[prcd];
  initData.value[prcfd] = res.data[prcfd];
  console.log('res.data : ', res.data);
  prdPropGroups.value = res.data.groupCodes;
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (isEmpty(currentPdCd.value)) {
    await router.close();
  } else {
    await fetchData();
  }
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  if (pdCd && currentPdCd.value !== pdCd) {
    currentPdCd.value = pdCd;
    await fetchData();
  }
}, { immediate: true });

</script>
<style scoped></style>
