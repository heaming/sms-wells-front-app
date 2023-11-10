<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMdProductOutOfStorageMgt - MD 상품 출고관리
3. 작성자 : jungheejin
4. 작성일 : 2023-09-21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-  MD 상품 택배 출고관리 http://localhost:3000/#/service/wwsna-md-product-out-of-storage-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PROCS_DV')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
            @change="onChangeCompStatus"
          />
        </kw-search-item>
        <kw-search-item
          v-show="!isCompStatus"
          :label="$t('MSG_TXT_FIRST_SPP_YN')"
        >
          <kw-option-group
            v-model="searchParams.firstSppGb"
            type="radio"
            :options="customCodes.firstSppGb"
          />
        </kw-search-item>
        <kw-search-item
          v-if="!isCompStatus"
          :colspan="2"
          :label="$t('MSG_TXT_OBJ_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OBJ_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isCompStatus"
          :label="$t('MSG_TXT_WK_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrCnfmDt"
            :label="$t('MSG_TXT_WK_DT')"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model.trim="searchParams.cntrDtlNo"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            :placeholder="`${$t('MSG_TXT_CNTR_NO')}-${$t('MSG_TXT_CNTR_SN')}`"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CST_NM')">
          <kw-input
            v-model.trim="searchParams.rcgvpKnm"
            :label="$t('MSG_TXT_CST_NM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model:tel-no0="searchParams.cralLocaraTno"
            v-model:tel-no1="searchParams.mexnoEncr"
            v-model:tel-no2="searchParams.cralIdvTno"
            mask="telephone"
            :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SERIAL_NO')"
        >
          <kw-input
            v-model="searchParams.serialNo"
            :label="$t('MSG_TXT_SERIAL_NO')"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PRTNR_BZS')">
          <kw-select
            v-model="searchParams.prtnrBzsCd"
            :options="codes.PRTNR_BZS_CD"
            :label="$t('MSG_TXT_PRTNR_BZS_CD')"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          v-show="!isCompStatus"
          :label="$t('MSG_TXT_SEL_LIMIT_CNT')"
        >
          <kw-input
            v-model="searchParams.selCnt"
            :maxlength="3"
            rules="numeric"
            :label="$t('MSG_TXT_SEL_LIMIT_CNT')"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <!-- 택배송장 -->
        <kw-btn
          v-show="isCompStatus"
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_PCSV_IVC')"
          @click="onClickExcelDownload2"
        />
        <!-- 엑셀업로드 -->
        <kw-btn
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-show="!isCompStatus"
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
      <kw-grid
        v-show="false"
        ref="grdSppIvcRef"
        @init="initGrdSppIvc"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSppIvcRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/md-product-out-of-storage';

const codes = await codeUtil.getMultiCodes(
  'PRTNR_BZS_CD',
  'PCSV_BZS_CD',
);
const customCodes = {
  findGb: [
    { codeId: '1', codeName: t('MSG_TXT_WK_FSH') },
    { codeId: '2', codeName: t('MSG_TXT_WORK_PENDING') },
  ],
  firstSppGb: [
    { codeId: 'ALL', codeName: t('MSG_TXT_ALL') },
    { codeId: '1', codeName: t('MSG_TXT_FIRST_SPP_YN') },
    { codeId: 'N', codeName: t('MSG_TXT_N_NMN') },
  ],
};
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  ostrCnfmDt: now.format('YYYYMMDD'),
  firstSppGb: 'ALL', /* 첫 배송 여부 */
  findGb: '2', /* 조회 구분 */
  selCnt: '', /* 조회 제한건수  */
  prtnrBzsCd: '', /* 파트너업체 */
  cntrDtlNo: '', /* 계약상세번호 */
  rcgvpKnm: '', /* 고객명 */
  serialNo: '', /* 시리얼 넘버 */
  cralLocaraTno: '', /* 휴대전화번호1 */
  mexnoEncr: '', /* 휴대전화번호2 */
  cralIdvTno: '', /* 휴대전화번호3 */
});
let cachedParams;
const totalCount = ref(0);

