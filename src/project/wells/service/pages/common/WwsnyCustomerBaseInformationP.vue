<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNY
 2. 프로그램 ID : WwsnyCustomerBaseInformation - 고객 기본정보 조회
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.27
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 고객 기본정보를 조회한다
 ****************************************************************************************************
--->
<template>
  <kw-popup size="3xl">
    <kw-search
      ref="frmMainRef"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <kw-input
            v-model="searchParams.cntrDtlNo"
            :placeholder="`${$t('MSG_TXT_CNTR_NO')}-${$t('MSG_TXT_CNTR_SN')}`"
            :mask="cntrDtlNoMask"
            :rules="validateCntrDtlNo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model="searchParams.mpNo"
            maxlength="11"
            regex="num"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TEL_NO')"
        >
          <kw-input
            v-model="searchParams.telNo"
            maxlength="11"
            regex="num"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ENTRP_NO')"
        >
          <kw-input
            v-model="searchParams.bzrno"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SNNO')"
        >
          <kw-input
            v-model="searchParams.bcNo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CAN_CT_INC_YN')"
        >
          <kw-option-group
            v-model="searchParams.canCtIncYn"
            type="radio"
            :options="[{codeId: '1', codeName: $t('MSG_TXT_CAN_CT_EXCD')},
                       {codeId: '0', codeName: $t('MSG_TXT_CAN_CT_INC')}]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
      <kw-btn
        icon="download_on"
        secondary
        dense
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, getComponentType, useMeta, useDataService, codeUtil, useGlobal, useModal, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
const { ok } = useModal();
const { currentRoute } = useRouter();
const dataService = useDataService();

