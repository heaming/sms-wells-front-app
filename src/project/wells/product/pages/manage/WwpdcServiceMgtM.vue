<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceMgtM - 서비스 관리 - 서비스 등록/변경 ( Z-PD-U-0041M01 )
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
          <slot>
            <!-- 속성 등록 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_BASIC.step"
              :name="pdConst.W_SERVICE_STEP_BASIC.name"
              :title="$t('MSG_TXT_PROP_REG')"
              :prefix="pdConst.W_SERVICE_STEP_BASIC.step"
              :done="currentStep.step > pdConst.W_SERVICE_STEP_BASIC.step"
              :sub-text="subTitle"
            />
            <!-- 상품필터 교체관리 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_FILTER.step"
              :name="pdConst.W_SERVICE_STEP_FILTER.name"
              :title="$t('MSG_TXT_PD_FILT_CHG')"
              :prefix="pdConst.W_SERVICE_STEP_FILTER.step"
              :done="currentStep.step > pdConst.W_SERVICE_STEP_FILTER.step"
              :sub-text="subTitle"
            />
            <!-- 등록정보 확인 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_CHECK.step"
              :name="pdConst.W_SERVICE_STEP_CHECK.name"
              :title="$t('MSG_TXT_CHK_REG_INFO')"
              :prefix="pdConst.W_SERVICE_STEP_CHECK.step"
              :sub-text="subTitle"
            />

            <kw-step-panel :name="pdConst.W_SERVICE_STEP_BASIC.name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[0]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
                is-auto-group-title
              />
            </kw-step-panel>
            <kw-step-panel :name="pdConst.W_SERVICE_STEP_FILTER.name">
              <wwpdc-service-mgt-m-filter
                :ref="cmpStepRefs[1]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
              />
            </kw-step-panel>
            <kw-step-panel :name="pdConst.W_SERVICE_STEP_CHECK.name">
              <wwpdc-service-dtl-m-contents
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :is-history-tab="false"
                :is-update-btn="false"
                :codes="codes"
                is-reg-check-page
              />
            </kw-step-panel>
          </slot>
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
              v-show="!isCreate && currentStep.step !== pdConst.W_SERVICE_STEP_CHECK.step"
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
import { useDataService, useGlobal, codeUtil } from 'kw-lib';
import { isEmpty, cloneDeep, isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, getCopyProductInfo, isValidToProdcutSave } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcServiceMgtMFilter from './WwpdcServiceMgtMFilter.vue';
import WwpdcServiceDtlMContents from './WwpdcServiceDtlMContents.vue';

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
const { notify, confirm } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const rel = pdConst.TBL_PD_REL;

// 이전 Props
const prevProps = ref({});
// 상품 최종 수정일
const fnlMdfcDtm = ref();
// 임시저장 버튼 표시 여부
const isTempSaveBtn = ref(true);
// 스텝 목록
const regSteps = ref([pdConst.W_SERVICE_STEP_BASIC, pdConst.W_SERVICE_STEP_FILTER, pdConst.W_SERVICE_STEP_CHECK]);
// 현재 스텝
const currentStep = cloneDeep(ref(pdConst.W_SERVICE_STEP_BASIC));
// 통과된 스텝
const passedStep = ref(0);
// 스텝 Ref 목록
const cmpStepRefs = ref([ref(), ref()]);
// 현재 수정 데이터
const prevStepData = ref({});
// 현재 상품 코드
const currentPdCd = ref();
// 현재 등록 여부
const currentNewRegYn = ref();
// 현재 새로고침 여부
const currentReloadYn = ref();
// 복사 상품 코드
const currentCopyPdCd = ref();
// 등록 여부
const isCreate = ref(false);
// 상품 코드 목록
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');
// 옵져버
const obsMainRef = ref();
// 등록정보확인 서브 타이틀
const subTitle = ref();

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
async function getSaveData() {
  // 데이터가 많아서 수정여부를 체크하여 미수정시, 텝 데이터 수집을 하지않음.
  if (!(await isModifiedCheck())) {
    return prevStepData.value;
  }

  const subList = { isModifiedProp: false, isOnlyFileModified: false, isModifiedRelation: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const isModified = await item.value.isModifiedProps();
    const saveData = item.value?.getSaveData ? await item.value.getSaveData() : null;
    if (await saveData) {
      // console.log(`${idx}saveData : `, saveData);
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      // 기본속성, 관리 속성 수정여부
      if (await isModified && idx === 0) {
        subList.isModifiedProp = true;
        subList.isOnlyFileModified = await item.value.isOnlyFileModified();
      }
      // 연결상품 수정여부
      if (await isModified && idx === (pdConst.W_SERVICE_STEP_FILTER.step - 1)) {
        subList.isModifiedRelation = true;
      }
      if (saveData[bas]) {
        // 상품 기본 정보 병합
        if (subList[bas]?.cols) {
          saveData[bas].cols += subList[bas].cols;
        }
        subList[bas] = pdMergeBy(subList[bas], saveData[bas]);
      }
      if (saveData[dtl]) {
        // 상품 상세 정보 병합
        subList[dtl] = pdMergeBy(subList[dtl], saveData[dtl], pdConst.PD_DTL_GRP_ID);
      }
      if (saveData[ecom]) {
        // 각사속성 정보 병합
        subList[ecom] = pdMergeBy(subList[ecom], saveData[ecom], 'pdExtsPrpGrpCd');
      }
      if (saveData[rel]) {
        // 연결상품 정보 병합
        subList[rel] = pdMergeBy(subList[rel], saveData[rel]);
      }
      if (saveData[pdConst.RELATION_PRODUCTS]) {
        // 연결상품 목록
        subList[pdConst.RELATION_PRODUCTS] = saveData[pdConst.RELATION_PRODUCTS];
      }
    }
  }));
  // 등록정보확인 - 서브 타이틀 정보
  subTitle.value = subList[bas].pdCd ? `${subList[bas].pdNm} (${subList[bas].pdCd})` : subList[bas].pdNm;
  // console.log('subList : ', subList);
  return subList;
}

