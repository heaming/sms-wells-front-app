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
        <kw-search-item :label="$t('처리구분')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
            @change="onChangeCompStatus"
          />
        </kw-search-item>
        <kw-search-item
          v-if="!isCompStatus"
          :colspan="2"
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_CNTR_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isCompStatus"
          :colspan="1"
          :label="$t('MSG_TXT_OSTR_CNFM_DT')"
        >
          <kw-date-picker
            v-model="searchParams.vstFshDt"
            :label="$t('MSG_TXT_OSTR_CNFM_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          v-show="isWaitStatus"
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
        <!-- 엑셀업로드 -->
        <kw-btn
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-show="isWaitStatus"
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
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

// const codes =
await codeUtil.getMultiCodes(
  'SV_BIZ_DCLSF_CD',
);
const customCodes = {
  findGb: [
    { codeId: '1', codeName: t('MSG_TXT_WK_FSH') },
    { codeId: '2', codeName: t('MSG_TXT_WORK_PENDING') },
  ],
  pcsvCompDv: [
    { codeId: '1', codeName: t('한진') },
    { codeId: '2', codeName: t('대한통운') },
    { codeId: '3', codeName: t('우체국') },
  ],
};
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  vstFshDt: now.format('YYYYMMDD'),
  findGb: '2', /* 조회 구분 */
  selCnt: '', /* 조회 제한건수  */
});
let cachedParams;
const totalCount = ref(0);

const isCompStatus = ref(false);
const isWaitStatus = ref(true);
async function onChangeCompStatus() {
  isCompStatus.value = false;
  isWaitStatus.value = false;
  const { findGb } = searchParams.value;

  const view = grdMainRef.value.getView();
  view.checkBar.visible = false;

  /* 작업완료 */
  if (findGb === '1') {
    isCompStatus.value = true;
  }

  /* 작업대기 */
  if (findGb === '2') {
    isWaitStatus.value = true;
    view.checkBar.visible = true;
  }
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  let list = res.data;
  // 임시 테스트 데이터 S
  list = [];
  list.push({
    cntrRcpFshDtm: '20230702',
    svBizDclsfCd: '대분류코드',
    svBizDclsfNm: '대분류코드명',
    wkPrgsStatNm: '작업대기',
    cntrNo: '12345',
    cntrSn: '1',
    rcgvpKnm: '테스트이름',
    cralIdvTno: '010-1234-5678',
    idvTno: '02-777-2222',
    newAdrZip: '12345',
    rnadr: '기본주소',
    rdadr: '상세주소',
    vstFshDt: '20230702',
    partCnt: 1,
    partCd1: '상품1',
    partNm1: '상품1',
    partQty1: '상품1',
    reqdDt: '20230702',
    rsgFshDt: '20230702',
    cstSvAsnNo: '01234589',
  });
  // 임시 테스트 데이터 E
  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
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
    // await dataService.post(`${baseUrl}`, chkRows);
    // notify(t('MSG_ALT_SAVE_DATA'));
    // await fetchData();
  }
}
/* 엑셀 업로드 유효성 체크 */
async function validate(rows) {
  rows.forEach((obj) => {
    const cntrDtlNo = obj.cntrDtlNo.split('-');
    if (!isEmpty(cntrDtlNo) && cntrDtlNo.length === 2) {
      obj.cntrNo = cntrDtlNo[0];
      obj.cntrSn = cntrDtlNo[1];
    }
  });
  const { data } = await dataService.put(`${baseUrl}/excel-upload-validate`, rows, {
    alert: false,
  });
  return data;
}
async function onClickExcelUpload() {
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      templateDocId: '택배송장_업로드결과',
      headerRows: 1,
      validationBtn: true,
      downloadBtn: true,
      serverSideValidation: validate,
      serverSideValidateOption: { sideEffect: true, rowBy: false },
      columns: {
        cstSvAsnNo: { label: t('MSG_TXT_ASGN_NO'), width: 180, rules: 'max:19|regex:[0-9]', required: true },
        cntrDtlNo: { label: t('MSG_TXT_CNTR_DTL_NO'), width: 160, rules: 'max:17|regex:W\\d{11}-[0-9]', required: true },
        pcsvCompDv: { label: t('MSG_TXT_PCSV_CO'), width: 90, options: customCodes.pcsvCompDv, rules: 'max:2|regex:[0-9]', required: true },
        sppIvcNo: { label: t('MSG_TXT_IVC_NO'), width: 150, rules: 'max:15|regex:[0-9]', required: true },
        sppBzsPdId: { label: t('MSG_TXT_SR_NO'), width: 130, rules: 'max:20', required: true },
      },
    },
  });
  console.log(payload);
  const { list } = payload;
  if (result) {
    await dataService.post(`${baseUrl}/excel-upload`, list);
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
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '80', styleName: 'text-center' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_OSTR_CNFM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
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
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_ASGN_NO'), width: '150', styleName: 'text-center' },
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
    'vstFshDt',
    'cstSvAsnNo',
    'cntrNo',
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
  view.setFixedOptions({ colCount: 7, resizable: true });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
