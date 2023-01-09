<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtM - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
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
      <div class="kw-stepper-headingtext">
        <kw-stepper v-model="currentStep.name">
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
              :props-title="$t('MSG_TXT_BAS_ATTR')"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.STANDARD_STEP_REL_PROD.name">
            <wwpdc-standard-mgt-m-rel
              :ref="cmpStepRefs[1]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.STANDARD_STEP_MANAGE.name">
            <zwpdc-prop-groups-mgt
              :ref="cmpStepRefs[2]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
              :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
              :props-title="$t('MSG_TXT_MGT_ATTR')"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.STANDARD_STEP_PRICE.name">
            <wwpdc-standard-mgt-m-price
              :ref="cmpStepRefs[3]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
            />
          </kw-step-panel>
          <kw-step-panel :name="pdConst.STANDARD_STEP_CHECK.name">
            <zwpdc-prop-groups-dtl
              :ref="cmpStepRefs[4]"
              v-model:pd-cd="currentPdCd"
              v-model:init-data="prevStepData"
              :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            />
          </kw-step-panel>
        </kw-stepper>
      </div>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            v-show="!isCreate"
            :label="$t('MSG_BTN_DEL')"
            @click="onClickDelete"
          />
          <kw-btn
            v-show="currentStep.step === 1 && isCreate"
            :label="$t('MSG_BTN_RESET')"
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
            :label="$t('MSG_BTN_SVE')"
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
import { useDataService, useGlobal } from 'kw-lib';
import { isEmpty, merge, unionBy } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsMgt from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsMgt.vue';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import WwpdcStandardMgtMPrice from './WwpdcStandardMgtMPrice.vue';
import WwpdcStandardMgtMRel from './WwpdcStandardMgtMRel.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});
const bas = pdConst.TBL_PD_BAS;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const prcd = pdConst.TBL_PD_PRC_DTL;

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { notify, confirm } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isTempSaveBtn = ref(true);
const regSteps = ref([pdConst.STANDARD_STEP_BASIC, pdConst.STANDARD_STEP_REL_PROD,
  pdConst.STANDARD_STEP_MANAGE, pdConst.STANDARD_STEP_PRICE, pdConst.STANDARD_STEP_CHECK]);
const currentStep = ref(pdConst.STANDARD_STEP_BASIC);
const cmpStepRefs = ref([ref(), ref(), ref(), ref(), ref()]);
const prevStepData = ref({});
const currentPdCd = ref();
const isCreate = ref(false);

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
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    const saveData = await item.value.getSaveData();
    if (await saveData) {
      console.log(`${idx}saveData : `, saveData);
      subList.pdCd = subList.pdCd ?? saveData.pdCd;
      subList.pdTpCd = subList.pdTpCd ?? saveData.pdTpCd;
      if (saveData[bas]) {
        if (subList[bas]?.cols) {
          saveData[bas].cols += subList[bas].cols;
        }
        subList[bas] = merge(subList[bas] ?? {}, saveData[bas]);
      }
      if (saveData[ecom]) {
        subList[ecom] = unionBy(saveData[ecom], subList[ecom], 'pdExtsPrpGrpCd');
      }
      if (saveData[prcd]) {
        subList[prcd] = unionBy(saveData[prcd], subList[prcd], 'pdPrcDtlId');
      }
      // console.log(`${idx}subList : `, subList);
    }
  }));
  console.log('subList : ', subList);
  return subList;
}

async function onClickNextStep() {
  // 현재 Step 필수여부 확인
  const validOk = await (cmpStepRefs.value[currentStep.value.step - 1].value.validateProps());
  if (!validOk) {
    return;
  }
  prevStepData.value = await getSaveData();
  currentStep.value = regSteps.value[(currentStep.value.step - 1) + 1];
}

async function onClickPrevStep() {
  currentStep.value = regSteps.value[(currentStep.value.step - 1) - 1];
}

async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/common/product/standards/${currentPdCd.value}`);
    prevStepData.value[bas] = res.data[bas];
    prevStepData.value[ecom] = res.data[ecom];
    prevStepData.value[prcd] = res.data[prcd];
    console.log('res.data : ', res.data);
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
  let validOk = true;
  await Promise.all(cmpStepRefs.value.map(async (item, idx) => {
    if (!await item.value.validateProps()) {
      validOk = false;
      currentStep.value = regSteps.value[idx];
    }
  }));
  if (!validOk) {
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

async function fetchData() {
  const { pdCd, tempSaveYn } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchProduct();
  }
  isCreate.value = isEmpty(currentPdCd.value);
  isTempSaveBtn.value = tempSaveYn !== 'N';
}

await fetchData();

watch(() => route.params.pdCd, async (pdCd) => {
  if (pdCd && currentPdCd.value !== pdCd) {
    currentPdCd.value = pdCd;
    isCreate.value = isEmpty(currentPdCd.value);
    currentStep.value = pdConst.STANDARD_STEP_BASIC;
    await fetchProduct();
  }
}, { immediate: true });

watch(() => route.params.tempSaveYn, async (tempSaveYn) => {
  if (tempSaveYn && isTempSaveBtn.value !== (tempSaveYn !== 'N')) {
    isTempSaveBtn.value = tempSaveYn !== 'N';
  }
}, { immediate: true });

</script>
<style scoped></style>