// 목록으로 이동
async function goList() {
  await router.push({ path: '/product/zwpdc-service-list', state: { stateParam: { searchYn: 'Y' } } });
}

// 삭제 버튼
async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/services/${currentPdCd.value}`);
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
    currentStep.value = cloneDeep(regSteps.value[currentStepIndex + 1]);
    return;
  }
  const isValidOk = await (cmpStepRefs.value[currentStepIndex].value?.validateProps());
  if (!isValidOk) {
    return;
  }

  // 다음 이동
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
    // 상품코드가 있는 경우 데이터 불러오기
    const res = await dataService.get(`/sms/wells/product/services/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = res.data;
    fnlMdfcDtm.value = prevStepData.value[bas].fnlMdfcDtm;
    isTempSaveBtn.value = prevStepData.value[bas].tempSaveYn === 'Y';
  } else if (currentCopyPdCd.value) {
    // 복사의 경우 복사 상품 정보 불러오기
    const res = await dataService.get(`/sms/wells/product/services/${currentCopyPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    prevStepData.value = await getCopyProductInfo(res.data);
    isTempSaveBtn.value = 'Y';
  }
  // 등록정보확인 - 서브타이틀
  subTitle.value = prevStepData.value[bas].pdCd ? `${prevStepData.value[bas].pdNm} (${prevStepData.value[bas].pdCd})` : prevStepData.value[bas].pdNm;
  await init();
}

// 저장
async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    if (!(await isModifiedCheck())) {
      // 변경사항이 없습니다.
      notify(t('MSG_ALT_NO_CHG_CNTN'));
      return;
    }
  }

  // 2. Step별 필수여부 확인
  let isValidOk = true;
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (isValidOk && !await item.value.validateProps()) {
      isValidOk = false;
      // 검증 실패시 해당 스텝으로 이동
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

  let rtn;
  if (isCreate.value) {
    rtn = await dataService.post('/sms/wells/product/services', subList);
  } else if (await isValidToProdcutSave(currentPdCd.value, fnlMdfcDtm.value, pdConst.PD_JOB_TYPE_EDIT)) {
    rtn = await dataService.put(`/sms/wells/product/services/${currentPdCd.value}`, subList);
  } else {
    return;
  }

  // 저장되었습니다.
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();

  if (tempSaveYn === 'N') {
    // 목록으로 이동
    await goList();
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      const newPdCd = rtn.data?.data?.pdCd;
      await router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', query: { pdCd: newPdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' } } });
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
  currentStep.value = cloneDeep(pdConst.W_SERVICE_STEP_BASIC);
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
  // console.log(`WwpdcServiceMgtM - watch - ${pdCd} : ${newRegYn} : ${reloadYn} : ${copyPdCd} : ${propWatch}`);
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

</script>
<style scoped></style>
