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
    <div class="normal-area normal-area--button-set-bottom">
      <kw-stepper
        v-model="currentStep.name"
        heading-text
      >
        <kw-step
          :name="pdConst.STANDARD_STEP_BASIC.name"
          :title="$t('MSG_TXT_BAS_ATTR_REG')"
          :prefix="pdConst.STANDARD_STEP_BASIC.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_BASIC.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_REL_PROD.name"
          :title="$t('MSG_TXT_REL_PRDT_SEL')"
          :prefix="pdConst.STANDARD_STEP_REL_PROD.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_REL_PROD.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_MANAGE.name"
          :title="$t('MSG_TXT_MGT_ATTR_REG')"
          :prefix="pdConst.STANDARD_STEP_MANAGE.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_MANAGE.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_PRICE.name"
          :title="$t('MSG_TXT_PRC_INFO_REG')"
          :prefix="pdConst.STANDARD_STEP_PRICE.step"
          :done="currentStep.step > pdConst.STANDARD_STEP_PRICE.step"
        />
        <kw-step
          :name="pdConst.STANDARD_STEP_CHECK.name"
          :title="$t('MSG_TXT_CHK_REG_INFO')"
          :prefix="pdConst.STANDARD_STEP_CHECK.step"
        />
        <kw-step-panel :name="pdConst.STANDARD_STEP_BASIC.name">
          <zwpdc-prop-groups-mgt
            :ref="cmpStepRefs[0]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_REL_PROD.name">
          <wwpdc-standard-mgt-m-rel
            :ref="cmpStepRefs[1]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :codes="codes"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_MANAGE.name">
          <zwpdc-prop-groups-mgt
            :ref="cmpStepRefs[2]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_PRICE.name">
          <wwpdc-standard-mgt-m-price
            :ref="cmpStepRefs[3]"
            v-model:pd-cd="currentPdCd"
            v-model:init-data="prevStepData"
            :codes="codes"
          />
        </kw-step-panel>
        <kw-step-panel :name="pdConst.STANDARD_STEP_CHECK.name">
          <wwpdc-standard-dtl-m-contents
            :pd-cd="currentPdCd"
            :init-data="prevStepData"
            :temp-save-yn="props.tempSaveYn"
            :is-history-tab="false"
            :is-update-btn="false"
          />
        </kw-step-panel>
      </kw-stepper>
      <div class="button-set--bottom">
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
            v-show="currentStep.step > 1"
            :label="$t('MSG_BTN_PREV')"
            class="ml8"
            @click="onClickPrevStep"
          />
          <kw-btn
            v-show="currentStep.step < regSteps.length"
            :label="$t('MSG_BTN_NEXT')"
            class="ml8"
            primary
            @click="onClickNextStep"
          />
          <kw-btn
            v-show="!isCreate || currentStep.step === regSteps.length"
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
import { useDataService, codeUtil, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, pdRemoveBy } from '~sms-common/product/utils/pdUtil';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import WwpdcStandardMgtMPrice from './WwpdcStandardMgtMPrice.vue';
import WwpdcStandardMgtMRel from './WwpdcStandardMgtMRel.vue';
import WwpdcStandardDtlMContents from './WwpdcStandardDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
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
const regSteps = ref([pdConst.STANDARD_STEP_BASIC, pdConst.STANDARD_STEP_REL_PROD,
  pdConst.STANDARD_STEP_MANAGE, pdConst.STANDARD_STEP_PRICE, pdConst.STANDARD_STEP_CHECK]);
const currentStep = ref(pdConst.STANDARD_STEP_BASIC);
const cmpStepRefs = ref([ref(), ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'COD_PRDT_STT',
  'SELL_CHNL_DV_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
  'SV_PRD_UNIT_CD',
  'SV_VST_PRD_CD',
);

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.tempSaveYn, (val) => { isTempSaveBtn.value = val !== 'Y'; });

async function onClickReset() {
  cmpStepRefs.value.forEach((item) => {
    item.value.resetData();
  });
}

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_DO_DELETE'))) {
    await dataService.delete(`/sms/common/product/standards/${currentPdCd.value}`);
    // TODO 화면닫기
    router.push({ path: '/product/zwpdc-sale-product-list' });
  }
}

async function getSaveData() {
  const subList = {};
  await Promise.all(cmpStepRefs.value.map(async (item) => {
    const saveData = await item.value.getSaveData();
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
        subList[dtl] = pdMergeBy(subList[dtl], saveData[dtl], 'pdDtlDvCd');
      }
      if (saveData[ecom]) {
        subList[ecom] = pdMergeBy(subList[ecom], saveData[ecom], 'pdExtsPrpGrpCd');
      }
      if (saveData[prcd]) {
        subList[prcd] = pdMergeBy(subList[prcd], saveData[prcd], pdConst.PRC_STD_ROW_ID);
        subList[prcd] = pdRemoveBy(subList[prcd], saveData[pdConst.REMOVE_ROWS]);
      }
      if (saveData[prcfd]) {
        subList[prcfd] = pdMergeBy(subList[prcfd], saveData[prcfd], pdConst.PRC_FNL_ROW_ID);
        subList[prcfd] = pdRemoveBy(subList[prcfd], saveData[pdConst.REMOVE_ROWS]);
      }
      if (saveData[rel]) {
        subList[rel] = pdMergeBy(subList[rel], saveData[rel]);
      }
      if (saveData[prumd]) {
        subList[prumd] = saveData[prumd];
      }
      // console.log(`${idx}subList : `, subList);
    }
  }));
  // console.log('subList : ', subList);
  return subList;
}

