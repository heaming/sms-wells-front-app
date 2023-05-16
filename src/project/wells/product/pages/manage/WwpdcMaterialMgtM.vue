<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcMaterialMgtM - 교재/자재 등록/변경
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 교재/자재 등록/변경 프로그램 (Outer Frame Page)
****************************************************************************************************
-TODO :
const materialMainPage = '/product/zwpdc-material-list';
// const page = ref({
//   reg: '/product/zwpdc-material-list/wwpdc-material-mgt', // 교재/자재 등록 UI
//   detail: '/product/zwpdc-material-list/wwpdc-material-dtl', // 교재/자재 상세보기 UI
// });
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="normal-area normal-area--button-set-bottom">
        <div class="kw-stepper-headingtext">
          <kw-stepper
            v-model="currentStep.name"
            heading-text
            :header-nav="!isTempSaveBtn || passedStep > 0"
            @update:model-value="onClickStep()"
          >
            <!-- 1. 기본속성 등록 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= regSteps[0].step"
              :name="regSteps[0].name"
              :title="$t('MSG_TXT_BAS_ATTR_REG')"
              :prefix="regSteps[0].step"
            />
            <!-- 2.연결상품 선택 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= regSteps[1].step"
              :name="regSteps[1].name"
              :title="$t('MSG_TXT_REL_PRDT_SEL')"
              :prefix="regSteps[1].step"
            />
            <!-- 3.관리속성 등록 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= regSteps[2].step"
              :name="regSteps[2].name"
              :title="$t('MSG_TXT_MGT_ATTR_REG')"
              :prefix="regSteps[2].step"
            />
            <!-- 4.등록정보 확인 -->
            <kw-step
              :header-nav="!isTempSaveBtn || passedStep >= regSteps[3].step"
              :name="regSteps[3].name"
              :title="$t('MSG_TXT_CHK_REG_INFO')"
              :prefix="regSteps[3].step"
            />

            <!-- 1. 기본속성 등록 -->
            <kw-step-panel :name="regSteps[0].name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[0]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                :pd-tp-dtl-cd="pdTpDtlCd"
                @open-popup="openPopup"
              />
            </kw-step-panel>
            <!-- 2.연결상품 선택 -->
            <kw-step-panel
              :name="regSteps[1].name"
            >
              <zwpdc-prop-relation-mgt
                :ref="cmpStepRefs[1]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
              />
            </kw-step-panel>
            <!-- 3.관리속성 등록 -->
            <kw-step-panel :name="regSteps[2].name">
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
            <kw-step-panel :name="regSteps[3].name">
              <kw-tabs
                v-model="selectedTab"
                class="mt20"
              >
                <kw-tab
                  name="attribute"
                  :label="$t('MSG_TXT_BAS_ATTR')"
                />
                <!-- 연결상품 -->
                <kw-tab
                  name="relation"
                  :label="$t('MSG_TXT_REL_PRDT')"
                />
                <kw-tab
                  name="attributeExtr"
                  :label="$t('MSG_TXT_MGT_ATTR')"
                />
              </kw-tabs>
              <kw-tab-panels :model-value="selectedTab">
                <!--기본속성-->
                <kw-tab-panel name="attribute">
                  <zwpdc-prop-groups-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                    :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                    :is-first-title="true"
                    :pd-tp-dtl-cd="pdTpDtlCd"
                    is-reg-check-page
                  />
                </kw-tab-panel>
                <!-- 연결상품-->
                <kw-tab-panel name="relation">
                  <wwpdc-prop-relation-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                  />
                </kw-tab-panel>
                <!--관리속성-->
                <kw-tab-panel name="attributeExtr">
                  <zwpdc-prop-groups-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                    :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                    :is-first-title="true"
                    :except-id="exceptPrpGrpCd"
                    is-reg-check-page
                  />
                </kw-tab-panel>
              </kw-tab-panels>
            </kw-step-panel>
          </kw-stepper>
        </div>

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
              v-if="currentPdCd"
              v-permission:delete
              :label="$t('MSG_BTN_DEL')"
              @click="onClickRemove"
            />
            <!--
              취소
              v-if="!isEmpty(currentPdCd)"
            -->
            <kw-btn
              v-show="!isTempSaveBtn"
              :label="$t('MSG_BTN_CANCEL')"
              class="ml8"
              @click="onClickCancel"
            />
            <!-- 초기화 currentStep.step === 1 && isCreate -->
            <kw-btn
              v-show="isShowInitBtn"
              :label="$t('MSG_BTN_INTL')"
              class="ml8"
              @click="onClickReset"
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
import { useDataService, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import { pdMergeBy, pageMove } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue'; /* 속성 등록/수정 */
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue'; /* 속성 상세보기 */
import ZwpdcPropRelationMgt from './WwpdcPropRelationMgtM.vue'; /* 연결상품 등록/수정 */
import WwpdcPropRelationDtl from './WwpdcPropRelationDtlM.vue'; /* 연결상품 상세보기 */

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
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
const wellsStep = [
  pdConst.W_MATERIAL_STEP_BASIC,
  pdConst.W_MATERIAL_STEP_REL_PROD,
  pdConst.W_MATERIAL_STEP_MANAGE,
  pdConst.W_MATERIAL_STEP_CHECK,
];
const regSteps = ref(wellsStep);
const currentStep = cloneDeep(ref(wellsStep[0]));
const passedStep = ref(0);
const obsMainRef = ref();
const cmpStepRefs = ref([ref(), ref(), ref()]);

const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const rel = pdConst.TBL_PD_REL;

const prevStepData = ref({});
const currentPdCd = ref();
const isTempSaveBtn = ref(true);
const isCreate = ref(false);

const selectedTab = ref('attribute');
const exceptPrpGrpCd = ref('PART');
const isShowInitBtn = ref(false);

async function onClickReset() {
  await cmpStepRefs.value.forEach((item) => {
    item.value.resetData();
  });
  passedStep.value = 0;
}

async function onClickRemove() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`${baseUrl}/${currentPdCd.value}`);
    await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: true });
  }
}

