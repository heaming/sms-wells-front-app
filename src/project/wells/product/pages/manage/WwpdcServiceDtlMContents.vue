<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlMContents - 서비스 관리 - 서비스 상세조회 ( Z-PD-U-0042M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 프로그램
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-model="selectedTab"
    class="mt24"
  >
    <!-- 기본속성 -->
    <kw-tab
      :name="pdConst.W_SERVICE_STEP_BASIC.name"
      :label="$t('MSG_TXT_BAS_ATTR')"
    />
    <!-- 연결상품 -->
    <kw-tab
      :name="pdConst.W_SERVICE_STEP_FILTER.name"
      :label="$t('MSG_TXT_PD_FILT_CHG')"
    />
    <!-- 변경이력 -->
    <kw-tab
      v-if="props.isHistoryTab"
      name="hist"
      :label="$t('MSG_TXT_REVS_HIST')"
    />
  </kw-tabs>
  <div class="normal-area normal-area--button-set-bottom">
    <kw-tab-panels
      :model-value="selectedTab"
    >
      <kw-tab-panel :name="pdConst.W_SERVICE_STEP_BASIC.name">
        <zwpdc-prop-groups-dtl
          :ref="cmpStepRefs[0]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
          :is-first-title="true"
          :prefix-title="$t('MSG_TXT_BAS_ATTR')"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.W_SERVICE_STEP_FILTER.name">
        <wwpdc-service-dtl-m-filter
          :ref="cmpStepRefs[1]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :codes="props.codes"
        />
      </kw-tab-panel>
      <kw-tab-panel name="hist">
        <zwpdc-prod-change-hist
          :ref="cmpStepRefs[2]"
          v-model:pd-cd="currentPdCd"
          :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
        />
      </kw-tab-panel>
    </kw-tab-panels>
    <div
      v-show="isUpdateBtn"
      class="button-set--bottom"
    >
      <div class="button-set--bottom-right">
        <kw-btn
          :label="$t('MSG_BTN_MOD')"
          @click="onClickUpdate"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import WwpdcServiceDtlMFilter from './WwpdcServiceDtlMFilter.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  isHistoryTab: { type: Boolean, default: true },
  isUpdateBtn: { type: Boolean, default: true },
  codes: { type: Object, default: null },
});

const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref(), ref()]);
const currentPdCd = ref();
const currentInitData = ref({});
const selectedTab = ref(pdConst.W_SERVICE_STEP_BASIC.name);

async function resetData() {
  selectedTab.value = pdConst.W_SERVICE_STEP_BASIC.name;
  currentPdCd.value = '';
  currentInitData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
  }));
}

async function onClickUpdate() {
  const { pdCd } = props;
  router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', query: { pdCd, tempSaveYn: 'N', reloadYn: 'Y' } });
}

async function initProps() {
  const { pdCd, initData } = props;
  selectedTab.value = pdConst.W_SERVICE_STEP_BASIC.name;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

watch(() => props.pdCd, (pdCd) => {
  currentPdCd.value = pdCd; selectedTab.value = pdConst.W_SERVICE_STEP_BASIC.name;
});
watch(() => props.initData, (initData) => { currentInitData.value = initData; }, { deep: true });

</script>
<style scoped></style>
