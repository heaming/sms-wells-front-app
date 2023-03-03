<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtM - (판매) 상품목록 - 기준상품 등록/변경 ( Z-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom">
      <kw-stepper
        v-model="currentStep.name"
        heading-text
        :header-nav="!isTempSaveBtn"
        @update:model-value="onClickStep()"
      >
        <kw-step
          :name="pdConst.STANDARD_STEP_BASIC.name"
          :title="$t('MSG_TXT_BAS_ATTR_REG')"
          :prefix="pdConst.STANDARD_STEP_BASIC.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_BASIC.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_REL_PROD.name"
          :title="$t('MSG_TXT_REL_PRDT_SEL')"
          :prefix="pdConst.STANDARD_STEP_REL_PROD.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_REL_PROD.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_MANAGE.name"
          :title="$t('MSG_TXT_MGT_ATTR_REG')"
          :prefix="pdConst.STANDARD_STEP_MANAGE.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_MANAGE.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_PRICE.name"
          :title="$t('MSG_TXT_PRC_INFO_REG')"
          :prefix="pdConst.STANDARD_STEP_PRICE.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_PRICE.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_CHECK.name"
          :title="$t('MSG_TXT_CHK_REG_INFO')"
          :prefix="pdConst.STANDARD_STEP_CHECK.step"
        />
        <kw-step-panel :name="pdConst.STANDARD_STEP_BASIC.name">
          <zwpdc-prop-groups-mgt
            :ref="cmpStepRefs[0]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
            @update="onUpdateBasicValue"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_REL_PROD.name">
          <wwpdc-standard-mgt-m-rel
            :ref="cmpStepRefs[1]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :codes="codes"
            @click-tab="onClickSubTab"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_MANAGE.name">
          <zwpdc-prop-groups-mgt
            :ref="cmpStepRefs[2]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_PRICE.name">
          <wwpdc-standard-mgt-m-price
            :ref="cmpStepRefs[3]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :codes="codes"
            @click-tab="onClickSubTab"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_CHECK.name">
          <wwpdc-standard-dtl-m-contents
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :is-history-tab="false"
            :is-update-btn="false"
            :codes="codes"
          />
        </kw-step-panel>
      </kw-stepper>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            v-show="!isCreate"
            :label="$t('MSG_BTN_DEL')"
            @click="onClickDelete"
          />
          <kw-btn
            v-show="currentStep.step === 1 && isCreate"
            :label="$t('MSG_BTN_INTL')"
            class="ml8"
            @click="onClickReset"
          />
          <kw-btn
            v-if="currentStep.step < regSteps.length && isTempSaveBtn"
            :label="$t('MSG_BTN_TMP_SAVE')"
            class="ml8"
            @click="onClickSave('Y')"
          />
          <kw-btn
            v-show="currentStep.step > 1"
            :label="$t('MSG_BTN_PREV')"
            class="ml8"
            @click="onClickPrevStep"
          />
          <kw-btn
            v-show="currentStep.step < regSteps.length"
            :label="$t('MSG_BTN_NEXT')"
            class="ml8"
            primary
            @click="onClickNextStep"
          />
          <kw-btn
            v-show="!isCreate || currentStep.step === regSteps.length"
            :label="$t('MSG_BTN_SAVE')"
            class="ml8"
            primary
            @click="onClickSave('N')"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, pdRemoveBy } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcStandardMgtMPrice from './WwpdcStandardMgtMPrice.vue';
import WwpdcStandardMgtMRel from './WwpdcStandardMgtMRel.vue';
import WwpdcStandardDtlMContents from './WwpdcStandardDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { notify, confirm } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const rel = pdConst.TBL_PD_REL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;

const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.STANDARD_STEP_BASIC, pdConst.STANDARD_STEP_REL_PROD,
  pdConst.STANDARD_STEP_MANAGE, pdConst.STANDARD_STEP_PRICE, pdConst.STANDARD_STEP_CHECK]);
