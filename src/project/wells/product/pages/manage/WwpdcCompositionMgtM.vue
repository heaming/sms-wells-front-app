<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtM - (판매) 상품목록 - 복합상품 등록/변경
                ( Z-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 복합상품 등록/변경 프로그램
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
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_BASIC.step"
            :name="pdConst.COMPOSITION_STEP_BASIC.name"
            :title="$t('MSG_TXT_BAS_ATTR_REG')"
            :prefix="pdConst.COMPOSITION_STEP_BASIC.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_BASIC.step"
            :sub-text="subTitle"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_REL_PROD.step"
            :name="pdConst.COMPOSITION_STEP_REL_PROD.name"
            :title="$t('MSG_TXT_REL_PRDT_SEL')"
            :prefix="pdConst.COMPOSITION_STEP_REL_PROD.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_REL_PROD.step"
            :sub-text="subTitle"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_PRICE.step"
            :name="pdConst.COMPOSITION_STEP_PRICE.name"
            :title="$t('MSG_TXT_PRC_INFO_REG')"
            :prefix="pdConst.COMPOSITION_STEP_PRICE.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_PRICE.step"
            :sub-text="subTitle"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_CHECK.step"
            :name="pdConst.COMPOSITION_STEP_CHECK.name"
            :title="$t('MSG_TXT_CHK_REG_INFO')"
            :prefix="pdConst.COMPOSITION_STEP_CHECK.step"
            :sub-text="subTitle"
          />
          <kw-step-panel :name="pdConst.COMPOSITION_STEP_BASIC.name">
            <zwpdc-prop-groups-mgt
              :ref="cmpStepRefs[0]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :pd-tp-cd="pdConst.PD_TP_CD_COMPOSITION"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.COMPOSITION_STEP_REL_PROD.name">
            <wwpdc-composition-mgt-m-rel
              :ref="cmpStepRefs[1]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :codes="codes"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.COMPOSITION_STEP_PRICE.name">
            <wwpdc-composition-mgt-m-price
              :ref="cmpStepRefs[2]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :codes="codes"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.COMPOSITION_STEP_CHECK.name">
            <wwpdc-composition-dtl-m-contents
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
import WwpdcCompositionMgtMPrice from './WwpdcCompositionMgtMPrice.vue';
import WwpdcCompositionMgtMRel from './WwpdcCompositionMgtMRel.vue';
import WwpdcCompositionDtlMContents from './WwpdcCompositionDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
  newRegYn: { type: String, default: 'N' },
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
const regSteps = ref([pdConst.COMPOSITION_STEP_BASIC, pdConst.COMPOSITION_STEP_REL_PROD,
  pdConst.COMPOSITION_STEP_PRICE, pdConst.COMPOSITION_STEP_CHECK]);
const currentStep = ref(cloneDeep(pdConst.COMPOSITION_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);
const obsMainRef = ref();
const subTitle = ref();

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
);

async function getSaveData() {
  const subList = { isModifiedProp: false, isOnlyFileModified: false, isModifiedPrice: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const saveData = await item.value.getSaveData();
    const isModified = await item.value.isModifiedProps();
    if (await saveData) {
      // console.log(`${idx}-${isModified}saveData : `, saveData);
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      // 기본속성, 관리 속성 수정여부
      if (await isModified && idx === (pdConst.COMPOSITION_STEP_BASIC.step - 1)) {
        subList.isOnlyFileModified = await item.value.isOnlyFileModified();
        subList.isModifiedProp = true;
      }
      // 가격 수정여부
      if (await isModified && idx === (pdConst.COMPOSITION_STEP_PRICE.step - 1)) {
        subList.isModifiedPrice = true;
      }
      if (saveData[bas]) {
        if (subList[bas]?.cols) {
          saveData[bas].cols += subList[bas].cols;
        }
        subList[bas] = pdMergeBy(subList[bas], saveData[bas]);
      }
      if (saveData[dtl]) {
        // 대상연령단위 예외 코딩
        const subLrnnAgeUnitCds = [];
        saveData[dtl] = saveData[dtl].reduce((rtn, chkItem) => {
          if (chkItem.pdDtlDvCd === '04' && chkItem[pdConst.PD_DTL_GRP_ID] !== 'pdDtlPrpVal01') {
            subLrnnAgeUnitCds.push(chkItem);
          } else {
            rtn.push(chkItem);
          }
          return rtn;
        }, []);
        // console.log('subLrnnAgeUnitCds : ', subLrnnAgeUnitCds);
        subList[dtl] = pdMergeBy(subList[dtl], saveData[dtl], pdConst.PD_DTL_GRP_ID);
        if (subLrnnAgeUnitCds.length) {
        // 대상연령단위 예외 코딩
          subList[dtl] = subList[dtl].map((chkItem) => {
            if (chkItem.pdDtlDvCd === '04') {
              chkItem.pdDtlPrpVal02 = subLrnnAgeUnitCds?.find((fItm) => fItm.pdDtlPrpVal02)?.pdDtlPrpVal02;
              chkItem.pdDtlPrpVal03 = subLrnnAgeUnitCds?.find((fItm) => fItm.pdDtlPrpVal03)?.pdDtlPrpVal03;
            }
            return chkItem;
          });
        }
      }
      if (saveData[ecom]) {
        subList[ecom] = pdMergeBy(subList[ecom], saveData[ecom], pdConst.PD_META_GRP_CD);
      }
      if (saveData[prcd]) {
        subList[prcd] = pdMergeBy(subList[prcd], saveData[prcd], pdConst.PRC_STD_ROW_ID);
        subList[prcd] = pdRemoveBy(subList[prcd], saveData[pdConst.REMOVE_ROWS]);
      }
      if (saveData[prcfd]) {
        subList[prcfd] = pdMergeBy(subList[prcfd], saveData[prcfd], pdConst.PRC_FNL_ROW_ID);
        subList[prcfd] = pdRemoveBy(subList[prcfd], saveData[pdConst.REMOVE_ROWS]);
      }
      if (rel in saveData) {
        subList[rel] = saveData[rel];
      }
      if (saveData[pdConst.RELATION_PRODUCTS]) {
        subList[pdConst.RELATION_PRODUCTS] = saveData[pdConst.RELATION_PRODUCTS];
      }
      // console.log('WwpdcCompositionMgtM - getSaveData - subList : ', subList);
    }
  }));
  // console.log('WwpdcCompositionMgtM - getSaveData - subList : ', subList);
  subTitle.value = subList[bas].pdCd ? `${subList[bas].pdNm} (${subList[bas].pdCd})` : subList[bas].pdNm;
  return subList;
}

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/compositions/${currentPdCd.value}`);
    await obsMainRef.value.reset();
    await router.close();
    await router.push({ path: '/product/zwpdc-sale-product-list', query: { searchYn: 'Y' } });
  }
}

// 화면이동
async function moveStepByIndex(stepIndex) {
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value[stepIndex]);
}

// 화면이동 - 스텝명
async function moveStepByName(stepName) {
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
}

async function isValidStep(stepIndex, isMoveProblemStep = false) {
  const currentStepIndex = currentStep.value.step - 1;
  const isValidOk = await (cmpStepRefs.value[stepIndex].value.validateProps());
  if (!isValidOk && isMoveProblemStep && stepIndex !== currentStepIndex) {
    await moveStepByIndex(stepIndex);
  }
  return isValidOk;
}

// 다음 버튼
async function onClickNextStep() {
  const currentStepIndex = currentStep.value.step - 1;
  // 현재 Step 필수여부 확인
  if (!(await isValidStep(currentStepIndex))) {
    return;
  }

  // 다음 이동
  const currentStepRef = await cmpStepRefs.value[currentStepIndex].value;
  // Child 페이지 내에서 다음 스텝이 없으면(false), 현재 페이지에서 다음으로 진행
  prevStepData.value = await getSaveData();
  const isMovedInnerStep = currentStepRef?.moveNextStep ? await currentStepRef?.moveNextStep() : false;
  if (!isMovedInnerStep) {
    const nextStepRef = cmpStepRefs.value[currentStepIndex + 1]?.value;
    if (nextStepRef && nextStepRef.resetFirstStep) {
      await nextStepRef.resetFirstStep();
    }
    await moveStepByIndex(currentStepIndex + 1);
    passedStep.value = currentStep.value.step;
  }
}

// 이전 버튼
async function onClickPrevStep() {
  const currentStepIndex = currentStep.value.step - 1;
  const currentStepRef = await cmpStepRefs.value[currentStepIndex]?.value;
  // Child 페이지 내에서 이전 스텝이 없으면(false), 현재 페이지에서 이전으로 진행
  prevStepData.value = await getSaveData();
  const isMovedInnerStep = currentStepRef?.movePrevStep ? await currentStepRef?.movePrevStep() : false;
  if (!isMovedInnerStep) {
    await moveStepByIndex(currentStepIndex - 1);
  }
}

// Stepper 클릭
async function onClickStep() {
  const stepName = currentStep.value?.name;
  await moveStepByName(stepName);
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
  if (currentPdCd.value) {
    const initData = {};
    const res = await dataService.get(`/sms/wells/product/compositions/${currentPdCd.value}`);
    console.log('WwpdcCompositionMgtM - fetchProduct - res.data', res.data);
    initData[bas] = res.data[bas];
    initData[dtl] = res.data[dtl];
    initData[ecom] = res.data[ecom];
    initData[prcd] = res.data[prcd];
    initData[prcfd] = res.data[prcfd];
    initData[rel] = res.data[rel];
    initData[prumd] = res.data[prumd];
    initData[pdConst.RELATION_PRODUCTS] = res.data[pdConst.RELATION_PRODUCTS];
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
    subTitle.value = initData[bas].pdCd ? `${initData[bas].pdNm} (${initData[bas].pdCd})` : initData[bas].pdNm;
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
        await moveStepByIndex(idx);
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
  // console.log('WwpdcCompositionMgtM - onClickSave - subList : ', subList);

  // 4. 생성 or 저장
  let rtn;
  if (!isCreate.value) {
    rtn = await dataService.put(`/sms/wells/product/compositions/${currentPdCd.value}`, subList);
  } else {
    rtn = await dataService.post('/sms/wells/product/compositions', subList);
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
      router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-composition-mgt', query: { pdCd: currentPdCd.value } });
    } else {
      await fetchProduct();
    }
  }
}

// 초기화
async function onClickReset() {
  currentPdCd.value = '';
  isCreate.value = true;
  isTempSaveBtn.value = true;
  currentStep.value = cloneDeep(pdConst.COMPOSITION_STEP_BASIC);
  passedStep.value = 0;
  prevStepData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
    if (item.value?.init) await item.value?.init();
  }));
  await fetchProduct();
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
  console.log(`WwpdcCompositionMgtM - currentPdCd.value : ${currentPdCd.value}, route.params.pdCd : ${pdCd}`, route);
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
  console.log(`WwpdcCompositionMgtM - newRegYn : ${newRegYn}`, route);
  if (newRegYn === 'Y') {
    await onClickReset();
  }
});

// 화면(탭) OPEN 상태에서, 상품정보 갱신
watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('zwpdc-sale-product-list')) return;
  console.log(`WwpdcCompositionMgtM - watch - route.params.reloadYn: ${reloadYn}`, route);
  if (reloadYn === 'Y') {
    currentStep.value = cloneDeep(pdConst.COMPOSITION_STEP_BASIC);
    passedStep.value = 0;
    await fetchProduct();
  }
});

</script>
<style scoped></style>
