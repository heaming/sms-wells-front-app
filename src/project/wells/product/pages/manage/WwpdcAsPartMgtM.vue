  <!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartMgtM - AS부품 등록/변경 (W-PD-U-0041M01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> AS부품 등록/변경 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="normal-area normal-area--button-set-bottom">
        <kw-stepper
          v-model="currentStep.name"
          heading-text
          :header-nav="!isTempSaveBtn || passedStep > 0"
          @update:model-value="onClickStep()"
        >
          <slot>
            <!-- 1. 기본속성 등록 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_AS_PART_STEP_BASIC.step"
              :name="pdConst.W_AS_PART_STEP_BASIC.name"
              :title="$t('MSG_TXT_BAS_ATTR_REG')"
              :prefix="pdConst.W_AS_PART_STEP_BASIC.step"
              :done="currentStep.step > pdConst.W_AS_PART_STEP_BASIC.step"
              :sub-text="subTitle"
            />
            <!-- 2.등록정보 확인 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_AS_PART_STEP_CHECK.step"
              :name="pdConst.W_AS_PART_STEP_CHECK.name"
              :title="$t('MSG_TXT_CHK_REG_INFO')"
              :prefix="pdConst.W_AS_PART_STEP_CHECK.step"
              :sub-text="subTitle"
            />

            <!-- 1. 기본속성 등록 -->
            <kw-step-panel :name="pdConst.W_AS_PART_STEP_BASIC.name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[0]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                :pd-tp-dtl-cd="pdConst.PD_TP_DTL_CD_AS_PART"
                @update="onUpdateMgtValue"
                @keydown="onKeydownInput"
                @open-popup="openPopup"
              />
            </kw-step-panel>
            <!-- 2.등록정보 확인 -->
            <kw-step-panel :name="pdConst.W_AS_PART_STEP_CHECK.name">
              <wwpdc-as-part-dtl-m-contents
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :is-history-tab="false"
                :is-update-btn="false"
                is-reg-check-page
              />
            </kw-step-panel>
          </slot>
        </kw-stepper>

        <div class="button-set--bottom">
          <div class="button-set--bottom-left">
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step > 1"
              :label="$t('MSG_BTN_PREV', null, '이전')"
              class="ml8"
              @click="onClickPrevStep"
            />
          </div>
          <div class="button-set--bottom-right">
            <kw-btn
              v-show="!isCreate"
              v-permission:delete
              :label="$t('MSG_BTN_DEL', null, '삭제')"
              @click="onClickDelete"
            />
            <kw-btn
              v-show="!isCreate && currentStep.step !== pdConst.W_AS_PART_STEP_CHECK.step"
              :label="$t('MSG_BTN_INTL', null, '초기화')"
              class="ml8"
              @click="onClickReset"
            />
            <kw-btn
              :label="$t('MSG_BTN_CANCEL', null, '취소')"
              class="ml8"
              @click="onClickCancel"
            />
            <kw-btn
              v-if="currentStep.step < regSteps.length && isTempSaveBtn"
              v-permission:update
              :label="$t('MSG_BTN_TMP_SAVE', null, '임시저장')"
              class="ml8"
              @click="onClickSave('Y')"
            />
            <kw-btn
              v-show="isTempSaveBtn && currentStep.step < regSteps.length"
              :label="$t('MSG_BTN_NEXT', null, '다음')"
              class="ml8"
              primary
              @click="onClickNextStep"
            />
            <kw-btn
              v-show="!isTempSaveBtn || currentStep.step === regSteps.length"
              v-permission:update
              :label="$t('MSG_BTN_SAVE', null, '저장')"
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
import { useDataService, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep, isEqual } from 'lodash-es';
import { pdMergeBy, pageMove, getCopyProductInfo, isValidToProdcutSave } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcAsPartDtlMContents from './WwpdcAsPartDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  newRegYn: { type: String, default: null }, // 신규등록 여부
  reloadYn: { type: String, default: null }, // 새로고침 여부
  copyPdCd: { type: String, default: null }, // 복사 원본 상품코드
  propWatch: { type: Object, default: null }, // Props 변경 여부
});

const { t } = useI18n();
const dataService = useDataService();
const { confirm, notify, modal, alert } = useGlobal();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const rel = pdConst.TBL_PD_REL;

const baseUrl = '/sms/wells/product/as-parts';

