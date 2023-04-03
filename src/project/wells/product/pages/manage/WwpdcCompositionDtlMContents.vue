<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlMContents - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-model="selectedTab"
    class="mt24"
    @update:model-value="onClickTab(selectedTab)"
  >
    <!-- 기본속성 -->
    <kw-tab
      :name="pdConst.COMPOSITION_STEP_BASIC.name"
      :label="$t('MSG_TXT_BAS_ATTR')"
    />
    <!-- 연결상품 -->
    <kw-tab
      :name="pdConst.COMPOSITION_STEP_REL_PROD.name"
      :label="$t('MSG_TXT_REL_PRDT')"
    />
    <!-- 관리속성 -->
    <kw-tab
      :name="pdConst.COMPOSITION_STEP_MANAGE.name"
      :label="$t('MSG_TXT_MGT_ATTR')"
    />
    <!-- 가격 -->
    <kw-tab
      :name="pdConst.COMPOSITION_STEP_PRICE.name"
      :label="$t('MSG_TXT_PRICE')"
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
      <kw-tab-panel :name="pdConst.COMPOSITION_STEP_BASIC.name">
        <zwpdc-prop-groups-dtl
          :ref="cmpStepRefs[0]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :pd-tp-cd="pdConst.PD_TP_CD_COMPOSITION"
          :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
          :is-first-title="true"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.COMPOSITION_STEP_REL_PROD.name">
        <wwpdc-composition-dtl-m-rel
          :ref="cmpStepRefs[1]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :codes="props.codes"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.COMPOSITION_STEP_MANAGE.name">
        <zwpdc-prop-groups-dtl
          :ref="cmpStepRefs[2]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :pd-tp-cd="pdConst.PD_TP_CD_COMPOSITION"
          :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
          :is-first-title="true"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.COMPOSITION_STEP_PRICE.name">
        <wwpdc-composition-dtl-m-price
          :ref="cmpStepRefs[3]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :codes="props.codes"
        />
      </kw-tab-panel>
      <kw-tab-panel name="hist">
        <zwpdc-prod-change-hist
          :ref="cmpStepRefs[4]"
          v-model:pd-cd="currentPdCd"
          :pd-tp-cd="pdConst.PD_TP_CD_COMPOSITION"
          :is-price="true"
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
import WwpdcCompositionDtlMPrice from './WwpdcCompositionDtlMPrice.vue';
import WwpdcCompositionDtlMRel from './WwpdcCompositionDtlMRel.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  tempSaveYn: { type: String, default: 'Y' },
  isHistoryTab: { type: Boolean, default: true },
  isUpdateBtn: { type: Boolean, default: true },
});

const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref(), ref(), ref(), ref()]);
const currentPdCd = ref();
const currentInitData = ref({});
const selectedTab = ref(pdConst.COMPOSITION_STEP_BASIC.name);

async function resetData() {
  selectedTab.value = pdConst.COMPOSITION_STEP_BASIC.name;
  currentPdCd.value = '';
  currentInitData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
  }));
}

async function onClickUpdate() {
  const { pdCd } = props;
  await router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-composition-mgt', query: { pdCd, tempSaveYn: 'N', reloadYn: 'Y' } });
}

async function onClickTab(selTab) {
  if (selTab === pdConst.COMPOSITION_STEP_PRICE.name) {
    const priceStepIndex = pdConst.COMPOSITION_STEP_PRICE.step - 1;
    cmpStepRefs.value[priceStepIndex].value.onClickSearch();
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  selectedTab.value = pdConst.COMPOSITION_STEP_BASIC.name;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

watch(() => props.pdCd, (pdCd) => {
  currentPdCd.value = pdCd; selectedTab.value = pdConst.COMPOSITION_STEP_BASIC.name;
});
watch(() => props.initData, (initData) => { currentInitData.value = initData; }, { deep: true });

</script>
<style scoped></style>
