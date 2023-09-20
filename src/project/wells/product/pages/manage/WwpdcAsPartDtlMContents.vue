<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartDtlMContents - AS부품 상세조회 (W-PD-U-0041M02)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 AS부품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-if="props.isHistoryTab"
    v-model="selectedTab"
    class="mt24"
  >
    <kw-tab
      :name="pdConst.W_AS_PART_STEP_BASIC.name"
      :label="$t('MSG_TXT_PRP', null, '속성')"
    />
    <kw-tab
      v-if="props.isHistoryTab"
      name="hist"
      :label="$t('MSG_TXT_REVS_HIST', null, '변경이력')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <kw-tab-panel :name="pdConst.W_AS_PART_STEP_BASIC.name">
      <zwpdc-prop-groups-dtl
        :ref="cmpStepRefs[0]"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
        :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
        :pd-tp-dtl-cd="pdConst.PD_TP_DTL_CD_AS_PART"
        :is-first-title="true"
        :is-reg-check-page="props.isRegCheckPage"
      />
    </kw-tab-panel>
    <kw-tab-panel name="hist">
      <zwpdc-prod-change-hist
        :ref="cmpStepRefs[1]"
        v-model:pd-cd="currentPdCd"
        :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
      />
    </kw-tab-panel>
  </kw-tab-panels>
  <div
    v-show="isUpdateBtn"
    class="button-set--bottom"
  >
    <div class="button-set--bottom-right">
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_MOD')"
        @click="onClickUpdate"
      />
    </div>
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { isEqual } from 'lodash-es'; // isEmpty
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import { pageMove } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
  initData: { type: Object, default: null },
  isHistoryTab: { type: Boolean, default: true },
  isUpdateBtn: { type: Boolean, default: true },
  // codes: { type: Object, default: null },
  isRegCheckPage: { type: Boolean, default: false }, /* 화면이 등록정보확인(true)인지, 상세조회인지(false)인지 여부  */
});

const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref()]);
const currentPdCd = ref();
const currentInitData = ref({});
const selectedTab = ref(pdConst.W_AS_PART_STEP_BASIC.name);

async function resetData() {
  selectedTab.value = pdConst.W_AS_PART_STEP_BASIC.name;
  currentPdCd.value = '';
  currentInitData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
  }));
}

// 상품 수정 화면으로 이동
async function onClickUpdate() {
  const { pdCd } = props;
  const query = { pdCd };
  const stateParam = { newRegYn: 'N', reloadYn: 'Y', copyPdCd: '', propWatch: new Date() };
  await pageMove(pdConst.ASPART_MNGT_PAGE, true, router, query, stateParam);
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

onMounted(async () => {
  await initProps();
});

watch(() => props.pdCd, (pdCd) => {
  currentPdCd.value = pdCd;
  selectedTab.value = pdConst.W_AS_PART_STEP_BASIC.name;
});
watch(() => props.initData, (initData) => {
  if (!isEqual(currentInitData.value, initData)) {
    currentInitData.value = initData;
  }
}, { deep: true });

</script>
<style scoped></style>