const prevProps = ref({});
const fnlMdfcDtm = ref();
const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.W_AS_PART_STEP_BASIC, pdConst.W_AS_PART_STEP_CHECK]);
const currentStep = cloneDeep(ref(pdConst.W_AS_PART_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const currentNewRegYn = ref();
const currentReloadYn = ref();
const currentCopyPdCd = ref();
const isCreate = ref(false);
const obsMainRef = ref();
const subTitle = ref();

// 중복검사
async function duplicationCheck(validationType, sourceData) {
  const validationParams = {};
  validationParams.validationType = validationType;
  validationParams.pdCd = sourceData[bas].pdCd;
  validationParams.sapMatCd = sourceData[bas].sapMatCd;

  const res = await dataService.get(`${baseUrl}/check-validation`, { params: validationParams });

  if (res.data !== 'N') {
    // 다른 교재/제품에서 이미 사용 중인 SAP자재코드입니다. (사용 교재/제품코드: {0}/{1}) - 교재명/자재코드
    await alert(t('MSG_ALT_EXIST_SAP_MAT_CD', [res.data, validationParams.sapMatCd]));
    return false;
  }
  return true;
}

// 저장 데이터
async function getSaveData() {
  const subList = { isModifiedProp: false, isOnlyFileModified: false, isModifiedRelation: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const isModified = await item.value.isModifiedProps();
    const saveData = item.value?.getSaveData ? await item.value.getSaveData() : null;
    if (await saveData) {
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      // 기본속성, 관리 속성 수정여부
      if (await isModified && idx === 0) {
        subList.isModifiedProp = true;
        subList.isOnlyFileModified = item.value?.isOnlyFileModified ? await item.value?.isOnlyFileModified() : false;
      }

      // 연결상품 수정여부 (0: 기본)
      if (await isModified && idx === 0) {
        subList.isModifiedRelation = true;
      }

      if (saveData[bas]) {
        if (subList[bas]?.cols) saveData[bas].cols += subList[bas].cols;
        subList[bas] = pdMergeBy(subList[bas], saveData[bas]);
      }
      if (saveData[dtl]) subList[dtl] = pdMergeBy(subList[dtl], saveData[dtl], pdConst.PD_DTL_GRP_ID);
      if (saveData[ecom]) subList[ecom] = pdMergeBy(subList[ecom], saveData[ecom], 'pdExtsPrpGrpCd');
      if (saveData[rel]) subList[rel] = saveData[rel];
    }
  }));
  subTitle.value = subList[bas].pdCd ? `${subList[bas].pdNm} (${subList[bas].pdCd})` : subList[bas].pdNm;
  // console.log('subList : ', subList);
  return subList;
}

// 목록으로 이동
async function goList() {
  await pageMove(pdConst.ASPART_LIST_PAGE, true, router, { isSearch: true }, { searchYn: 'Y' });
}

// 삭제 버튼
async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`${baseUrl}/${currentPdCd.value}`);
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
  // Validation Check 1- 현재 Step 필수여부 확인
  const isValidOk = await (cmpStepRefs.value[currentStepIndex].value.validateProps());
  if (!isValidOk) return false;

  await moveStepByIndex(currentStepIndex + 1);
  passedStep.value = currentStep.value.step;
}

// 이전 버튼
async function onClickPrevStep() {
  const currentStepIndex = currentStep.value.step - 1;
  await moveStepByIndex(currentStepIndex - 1);
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

// 컴포넌트 초기화
async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

// 상품 데이터 불러오기
async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = res.data;
    fnlMdfcDtm.value = prevStepData.value[bas].fnlMdfcDtm;
    isTempSaveBtn.value = prevStepData.value[bas].tempSaveYn === 'Y';
    await init();
  } else if (currentCopyPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentCopyPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = await getCopyProductInfo(res.data);
    isTempSaveBtn.value = 'Y';
    // 복사기능으로 생성된 품목코드 및 AS자재번호는 삭제처리. 23-07-04
    prevStepData.value[ecom][0].pdPrpVal01 = null;
    prevStepData.value[ecom][0].pdPrpVal31 = null;
  }
  subTitle.value = prevStepData.value[bas].pdCd ? `${prevStepData.value[bas].pdNm} (${prevStepData.value[bas].pdCd})` : prevStepData.value[bas].pdNm;
  await init();
}

