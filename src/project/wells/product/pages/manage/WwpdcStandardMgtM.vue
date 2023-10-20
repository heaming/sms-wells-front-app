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
          <!-- 기본속성 등록 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_BASIC.step"
            :name="pdConst.STANDARD_STEP_BASIC.name"
            :title="$t('MSG_TXT_BAS_ATTR_REG')"
            :prefix="pdConst.STANDARD_STEP_BASIC.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_BASIC.step"
            :sub-text="subTitle"
          />
          <!-- 연결상품 선택-->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_REL_PROD.step"
            :name="pdConst.STANDARD_STEP_REL_PROD.name"
            :title="$t('MSG_TXT_REL_PRDT_SEL')"
            :prefix="pdConst.STANDARD_STEP_REL_PROD.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_REL_PROD.step"
            :sub-text="subTitle"
          />
          <!-- 관리속성 등록 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_MANAGE.step"
            :name="pdConst.STANDARD_STEP_MANAGE.name"
            :title="$t('MSG_TXT_MGT_ATTR_REG')"
            :prefix="pdConst.STANDARD_STEP_MANAGE.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_MANAGE.step"
            :sub-text="subTitle"
          />
          <!-- 가격정보 등록 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_PRICE.step"
            :name="pdConst.STANDARD_STEP_PRICE.name"
            :title="$t('MSG_TXT_PRC_INFO_REG')"
            :prefix="pdConst.STANDARD_STEP_PRICE.step"
            :done="currentStep.step > pdConst.STANDARD_STEP_PRICE.step"
            :sub-text="subTitle"
          />
          <!-- 등록정보확인 -->
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.STANDARD_STEP_CHECK.step"
            :name="pdConst.STANDARD_STEP_CHECK.name"
            :title="$t('MSG_TXT_CHK_REG_INFO')"
            :prefix="pdConst.STANDARD_STEP_CHECK.step"
            :sub-text="subTitle"
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
              @open-popup="openPopup"
              @update="onUpdateBasicValue"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.STANDARD_STEP_PRICE.name">
            <wwpdc-standard-mgt-m-price
              :ref="cmpStepRefs[3]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :codes="codes"
              @click-tab="onClickSubTab"
              @apply-data="applyData"
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
              v-show="!isCreate && currentStep.step !== pdConst.STANDARD_STEP_CHECK.step"
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
import dayjs from 'dayjs';
import { isEmpty, cloneDeep, isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames, pdMergeBy, pdRemoveBy, getCopyProductInfo, isValidToProdcutSave } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcStandardMgtMPrice from './WwpdcStandardMgtMPrice.vue';
import WwpdcStandardMgtMRel from './WwpdcStandardMgtMRel.vue';
import WwpdcStandardDtlMContents from './WwpdcStandardDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  newRegYn: { type: String, default: null }, // 신규등록 여부
  reloadYn: { type: String, default: null }, // 새로고침 여부
  copyPdCd: { type: String, default: null }, // 복사 상품코드 원본
  propWatch: { type: Object, default: null }, // Props 변경 여부
});

const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { modal, notify, confirm } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const rel = pdConst.TBL_PD_REL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;

const prevProps = ref({});
const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.STANDARD_STEP_BASIC, pdConst.STANDARD_STEP_REL_PROD,
  pdConst.STANDARD_STEP_MANAGE, pdConst.STANDARD_STEP_PRICE, pdConst.STANDARD_STEP_CHECK]);
const currentStep = ref(cloneDeep(pdConst.STANDARD_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref(), ref(), ref()]);
const removePriceRows = ref([]);
const prevStepData = ref({});
const currentPdCd = ref();
const currentNewRegYn = ref();
const currentReloadYn = ref();
const currentCopyPdCd = ref();
const fnlMdfcDtm = ref();
const isCreate = ref(false);
const obsMainRef = ref();
const subTitle = ref();

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
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

