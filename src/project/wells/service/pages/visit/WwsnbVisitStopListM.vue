<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB
 2. 프로그램 ID : WwsnbVisitStopListP - 방문중지 조회
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.03.23
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 자가관리 택배 배송중지/해제한다.
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <h3>{{ $t('MSG_TXT_CRTL_BFSVC_PCSV_PS') }}</h3>
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BFSVC_EXP_SPP_STP_YN')">
          <kw-checkbox
            v-model="crtlBfsvcPsData.checkYn1"
            :label="label1"
            :true-value="'Y'"
            :false-value="'N'"
            disable
          />
          <kw-checkbox
            v-model="crtlBfsvcPsData.checkYn2"
            :label="label2"
            :true-value="'Y'"
            :false-value="'N'"
            disable
          />
          <kw-checkbox
            v-model="crtlBfsvcPsData.checkYn3"
            :label="label3"
            :true-value="'Y'"
            :false-value="'N'"
            disable
          />
          <kw-checkbox
            v-model="crtlBfsvcPsData.checkYn4"
            :label="label4"
            :true-value="'Y'"
            :false-value="'N'"
            disable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NO_TMLM_STP')">
          <kw-option-group
            v-model="crtlBfsvcPsData.checkYn4"
            type="radio"
            :options="vstStpCd2"
            disable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ $t('MSG_TXT_CH_BFSVC_PCSV_PS') }}</h3>
        </template>
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_BLK_RLS')"
          @click="onClickBlkPls"
        />
      </kw-action-top>
    </kw-form>
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BFSVC_EXP_SPP_STP_YN')"
          :colspan="2"
        >
          <kw-checkbox
            v-model="dataParam.tn1StpYm"
            :label="label1"
            :true-value="fstTn.codeId"
            :false-value="''"
            @update:model-value="onChangeChkbox"
          />
          <kw-checkbox
            v-model="dataParam.tn2StpYm"
            :label="label2"
            :true-value="scdTn.codeId"
            :false-value="''"
            @update:model-value="onChangeChkbox"
          />
          <kw-checkbox
            v-model="dataParam.tn3StpYm"
            :label="label3"
            :true-value="thrdTn.codeId"
            :false-value="''"
            @update:model-value="onChangeChkbox"
          />
          <kw-checkbox
            v-model="dataParam.tn4StpYm"
            :label="label4"
            :true-value="frthTn.codeId"
            :false-value="''"
            @update:model-value="onChangeChkbox"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NO_TMLM_STP')">
          <kw-option-group
            v-model="dataParam.sppStpDvCd"
            type="radio"
            :options="vstStpCd2"
            @change="onChangeRadio"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPF_DT_VT1_SPP_AK')">
          <kw-option-group
            v-model="dataParam.sppStpDvCd"
            type="radio"
            :options="spfDtSppAkCd"
          />
          <kw-date-picker
            v-model="dataParam.sppAkSpfDt"
            :label="$t('MSG_TXT_SPP_AK_D')"
            :rules="isValidate"
            :disable="!isDisableSppAkSpfDt"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <ul class="kw-notification mt20">
      <li>
        {{ $t('MSG_TXT_CHO_SPF_DT_OSTR_EXP_D') }}
      </li>
    </ul>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_RGST_CH_HIST') }}</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
      </template>

      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_SAVE')"
        @click="onClickSave"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      :visible-rows="'10'"
      class="mt20"
      @init="initGrdMain"
    />
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, getComponentType, useDataService, codeUtil, useGlobal, validate, notify } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { confirm } = useGlobal();
const router = useRouter();