const isCompStatus = ref(false);
async function onChangeCompStatus() {
  const { findGb } = searchParams.value;
  const view = grdMainRef.value.getView();

  /* 작업완료 */
  if (findGb === '1') {
    isCompStatus.value = true;
    view.checkBar.visible = false;
    searchParams.value.firstSppGb = 'ALL';
  }

  /* 작업대기 */
  if (findGb === '2') {
    isCompStatus.value = false;
    view.checkBar.visible = true;
  }
}
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  // 택배송장 목록
  const view2 = grdSppIvcRef.value.getView();
  view2.getDataSource().setRows(list);
}
async function onClickSearch() {
  // 계약상세번호, 고객명, 휴대전화번호, S/N조회 시, 변수 초기화
  if (!isEmpty(searchParams.value.cntrDtlNo)
      || !isEmpty(searchParams.value.rcgvpKnm)
      || !isEmpty(searchParams.value.serialNo)
      || !isEmpty(searchParams.value.cralLocaraTno)) {
    const initParams = cloneDeep(searchParams.value);
    initParams.startDt = '';
    initParams.endDt = '';
    initParams.findGb = '';
    initParams.firstSppGb = 'ALL';
    cachedParams = cloneDeep(initParams);
  } else {
    cachedParams = cloneDeep(searchParams.value);
  }
  console.log(cachedParams);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
async function onClickExcelDownload2() {
  const view = grdSppIvcRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_PCSV_IVC')}_${t('MSG_BTN_ULD_SMP')}`,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    const checkRowProducts = [];
    chkRows.forEach((obj) => {
      // 상품 갯수만큼 셋팅
      for (let cnt = 1; cnt <= obj.partCnt; cnt += 1) {
        checkRowProducts.push(
          {
            pdCd: obj[`partCd${cnt}`],
            pdNm: obj[`partNm${cnt}`],
            useQty: obj[`partQty${cnt}`],
          },
        );
      }
      obj.products = checkRowProducts;
    });
    console.log(chkRows);
    await dataService.post(`${baseUrl}`, chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

/* 엑셀 업로드 유효성 체크 */
let excelUploadRows;
async function validate(rows) {
  let isValidate = true;
  const errors = [];

  const sppIvcNos = []; // 송장번호 목록
  rows.forEach((row, index) => {
    // 송장번호 중복체크
    if (sppIvcNos.indexOf(row.sppIvcNo) > -1) {
      isValidate = false;
      errors.push({
        dataRow: index,
        errors: [t('MSG_ALT_SPP_IVC_NO')], // 중복된 송장번호가 존재합니다.
      });
    } else {
      sppIvcNos.push(row.sppIvcNo);
    }
  });
  // 화면 유효성 체크
  if (!isValidate) {
    const data = [];
    data.result = false;
    data.errors = errors;
    return data;
  }
  // 서버 유효성 체크
  rows.forEach((obj) => {
    const cntrDtlNo = obj.cntrDtlNo.split('-');
    if (!isEmpty(cntrDtlNo) && cntrDtlNo.length === 2) {
      obj.cntrNo = cntrDtlNo[0];
      obj.cntrSn = cntrDtlNo[1];
    }
  });
  excelUploadRows = rows;
  const { data } = await dataService.put(`${baseUrl}/excel-upload-validate`, excelUploadRows, {
    alert: false,
  });
  return data;
}
async function onClickExcelUpload() {
  const { result } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      templateDocId: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_PCSV_IVC')}_${t('MSG_TXT_WK_RS')}`,
      headerRows: 2,
      validationBtn: true,
      downloadBtn: true,
      serverSideValidation: validate,
      serverSideValidateOption: { sideEffect: true, rowBy: false },
      columns: {
        cstSvAsnNo: { label: t('MSG_TXT_ASGN_NO'), width: 180, rules: 'max:19|regex:[0-9]', required: true },
        cntrDtlNo: { label: t('MSG_TXT_CNTR_DTL_NO'), width: 160, rules: 'max:17|regex:W\\d{11}-[0-9]', required: true },
        pcsvCompDv: { label: t('MSG_TXT_PCSV_CO'), width: 130, options: codes.PCSV_BZS_CD, rules: 'max:2|regex:[0-9]', required: true },
        sppIvcNo: { label: t('MSG_TXT_IVC_NO'), width: 150, rules: 'max:15|regex:[0-9]', required: true },
        sppBzsPdId: { label: t('MSG_TXT_SR_NO'), width: 130, rules: 'max:20', required: true },
      },
    },
  });
  console.log(excelUploadRows);
  if (result) {
    await dataService.post(`${baseUrl}/excel-upload`, excelUploadRows);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_TASK_TYPE_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrBzsNm', header: t('MSG_TXT_PRTNR_BZS_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'pcsvCompNm', header: t('MSG_TXT_PCSV_CO'), width: '110', styleName: 'text-center' },
    { fieldName: 'sppIvcNo', header: t('MSG_TXT_IVC_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'sppBzsPdId', header: t('MSG_TXT_SR_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '80', styleName: 'text-center' },
    { fieldName: 'ostrCnfmDt', header: t('MSG_TXT_OSTR_CNFM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cralLocaraTno', visible: false }, // [휴대전화번호1]
    { fieldName: 'mexnoEncr', visible: false }, // [휴대전화번호2]
    { fieldName: 'cralIdvTno', // [휴대전화번호3]
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.cralLocaraTno}-${values.mexnoEncr}-${value}`;
        }
      },
    }, // [휴대전화번호]
    { fieldName: 'locaraTno', visible: false }, // [전화번호1]
    { fieldName: 'exnoEncr', visible: false }, // [전화번호2]
    {
      fieldName: 'idvTno', // [전화번호3]
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' },
    { fieldName: 'rnadr', header: t('MSG_TXT_ADDR'), width: '380', styleName: 'text-left' },
    { fieldName: 'rdadr', header: t('MSG_TXT_ADDR_DTL'), width: '380', styleName: 'text-left' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_ASGN_NO'), width: '180', styleName: 'text-center' },
  ];
  // 상품 동적 필드
  const pdColums = [
    { fieldName: 'partCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'partNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    {
      fieldName: 'partQty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
    },
  ];

  const columnPdTotals = [];
  const columnPdLayouts = [];
  for (let cnt = 1; cnt <= 10; cnt += 1) { // 상품 갯수 최대 10개
    pdColums.forEach((row) => {
      // 상품 전체 필드
      columnPdTotals.push(
        {
          fieldName: `${row.fieldName}${cnt}`,
          header: row.header,
          width: row.width,
          styleName: row.styleName,
          dataType: row.dataType,
          numberFormat: row.numberFormat,
        },
      );
    });
    // 상품 레이아웃 필드
    columnPdLayouts.push(
      {
        header: `${t('MSG_TXT_PD_INF')}${cnt}`,
        direction: 'horizontal',
        items: [`partCd${cnt}`, `partNm${cnt}`, `partQty${cnt}`],
      },
    );
  }
  const layout = [
    'cntrRcpFshDtm',
    {
      header: t('MSG_TXT_WK_CLS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svBizDclsfCd', 'svBizDclsfNm'],
    },
    'wkPrgsStatNm',
    'ostrCnfmDt',
    'sellTpNm',
    'prtnrBzsNm',
    'cntrNo',
    'cstSvAsnNo',
    {
      header: t('MSG_TXT_PCSV') + t('MSG_TXT_INF'),
      direction: 'horizontal',
      items: ['pcsvCompNm', 'sppIvcNo', 'sppBzsPdId'],
    },
    'rcgvpKnm',
    'cralIdvTno',
    'idvTno',
    'newAdrZip',
    'rnadr',
    'rdadr',
    ...columnPdLayouts,
    'reqdDt',
    'rsgFshDt',
  ];
  columns.push(...columnPdTotals);
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layout);
  view.setFixedOptions({ colCount: 8, resizable: true });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

// 택배 송장 Grid
const initGrdSppIvc = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_ASGN_NO'), width: 160 },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: 150 },
    { fieldName: 'pcsvCompDv', header: `${t('MSG_TXT_PCSV_CO')}`, width: 120 },
    { fieldName: 'sppIvcNo', header: t('MSG_TXT_IVC_NO'), width: 150 },
    { fieldName: 'sppBzsPdId', header: t('MSG_TXT_SR_NO'), width: 130 },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
});
</script>
