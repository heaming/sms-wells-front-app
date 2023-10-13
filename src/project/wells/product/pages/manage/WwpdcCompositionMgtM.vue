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
          <!-- 기본속성 등록 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_BASIC.step"
            :name="pdConst.COMPOSITION_STEP_BASIC.name"
            :title="$t('MSG_TXT_PROP_REG')"
            :prefix="pdConst.COMPOSITION_STEP_BASIC.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_BASIC.step"
            :sub-text="subTitle"
          />
          <!-- 연결상품 선택 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_REL_PROD.step"
            :name="pdConst.COMPOSITION_STEP_REL_PROD.name"
            :title="$t('MSG_TXT_REL_PRDT_SEL')"
            :prefix="pdConst.COMPOSITION_STEP_REL_PROD.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_REL_PROD.step"
            :sub-text="subTitle"
          />
          <!-- 가격 정보등록-->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.COMPOSITION_STEP_PRICE.step"
            :name="pdConst.COMPOSITION_STEP_PRICE.name"
            :title="$t('MSG_TXT_PRC_INFO_REG')"
            :prefix="pdConst.COMPOSITION_STEP_PRICE.step"
            :done="currentStep.step > pdConst.COMPOSITION_STEP_PRICE.step"
            :sub-text="subTitle"
          />
          <!-- 입력정보확인 -->
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
              is-auto-group-title
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
            <!-- 이전 -->
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step > 1"
              :label="$t('MSG_BTN_PREV')"
              class="ml8"
              @click="onClickPrevStep"
            />
          </div>
          <div class="button-set--bottom-right">
            <!-- 삭제 -->
            <kw-btn
              v-show="!isCreate"
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
            />
            <!-- 초기화 -->
            <kw-btn
              v-show="!isCreate && currentStep.step !== pdConst.COMPOSITION_STEP_CHECK.step"
              :label="$t('MSG_BTN_INTL')"
              class="ml8"
              @click="onClickReset"
            />
            <!-- 취소 -->
            <kw-btn
              :label="$t('MSG_BTN_CANCEL')"
              class="ml8"
              @click="onClickCancel()"
            />
            <!-- 임시저장 -->
            <kw-btn
              v-if="currentStep.step < regSteps.length && isTempSaveBtn"
              :label="$t('MSG_BTN_TMP_SAVE')"
              class="ml8"
              @click="onClickSave('Y')"
            />
            <!-- 다음 -->
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step < regSteps.length"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNextStep"
            />
            <!-- 저장 -->
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
import { isEmpty, cloneDeep, isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, pdRemoveBy, getCopyProductInfo, isValidToProdcutSave } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcCompositionMgtMPrice from './WwpdcCompositionMgtMPrice.vue';
import WwpdcCompositionMgtMRel from './WwpdcCompositionMgtMRel.vue';
import WwpdcCompositionDtlMContents from './WwpdcCompositionDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  newRegYn: { type: String, default: null },
  reloadYn: { type: String, default: null },
  copyPdCd: { type: String, default: null },
  propWatch: { type: Object, default: null },
});

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

const prevProps = ref({});
const fnlMdfcDtm = ref();
const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.COMPOSITION_STEP_BASIC, pdConst.COMPOSITION_STEP_REL_PROD,
  pdConst.COMPOSITION_STEP_PRICE, pdConst.COMPOSITION_STEP_CHECK]);
const currentStep = ref(cloneDeep(pdConst.COMPOSITION_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const currentNewRegYn = ref();
const currentReloadYn = ref();
const currentCopyPdCd = ref();
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

// 상품 수정여부 검증
async function isModifiedCheck() {
  let modifiedOk = false;
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (!modifiedOk) {
      if (await item.value.isModifiedProps()) {
        modifiedOk = true;
      }
    }
  }));
  return modifiedOk;
}

