<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcMaterialMgtM - 교재/자재 등록/변경
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 교재/자재 등록/변경 프로그램 (Outer Frame Page)
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
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_MATERIAL_STEP_BASIC.step"
              :name="pdConst.W_MATERIAL_STEP_BASIC.name"
              :title="$t('MSG_TXT_BAS_ATTR_REG')"
              :prefix="pdConst.W_MATERIAL_STEP_BASIC.step"
              :sub-text="subTitle"
            />
            <!-- 2.연결상품 선택 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_MATERIAL_STEP_REL_PROD.step"
              :name="pdConst.W_MATERIAL_STEP_REL_PROD.name"
              :title="$t('MSG_TXT_REL_PRDT_SEL')"
              :prefix="pdConst.W_MATERIAL_STEP_REL_PROD.step"
              :sub-text="subTitle"
            />
            <!-- 3.관리속성 등록 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_MATERIAL_STEP_MANAGE.step"
              :name="pdConst.W_MATERIAL_STEP_MANAGE.name"
              :title="$t('MSG_TXT_MGT_ATTR_REG')"
              :prefix="pdConst.W_MATERIAL_STEP_MANAGE.step"
              :sub-text="subTitle"
            />
            <!-- 4.등록정보 확인 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_MATERIAL_STEP_CHECK.step"
              :name="pdConst.W_MATERIAL_STEP_CHECK.name"
              :title="$t('MSG_TXT_CHK_REG_INFO')"
              :prefix="pdConst.W_MATERIAL_STEP_CHECK.step"
              :sub-text="subTitle"
            />

            <!-- 1. 기본속성 등록 -->
            <kw-step-panel :name="pdConst.W_MATERIAL_STEP_BASIC.name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[0]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                :pd-tp-dtl-cd="pdTpDtlCd"
                @update="onUpdateMgtValue"
                @keydown="onKeydownInput"
                @open-popup="openPopup"
              />
            </kw-step-panel>
            <!-- 2.연결상품 선택 -->
            <kw-step-panel
              :name="pdConst.W_MATERIAL_STEP_REL_PROD.name"
            >
              <zwpdc-prop-relation-mgt
                :ref="cmpStepRefs[1]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
              />
            </kw-step-panel>
            <!-- 3.관리속성 등록 -->
            <kw-step-panel :name="pdConst.W_MATERIAL_STEP_MANAGE.name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[2]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                :except-id="exceptPrpGrpCd"
              />
            </kw-step-panel>
            <!-- 4.등록정보 확인 -->
            <kw-step-panel :name="pdConst.W_MATERIAL_STEP_CHECK.name">
              <wwpdc-material-dtl-m-contents
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
              v-permission:delete
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
            />
            <!-- 초기화 -->
            <kw-btn
              v-show="!isCreate && currentStep.step !== pdConst.W_MATERIAL_STEP_CHECK.step"
              :label="$t('MSG_BTN_INTL')"
              class="ml8"
              @click="onClickReset"
            />
            <!-- 취소 -->
            <kw-btn
              v-show="!isTempSaveBtn"
              :label="$t('MSG_BTN_CANCEL')"
              class="ml8"
              @click="onClickCancel"
            />
            <!-- 임시저장 -->
            <kw-btn
              v-show="(currentStep.step < regSteps.length ) && isTempSaveBtn"
              v-permission:update
              :label="$t('MSG_BTN_TMP_SAVE')"
              class="ml8"
              @click="onClickSave('Y')"
            />
            <!-- 다음 -->
            <kw-btn
              v-show="isTempSaveBtn && (currentStep.step < regSteps.length)"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNextStep"
            />
            <!-- 저장 -->
            <kw-btn
              v-show="!isTempSaveBtn || currentStep.step === regSteps.length"
              v-permission:update
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
import { pdMergeBy, pageMove, getCopyProductInfo, isValidToProdcutSave } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue'; /* 속성 등록/수정 */
import ZwpdcPropRelationMgt from './WwpdcPropRelationMgtM.vue'; /* 연결상품 등록/수정 */
import WwpdcMaterialDtlMContents from './WwpdcMaterialDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  newRegYn: { type: String, default: null },
  reloadYn: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
  copyPdCd: { type: String, default: null },
  propWatch: { type: Object, default: null },
});

const { t } = useI18n();
const dataService = useDataService();
const { confirm, notify, modal } = useGlobal();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/materials';
const pdTpDtlCd = ref(pdConst.PD_TP_DTL_CD_MATERIAL);
const exceptPrpGrpCd = ref('PART');

const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const rel = pdConst.TBL_PD_REL;