const currentStep = ref(cloneDeep(pdConst.STANDARD_STEP_BASIC));
const cmpStepRefs = ref([ref(), ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'COD_PRDT_STT',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
  'SV_PRD_UNIT_CD',
  'SV_VST_PRD_CD',
  'RENTAL_SELL_DTL_TP_CD', // 렌탈 판매상세유형 : 판매유형 - 2
  'MSH_SELL_DTL_TP_CD', // 멤버십 판매상세유형 : 판매유형 - 3
);
codes.COD_YN.map((item) => {
  item.codeName = item.codeId;
  item.changed = true;
  return item;
});
async function onClickReset() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value.resetData) {
      await item.value?.resetData();
    }
  }));
}

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/common/product/standards/${currentPdCd.value}`);
    // TODO 화면닫기
    router.push({ path: '/product/zwpdc-sale-product-list' });
  }
}

async function getSaveData() {
  const subList = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    const saveData = await item.value?.getSaveData();
    if (await saveData) {
      // console.log(`${idx}saveData : `, saveData);
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      if (saveData[bas]) {
        if (subList[bas]?.cols) {
          saveData[bas].cols += subList[bas].cols;
        }
        subList[bas] = pdMergeBy(subList[bas], saveData[bas]);
      }
      if (saveData[dtl]) {
        subList[dtl] = pdMergeBy(subList[dtl], saveData[dtl], pdConst.PD_DTL_GRP_ID);
      }
      if (saveData[ecom]) {
        subList[ecom] = pdMergeBy(subList[ecom], saveData[ecom], 'pdExtsPrpGrpCd');
      }
      if (saveData[prcd]) {
        subList[prcd] = pdMergeBy(subList[prcd], saveData[prcd], pdConst.PRC_STD_ROW_ID);
      }
      if (saveData[prcfd]) {
        subList[prcfd] = pdMergeBy(subList[prcfd], saveData[prcfd], pdConst.PRC_FNL_ROW_ID);
      }
      if (saveData[rel]) {
        subList[rel] = pdMergeBy(subList[rel], saveData[rel]);
      }
      if (saveData[prumd]) {
        subList[prumd] = saveData[prumd];
      }
      if (saveData[pdConst.RELATION_PRODUCTS]) {
        subList[pdConst.RELATION_PRODUCTS] = saveData[pdConst.RELATION_PRODUCTS];
        const services = saveData[pdConst.RELATION_PRODUCTS]
          ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
        codes.svPdCd = services?.map(({ pdNm, pdCd }) => ({
          codeId: pdCd, codeName: pdNm,
        }));
      }
      if (saveData[pdConst.REMOVE_ROWS]) {
        subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], saveData[pdConst.REMOVE_ROWS]);
        // console.log('removeRows : ', subList[pdConst.REMOVE_ROWS]);
        subList[prcd] = pdRemoveBy(subList[prcd], subList[pdConst.REMOVE_ROWS]);
        subList[prcfd] = pdRemoveBy(subList[prcfd], subList[pdConst.REMOVE_ROWS]);
      }
    }
  }));
  console.log('subList : ', subList);
  return subList;
}

async function onClickNextStep() {
  const currentStepIndex = currentStep.value.step - 1;
  // 현재 Step 필수여부 확인
  const currentStepRef = await cmpStepRefs.value[currentStepIndex].value;
  if (isEmpty(currentStepRef)) {
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
    return;
  }
  const isValidOk = await (cmpStepRefs.value[currentStepIndex].value?.validateProps());
  if (!isValidOk) {
    return;
  }
  prevStepData.value = await getSaveData();

  // Child 페이지 내에서 다음 스텝이 없으면(false), 현재 페이지에서 다음으로 진행
  const isMovedInnerStep = currentStepRef?.moveNextStep ? await currentStepRef?.moveNextStep() : false;
  if (!isMovedInnerStep) {
    const nextStepRef = cmpStepRefs.value[currentStepIndex + 1]?.value;
    if (nextStepRef && nextStepRef.resetFirstStep) {
      await nextStepRef.resetFirstStep();
    }
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
  }
}

async function onClickPrevStep() {
  const currentStepIndex = currentStep.value.step - 1;
  prevStepData.value = await getSaveData();
  const currentStepRef = await cmpStepRefs.value[currentStepIndex]?.value;
  // Child 페이지 내에서 이전 스텝이 없으면(false), 현재 페이지에서 이전으로 진행
  const isMovedInnerStep = currentStepRef?.movePrevStep ? await currentStepRef?.movePrevStep() : false;
  if (!isMovedInnerStep) {
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex - 1]);
  }
}

async function onClickStep() {
  const stepName = currentStep.value?.name;
  console.log('WwpdcStandardMgtM - onClickStep : ', stepName);
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
  console.log('WwpdcStandardMgtM - onClickStep : ', currentStep.value);
}

async function onClickSubTab() {
  // console.log('WwpdcStandardMgtM - onClickSubTab - ', clickedTab);
  prevStepData.value = await getSaveData();
}

async function fetchProduct() {
  prevStepData.value = {};
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/common/product/standards/${currentPdCd.value}`);
    console.log('WwpdcStandardMgtM - fetchProduct - res.data', res.data);
    prevStepData.value[bas] = res.data[bas];
    prevStepData.value[dtl] = res.data[dtl];
    prevStepData.value[ecom] = res.data[ecom];
    prevStepData.value[prcd] = res.data[prcd];
    prevStepData.value[prcfd] = res.data[prcfd];
    prevStepData.value[rel] = res.data[rel];
    prevStepData.value[prumd] = res.data[prumd];
    prevStepData.value[pdConst.RELATION_PRODUCTS] = res.data[pdConst.RELATION_PRODUCTS];
    // console.log('res.data : ', res.data);
    const services = prevStepData.value[pdConst.RELATION_PRODUCTS]
      ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
    codes.svPdCd = services?.map(({ pdNm, pdCd }) => ({
      codeId: pdCd, codeName: pdNm,
    }));
    isTempSaveBtn.value = prevStepData.value[bas].tempSaveYn === 'Y';
  }
}