const props = defineProps({
  cntrDtlNo: {
    type: String,
    default: '',
  },
  cntrNo: {
    type: String,
    default: '',
  },
  cntrSn: {
    type: String,
    default: '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmMainRef = ref(getComponentType('KwObserver'));
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cstNm: '',
  cntrDtlNo: props.cntrDtlNo,
  cntrNo: '',
  cntrSn: '',
  locaraTno: '',
  exnoEncr: '',
  idvTno: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  telNo: '',
  mpNo: '',
  bzrno: '',
  bcNo: '',
  canCtIncYn: '1',
});

const returnValues = ref({
  cntrNo: '',
  cntrSn: '',
  cstNm: '',
  newAdrZip: '',
  rnadr: '',
  rdadr: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  locaraTno: '',
  exnoEncr: '',
  idvTno: '',
  istDt: '',
  sellTpCd: '',
  pdCd: '',
  bcNo: '',
  svStpDt: '',
  recapDutyPtrmN: '',
  frisuAsPtrmN: '',
  frisuBfsvcPtrmN: '',
  cycleCode: '',
});

const cntrDtlNoMask = computed(() => (searchParams.value.cntrDtlNo.length === 12 ? 'A#############' : 'A###########-#####'));

const validateCntrDtlNo = async () => {
  const errors = [];

  if (searchParams.value.cntrDtlNo) {
    if (searchParams.value.cntrDtlNo.length <= 12) {
      errors.push(t('MSG_ALT_CNTR_DTL_NO_CONF'));
    }
  }

  return errors[0] || true;
};

let cachedParams;
async function fetchData() {
  if (searchParams.value.cstNm === '' && searchParams.value.bzrno === '' && searchParams.value.bcNo === ''
  && searchParams.value.mpNo === '' && searchParams.value.telNo === '' && searchParams.value.cntrDtlNo === '') {
    notify(t('MSG_ALT_MNDT_IN_CNDT'));
    return;
  }

  const res = await dataService.get('/sms/wells/service/customers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: customerBases, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(customerBases);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  if (pageInfo.value.totalCount === 1) {
    ok(view.getValues(0));
  }
}

async function onClickSearch() {
  if (!await frmMainRef.value.validate()) { return; }

  if (searchParams.value.cstNm === '' && searchParams.value.bzrno === '' && searchParams.value.bcNo === ''
  && searchParams.value.mpNo === '' && searchParams.value.telNo === '' && searchParams.value.cntrDtlNo === '') {
    notify(t('MSG_ALT_MNDT_IN_CNDT'));
    return;
  }

  pageInfo.value.pageIndex = 1;

  if (searchParams.value.cntrDtlNo !== '') {
    searchParams.value.cntrNo = searchParams.value.cntrDtlNo.substring(0, 12);
    searchParams.value.cntrSn = searchParams.value.cntrDtlNo.substring(12);
  } else {
    searchParams.value.cntrNo = '';
    searchParams.value.cntrSn = '';
  }

  if (searchParams.value.mpNo !== '') {
    if (searchParams.value.mpNo.length === 10) {
      searchParams.value.cralLocaraTno = searchParams.value.mpNo.substring(0, 3);
      searchParams.value.mexnoEncr = searchParams.value.mpNo.substring(3, 3);
      searchParams.value.cralIdvTno = searchParams.value.mpNo.substring(6, 4);
    } else if (searchParams.value.mpNo.length === 11) {
      searchParams.value.cralLocaraTno = searchParams.value.mpNo.substring(0, 3);
      searchParams.value.mexnoEncr = searchParams.value.mpNo.substring(3, 4);
      searchParams.value.cralIdvTno = searchParams.value.mpNo.substring(7, 4);
    }
  }

  if (searchParams.value.telNo !== '') {
    if (searchParams.value.telNo.substring(0, 2) === '02') {
      if (searchParams.value.telNo.length === 9) {
        searchParams.value.cralLocaraTno = searchParams.value.telNo.substring(0, 2);
        searchParams.value.mexnoEncr = searchParams.value.telNo.substring(2, 3);
        searchParams.value.cralIdvTno = searchParams.value.telNo.substring(5, 4);
      } else if (searchParams.value.telNo.length === 10) {
        searchParams.value.cralLocaraTno = searchParams.value.telNo.substring(0, 2);
        searchParams.value.mexnoEncr = searchParams.value.telNo.substring(2, 4);
        searchParams.value.cralIdvTno = searchParams.value.telNo.substring(6, 4);
      }
    } else if (searchParams.value.telNo.substring(0, 2) !== '02') {
      if (searchParams.value.telNo.length === 10) {
        searchParams.value.cralLocaraTno = searchParams.value.telNo.substring(0, 3);
        searchParams.value.mexnoEncr = searchParams.value.telNo.substring(3, 3);
        searchParams.value.cralIdvTno = searchParams.value.telNo.substring(6, 4);
      } else if (searchParams.value.telNo.length === 11) {
        searchParams.value.cralLocaraTno = searchParams.value.telNo.substring(0, 3);
        searchParams.value.mexnoEncr = searchParams.value.telNo.substring(3, 4);
        searchParams.value.cralIdvTno = searchParams.value.telNo.substring(7, 4);
      }
    }
  }

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/customers', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  if (props.cntrNo) {
    searchParams.value.cntrDtlNo = `${props.cntrNo}${props.cntrSn}`;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'adrNm' },
    { fieldName: 'bznsCnr' },
    { fieldName: 'svCnr' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'istDt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'bcNo' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'svStpDt' },
    { fieldName: 'recapDutyPtrmN' },
    { fieldName: 'frisuBfsvcPtrmN' },
    { fieldName: 'frisuAsPtrmN' },
    { fieldName: 'cycleCode' },
    { fieldName: 'cycleNm' },
    { fieldName: 'mpNo' },
    { fieldName: 'telNo' },
    { fieldName: 'bzrno' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bznsCnr', header: t('MSG_TXT_BSNS_CNTR'), width: '100', styleName: 'text-center' },
    { fieldName: 'svCnr', header: t('MSG_TXT_SV_CNR'), width: '100', styleName: 'text-center' },
    { fieldName: 'adrNm', header: t('MSG_TXT_INST_ADDR'), width: '400', styleName: 'text-center' },
    {
      fieldName: 'mpNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        if (!isEmpty(grid.getValue(index, 'cralLocaraTno')) && !isEmpty(grid.getValue(index, 'mexnoEncr'))
        && !isEmpty(grid.getValue(index, 'cralIdvTno'))) {
          return `${grid.getValue(index, 'cralLocaraTno')}-${grid.getValue(index, 'mexnoEncr')}-${grid.getValue(index, 'cralIdvTno')}`;
        }
      },
    },
    {
      fieldName: 'telNo',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        if (!isEmpty(grid.getValue(index, 'locaraTno')) && !isEmpty(grid.getValue(index, 'exnoEncr'))
        && !isEmpty(grid.getValue(index, 'idvTno'))) {
          return `${grid.getValue(index, 'locaraTno')}-${grid.getValue(index, 'exnoEncr')}-${grid.getValue(index, 'idvTno')}`;
        }
      },
    },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '117', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '115', styleName: 'text-center' },
    { fieldName: 'bcNo', header: t('MSG_TXT_SNNO'), width: '180', styleName: 'text-center' },
    { fieldName: 'svStpDt', header: t('MSG_TXT_SV_STP_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_DUTY_USE_MCNT_N'), width: '117', styleName: 'text-center' },
    { fieldName: 'frisuAsPtrmN', header: t('MSG_TXT_FRISU_SV_MCN'), width: '117', styleName: 'text-center' },
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_B_SV_MCN'), width: '117', styleName: 'text-center' },
    { fieldName: 'cycleNm', header: t('MSG_TXT_CHK_PRD'), width: '117', styleName: 'text-center' },
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '120', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = (grid, clickData) => {
    const {
      cntrNo,
      cntrSn,
      cstNm,
      newAdrZip,
      rnadr,
      rdadr,
      cralLocaraTno,
      mexnoEncr,
      cralIdvTno,
      locaraTno,
      exnoEncr,
      idvTno,
      istDt,
      sellTpCd,
      pdCd,
      bcNo,
      svStpDt,
      recapDutyPtrmN,
      frisuAsPtrmN,
      frisuBfsvcPtrmN,
      cycleCode,
    } = grid.getValues(clickData.itemIndex);

    returnValues.value.cntrNo = cntrNo;
    returnValues.value.cntrSn = cntrSn;
    returnValues.value.cstNm = cstNm;
    returnValues.value.newAdrZip = newAdrZip;
    returnValues.value.rnadr = rnadr;
    returnValues.value.rdadr = rdadr;
    returnValues.value.cralLocaraTno = cralLocaraTno;
    returnValues.value.mexnoEncr = mexnoEncr;
    returnValues.value.cralIdvTno = cralIdvTno;
    returnValues.value.locaraTno = locaraTno;
    returnValues.value.exnoEncr = exnoEncr;
    returnValues.value.idvTno = idvTno;
    returnValues.value.istDt = istDt;
    returnValues.value.sellTpCd = sellTpCd;
    returnValues.value.pdCd = pdCd;
    returnValues.value.bcNo = bcNo;
    returnValues.value.svStpDt = svStpDt;
    returnValues.value.recapDutyPtrmN = recapDutyPtrmN;
    returnValues.value.frisuAsPtrmN = frisuAsPtrmN;
    returnValues.value.frisuBfsvcPtrmN = frisuBfsvcPtrmN;
    returnValues.value.cycleCode = cycleCode;

    ok(returnValues.value);
  };
});
</script>
