  <!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartMgtM - AS부품 등록/변경
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> AS부품 등록/변경 프로그램 (Outer Frame Page)
****************************************************************************************************
-TODO :
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="normal-area normal-area--button-set-bottom">
        <div class="kw-stepper-headingtext">
          <kw-stepper
            v-model="currentStep.name"
            heading-text
          >
            <!-- 1. 기본속성 등록 -->
            <kw-step
              :name="regSteps[0].name"
              :title="$t('MSG_TXT_BAS_ATTR_REG')"
              :prefix="regSteps[0].step"
            />
            <!-- 3.관리속성 등록 -->
            <kw-step
              :name="regSteps[1].name"
              :title="$t('MSG_TXT_MGT_ATTR_REG')"
              :prefix="regSteps[1].step"
            />
            <!-- 4.등록정보 확인 -->
            <kw-step
              :name="regSteps[2].name"
              :title="$t('MSG_TXT_CHK_REG_INFO')"
              :prefix="regSteps[2].step"
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
                @popup-callback="popupCallback"
              />
            </kw-step-panel>

            <!-- 3.관리속성 등록 -->
            <kw-step-panel :name="regSteps[1].name">
              <zwpdc-prop-groups-mgt
                :ref="cmpStepRefs[1]"
                v-model:pd-cd="currentPdCd"
                v-model:init-data="prevStepData"
                :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                :except-id="exceptPrpGrpCd"
              />
            </kw-step-panel>
            <!-- 4.등록정보 확인 -->
            <kw-step-panel :name="regSteps[2].name">
              <kw-tabs
                v-model="selectedTab"
                class="mt20"
              >
                <kw-tab
                  name="attribute"
                  :label="$t('MSG_TXT_BAS_ATTR')"
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
                    :prefix-title="$t('MSG_TXT_BAS_ATTR')"
                    :is-first-title="true"
                    :pd-tp-dtl-cd="pdTpDtlCd"
                  />
                </kw-tab-panel>
                <!--관리속성-->
                <kw-tab-panel name="attributeExtr">
                  <zwpdc-prop-groups-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                    :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                    :prefix-title="$t('MSG_TXT_MGT_ATTR')"
                    :is-first-title="true"
                    :except-id="exceptPrpGrpCd"
                  />
                </kw-tab-panel>
              </kw-tab-panels>
            </kw-step-panel>
          </kw-stepper>
        </div>

        <div class="button-set--bottom">
          <div class="button-set--bottom-right">
            <!-- 삭제 -->
            <kw-btn
              v-if="currentPdCd"
              v-permission:delete
              :label="$t('MSG_BTN_DEL')"
              @click="onClickRemove"
            />
            <!-- 취소 -->
            <kw-btn
              v-if="!isEmpty(currentPdCd)"
              :label="$t('MSG_BTN_CANCEL')"
              class="ml8"
              @click="onClickCancel"
            />
            <!-- 초기화 -->
            <kw-btn
              v-show="currentStep.step === 1 && isCreate"
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
            <!-- 이전 -->
            <kw-btn
              v-show="(currentStep.step > 1)"
              :label="$t('MSG_BTN_PREV')"
              class="ml8"
              @click="onClickPrevStep"
            />
            <!-- 다음 -->
            <kw-btn
              v-show="(currentStep.step < regSteps.length)"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNextStep"
            />
            <!-- 저장 -->
            <kw-btn
              v-show="currentStep.step === regSteps.length"
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
import { isEmpty } from 'lodash-es';
import { pdMergeBy } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue'; /* 속성 등록/수정 */
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue'; /* 속성 상세보기 */

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const { t } = useI18n();
const dataService = useDataService();
const { confirm, notify } = useGlobal();
const router = useRouter();
const obsMainRef = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';
const asPartMainPage = '/product/wwpdc-as-part-list';

const pdTpDtlCd = ref(pdConst.PD_TP_DTL_CD_AS_PART);
const wellsStep = [
  pdConst.W_AS_PART_STEP_BASIC,
  pdConst.W_AS_PART_STEP_MANAGE,
  pdConst.W_AS_PART_STEP_CHECK,
];
const regSteps = ref(wellsStep);
const currentStep = ref(wellsStep[0]);
const cmpStepRefs = ref([ref(), ref()]);

const bas = pdConst.TBL_PD_BAS;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const rel = pdConst.TBL_PD_REL;

const prevStepData = ref({});
const currentPdCd = ref();
const isTempSaveBtn = ref(true);
const isCreate = ref(false);

const selectedTab = ref('attribute');

const page = ref({
  reg: '/product/zwpdc-as-part-list/wwpdc-as-part-mgt', // AS부품 등록 UI
  detail: '/product/zwpdc-as-part-list/wwpdc-as-part-dtl', // AS부품 상세보기 UI
});

const exceptPrpGrpCd = ref('');

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.tempSaveYn, (val) => { isTempSaveBtn.value = val !== 'Y'; });

