<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcMaterialDtlM - 교재/자재 상세조회 ( W-PD-U-0031M07 )
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 상세조회 프로그램 (Outer Frame W-PD-U-0031M07 - M10)
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-model="selectedTab"
    class="mt24"
  >
    <!-- 기준속성 -->
    <kw-tab
      :name="pdConst.W_MATERIAL_STEP_BASIC.name"
      :label="$t('MSG_TXT_BAS_ATTR')"
    />
    <!-- 연결상품 (Wells 특화) -->
    <kw-tab
      :name="pdConst.W_MATERIAL_STEP_REL_PROD.name"
      :label="t('MSG_TXT_REL_PRDT')"
    />
    <!-- 확장속성 -->
    <kw-tab
      :name="pdConst.W_MATERIAL_STEP_MANAGE.name"
      :label="$t('MSG_TXT_MGT_ATTR')"
    />
    <!-- 변경이력 -->
    <kw-tab
      v-if="props.isHistoryTab"
      name="hist"
      :label="$t('MSG_TXT_REVS_HIST')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <!-- 기준속성 -->
    <kw-tab-panel :name="pdConst.W_MATERIAL_STEP_BASIC.name">
      <zwpdc-prop-groups-dtl
        :ref="cmpStepRefs[0]"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
        :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
        :is-first-title="true"
        :pd-tp-dtl-cd="pdTpDtlCd"
      />
    </kw-tab-panel>
    <!-- 연결상품 (Wells 특화) -->
    <kw-tab-panel
      :name="pdConst.W_MATERIAL_STEP_REL_PROD.name"
    >
      <wwpdc-prop-relation-dtl
        :ref="cmpStepRefs[1]"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
      />
    </kw-tab-panel>
    <!-- 확장속성 -->
    <kw-tab-panel :name="pdConst.W_MATERIAL_STEP_MANAGE.name">
      <zwpdc-prop-groups-dtl
        :ref="cmpStepRefs[2]"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
        :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
        :is-first-title="true"
      />
    </kw-tab-panel>
    <!-- 변경이력 -->
    <kw-tab-panel name="hist">
      <zwpdc-prod-change-hist
        :ref="cmpStepRefs[3]"
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
import { isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import { pageMove } from '~sms-common/product/utils/pdUtil';
import WwpdcPropRelationDtl from './WwpdcPropRelationDtlM.vue';

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
  codes: { type: Object, default: null },
  isRegCheckPage: { type: Boolean, default: false }, /* 화면이 등록정보확인(true)인지, 상세조회인지(false)인지 여부  */
});

const { t } = useI18n();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pdTpDtlCd = ref(pdConst.PD_TP_DTL_CD_MATERIAL);

const cmpStepRefs = ref([ref(), ref(), ref(), ref()]);
const currentPdCd = ref();
const currentInitData = ref({});
const selectedTab = ref(pdConst.W_MATERIAL_STEP_BASIC.name);

async function resetData() {
  selectedTab.value = pdConst.W_MATERIAL_STEP_BASIC.name;
  currentPdCd.value = '';
  currentInitData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
  }));
}

// 상품 수정 화면으로 이동
async function onClickUpdate() {
  const { pdCd, tempSaveYn } = props;
  const query = { pdCd, tempSaveYn, isSearch: true, fromUi: 'Dtl' };
  const stateParam = { newRegYn: 'N', reloadYn: 'Y', copyPdCd: '', propWatch: new Date() };
  await pageMove(pdConst.MATERIAL_MNGT_PAGE_W, true, router, query, stateParam);
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

onMounted(async () => {
  setTimeout(() => initProps(), 500);
});

watch(() => props.pdCd, (pdCd) => {
  currentPdCd.value = pdCd;
  selectedTab.value = pdConst.W_MATERIAL_STEP_BASIC.name;
});
watch(() => props.initData, (initData) => {
  if (!isEqual(currentInitData.value, initData)) {
    currentInitData.value = initData;
  }
}, { deep: true });

</script>
<style scoped></style>
