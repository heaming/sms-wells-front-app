<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardDtlMContents - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
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
  >
    <!-- 기본속성 -->
    <kw-tab
      :name="pdConst.STANDARD_STEP_BASIC.name"
      :label="$t('MSG_TXT_BAS_ATTR')"
    />
    <!-- 연결상품 -->
    <kw-tab
      :name="pdConst.STANDARD_STEP_REL_PROD.name"
      :label="$t('MSG_TXT_REL_PRDT')"
    />
    <!-- 관리속성 -->
    <kw-tab
      :name="pdConst.STANDARD_STEP_MANAGE.name"
      :label="$t('MSG_TXT_MGT_ATTR')"
    />
    <!-- 가격 -->
    <kw-tab
      :name="pdConst.STANDARD_STEP_PRICE.name"
      :label="$t('MSG_TXT_PRICE')"
    />
    <!-- 변경이력 -->
    <kw-tab
      v-show="props.isHistoryTab"
      name="hist"
      :label="$t('MSG_TXT_REVS_HIST')"
    />
  </kw-tabs>
  <div class="normal-area normal-area--button-set-bottom">
    <kw-tab-panels
      :model-value="selectedTab"
    >
      <kw-tab-panel :name="pdConst.STANDARD_STEP_BASIC.name">
        <zwpdc-prop-groups-dtl
          :ref="cmpStepRefs[0]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
          :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
          :is-first-title="true"
          :prefix-title="$t('MSG_TXT_BAS_ATTR')"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.STANDARD_STEP_REL_PROD.name">
        <wwpdc-standard-dtl-m-rel
          :ref="cmpStepRefs[1]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :codes="currentCodes"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.STANDARD_STEP_MANAGE.name">
        <zwpdc-prop-groups-dtl
          :ref="cmpStepRefs[2]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
          :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
          :is-first-title="true"
          :prefix-title="$t('MSG_TXT_MGT_ATTR')"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="pdConst.STANDARD_STEP_PRICE.name">
        <wwpdc-standard-dtl-m-price
          :ref="cmpStepRefs[3]"
          v-model:pd-cd="currentPdCd"
          v-model:init-data="currentInitData"
          :codes="currentCodes"
        />
      </kw-tab-panel>
      <kw-tab-panel name="hist">
        <zwpdc-prod-change-hist
          v-model:pd-cd="currentPdCd"
          :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
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
import WwpdcStandardDtlMPrice from './WwpdcStandardDtlMPrice.vue';
import WwpdcStandardDtlMRel from './WwpdcStandardDtlMRel.vue';

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
const currentCodes = ref({});
const selectedTab = ref(pdConst.STANDARD_STEP_BASIC.name);

async function onClickUpdate() {
  const { pdCd } = props;
  router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-standard-mgt', query: { pdCd, tempSaveYn: 'N' } });
}

async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentCodes.value = codes;
}

await initProps();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });

</script>
<style scoped></style>