const prevProps = ref({});
const fnlMdfcDtm = ref();
const isTempSaveBtn = ref(true);
const regSteps = ref([
  pdConst.W_MATERIAL_STEP_BASIC,
  pdConst.W_MATERIAL_STEP_REL_PROD,
  pdConst.W_MATERIAL_STEP_MANAGE,
  pdConst.W_MATERIAL_STEP_CHECK,
]);
const currentStep = cloneDeep(ref(pdConst.W_MATERIAL_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const currentCopyPdCd = ref();
const currentNewRegYn = ref();
const currentReloadYn = ref();
const isCreate = ref(false);
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');
const obsMainRef = ref();
const subTitle = ref();

async function getSaveData(tempSaveYn) {
  const subList = { isModifiedProp: false, isOnlyFileModified: false, isModifiedRelation: false };
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const isModified = await item.value.isModifiedProps();
    const saveData = item.value?.getSaveData ? await item.value.getSaveData() : null;
    // 기본속성, 관리 속성 수정여부
    if (await isModified && (idx === 0 || idx === 2)) {
      subList.isModifiedProp = true;
      // subList.isOnlyFileModified = item.value?.isOnlyFileModified ? await item.value?.isOnlyFileModified() : false;
      if (idx === 0 && isModified) {
        subList.isOnlyFileModified = item.value?.isOnlyFileModified ? await item.value?.isOnlyFileModified() : false;
      } else if (idx === 2 && isModified) {
        subList.isOnlyFileModified = false;
      }
    }

    // 연결상품 수정여부 (0: 기본, 1: 연결, 2:관리)
    if (await isModified && idx === 1) {
      subList.isModifiedRelation = true;
    }

    if (await saveData) {
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

      if (saveData[rel]) {
        subList[rel] = saveData[rel];
      }
    }
  }));
  subList[bas].tempSaveYn = tempSaveYn;
  subTitle.value = subList[bas].pdCd ? `${subList[bas].pdNm} (${subList[bas].pdCd})` : subList[bas].pdNm;
  return subList;
}

async function goList() {
  await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: true }, { searchYn: 'Y' });
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

async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

async function fetchProduct() {
  const initData = {};
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    initData[bas] = res.data[bas];
    initData[dtl] = res.data[dtl];
    initData[ecom] = res.data[ecom];
    initData[rel] = res.data[rel];
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
    fnlMdfcDtm.value = prevStepData.value[bas].fnlMdfcDtm;
    subTitle.value = initData[bas].pdCd ? `${initData[bas].pdNm} (${initData[bas].pdCd})` : initData[bas].pdNm;
    await init();
  } else if (currentCopyPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentCopyPdCd.value}`).catch(() => {
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
    if (!await item.value.validateProps()) {
      isValidOk = false;
      await moveStepByIndex(idx);
    }
  }));
  if (!isValidOk) return;

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData(tempSaveYn);
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
  // TODO 설계요청에 의해 임시주석처리 230516
  // if (!isEmpty(subList[bas].sapMatCd)) {
  //   if (!await duplicationCheck('sapMatCd', subList)) return false;
  // }

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
    await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: true }, { newRegYn: 'N', reloadYn: 'N', copyPdCd: '', searchYn: 'Y' });
    return;
  }
  // else {
  //   currentPdCd.value = rtn.data?.data?.pdCd;
  //   isCreate.value = isEmpty(currentPdCd.value);
  //   await fetchProduct();
  // }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      const newPdCd = rtn.data?.data?.pdCd;
      await router.push({ path: pdConst.MATERIAL_MNGT_PAGE_W, query: { pdCd: newPdCd }, state: { stateParam: { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' } } });
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

async function onClickReset() {
  if (!await confirm(t('MSG_ALT_PD_RESET', null, '조회항목을 초기화하시겠습니까?\n초기화 이후 STEP1으로 이동합니다. '))) return false;
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

onMounted(async () => {
  await initProps();
});

async function popupCallback(payload) {
  if (payload?.fromUi === 'ZwpdcMaterialsCodeListP') {
    if (isEmpty(prevStepData.value[bas])) {
      prevStepData.value = await getSaveData();
    }
    // prevStepData.value[bas].sapMatCd = payload.sapMatCd ?? '';
    // prevStepData.value[bas].modelNo = payload.modelNo ?? '';
    // prevStepData.value[bas].sapPdctSclsrtStrcVal = payload.sapPdctSclsrtStrcVal ?? '';
    // prevStepData.value[bas].sapPlntCd = payload.sapPlntCd ?? '';
    // prevStepData.value[bas].sapMatEvlClssVal = payload.sapMatEvlClssVal ?? '';
    // prevStepData.value[bas].sapMatGrpVal = payload.sapMatGrpVal ?? '';
    // prevStepData.value[bas].sapPlntCd = payload.sapPlntVal ?? '';
    // prevStepData.value[bas].sapMatTpVal = payload.sapMatTpVal ?? '';

    const mgtNameFields = await cmpStepRefs.value[0]?.value.getNameFields();
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
  // console.log('EwpdcStandardMgtM - onUpdateMgtValue - field : ', field);
  /* && isEmpty(field.initName ) */
  // if (field.colNm === 'sapMatCd' && field.initName !== field.initValue) {
  // if (field.colNm === 'sapMatCd' && isEmpty(field.initValue)) {
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

watch(() => props, async ({ pdCd, newRegYn, reloadYn, copyPdCd, propWatch }) => {
  // console.log(` - watch - ${pdCd} : ${newRegYn} : ${reloadYn} : ${copyPdCd} : ${propWatch}`);
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
<style lang="scss" scoped></style>