async function getSaveData() {
  // 데이터가 많아서 수정여부를 체크하여 미수정시, 텝 데이터 수집을 하지않음.
  if (!(await isModifiedCheck())) {
    return prevStepData.value;
  }

  const subList = { isModifiedProp: false,
    isOnlyFileModified: false,
    isModifiedPrice: false,
    isModifiedRelation: false };
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
      // 연결상품 수정여부
      if (await isModified && idx === (pdConst.COMPOSITION_STEP_REL_PROD.step - 1)) {
        subList.isModifiedRelation = true;
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

async function goList() {
  await router.push({ path: '/product/zwpdc-sale-product-list', state: { stateParam: { searchYn: 'Y', pdTpCd: pdConst.PD_TP_CD_COMPOSITION } } });
}

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/compositions/${currentPdCd.value}`);
    await obsMainRef.value.reset();
    await router.close();
    await goList();
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
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
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
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex - 1]);
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
    const res = await dataService.get(`/sms/wells/product/compositions/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    // console.log('WwpdcCompositionMgtM - fetchProduct - res.data', res.data);
    prevStepData.value = res.data;
    fnlMdfcDtm.value = prevStepData.value[bas].fnlMdfcDtm;
    isTempSaveBtn.value = prevStepData.value[bas].tempSaveYn === 'Y';
  } else if (currentCopyPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/compositions/${currentCopyPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = await getCopyProductInfo(res.data);
    isTempSaveBtn.value = 'Y';
  }
  subTitle.value = prevStepData.value[bas].pdCd ? `${prevStepData.value[bas].pdNm} (${prevStepData.value[bas].pdCd})` : prevStepData.value[bas].pdNm;
  await init();
}

async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    if (!(await isModifiedCheck())) {
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
  if (isCreate.value) {
    rtn = await dataService.post('/sms/wells/product/compositions', subList);
  } else if (await isValidToProdcutSave(currentPdCd.value, fnlMdfcDtm.value, pdConst.PD_JOB_TYPE_EDIT)) {
    rtn = await dataService.put(`/sms/wells/product/compositions/${currentPdCd.value}`, subList);
  } else {
    return;
  }

  notify(t('MSG_ALT_SAVE_DATA'));
  await init();

  if (tempSaveYn === 'N') {
    // 목록으로 이동
    // await router.close();
    await goList();
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      const newPdCd = rtn.data?.data?.pdCd;
      await router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-composition-mgt', query: { pdCd: newPdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' } } });
    } else {
      await fetchProduct();
    }
  }
}

// 초기화
async function resetData() {
  if (isEmpty(currentPdCd.value)) {
    isCreate.value = true;
    passedStep.value = 0;
    isTempSaveBtn.value = true;
    subTitle.value = '';
  } else {
    isCreate.value = false;
  }
  currentStep.value = cloneDeep(pdConst.COMPOSITION_STEP_BASIC);
  prevStepData.value = {};
  fnlMdfcDtm.value = null;
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
    if (item.value?.init) await item.value?.init();
  }));
}

// 초기화 버튼
async function onClickReset() {
  // 조회항목을 초기화하시겠습니까?\n초기화 이후 STEP1으로 이동합니다.
  if (!await confirm(t('MSG_ALT_PD_RESET'))) return false;
  await resetData();
  await fetchProduct();
}

async function initProps() {
  const { pdCd, newRegYn, reloadYn, copyPdCd, propWatch } = props;
  currentPdCd.value = pdCd;
  currentNewRegYn.value = newRegYn;
  currentReloadYn.value = reloadYn;
  currentCopyPdCd.value = copyPdCd;
  if (currentPdCd.value || currentCopyPdCd.value) {
    await fetchProduct();
  } else {
    isTempSaveBtn.value = true;
  }
  isCreate.value = isEmpty(currentPdCd.value);
  prevProps.value = cloneDeep({ pdCd, newRegYn, reloadYn, copyPdCd, propWatch });
}

await initProps();

watch(() => props, async ({ pdCd, newRegYn, reloadYn, copyPdCd, propWatch }) => {
  // console.log(` WwpdcCompositionMgtM - watch - ${pdCd} : ${newRegYn} : ${reloadYn} : ${copyPdCd} : ${propWatch}`);
  const newProps = { pdCd, newRegYn, reloadYn, copyPdCd, propWatch };
  if (isEqual(newProps, prevProps.value)) {
    return;
  }
  prevProps.value = cloneDeep({ pdCd, newRegYn, reloadYn, copyPdCd, propWatch });
  if (pdCd && (currentPdCd.value !== pdCd || propWatch)) {
    // 상품코드 변경
    currentPdCd.value = pdCd;
    currentNewRegYn.value = 'N';
    currentReloadYn.value = 'N';
    currentCopyPdCd.value = '';
    await resetData();
    await fetchProduct();
    // TODO - mound func
  } else if (newRegYn && currentNewRegYn.value !== newRegYn) {
    // 신규등록
    currentPdCd.value = '';
    currentNewRegYn.value = newRegYn;
    currentReloadYn.value = 'N';
    currentCopyPdCd.value = '';
    if (newRegYn === 'Y') {
      await resetData();
    }
  } else if (reloadYn && currentReloadYn.value !== reloadYn && reloadYn === 'Y') {
    // Reload
    currentNewRegYn.value = 'N';
    currentReloadYn.value = reloadYn;
    currentCopyPdCd.value = '';
    if (reloadYn === 'Y') {
      await resetData();
      await fetchProduct();
    }
  } else if (copyPdCd && currentCopyPdCd.value !== copyPdCd) {
    // 복사
    currentPdCd.value = '';
    currentNewRegYn.value = 'N';
    currentReloadYn.value = 'N';
    currentCopyPdCd.value = copyPdCd;
    if (copyPdCd) {
      await resetData();
      await fetchProduct();
    }
  }
}, { deep: true });

</script>
<style scoped></style>