// 저장
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
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (isValidOk && !await item.value.validateProps()) {
      isValidOk = false;
      await moveStepByIndex(idx);
    }
  }));
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

  // 4. 자재코드 중복검사.
  if (!isEmpty(subList[bas].sapMatCd)) {
    if (!await duplicationCheck('sapMatCd', subList)) return false;
  }

  // 5. Insert or Update
  let rtn;
  if (isCreate.value) {
    rtn = await dataService.post(`${baseUrl}`, subList);
  } else if (await isValidToProdcutSave(currentPdCd.value, fnlMdfcDtm.value, pdConst.PD_JOB_TYPE_EDIT)) {
    rtn = await dataService.put(baseUrl, subList);
  } else {
    return;
  }
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();

  if (tempSaveYn === 'N') {
    // 목록으로 이동
    await pageMove(pdConst.ASPART_LIST_PAGE, true, router, { isSearch: true }, { newRegYn: 'N', reloadYn: 'N', copyPdCd: '', searchYn: 'Y' });
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      const newPdCd = rtn.data?.data?.pdCd;
      await router.push({ path: pdConst.ASPART_MNGT_PAGE, query: { pdCd: newPdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' } } });
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
  currentStep.value = cloneDeep(pdConst.W_MATERIAL_STEP_BASIC);
  prevStepData.value = {};
  fnlMdfcDtm.value = null;
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
    if (item.value?.init) await item.value?.init();
  }));
}

// 초기화 버튼
async function onClickReset() {
  if (!await confirm(t('MSG_ALT_PD_RESET', null, '조회항목을 초기화하시겠습니까?\n초기화 이후 STEP1으로 이동합니다. '))) return false;
  await resetData();
  await fetchProduct();
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

onMounted(async () => {
  await initProps();
});

watch(() => props, async ({ pdCd, newRegYn, reloadYn, copyPdCd, propWatch }) => {
  // console.log(`WwpdcAsPartMgtM - watch - ${pdCd} : ${newRegYn} : ${reloadYn} : ${copyPdCd} : ${propWatch}`);
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

// 팝업 호출 이후
async function popupCallback(payload) {
  if (payload?.fromUi === 'ZwpdcMaterialsCodeListP') {
    if (isEmpty(prevStepData.value[bas])) {
      prevStepData.value = await getSaveData();
    }

    const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
    console.log('mgtNameFields', mgtNameFields);
    console.log('payload', payload);
    mgtNameFields.sapMatCd.initValue = payload.sapMatCd ?? '';
    mgtNameFields.modelNo.initValue = payload.modelNo ?? '';
    mgtNameFields.sapPdctSclsrtStrcVal.initValue = payload.sapPdctSclsrtStrcVal ?? '';
    mgtNameFields.sapPlntCd.initValue = payload.sapPlntCd ?? '';
    mgtNameFields.sapMatEvlClssVal.initValue = payload.sapMatEvlClssVal ?? '';
    mgtNameFields.sapMatGrpVal.initValue = payload.sapMatGrpVal ?? '';
    mgtNameFields.sapPlntCd.initValue = payload.sapPlntVal ?? '';
    mgtNameFields.sapMatTpVal.initValue = payload.sapMatTpVal ?? '';
  }
}

// 메타 속성값 수정시 호출
async function onUpdateMgtValue(field) {
  if ((field.colNm === 'sapMatCd' && isEmpty(field.initValue)) || (field.colNm === 'sapMatCd' && field.initName !== field.initValue)) {
    console.log('삭제');
    const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
    mgtNameFields.sapMatCd.initValue = '';
    mgtNameFields.modelNo.initValue = '';
    mgtNameFields.sapPdctSclsrtStrcVal.initValue = '';
    mgtNameFields.sapPlntCd.initValue = '';
    mgtNameFields.sapMatEvlClssVal.initValue = '';
    mgtNameFields.sapMatGrpVal.initValue = '';
    mgtNameFields.sapMatTpVal.initValue = '';
  }
}

// 팝업 키 다운 이벤트
// eslint-disable-next-line no-unused-vars
async function onKeydownInput(e, field) {
  // console.log(e, field);
}

// 팝업 호출
async function openPopup(field) {
  const { payload } = await modal({
    component: field.sourcInfCn,
    componentProps: {
      searchValue: field.initName,
      searchType: pdConst.PD_SEARCH_PRODUCT,
      selectType: pdConst.PD_SEARCH_SINGLE },
  });
  if (payload && payload.type !== 'click') {
    field.initValue = payload.returnValue;
    field.initName = payload.returnName;
  }
  await popupCallback(payload);
}
</script>
<style lang="scss" scoped></style>