async function onClickNextStep() {
  const currentStepIndex = currentStep.value.step - 1;
  // 현재 Step 필수여부 확인
  const isValidOk = await (cmpStepRefs.value[currentStepIndex].value.validateProps());
  if (!isValidOk) {
    return;
  }
  prevStepData.value = await getSaveData();
  const currentStepRef = await cmpStepRefs.value[currentStepIndex].value;
  // Child 페이지 내에서 다음 스텝이 없으면(false), 현재 페이지에서 다음으로 진행
  const isMovedInnerStep = currentStepRef?.moveNextStep ? await currentStepRef?.moveNextStep() : false;
  if (!isMovedInnerStep) {
    const nextStepRef = cmpStepRefs.value[currentStepIndex + 1]?.value;
    if (nextStepRef && nextStepRef.resetFirstStep) {
      await nextStepRef.resetFirstStep();
    }
    currentStep.value = regSteps.value[currentStepIndex + 1];
  }
}

async function onClickPrevStep() {
  const currentStepIndex = currentStep.value.step - 1;
  prevStepData.value = await getSaveData();
  const currentStepRef = await cmpStepRefs.value[currentStepIndex]?.value;
  // Child 페이지 내에서 이전 스텝이 없으면(false), 현재 페이지에서 이전으로 진행
  const isMovedInnerStep = currentStepRef?.movePrevStep ? await currentStepRef?.movePrevStep() : false;
  if (!isMovedInnerStep) {
    currentStep.value = regSteps.value[currentStepIndex - 1];
  }
}

async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/common/product/standards/${currentPdCd.value}`);
    // console.log('WwpdcStandardMgtM - fetchProduct - res.data', res.data);
    prevStepData.value[bas] = res.data[bas];
    prevStepData.value[dtl] = res.data[dtl];
    prevStepData.value[ecom] = res.data[ecom];
    prevStepData.value[prcd] = res.data[prcd];
    prevStepData.value[prcfd] = res.data[prcfd];
    prevStepData.value[prumd] = res.data[prumd];
    // console.log('res.data : ', res.data);
  }
}

async function onClickSave(tempSaveYn) {
  // 1. Step별 수정여부 확인
  // '임시저장 ==> 저장' 경우를 제외하고 수정여부 체크
  if (!(isTempSaveBtn.value && tempSaveYn === 'N')) {
    let modifiedOk = true;
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (modifiedOk) {
        modifiedOk = await item.value.isModifiedProps(false);
      }
    }));
    // if (!modifiedOk) {
    //   await alert(t('MSG_ALT_NO_CHG_CNTN'));
    //   return;
    // }
  }

  // 2. Step별 필수여부 확인
  let isValidOk = true;
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (!await item.value.validateProps()) {
      isValidOk = false;
      currentStep.value = regSteps.value[idx];
    }
  }));
  if (!isValidOk) {
    return;
  }

  // 3. Step별 저장 데이터 확인
  const subList = await getSaveData();

  // 4. 생성 or 저장
  const { pdCd } = props;
  let rtn;
  if (!isCreate.value) {
    rtn = await dataService.put(`/sms/common/product/standards/${pdCd}`, subList);
  } else {
    rtn = await dataService.post('/sms/common/product/standards', subList);
  }

  // 5. 생성 이후 Step 설정
  if (rtn) {
    notify(t('MSG_ALT_SAVE_DATA'));
    if (isTempSaveBtn) {
      // 임시저장
      currentPdCd.value = rtn.data?.data?.pdCd;
      isCreate.value = isEmpty(currentPdCd.value);
      fetchProduct();
    } else {
      router.push({ path: '/product/zwpdc-sale-product-list' });
    }
  }
}

async function initProps() {
  const { pdCd, tempSaveYn } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchProduct();
  }
  isCreate.value = isEmpty(currentPdCd.value);
  isTempSaveBtn.value = tempSaveYn !== 'N';
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  if (route.params.pdCd !== pdCd) {
    isCreate.value = isEmpty(pdCd);
    currentStep.value = pdConst.STANDARD_STEP_BASIC;
    if (isEmpty(pdCd)) {
      isTempSaveBtn.value = true;
    }
    prevStepData.value = {};
    if (pdCd !== currentStep.value) {
      currentPdCd.value = pdCd;
      await fetchProduct();
    }
  }
}, { immediate: true });

watch(() => route.params.tempSaveYn, async (tempSaveYn) => {
  if (tempSaveYn && isTempSaveBtn.value !== (tempSaveYn !== 'N')) {
    isTempSaveBtn.value = tempSaveYn !== 'N';
  }
}, { immediate: true });

</script>
<style scoped></style>