// 저장 데이터
async function getSaveData(isBatchCopy) {
  // 데이터가 많아서 수정여부를 체크하여 미수정시, 텝 데이터 수집을 하지않음.
  // isBatchCopy - Wells - 기준정보 - 가격 - 일괄복사 여부
  if (!(await isModifiedCheck()) && !isBatchCopy) {
    return prevStepData.value;
  }

  const subList = { isModifiedProp: false,
    isOnlyFileModified: false,
    isModifiedPrice: false,
    isModifiedRelation: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    // isBatchCopy - Wells - 기준정보 - 가격 - 일괄복사 여부
    const saveData = await item.value?.getSaveData(isBatchCopy);
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
      // 연결상품 수정여부
      if (await isModified && idx === (pdConst.STANDARD_STEP_REL_PROD.step - 1)) {
        subList.isModifiedRelation = true;
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
  // console.log('WwpdcStandardMgtM - getSaveData - subList.isOnlyFileModified : ', subList.isOnlyFileModified);
  // console.log('WwpdcStandardMgtM - getSaveData - subList : ', subList);
  subTitle.value = subList[bas].pdCd ? `${subList[bas].pdNm} (${subList[bas].pdCd})` : subList[bas].pdNm;
  return subList;
}

// 목록으로 이동
async function goList() {
  await router.push({ path: '/product/zwpdc-sale-product-list', state: { stateParam: { searchYn: 'Y', pdTpCd: pdConst.PD_TP_CD_STANDARD } } });
}

// 삭제
async function onClickDelete() {
  const deleteConfirmMsg = `[${t('MSG_TXT_STND_PRDT')}]${t('MSG_ALT_WANT_DEL_WCC')}`;
  if (await confirm(deleteConfirmMsg)) {
    await dataService.delete(`/sms/wells/product/standards/${currentPdCd.value}`);
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

// 다음 버튼
async function onClickNextStep() {
  const currentStepIndex = currentStep.value.step - 1;
  // 현재 Step 필수여부 확인
  const currentStepRef = await cmpStepRefs.value[currentStepIndex].value;
  if (isEmpty(currentStepRef)) {
    await moveStepByIndex(currentStepIndex + 1);
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

// 하위 컴포넌트 탭 이동시 호출
async function onClickSubTab() {
  prevStepData.value = await getSaveData();
}

// 하위 컴포넌트 강제 값 적용(가격정보 등록 - 일괄복사)
async function applyData() {
  prevStepData.value = await getSaveData(true);
  // 반영되었습니다.
  notify(t('MSG_ALT_SUCCESS_RFL'));
}

// 취소 버튼
async function onClickCancel() {
  if (await obsMainRef.value.confirmIfIsModified()) {
    await obsMainRef.value.reset();
    await router.close();
  }
}

// 컴포넌트 초기화
async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

// 상품 데이터 불러오기
async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/standards/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;

    // console.log('WwpdcStandardMgtM - fetchProduct - res.data', res.data);
    const initData = res.data;
    fnlMdfcDtm.value = initData[bas].fnlMdfcDtm;
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
  } else if (currentCopyPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/standards/${currentCopyPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = await getCopyProductInfo(res.data);
    isTempSaveBtn.value = 'Y';
  }
  const services = prevStepData.value[pdConst.RELATION_PRODUCTS]
    ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
  codes.svPdCd = services?.map(({ pdNm, pdCd }) => ({
    codeId: pdCd, codeName: pdNm,
  }));
  subTitle.value = prevStepData.value[bas].pdCd ? `${prevStepData.value[bas].pdNm} (${prevStepData.value[bas].pdCd})` : prevStepData.value[bas].pdNm;
  await init();
}

// 저장 버튼
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
  // console.log('WwpdcStandardMgtM - onClickSave - subList : ', subList);

  // 4. 생성 or 저장
  let rtn;
  if (isCreate.value) {
    rtn = await dataService.post('/sms/wells/product/standards', subList);
  } else if (await isValidToProdcutSave(currentPdCd.value, fnlMdfcDtm.value, pdConst.PD_JOB_TYPE_EDIT)) {
    rtn = await dataService.put(`/sms/wells/product/standards/${currentPdCd.value}`, subList);
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
      await router.push({ path: '/product/zwpdc-sale-product-list/wwpdc-standard-mgt', query: { pdCd: newPdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' } } });
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

// 현재가치할인차금여부 설정
async function setCurrentPriceDepositYn() {
  const basicAttrFields = await cmpStepRefs.value[0]?.value.getNameFields();
  const mangeAttrFields = await cmpStepRefs.value[2]?.value.getNameFields();
  if (basicAttrFields.sellTpDtlCd && mangeAttrFields.pvdaYn) {
    // 판매상세유형
    if (['22', '24'].includes(basicAttrFields.sellTpDtlCd.initValue)) {
      if (mangeAttrFields.pvdaYn) {
        mangeAttrFields.pvdaYn.initValue = 'Y';
      } else {
        mangeAttrFields.pvdaYn.initValue = 'N';
      }
    } else {
      mangeAttrFields.pvdaYn.initValue = 'N';
    }
  }
}

// 판매채널 변경시, 가격정보에서 사용된 채널은 복구
async function checkUsedSellChannel(channels) {
  if (channels && prevStepData.value[prcfd] && prevStepData.value[prcfd].length) {
    // console.log('mgtNameFields?.avlChnlId.initValue : ', channels);
    const prcUsedChannels = prevStepData.value[prcfd].reduce((rtn, item) => {
      if (!rtn.includes(item.sellChnlCd)) {
        rtn.push(item.sellChnlCd);
      }
      return rtn;
    }, []);
    const recoveryChannels = [];
    prcUsedChannels.forEach(async (channel) => {
      if (!channels.includes(channel)) {
        recoveryChannels.push(channel);
      }
    });
    if (recoveryChannels.length) {
      channels.push(...recoveryChannels);
      const recoveryChannelNames = getCodeNames(codes.SELL_CHNL_DTL_CD, recoveryChannels.join(','));
      // 가격정보에서 사용중인 다음 채널은 복구 됩니다. {0}
      notify(t('MSG_ALT_PD_RECOV_CHANNLS', [`[${recoveryChannelNames}]`]));
    }
  }
}

// 매출인식분류코드
async function fetechSaleRecognitionClassification(slRcogClsfCd) {
  if (slRcogClsfCd) {
    const res = await dataService.get(`/sms/common/product/standards/recogn-class/${slRcogClsfCd}`);
    return res.data?.slRcogClsfNm;
  }
}

// 메타 속성값 수정시 호출
async function onUpdateBasicValue(field) {
  if (field.colNm === 'sellTpCd') {
    // 판매유형
    await setSellDetailTypeCodes(field.initValue, true);
  } else if (field.colNm === 'avlChnlId') {
    // 판매채널
    await checkUsedSellChannel(field.initValue);
  } else if (['sellTpCd', 'sellTpDtlCd', 'pvdaYn'].includes(field.colNm)) {
    // 현재가치할인차금여부
    await setCurrentPriceDepositYn();
  }
}

// 메타 속성 팝업 호출
async function openPopup(field) {
  const searchParams = {
    apyStrtdt: now.format('YYYYMMDD'),
    apyEnddt: now.format('YYYYMMDD'),
  };
  // 매출인식분류코드
  if (field.colNm === 'slRcogClsfCd') {
    const rtn = await modal({
      // ZwwdcSalesRecognitionBaseMgtP
      component: field.sourcInfCn ?? 'ZwwdcSalesRecognitionBaseMgtP',
      componentProps: searchParams,
    });
    if (rtn && rtn.payload && rtn.result) {
      // console.log('EwpdcStandardMgtM - openPopup : ', rtn);
      field.initValue = rtn.payload.slRcogClsfCd;
      field.initName = rtn.payload.slRcogClsfNm;
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
  currentStep.value = cloneDeep(pdConst.STANDARD_STEP_BASIC);
  prevStepData.value = {};
  fnlMdfcDtm.value = null;
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
    if (item.value?.init) await item.value?.init();
  }));
}

// 마운트 데이터 설정
async function setMountData() {
  // 판매 상세 유형 초기값 설정
  const baseAttrFields = await cmpStepRefs.value[0]?.value.getNameFields();
  await setSellDetailTypeCodes(baseAttrFields.sellTpCd?.initValue);
  const mangeAttrFields = await cmpStepRefs.value[2]?.value.getNameFields();
  // 매출인식분류코드
  if (mangeAttrFields.slRcogClsfCd) {
    mangeAttrFields.slRcogClsfCd.readonly = true;
    mangeAttrFields.slRcogClsfCd.initName = await fetechSaleRecognitionClassification(
      mangeAttrFields.slRcogClsfCd?.initValue,
    );
  }
}

// 초기화 버튼
async function onClickReset() {
  // 조회항목을 초기화하시겠습니까?\n초기화 이후 STEP1으로 이동합니다.
  if (!await confirm(t('MSG_ALT_PD_RESET'))) return false;
  await resetData();
  await fetchProduct();
  await setMountData();
}

// Props 데이터 설정
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
  // console.log(`WwpdcStandardMgtM - watch - ${pdCd} : ${newRegYn} : ${reloadYn} : ${copyPdCd} : ${propWatch}`);
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
    await setMountData();
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
      await setMountData();
    }
  } else if (copyPdCd && currentCopyPdCd.value !== copyPdCd) {
    currentPdCd.value = '';
    currentNewRegYn.value = 'N';
    currentReloadYn.value = 'N';
    currentCopyPdCd.value = copyPdCd;
    // 복사
    if (copyPdCd) {
      await resetData();
      await fetchProduct();
    }
  }
}, { deep: true });

onMounted(async () => {
  await setMountData();
});

</script>
<style scoped></style>