async function onClickReset() {
  notify('TBD Function..');
  await cmpStepRefs.value.forEach((item) => {
    item.value.resetData();
  });
}

async function onClickRemove() {
  if (currentPdCd.value) {
    if (await confirm(t('MSG_ALT_DO_DELETE'))) {
      await dataService.delete(`${baseUrl}/${currentPdCd.value}`);
      // 변경사항 체크로직 우회 및 현재 page 닫고 target 페이지로 이동.
      obsMainRef.value.init();

      // CASE -1 F5 keyPress 현상 발생 및 타겟화면 호출불가.
      // await router.go(
      //   { path: asPartMainPage,
      //     query: { isSearch: true, closeTargetUi: page.value.reg },
      //   },
      // );
      // CASE -2 창 닫고 이동은 하지만...파라미터 전달 불가.
      await router.close(
        {
          to: asPartMainPage,
          params: { isSearch: true, closeTargetUi: page.value.reg },
          query: { isSearch: true, closeTargetUi: page.value.reg },
          refresh: false,
        },
      );
      // CASE -3 파라미터 전달하여 이동은 하지만, 현재 창 닫지못함. 또한 타겟 페이지의 grid 객체 null 에러남. (unMounted 타는 듯.)
      // await router.push(
      //   { path: asPartMainPage,
      //     query: { isSearch: true, closeTargetUi: page.value.reg },
      //   },
      // );
    }
  }
}

async function getSaveData(tempSaveYn) {
  const subList = {};
  console.log('cmpStepRefs', cmpStepRefs.value);
  // eslint-disable-next-line no-unused-vars
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const saveData = await item.value.getSaveData();
    if (await saveData) {
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      if (saveData[bas]) {
        if (subList[bas]?.cols) {
          saveData[bas].cols += subList[bas].cols;
        }
        subList[bas] = pdMergeBy(subList[bas], saveData[bas]);
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

async function fetchData() {
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`);
    prevStepData.value[bas] = res.data[bas];
    prevStepData.value[ecom] = res.data[ecom];
    prevStepData.value[rel] = res.data[rel];
    obsMainRef.value.init();
  }
}

async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    let isModifiedOk = true;
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (isModifiedOk) {
        isModifiedOk = await item.value.isModifiedProps(false);
      }
    }));
  }

  // 2. Step별 필수여부 확인
  let isValidOk = true;
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (!await item.value.validateProps()) {
      isValidOk = false;
      currentStep.value = regSteps.value[idx];
    }
  }));
  if (!isValidOk) return;

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData(tempSaveYn);

  // 4. 생성 or 저장
  const rtn = currentPdCd.value
    ? await dataService.put(baseUrl, subList)
    : await dataService.post(`${baseUrl}`, subList);

  // 5. 생성 이후 Step 설정
  notify(t('MSG_ALT_SAVE_DATA'));
  if (tempSaveYn === 'Y') {
    currentPdCd.value = rtn.data?.data?.pdCd;
    isCreate.value = isEmpty(currentPdCd.value);
    await fetchData();
  } else {
    // TODO 경로 관련 여타와 동일하게 push,close-go, go 방식들 내재한 문제 처리 필요.
    router.push({ path: asPartMainPage, query: {} });
  }
}

async function onClickNextStep() {
  // Validation Check 1- 현재 Step 필수여부 확인
  const isValidOk = await (cmpStepRefs.value[currentStep.value.step - 1].value.validateProps());
  if (!isValidOk) return false;

  // Validation Check 2- 현재 Step 변경사항 유무 확인 (변경사항이 있으면 '임시저장' 버튼 기능 수행 후 다음으로!)
  // const isModify = await (cmpStepRefs.value[currentStep.value.step - 1].value.isModifiedProps(false));
  // console.log('변경사항 유무 체크', isModify);
  // if (isModify) {
  //   // 변경사항이 있으므로 DB 저장수행 및 save Method 내부단에서 prevStepData 의 값들을 재조회하므로 if else 분기.
  //   await onClickSave('Y');
  // } else {
  //   prevStepData.value = await getSaveData();
  // }

  prevStepData.value = await getSaveData();
  currentStep.value = regSteps.value[(currentStep.value.step - 1) + 1];
}

async function onClickPrevStep() {
  currentStep.value = regSteps.value[(currentStep.value.step - 1) - 1];
}

async function onClickCancel() {
  await router.close({ to: asPartMainPage });
}

async function setInitCondition() {
  const { pdCd, tempSaveYn } = props;
  currentPdCd.value = pdCd;
  isCreate.value = isEmpty(currentPdCd.value);
  isTempSaveBtn.value = tempSaveYn !== 'N';

  if (currentPdCd.value) await fetchData();
}

onMounted(async () => {
  await setInitCondition();
  console.log('as-partas-partas-part MGT');
});

async function popupCallback(payload) {
  if (payload.fromUi === 'ZwpdcMaterialsCodeListP') {
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
  }
}
</script>
<style lang="scss" scoped></style>