async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    let modifiedOk = true;
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (modifiedOk) {
        modifiedOk = await item.value?.isModifiedProps(false);
      }
    }));
  }

  // 2. Step별 필수여부 확인
  let isValidOk = true;
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (!await item.value.validateProps()) {
      isValidOk = false;
      currentStep.value = cloneDeep(regSteps.value[idx]);
    }
  }));
  if (!isValidOk) {
    return;
  }

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData();
  if (tempSaveYn === 'N' && isTempSaveBtn.value) {
    subList[bas].tempSaveYn = tempSaveYn;
  } else if (isEmpty(currentPdCd.value)) {
    subList[bas].tempSaveYn = tempSaveYn;
  } else if (isEmpty(subList[bas].tempSaveYn)) {
    subList[bas].tempSaveYn = 'Y';
  }
  console.log('WwpdcStandardMgtM - onClickSave - subList : ', subList);

  // 4. 생성 or 저장
  let rtn;
  if (!isCreate.value) {
    rtn = await dataService.put(`/sms/common/product/standards/${currentPdCd.value}`, subList);
  } else {
    rtn = await dataService.post('/sms/common/product/standards', subList);
  }

  // 5. 생성 이후 Step 설정
  notify(t('MSG_ALT_SAVE_DATA'));
  if (isTempSaveBtn.value) {
    // 임시저장
    currentPdCd.value = rtn.data?.data?.pdCd;
    isCreate.value = isEmpty(currentPdCd.value);
    router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-standard-mgt', replace: true, query: { pdCd: currentPdCd.value } });
  } else {
    // router.push({ path: '/product/zwpdc-sale-product-list', replace: true, query: { searchYn: 'Y' } });
  }
}

// 판매상세유형 코드 설정
async function setSellDetailTypeCodes(sellTpCd, isReset = false) {
  const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
  if (mgtNameFields.sellTpDtlCd) {
    if (isReset) {
      mgtNameFields.sellTpDtlCd.initValue = '';
    }
    if (sellTpCd === '2') {
      mgtNameFields.sellTpDtlCd.readonly = false;
      mgtNameFields.sellTpDtlCd.codes = codes.RENTAL_SELL_DTL_TP_CD;
    } else if (sellTpCd === '3') {
      mgtNameFields.sellTpDtlCd.readonly = false;
      mgtNameFields.sellTpDtlCd.codes = codes.MSH_SELL_DTL_TP_CD;
    } else {
      mgtNameFields.sellTpDtlCd.readonly = true;
    }
  }
}

async function onUpdateBasicValue(field) {
  if (field.colNm === 'sellTpCd') {
    setSellDetailTypeCodes(field.initValue, true);
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchProduct();
  } else {
    isTempSaveBtn.value = true;
  }
  isCreate.value = isEmpty(currentPdCd.value);
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  console.log(`currentPdCd.value : ${currentPdCd.value}, route.params.pdCd : ${pdCd}`);
  if (currentPdCd.value !== pdCd && pdCd) {
    isCreate.value = isEmpty(pdCd);
    currentStep.value = cloneDeep(pdConst.STANDARD_STEP_BASIC);
    if (isCreate.value) {
      isTempSaveBtn.value = true;
    }
    currentPdCd.value = pdCd;
    await fetchProduct();
  }
}, { immediate: true });

// watch(() => route.params.pdCd, async (pdCd) => {
//   if (currentPdCd.value && isEmpty(pdCd)) {
//     currentStep.value = pdConst.STANDARD_STEP_BASIC;
//     await onClickReset();
//   }
// }, { immediate: true });

onMounted(async () => {
  const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
  await setSellDetailTypeCodes(mgtNameFields.sellTpCd?.initValue);
});

</script>
<style scoped></style>
