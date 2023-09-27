<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeyEngineerAllowanceDsbUprcMgtP
3. 작성자 : jingun.jung
4. 작성일 : 2023.05.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 현장수당 단가 관리 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="frmRef"
    size="2xl"
  >
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <!-- 상품그룹 -->
        <kw-form-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="feeStandard.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            :options="codes['PD_GRP_CD']"
            :readonly="screenMode !== 'CREATE'"
            rules="required"
          />
        </kw-form-item>
        <!-- 상품유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRDT_TYPE')"
          required
        >
          <kw-select
            v-model="feeStandard.pdGrpDtlCd"
            :label="$t('MSG_TXT_PRDT_TYPE')"
            :options="filterdGroupDetailCode"
            :readonly="screenMode !== 'CREATE'"
            first-option="select"
            rules="required"
          />
        </kw-form-item>
        <!-- 급지구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_RGLVL_DV')"
        >
          <kw-select
            v-model="feeStandard.rglvlDvCd"
            :label="$t('MSG_TXT_RGLVL_DV')"
            :options="codes['RGLVL_DV_CD']"
            :readonly="screenMode !== 'CREATE'"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 서비스유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_SV_TP')"
        >
          <kw-select
            v-model="feeStandard.svTpCd"
            :label="$t('MSG_TXT_SV_TP')"
            :options="codes['SV_TP_CD_BK']"
            :readonly="screenMode !== 'CREATE'"
            rules="required"
          />
        </kw-form-item>
        <!-- 현장수당그룹 -->
        <kw-form-item
          :label="$t('MSG_TXT_SITE_AW_GRP')"
          required
        >
          <kw-select
            v-model="feeStandard.siteAwGrpCd"
            :label="$t('MSG_TXT_SITE_AW_GRP')"
            :options="codes.SITE_AW_GRP_CD.filter((item) => item.codeId.startsWith(
              (feeStandard.pdGrpDtlCd === '' ? 'DUMMY' : feeStandard.pdGrpDtlCd)))"
            :readonly="screenMode !== 'CREATE'"
            first-option="select"
            rules="required"
          />
        </kw-form-item>
        <!-- 현장수당항목 -->
        <kw-form-item
          :label="$t('MSG_TXT_SITE_AW_ATC')"
          required
        >
          <kw-select
            v-model="feeStandard.siteAwAtcCd"
            :label="$t('MSG_TXT_SITE_AW_ATC')"
            :options="codes.SITE_AW_ATC_CD.filter((item) => item.codeId.startsWith(
              (feeStandard.siteAwGrpCd === '' ? 'DUMMY' : feeStandard.siteAwGrpCd)))"
            :readonly="screenMode !== 'CREATE'"
            first-option="select"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 적용기간 -->
        <kw-form-item
          :label="t('MSG_TXT_ACEPT_PERIOD')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="feeStandard.apyStrtdt"
            v-model:to="feeStandard.apyEnddt"
            rules="date_range_required"
            :min-date="tommorowDash"
            max-date="9999-12-31"
            :label="$t('MSG_TXT_ACEPT_PERIOD')"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20 mt30">
      <template #left>
        <h3>{{ $t('MSG_TXT_EGER_AW_UPRC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <!-- 정규직 -->
        <kw-form-item
          :label="t('MSG_TXT_PRMEMP')"
        >
          <kw-input
            v-model="feeStandard.fuleyAwAmt"
            :label="t('MSG_TXT_PRMEMP')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 직무1급 수석 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_LYR1_TOPMR')"
        >
          <kw-input
            v-model="feeStandard.rolLyr1TopmrAwAmt"
            :label="t('MSG_TXT_ROL_LYR1_TOPMR')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 직무1급 상 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_LYR1_H')"
        >
          <kw-input
            v-model="feeStandard.rolLyr1UplrAwAmt"
            :label="t('MSG_TXT_ROL_LYR1_H')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 직무1급 중 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_LYR1_M')"
        >
          <kw-input
            v-model="feeStandard.rolLyr1MdlyrAwAmt"
            :label="t('MSG_TXT_ROL_LYR1_M')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 직무1급 하 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_LYR1_L')"
        >
          <kw-input
            v-model="feeStandard.rolLyr1LolyrAwAmt"
            :label="t('MSG_TXT_ROL_LYR1_L')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 직무2급 상 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_L2_H')"
        >
          <kw-input
            v-model="feeStandard.rolL2UplrAwAmt"
            :label="t('MSG_TXT_ROL_L2_H')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 직무2급 중 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_L2_M')"
        >
          <kw-input
            v-model="feeStandard.rolL2MdlyrAwAmt"
            :label="t('MSG_TXT_ROL_L2_M')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 직무2급 하 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_L2_L')"
        >
          <kw-input
            v-model="feeStandard.rolL2LolyrAwAmt"
            :label="t('MSG_TXT_ROL_L2_L')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 직무3급 -->
        <kw-form-item
          :label="t('MSG_TXT_ROL_L3')"
        >
          <kw-input
            v-model="feeStandard.rolL3AwAmt"
            :label="t('MSG_TXT_ROL_L3')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 계약직 -->
        <kw-form-item
          :label="t('MSG_TXT_CRWK')"
        >
          <kw-input
            v-model="feeStandard.crwkAwAmt"
            :label="t('MSG_TXT_CRWK')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
        <!-- 개인사업자 -->
        <kw-form-item
          :label="t('MSG_TXT_PRVT_BUSINESS')"
        >
          <kw-input
            v-model="feeStandard.indvEntrpAwAmt"
            :label="t('MSG_TXT_PRVT_BUSINESS')"
            rules="max:5"
            mask="number"
            align="left"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 비고사항 -->
        <kw-form-item
          :label="t('MSG_TXT_RMK_ARTC')"
          :colspan="3"
        >
          <kw-input
            v-model="feeStandard.rmkCn"
            :label="t('MSG_TXT_RMK_ARTC')"
            type="textarea"
            maxlength="4000"
            rows="5"
            :readonly="screenMode === 'VIEW'"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <!-- 삭제 -->
      <kw-btn
        v-if="screenMode === 'UPDATE'"
        v-permission:delete
        :label="$t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <!-- 취소 -->
      <kw-btn
        v-if="screenMode !== 'VIEW'"
        v-permission:update
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <!-- 추가(저장) -->
      <kw-btn
        v-if="screenMode === 'CREATE'"
        v-permission:create
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickCreate"
      />
      <!-- 저장 -->
      <kw-btn
        v-if="screenMode === 'UPDATE'"
        v-permission:update
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import {
  codeUtil,
  useDataService,
  useModal,
  confirm, notify,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const props = defineProps({
  mode: { type: String, default: 'VIEW' },
  searchParams: { type: Object, default: undefined },
  modelValue: { type: Object, default: undefined },
});

const dataService = useDataService('PGE_FEY_00056');
const { t } = useI18n();

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
  'PD_GRP_DTL_CD',
  'RGLVL_DV_CD',
  'SV_TP_CD',
  'SITE_AW_ATC_CD',
  'SITE_AW_GRP_CD',
  'SV_TP_CD_BK',
);
const { cancel, ok } = useModal();
const tommorow = dayjs().add(1, 'day').format('YYYYMMDD');
const tommorowDash = dayjs().add(1, 'day').format('YYYY-MM-DD');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmRef = ref();
const feeStandard = ref(props.modelValue);
const defaultFeeStandard = {
  svTpCd: '1',
  siteAwAtcCd: undefined,
  siteAwGrpCd: undefined,
  pdGrpCd: undefined,
  pdGrpDtlCd: undefined,
  rglvlDvCd: undefined,
  apyStrtdt: tommorow,
  apyEnddt: '99991231',
  fuleyAwAmt: undefined,
  rolLyr1TopmrAwAmt: undefined,
  rolLyr1UplrAwAmt: undefined,
  rolLyr1MdlyrAwAmt: undefined,
  rolLyr1LolyrAwAmt: undefined,
  rolL2UplrAwAmt: undefined,
  rolL2MdlyrAwAmt: undefined,
  rolL2LolyrAwAmt: undefined,
  rolL3AwAmt: undefined,
  crwkAwAmt: undefined,
  indvEntrpAwAmt: undefined,
  dsbBaseSn: undefined,
  rmkCn: undefined,
  useYn: 'Y',
};

const filterdGroupDetailCode = computed(() => {
  const data = [{ codeId: 'DUMMY', codeName: t('MSG_BTN_PREV') }];
  data.push(
    // eslint-disable-next-line no-unsafe-optional-chaining
    ...(codes?.PD_GRP_DTL_CD.filter((item) => item.userDfn03 === feeStandard.value.pdGrpCd)),
  );

  return data;
});

const screenMode = ref();

async function onClickCancel() {
  await cancel();
}

async function onClickCreate() {
  if (!await frmRef.value.validate()) { return; }
  if (await frmRef.value.alertIfIsNotModified()) { return; }
  if (!await confirm(t('MSG_ALT_CREATED'))) { // 생성하시겠습니까?
    return;
  }
  await dataService.post('/sms/wells/fee/engineer-allowances/unit-prices', feeStandard.value);
  ok('CREATE');
}

async function onClickDelete() {
  if (feeStandard.value.apyStrtdt < tommorow) {
    notify(t('MSG_ALT_NOT_UPDATE_PRGS_ITEM')); // 진행 중인 기준정보는 변경이 불가합니다.
    return;
  }
  if (!await confirm(t('MSG_ALT_WANT_DEL'))) { // 삭제하시겠습니까?
    return;
  }
  await dataService.delete('/sms/wells/fee/engineer-allowances/unit-prices', { params: feeStandard.value });
  ok('DELETE');
}

async function onClickSave() {
  if (!await frmRef.value.validate()) { return; }
  if (await frmRef.value.alertIfIsNotModified()) { return; }
  if (!await confirm(t('MSG_ALT_MDFC'))) { // 수정하시겠습니까?
    return;
  }
  await dataService.put('/sms/wells/fee/engineer-allowances/unit-prices', feeStandard.value);
  ok('UPDATE');
}

async function initFeeStandard() {
  await nextTick();
  screenMode.value = cloneDeep(props.mode);
  if (screenMode.value !== 'CREATE') {
    feeStandard.value = props.modelValue;
    if (tommorow >= feeStandard.value.apyStrtdt) {
      screenMode.value = 'VIEW';
    }
  } else {
    feeStandard.value = { ...defaultFeeStandard };
    if (props.modelValue) {
      feeStandard.value.svTpCd = props.modelValue.svTpCd;
      feeStandard.value.siteAwGrpCd = props.modelValue.siteAwGrpCd;
      feeStandard.value.siteAwAtcCd = props.modelValue.siteAwAtcCd;
    }
  }
  feeStandard.value.pdGrpCd = props.searchParams.productGroupCode;
  feeStandard.value.pdGrpDtlCd = props.searchParams.productGroupDetailCode;
  feeStandard.value.rglvlDvCd = props.searchParams.regionLevelDivideCode;
}

async function changeProduectGroupDetailCode() {
  feeStandard.value.pdGrpDtlCd = '';
}

async function changSiteAllowanceGroupCode() {
  feeStandard.value.siteAwGrpCd = '';
  feeStandard.value.siteAwAtcCd = '';
}

async function changeSiteAllowanceArticleCode() {
  feeStandard.value.siteAwAtcCd = '';
}

await initFeeStandard();

watch(() => feeStandard.value.pdGrpCd, changeProduectGroupDetailCode);
watch(() => feeStandard.value.pdGrpDtlCd, changSiteAllowanceGroupCode);
watch(() => feeStandard.value.svTpCd, changSiteAllowanceGroupCode);
watch(() => feeStandard.value.siteAwGrpCd, changeSiteAllowanceArticleCode);

</script>