async function getSaveData(tempSaveYn) {
  const subList = { isModifiedProp: false, isOnlyFileModified: false };
  // eslint-disable-next-line no-unused-vars
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
  return subList;
}

async function onClickStep() {
  const stepName = currentStep.value?.name;
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
}

async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

async function fetchData() {
  const initData = {};
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`);
    initData[bas] = res.data[bas];
    initData[dtl] = res.data[dtl];
    initData[ecom] = res.data[ecom];
    initData[rel] = res.data[rel];
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
    await init();
  }
}

// 중복체크 메소드 - 확장성 위해 'validationType' 추가.
// async function duplicationCheck(validationType, sourceData) {
//   const validationParams = {};
//   validationParams.validationType = validationType;
//   validationParams.pdCd = sourceData[bas].pdCd;
//   validationParams.sapMatCd = sourceData[bas].sapMatCd;

//   const res = await dataService.get(`${baseUrl}/check-validation`, { params: validationParams });

//   if (res.data !== 'N') {
//     // 다른 교재/제품에서 이미 사용 중인 SAP자재코드입니다. (사용 교재/제품코드: {0}/{1}) - 교재명/자재코드
//     notify(t('MSG_ALT_EXIST_SAP_MAT_CD', [res.data, validationParams.sapMatCd]));
//     return false;
//   }
//   return true;
// }

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
      currentStep.value = cloneDeep(regSteps.value[idx]);
    }
  }));
  if (!isValidOk) return;

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData(tempSaveYn);

  // 4. 자재코드 중복검사.
  // TODO 설계요청에 의해 임시주석처리 230516
  // if (!isEmpty(subList[bas].sapMatCd)) {
  //   if (!await duplicationCheck('sapMatCd', subList)) return false;
  // }

  // 5. Insert or Update
  const rtn = currentPdCd.value
    ? await dataService.put(baseUrl, subList)
    : await dataService.post(`${baseUrl}`, subList);

  // 6. fetchData Or pageMove
  notify(t('MSG_ALT_SAVE_DATA'));
  if (tempSaveYn === 'Y') {
    currentPdCd.value = rtn.data?.data?.pdCd;
    isCreate.value = isEmpty(currentPdCd.value);
    await fetchData();
  } else {
    await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: true });
  }
}

async function onClickNextStep() {
  // Validation Check 1- 현재 Step 필수여부 확인
  const isValidOk = await (cmpStepRefs.value[currentStep.value.step - 1].value.validateProps());
  if (!isValidOk) return false;

  if (isEmpty(prevStepData.value)) prevStepData.value = {};
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value[(currentStep.value.step - 1) + 1]);
  passedStep.value = currentStep.value.step;
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

async function onClickCancel() {
  // TODO [신규 Vs 수정] 취소버튼 클릭시 이동해야할 대상이 달라진다면 query.fromUi로 대응하도록 파라미터 선처리함.
  let modifiedOk = false;
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (!modifiedOk) {
      if (await item.value.isModifiedProps()) {
        modifiedOk = true;
      }
    }
  }));

  // MSG_ALT_HIS_TAB_MOD - 변경사항이 있습니다. 취소하시겠습니까?
  if (modifiedOk && await confirm(t('MSG_ALT_DO_CANCEL_DISCARD_CHANGE'))) {
    await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: false });
  }
  if (!modifiedOk) await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: false });
}

// async function setInitCondition() {
//   const { pdCd, tempSaveYn } = props;
//   currentPdCd.value = pdCd;
//   isCreate.value = isEmpty(currentPdCd.value);
//   isTempSaveBtn.value = tempSaveYn !== 'N';

//   if (currentPdCd.value) await fetchData();
// }

// onMounted(async () => {
//   await setInitCondition();
// });

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  passedStep.value = 0;
  if (currentPdCd.value) {
    await fetchData();
  } else {
    isTempSaveBtn.value = true;
  }
  isCreate.value = isEmpty(currentPdCd.value);
}

await initProps();

async function popupCallback(payload) {
  if (payload?.fromUi === 'ZwpdcMaterialsCodeListP') {
    if (isEmpty(prevStepData.value[bas])) {
      prevStepData.value = await getSaveData();
    }

    prevStepData.value[bas].sapMatCd = payload.sapMatCd ?? '';
    prevStepData.value[bas].modelNo = payload.modelNo ?? '';
    prevStepData.value[bas].sapPdctSclsrtStrcVal = payload.sapPdctSclsrtStrcVal ?? '';
    prevStepData.value[bas].sapPlntCd = payload.sapPlntCd ?? '';
    prevStepData.value[bas].sapMatEvlClssVal = payload.sapMatEvlClssVal ?? '';
    prevStepData.value[bas].sapMatGrpVal = payload.sapMatGrpVal ?? '';
    prevStepData.value[bas].sapPlntCd = payload.sapPlntVal ?? '';
    prevStepData.value[bas].sapMatTpVal = payload.sapMatTpVal ?? '';
  }
}

async function openPopup(field) {
  console.log('Open Popup : ', field.colNm, field.sourcInfCn);
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

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.tempSaveYn, (val) => { isTempSaveBtn.value = val !== 'Y'; });

</script>
<style lang="scss" scoped></style>
