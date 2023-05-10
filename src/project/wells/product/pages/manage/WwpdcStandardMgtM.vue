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
    <kw-observer
      ref="obsMainRef"
      name="obsMain"
    >
      <div class="normal-area normal-area--button-set-bottom">
        <kw-stepper
          v-model="currentStep.name"
          heading-text
          :header-nav="!isTempSaveBtn || passedStep > 0"
          @update:model-value="onClickStep()"
        >
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_BASIC.step"
            :name="pdConst.STANDARD_STEP_BASIC.name"
            :title="$t('MSG_TXT_BAS_ATTR_REG')"
            :prefix="pdConst.STANDARD_STEP_BASIC.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_BASIC.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_REL_PROD.step"
            :name="pdConst.STANDARD_STEP_REL_PROD.name"
            :title="$t('MSG_TXT_REL_PRDT_SEL')"
            :prefix="pdConst.STANDARD_STEP_REL_PROD.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_REL_PROD.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_MANAGE.step"
            :name="pdConst.STANDARD_STEP_MANAGE.name"
            :title="$t('MSG_TXT_MGT_ATTR_REG')"
            :prefix="pdConst.STANDARD_STEP_MANAGE.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_MANAGE.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_PRICE.step"
            :name="pdConst.STANDARD_STEP_PRICE.name"
            :title="$t('MSG_TXT_PRC_INFO_REG')"
            :prefix="pdConst.STANDARD_STEP_PRICE.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_PRICE.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_CHECK.step"
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
              is-reg-check-page
            />
          </kw-step-panel>
        </kw-stepper>
        <div class="button-set--bottom">
          <div class="button-set--bottom-left">
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step > 1"
              :label="$t('MSG_BTN_PREV')"
              class="ml8"
              @click="onClickPrevStep"
            />
          </div>
          <div class="button-set--bottom-right">
            <kw-btn
              v-show="!isCreate"
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
            />
            <!-- <kw-btn
            v-show="currentStep.step === 1 && isCreate"
            :label="$t('MSG_BTN_INTL')"
            class="ml8"
            @click="onClickReset"
          /> -->
            <kw-btn
              :label="$t('MSG_BTN_CANCEL')"
              class="ml8"
              @click="onClickCancel()"
            />
            <kw-btn
              v-if="currentStep.step < regSteps.length && isTempSaveBtn"
              :label="$t('MSG_BTN_TMP_SAVE')"
              class="ml8"
              @click="onClickSave('Y')"
            />
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step < regSteps.length"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNextStep"
            />
            <kw-btn
              v-show="!isTempSaveBtn || currentStep.step === regSteps.length"
              :label="$t('MSG_BTN_SAVE')"
              class="ml8"
              primary
              @click="onClickSave('N')"
            />
          </div>
        </div>
      </div>
    </kw-observer>
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
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref(), ref(), ref()]);
const removePriceRows = ref([]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);
const obsMainRef = ref();

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

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/standards/${currentPdCd.value}`);
    await obsMainRef.value.reset();
    await router.close();
    await router.push({ path: '/product/zwpdc-sale-product-list', query: { searchYn: 'Y' } });
  }
}

async function getSaveData() {
  const subList = { isModifiedProp: false, isOnlyFileModified: false, isModifiedPrice: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const saveData = await item.value?.getSaveData();
    const isModified = await item.value.isModifiedProps();
    if (await saveData) {
      // console.log(`${idx}saveData : `, saveData);
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      // 기본속성, 관리 속성 수정여부
      if (await isModified && (idx === 0 || idx === 2)) {
        if (idx === 0 && isModified) {
          subList.isOnlyFileModified = await item.value.isOnlyFileModified();
        } else if (idx === 2 && isModified) {
          subList.isOnlyFileModified = false;
        }
        subList.isModifiedProp = true;
      }
      // 가격 수정여부
      if (await isModified && idx === 3) {
        subList.isModifiedPrice = true;
      }
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
        removePriceRows.value = pdMergeBy(removePriceRows.value, saveData[pdConst.REMOVE_ROWS]);
      }
    }
  }));
  if (removePriceRows.value.length) {
    // console.log('removePriceRows - prev : ', subList);
    // console.log('removePriceRows.value : ', removePriceRows.value);
    subList[prcd] = pdRemoveBy(subList[prcd], removePriceRows.value);
    subList[prcfd] = pdRemoveBy(subList[prcfd], removePriceRows.value);
    // console.log('removePriceRows - after : ', subList);
  }
  console.log('WwpdcStandardMgtM - getSaveData - subList.isOnlyFileModified : ', subList.isOnlyFileModified);
  // console.log('WwpdcStandardMgtM - getSaveData - subList : ', subList);
  return subList;
}

// 다음 버튼
async function onClickNextStep() {
  const currentStepIndex = currentStep.value.step - 1;
  // 현재 Step 필수여부 확인
  const currentStepRef = await cmpStepRefs.value[currentStepIndex].value;
  if (isEmpty(currentStepRef)) {
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
    return;
  }
  // 가격의 경우 별도 Step
  const isValidOk = currentStepIndex === 3
    ? await (cmpStepRefs.value[currentStepIndex].value?.validateStepProps())
    : await (cmpStepRefs.value[currentStepIndex].value?.validateProps());
  if (!isValidOk) {
    return;
  }

  // 다음 이동
  prevStepData.value = await getSaveData();
  // Child 페이지 내에서 다음 스텝이 없으면(false), 현재 페이지에서 다음으로 진행
  const isMovedInnerStep = currentStepRef?.moveNextStep ? await currentStepRef?.moveNextStep() : false;
  if (!isMovedInnerStep) {
    const nextStepRef = cmpStepRefs.value[currentStepIndex + 1]?.value;
    if (nextStepRef && nextStepRef.resetFirstStep) {
      await nextStepRef.resetFirstStep();
    }
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
    passedStep.value = currentStep.value.step;
  }
}

// 이전 버튼
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

// Stepper 클릭
async function onClickStep() {
  const stepName = currentStep.value?.name;
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
}

// 하위 컴포넌트 탭 이동시 호출
async function onClickSubTab() {
  prevStepData.value = await getSaveData();
}

// 취소 버튼
async function onClickCancel() {
  if (await obsMainRef.value.confirmIfIsModified()) {
    await obsMainRef.value.reset();
    await router.close();
  }
}

async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

async function fetchProduct() {
  removePriceRows.value = [];
  if (currentPdCd.value) {
    const initData = {};
    const res = await dataService.get(`/sms/wells/product/standards/${currentPdCd.value}`);
    // console.log('WwpdcStandardMgtM - fetchProduct - res.data', res.data);
    initData[bas] = res.data[bas];
    initData[dtl] = res.data[dtl];
    initData[ecom] = res.data[ecom];
    initData[prcd] = res.data[prcd];
    initData[prcfd] = res.data[prcfd];
    initData[rel] = res.data[rel];
    initData[prumd] = res.data[prumd];
    initData[pdConst.RELATION_PRODUCTS] = res.data[pdConst.RELATION_PRODUCTS];
    const services = initData[pdConst.RELATION_PRODUCTS]
      ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
    codes.svPdCd = services?.map(({ pdNm, pdCd }) => ({
      codeId: pdCd, codeName: pdNm,
    }));
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
    await init();
  }
}

async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    let modifiedOk = false;
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (!modifiedOk) {
        if (await item.value.isModifiedProps()) {
          modifiedOk = true;
        }
      }
    }));
    if (!modifiedOk) {
      notify(t('MSG_ALT_NO_CHG_CNTN'));
      return;
    }
  }

  // 2. Step별 필수여부 확인
  let isValidOk = true;
  if (tempSaveYn === 'Y' && isTempSaveBtn.value) {
    isValidOk = await cmpStepRefs.value[0].value.validateProps();
  } else {
    await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
      if (isValidOk && !await item.value.validateProps()) {
        isValidOk = false;
        currentStep.value = cloneDeep(regSteps.value[idx]);
      }
    }));
  }
  if (!isValidOk) {
    return;
  }

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData();
  if (tempSaveYn === 'N' && isTempSaveBtn.value) {
    subList.isModifiedProp = true;
    subList[bas].tempSaveYn = tempSaveYn;
  } else if (isEmpty(currentPdCd.value)) {
    subList[bas].tempSaveYn = 'Y';
  } else {
    subList[bas].tempSaveYn = tempSaveYn;
  }
  // console.log('WwpdcStandardMgtM - onClickSave - subList : ', subList);

  // 4. 생성 or 저장
  let rtn;
  if (!isCreate.value) {
    rtn = await dataService.put(`/sms/wells/product/standards/${currentPdCd.value}`, subList);
  } else {
    rtn = await dataService.post('/sms/wells/product/standards', subList);
  }
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();

  if (tempSaveYn === 'N') {
    // 목록으로 이동
    await router.close();
    await router.push({ path: '/product/zwpdc-sale-product-list', query: { searchYn: 'Y' } });
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      currentPdCd.value = rtn.data?.data?.pdCd;
      isCreate.value = isEmpty(currentPdCd.value);
      await router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-standard-mgt', query: { pdCd: currentPdCd.value } });
    } else {
      await fetchProduct();
    }
  }
}

// 판매상세유형 코드 설정
async function setSellDetailTypeCodes(sellTpCd, isReset = false) {
  const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
  if (mgtNameFields.sellTpDtlCd) {
    if (isReset) {
      mgtNameFields.sellTpDtlCd.initValue = '';
    }
    mgtNameFields.sellTpDtlCd.codes = codes.SELL_TP_DTL_CD.filter((item) => item.userDfn02 === sellTpCd);
  }
}

// 메타 속성값 수정시 호출
async function onUpdateBasicValue(field) {
  if (field.colNm === 'sellTpCd') {
    // 판매유형
    setSellDetailTypeCodes(field.initValue, true);
  }
}

// 초기화
async function onClickReset() {
  currentPdCd.value = '';
  isCreate.value = true;
  isTempSaveBtn.value = true;
  currentStep.value = cloneDeep(pdConst.STANDARD_STEP_BASIC);
  passedStep.value = 0;
  prevStepData.value = {};
  removePriceRows.value = [];
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
    if (item.value?.init) await item.value?.init();
  }));
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

// 화면(탭) OPEN 상태에서, 다른 상품코드로 정보 변환
watch(() => route.params.pdCd, async (pdCd) => {
  if (!route.path.includes('zwpdc-sale-product-list')) return;
  console.log(`WwpdcStandardMgtM - currentPdCd.value : ${currentPdCd.value}, route.params.pdCd : ${pdCd}`, route);
  if (pdCd && currentPdCd.value !== pdCd) {
    await onClickReset();
    currentPdCd.value = pdCd;
    isCreate.value = isEmpty(currentPdCd.value);
    if (isCreate.value) {
      isTempSaveBtn.value = true;
    }
    await fetchProduct();
  }
}, { immediate: true });

// 화면(탭) OPEN 상태에서, 신규등록
watch(() => route.params.newRegYn, async (newRegYn) => {
  if (!route.path.includes('zwpdc-sale-product-list')) return;
  console.log(`WwpdcStandardMgtM - newRegYn : ${newRegYn}`, route);
  if (newRegYn === 'Y') {
    await onClickReset();
  }
});

// 화면(탭) OPEN 상태에서, 상품정보 갱신
watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('zwpdc-sale-product-list')) return;
  console.log(`WwpdcStandardMgtM - watch - route.params.reloadYn: ${reloadYn}`, route);
  if (reloadYn === 'Y') {
    currentStep.value = cloneDeep(pdConst.STANDARD_STEP_BASIC);
    passedStep.value = 0;
    await fetchProduct();
  }
});

onMounted(async () => {
  // 판매 상세 유형 초기값 설정
  const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
  await setSellDetailTypeCodes(mgtNameFields.sellTpCd?.initValue);
});

</script>
<style scoped></style>