const props = defineProps({
  cntrNo: { type: String, default: 'W20230007679', required: true }, // 테스트를 위한 default값
  cntrSn: { type: String, default: '1', required: true },
  prtnrNo: { type: String, default: '36834', required: true },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmMainRef = ref(getComponentType('KwObserver'));
const grdMainRef = ref(getComponentType('KwGrid'));
const vstStpCd1 = ref();
const vstStpCd2 = ref();
const code = await codeUtil.getCodes('SPP_STP_DV_CD');
const fstTn = ref({
  codeId: '',
  codeName: '',
});
const scdTn = ref({
  codeId: '',
  codeName: '',
});
const thrdTn = ref({
  codeId: '',
  codeName: '',
});
const frthTn = ref({
  codeId: '',
  codeName: '',
});
const spfDtSppAkCd = ref([]);
const pageInfo = ref({
  totalCount: 0,
});

const crtlBfsvcPsData = ref({
  checkYn1: '',
  checkYn2: '',
  checkYn3: '',
  checkYn4: '',
  checkYn5: '',
  sppStpDvCd: '',
});

const dataParam = ref({
  cntrNo: props.cntrNo !== '' ? props.cntrNo : undefined,
  cntrSn: props.cntrSn !== '' ? props.cntrSn : undefined,
  apyDt: '',
  sppStpDvCd: '',
  tn1StpYm: '',
  tn2StpYm: '',
  tn3StpYm: '',
  tn4StpYm: '',
  sppAkSpfDt: '',
  ogTpCd: '',
  prtnrNo: props.prtnrNo,
});

const isDisableSppAkSpfDt = computed(() => dataParam.value.sppStpDvCd === 'D');
const label1 = computed(() => fstTn.value.codeName);
const label2 = computed(() => scdTn.value.codeName);
const label3 = computed(() => thrdTn.value.codeName);
const label4 = computed(() => frthTn.value.codeName);
// const label5 = computed(() => vstStpCd2..codeName);

let cachedParams;

async function fetchData() {
  cachedParams = cloneDeep(props);

  const res = await dataService.get('/sms/wells/service/visit-stops/history', { params: cachedParams });

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();

  dataParam.value.ogTpCd = view.getValue(0, 'ogTpCd');
  dataParam.value.prtnrNo = view.getValue(0, 'prtnrNo');
}

async function fetchVisitStopCodes(crtnNo, cntrSn) {
  const res = await dataService.get(`/sms/wells/service/visit-stops/${crtnNo}-${cntrSn}`);
  const codes = res.data;

  const vstStpCd1Filt = codes.filter((v) => v.gbnCd === 'A');
  const vstStpCd2Filt = codes.filter((v) => v.gbnCd === 'B');
  const spfDtSppAkCdFilt = codes.filter((v) => v.gbnCd === 'D');

  vstStpCd1.value = vstStpCd1Filt.map((v) => ({ codeId: v.code, codeName: v.codeName, checkYn: v.checkYn }));
  vstStpCd2.value = vstStpCd2Filt.map((v) => ({ codeId: v.gbnCd, codeName: v.codeName, checkYn: v.checkYn }));
  spfDtSppAkCd.value = spfDtSppAkCdFilt.map((v) => ({ codeId: v.gbnCd, codeName: v.codeName }));

  crtlBfsvcPsData.value.checkYn1 = vstStpCd1.value[0].checkYn;
  crtlBfsvcPsData.value.checkYn2 = vstStpCd1.value[1].checkYn;
  crtlBfsvcPsData.value.checkYn3 = vstStpCd1.value[2].checkYn;
  crtlBfsvcPsData.value.checkYn4 = vstStpCd1.value[3].checkYn;

  fstTn.value = vstStpCd1.value[0];
  scdTn.value = vstStpCd1.value[1];
  thrdTn.value = vstStpCd1.value[2];
  frthTn.value = vstStpCd1.value[3];

  await fetchData();
}

function isEmptyTnStpYm() {
  if (dataParam.value.tn1StpYm.length === 0
     && dataParam.value.tn2StpYm.length === 0
     && dataParam.value.tn3StpYm.length === 0
     && dataParam.value.tn4StpYm.length === 0) {
    return true;
  }
  return false;
}

function onChangeChkbox() {
  if (dataParam.value.sppStpDvCd !== 'A') {
    dataParam.value.sppStpDvCd = 'A';
  } else if (dataParam.value.sppStpDvCd === 'A' && isEmptyTnStpYm()) {
    dataParam.value.sppStpDvCd = '';
  }
}

const isValidate = async (val, options) => {
  const errors = [];

  if (dataParam.value.sppStpDvCd === 'D') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );

    if (Number(dayjs().format('YYYYMMDD')) >= Number(dataParam.value.sppAkSpfDt)) {
      errors.push(t('MSG_ALT_TD_AF'));
    }
  }
  return errors[0] || true;
};

