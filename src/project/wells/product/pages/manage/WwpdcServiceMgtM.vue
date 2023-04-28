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
    <div class="normal-area normal-area--button-set-bottom">
      <kw-stepper
        v-model="currentStep.name"
        heading-text
        :header-nav="!isTempSaveBtn || passedStep > 0"
        @update:model-value="onClickStep()"
      >
        <slot>
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_BASIC.step"
            :name="pdConst.W_SERVICE_STEP_BASIC.name"
            :title="$t('MSG_TXT_PROP_REG')"
            :prefix="pdConst.W_SERVICE_STEP_BASIC.step"
            :done="currentStep.step > pdConst.W_SERVICE_STEP_BASIC.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_FILTER.step"
            :name="pdConst.W_SERVICE_STEP_FILTER.name"
            :title="$t('MSG_TXT_PD_FILT_CHG')"
            :prefix="pdConst.W_SERVICE_STEP_FILTER.step"
            :done="currentStep.step > pdConst.W_SERVICE_STEP_FILTER.step"
          />
          <kw-step
            :header-nav="!isTempSaveBtn || passedStep >= pdConst.W_SERVICE_STEP_CHECK.step"
            :name="pdConst.W_SERVICE_STEP_CHECK.name"
            :title="$t('MSG_TXT_CHK_REG_INFO')"
            :prefix="pdConst.W_SERVICE_STEP_CHECK.step"
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
            <h3 class="mb20">
              <!-- 기본속성 -->
              {{ $t('MSG_TXT_BAS_ATTR') }}
            </h3>
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
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, codeUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcServiceMgtMFilter from './WwpdcServiceMgtMFilter.vue';
import WwpdcServiceDtlMContents from './WwpdcServiceDtlMContents.vue';

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
const rel = pdConst.TBL_PD_REL;

const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.W_SERVICE_STEP_BASIC, pdConst.W_SERVICE_STEP_FILTER, pdConst.W_SERVICE_STEP_CHECK]);
const currentStep = cloneDeep(ref(pdConst.W_SERVICE_STEP_BASIC));
const passedStep = ref(0);
const cmpStepRefs = ref([ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

// 삭제 버튼
async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/services/${currentPdCd.value}`);
    await router.close();
    await router.push({ path: '/product/zwpdc-service-list',
      query: { searchYn: 'Y' }, /* 임시 아래 stateParam 될 때 삭제, props로 돌리는건 watch 문제가 있음 */
      state: { stateParam: { searchYn: 'Y' } },
    });
  }
}

async function getSaveData() {
  const subList = { isModifiedProp: false, isOnlyFileModified: false };
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
        subList[rel] = pdMergeBy(subList[rel], saveData[rel]);
      }
      if (saveData[pdConst.RELATION_PRODUCTS]) {
        subList[pdConst.RELATION_PRODUCTS] = saveData[pdConst.RELATION_PRODUCTS];
      }
    }
  }));
  // console.log('subList : ', subList);
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
  const isValidOk = await (cmpStepRefs.value[currentStepIndex].value?.validateProps());
  if (!isValidOk) {
    return;
  }

  // 다음 이동
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value[(currentStep.value.step - 1) + 1]);
  passedStep.value = currentStep.value.step;
}

// 이전 버튼
async function onClickPrevStep() {
  currentStep.value = cloneDeep(regSteps.value[(currentStep.value.step - 1) - 1]);
}

// Stepper 클릭
async function onClickStep() {
  const stepName = currentStep.value?.name;
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
}

// 취소 버튼
async function onClickCancel() {
  await router.close();
}

async function init() {
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.init) await item.value?.init();
  }));
}

async function fetchProduct() {
  const initData = {};
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/services/${currentPdCd.value}`);
    initData[bas] = res.data[bas];
    initData[ecom] = res.data[ecom];
    initData[rel] = res.data[rel];
    initData[pdConst.RELATION_PRODUCTS] = res.data[pdConst.RELATION_PRODUCTS];
    isTempSaveBtn.value = initData[bas].tempSaveYn === 'Y';
    prevStepData.value = initData;
    // console.log('res.data : ', res.data);
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
          // console.log('Update Idx : ', idx);
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
  if (!isCreate.value) {
    rtn = await dataService.put(`/sms/wells/product/services/${currentPdCd.value}`, subList);
  } else {
    rtn = await dataService.post('/sms/wells/product/services', subList);
  }
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();

  if (tempSaveYn === 'N') {
    // 목록으로 이동
    await router.close();
    await router.push({ path: '/product/zwpdc-service-list',
      query: { searchYn: 'Y' }, /* 임시 아래 stateParam 될 때 삭제 */
      state: { stateParam: { searchYn: 'Y' } },
    });
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      currentPdCd.value = rtn.data?.data?.pdCd;
      isCreate.value = isEmpty(currentPdCd.value);
      router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', query: { pdCd: currentPdCd.value } });
    }
  }
}

// 초기화 버튼
async function onClickReset() {
  currentPdCd.value = '';
  isCreate.value = true;
  isTempSaveBtn.value = true;
  currentStep.value = cloneDeep(pdConst.W_SERVICE_STEP_BASIC);
  passedStep.value = 0;
  prevStepData.value = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value?.resetData) await item.value?.resetData();
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
  if (!route.path.includes('zwpdc-service-list')) return;
  console.log(`WwpdcServiceMgtM - watch - currentPdCd.value: ${currentPdCd.value} route.params.pdCd: ${pdCd}`, route);
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
  if (!route.path.includes('zwpdc-service-list')) return;
  console.log(`WwpdcServiceMgtM - watch - route.params.newRegYn: ${newRegYn}`, route);
  if (newRegYn === 'Y') {
    await onClickReset();
  }
});

// 화면(탭) OPEN 상태에서, 상품정보 갱신
watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('zwpdc-service-list')) return;
  console.log(`WwpdcServiceMgtM - watch - route.params.reloadYn: ${reloadYn}`, route);
  if (reloadYn === 'Y') {
    currentStep.value = cloneDeep(pdConst.W_SERVICE_STEP_BASIC);
    passedStep.value = 0;
    await fetchProduct();
  }
});

</script>
<style scoped></style>
