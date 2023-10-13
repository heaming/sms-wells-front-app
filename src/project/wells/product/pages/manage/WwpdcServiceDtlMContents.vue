<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlMContents - 서비스 관리 - 서비스 상세조회
                ( W-PD-U-0044M01, W-PD-U-0043M03,  )
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
    <!-- 속성 -->
    <kw-tab
      :name="pdConst.W_SERVICE_STEP_BASIC.name"
      :label="$t('MSG_TXT_PRP')"
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
        is-auto-group-title
        :is-reg-check-page="props.isRegCheckPage"
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
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import WwpdcServiceDtlMFilter from './WwpdcServiceDtlMFilter.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  isHistoryTab: { type: Boolean, default: true }, // 변경이력탭 존재 여부
  isUpdateBtn: { type: Boolean, default: true }, // 수정 버튼 존재 여부
  codes: { type: Object, default: null }, // 공통코드
  isRegCheckPage: { type: Boolean, default: false }, /* 화면이 등록정보확인(true)인지, 상세조회인지(false)인지 여부  */
});

const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref(), ref()]);
const currentPdCd = ref();
const currentInitData = ref({});
const selectedTab = ref(pdConst.W_SERVICE_STEP_BASIC.name);

// 데이터 초기화
async function resetData() {
  selectedTab.value = pdConst.W_SERVICE_STEP_BASIC.name;
  currentPdCd.value = '';
  currentInitData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
  }));
}

// 상품 수정 화면으로 이동
async function onClickUpdate() {
  const { pdCd } = props;
  await router.close();
  await router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', query: { pdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'Y', copyPdCd: '', propWatch: new Date() } } });
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

watch(() => props.pdCd, (pdCd) => {
  currentPdCd.value = pdCd;
  selectedTab.value = pdConst.W_SERVICE_STEP_BASIC.name;
});
watch(() => props.initData, (initData) => {
  if (!isEqual(currentInitData.value, initData)) {
    currentInitData.value = initData;
  }
}, { deep: true });

</script>
<style scoped></style>
