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
        :header-nav="!isTempSaveBtn"
        @update:model-value="onClickStep()"
      >
        <slot>
          <kw-step
            :name="pdConst.E_SERVICE_STEP_BASIC.name"
            :title="$t('MSG_TXT_PROP_REG')"
            :prefix="pdConst.E_SERVICE_STEP_BASIC.step"
            :done="currentStep.step > pdConst.E_SERVICE_STEP_BASIC.step"
          />
          <kw-step
            :name="pdConst.W_SERVICE_STEP_FILTER.name"
            :title="$t('MSG_TXT_PD_FILT_CHG')"
            :prefix="pdConst.W_SERVICE_STEP_FILTER.step"
            :done="currentStep.step > pdConst.W_SERVICE_STEP_FILTER.step"
          />
          <kw-step
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
            />
          </kw-step-panel>
        </slot>
      </kw-stepper>

      <div class="button-set--bottom">
        <div class="button-set--bottom-left">
          <kw-btn
            v-show="currentStep.step > 1"
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
          <kw-btn
            v-show="currentStep.step === 1 && isCreate"
            :label="$t('MSG_BTN_INTL')"
            class="ml8"
            @click="onClickReset"
          />
          <kw-btn
            v-if="currentStep.step < regSteps.length && isTempSaveBtn"
            :label="$t('MSG_BTN_TMP_SAVE')"
            class="ml8"
            @click="onClickSave('Y')"
          />
          <kw-btn
            v-show="currentStep.step < regSteps.length"
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
const rel = pdConst.TBL_PD_REL;

const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.W_SERVICE_STEP_BASIC, pdConst.W_SERVICE_STEP_FILTER, pdConst.W_SERVICE_STEP_CHECK]);
const currentStep = cloneDeep(ref(pdConst.W_SERVICE_STEP_BASIC));
const cmpStepRefs = ref([ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    await dataService.delete(`/sms/wells/product/services/${currentPdCd.value}`);
    router.close();
    router.push({ path: '/product/zwpdc-service-list', replace: true, query: { onloadSearchYn: 'Y' } });
  }
}
async function getSaveData() {
  const subList = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    const saveData = item.value?.getSaveData ? await item.value.getSaveData() : null;
    if (await saveData) {
      // console.log(`${idx}saveData : `, saveData);
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
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value[(currentStep.value.step - 1) + 1]);
}

async function onClickPrevStep() {
  currentStep.value = cloneDeep(regSteps.value[(currentStep.value.step - 1) - 1]);
}

async function onClickStep() {
  const stepName = currentStep.value?.name;
  prevStepData.value = await getSaveData();
  currentStep.value = cloneDeep(regSteps.value.find((item) => item.name === stepName));
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
    prevStepData.value = cloneDeep(initData);
    // console.log('res.data : ', res.data);
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
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    if (item.value.init) { await item.value.init(); }
  }));
  if (tempSaveYn === 'N') {
    // 목록으로 이동
    router.close();
    router.push({ path: '/product/zwpdc-service-list', replace: true, query: { onloadSearchYn: 'Y' } });
    return;
  }
  if (isTempSaveBtn.value) {
    // 임시저장
    if (rtn.data?.data?.pdCd !== currentPdCd.value) {
      currentPdCd.value = rtn.data?.data?.pdCd;
      isCreate.value = isEmpty(currentPdCd.value);
      router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', replace: true, query: { pdCd: currentPdCd.value } });
    }
  }
}

async function onClickReset() {
  currentPdCd.value = '';
  isCreate.value = true;
  isTempSaveBtn.value = true;
  currentStep.value = cloneDeep(pdConst.W_SERVICE_STEP_BASIC);
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

watch(() => route.params.pdCd, async (pdCd) => {
  if (!route.path.includes('wwpdc-service-mgt')) return;
  console.log(`WwpdcServiceMgtM - watch - currentPdCd.value: ${currentPdCd.value} route.params.pdCd: ${pdCd}`);
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

watch(() => route.params.newRegYn, async (newRegYn) => {
  if (!route.path.includes('wwpdc-service-mgt')) return;
  console.log(`WwpdcServiceMgtM - watch - route.params.newRegYn: ${newRegYn}`);
  if (newRegYn && newRegYn === 'Y') {
    await onClickReset();
  }
});

watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('wwpdc-service-mgt')) return;
  console.log(`WwpdcServiceMgtM - watch - route.params.reloadYn: ${reloadYn}`);
  if (reloadYn && reloadYn === 'Y') {
    currentStep.value = cloneDeep(pdConst.W_SERVICE_STEP_BASIC);
    await fetchProduct();
  }
});

</script>
<style scoped></style>