function onChangeRadio(val) {
  if (val === 'B' && !isEmptyTnStpYm()) {
    dataParam.value.tn1StpYm = '';
    dataParam.value.tn2StpYm = '';
    dataParam.value.tn3StpYm = '';
    dataParam.value.tn4StpYm = '';
  }
}

async function onClickBlkPls() {
  if (await confirm(t('MSG_ALT_BLK_RLS'))) {
    dataParam.value.apyDt = dayjs().format('YYYYMMDD');
    dataParam.value.sppStpDvCd = 'C';
    dataParam.value.tn1StpYm = '';
    dataParam.value.tn2StpYm = '';
    dataParam.value.tn3StpYm = '';
    dataParam.value.tn4StpYm = '';
    dataParam.value.sppAkSpfDt = '';

    await dataService.post('/sms/wells/service/visit-stops', dataParam.value);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchVisitStopCodes(props.cntrNo, props.cntrSn);
  }
}

async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  dataParam.value.apyDt = dayjs().format('YYYYMMDD');

  await dataService.post('/sms/wells/service/visit-stops', dataParam.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchVisitStopCodes(props.cntrNo, props.cntrSn);
}

onMounted(async () => {
  await fetchVisitStopCodes(props.cntrNo, props.cntrSn);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'akDt' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'sppStpDvNm' },
    { fieldName: 'sppStpDvCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ogNm' },
    { fieldName: 'stat' },
    { fieldName: 'sppAkSpfDt' },
    { fieldName: 'apyDt' },
    { fieldName: 'tn1StpYm' },
    { fieldName: 'tn2StpYm' },
    { fieldName: 'tn3StpYm' },
    { fieldName: 'tn4StpYm' },
    { fieldName: 'pdNm' },
  ];

  const columns = [
    { fieldName: 'akDt',
      header: t('MSG_TXT_AK_DT'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const akDtReg = grid.getValue(index.itemIndex, 'akDt');
        if (akDtReg !== null) {
          return akDtReg?.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
        }

        return isEmpty(value) ? akDtReg : value;
      },
    },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'apyDt', header: t('MSG_TXT_APPLY_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'sppStpDvCd',
      header: t('MSG_TXT_AK'),
      width: '150',
      styleName: 'text-center',
      options: code,
    },
    // { fieldName: 'pdNm', header: t('MSG_TXT_RGST_FILT'), width: '200', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RGST_USR'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CHNL'), width: '100', styleName: 'text-center' },
    { fieldName: 'stat', header: t('MSG_TXT_STT'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.onCellClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const param = { cntrNo: g.getValue(itemIndex, 'cntrNo'), cntrSn: g.getValue(itemIndex, 'cntrSn') };

      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };

  // view.onCellDblClicked = async (g, cData) => {
  //   if (cData.fieldName === 'cntrDtl') {
  //     const { cntrDtl } = g.getValues(cData.itemIndex);
  //     searchParams.value.bcNo = '';
  //     searchParams.value.sppIvcNo = '';

  //     searchParams.value.cntrNo = cntrDtl.substring(0, 12);
  //     searchParams.value.cntrSn = cntrDtl.substring(13, 14);
  //     await isValidateIndividualParams();
  //   }
  // };

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
<style scoped>
</style>
