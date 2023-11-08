<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaPcsvReturningGoodsMgtM - 택배설치상품 반품관리
3. 작성자 : leeminwoo
4. 작성일 : 2023-05-25
5. 참고 : baseurl - /sms/wells/service/pcsv-returning-goods
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 택배설치상품 반품관리 http://localhost:3000/#/service/wwsna-pcsv-returning-goods-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_DELV_WARE')">
          <kw-select
            v-model="searchParams.wareNo"
            :options="logisticsCenters"
            readonly
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_WK_STS')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
          />
        </kw-search-item>
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_AK_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_AK_DT')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model.trim="searchParams.cntrDtlNo"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
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
        <kw-search-item :label="$t('MSG_TXT_SE_NO')">
          <kw-input
            v-model.trim="searchParams.bcNo"
            :label="$t('MSG_TXT_SE_NO')"
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
        <kw-btn
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
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/pcsv-returning-goods';

const codes = await codeUtil.getMultiCodes('SV_BIZ_DCLSF_CD');
console.log(codes);

const customCodes = {
  findGb: [
    { codeId: '99', codeName: t('MSG_TXT_ALL') },
    { codeId: '00', codeName: t('MSG_TXT_RTRN_RQST') }, // 반품요청
    { codeId: '10', codeName: t('MSG_TXT_RTRN_RGST') }, // 반품등록
    { codeId: '11', codeName: t('MSG_TXT_CANCEL_COMP') }, // 취소완료
    { codeId: '20', codeName: t('MSG_TXT_RTRN_COMP') }, // 반품완료
  ],
  dtmChRsonCd: [
    { codeId: '', codeName: t('MSG_TXT_SELT') },
    { codeId: '91', codeName: t('MSG_TXT_OPEN') },
    { codeId: '92', codeName: t('MSG_TXT_UNOPEN') },
  ],
};

const searchParams = ref({
  wareNo: '100002', /* 교원파주물류센터 */
  findGb: '00',
  startDt: now.set('date', 1).format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'),
  cntrDtlNo: '', /* 계약상세번호 */
  rcgvpKnm: '', /* 고객명 */
  bcNo: '', /* 시리얼넘버 */
  cralLocaraTno: '', /* 전화번호1 */
  mexnoEncr: '', /* 전화번호2 */
  cralIdvTno: '', /* 전화번호3 */
});

const totalCount = ref(0);

let cachedParams;
const logisticsCenters = ref();

/* 물류센터 조회 */
async function fetchLogisticsCenters() {
  const res = await dataService.get(`${baseUrl}/logistics-centers`, {});
  logisticsCenters.value = res.data;
}

await fetchLogisticsCenters();

/* 택배상품 반품조회 */
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  // 계약상세번호, 고객명, 휴대전화번호, S/N조회 시, 변수 초기화
  if (!isEmpty(searchParams.value.cntrDtlNo)
      || !isEmpty(searchParams.value.rcgvpKnm)
      || !isEmpty(searchParams.value.bcNo)
      || !isEmpty(searchParams.value.cralLocaraTno)) {
    const initParams = cloneDeep(searchParams.value);
    initParams.startDt = '';
    initParams.endDt = '';
    initParams.findGb = '';
    cachedParams = cloneDeep(initParams);
  } else {
    cachedParams = cloneDeep(searchParams.value);
  }
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
    await dataService.post(`${baseUrl}`, chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    searchParams.value.cntrDtlNo = '';
    searchParams.value.rcgvpKnm = '';
    searchParams.value.bcNo = '';
    searchParams.value.cralLocaraTno = '';
    searchParams.value.mexnoEncr = '';
    searchParams.value.cralIdvTno = '';
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_TASK_TYPE_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'reWkPrgsStatNm', header: t('MSG_TXT_RE_WK_STS'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bcNo', header: t('MSG_TXT_SE_NO'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center', editable: false }, // 계약상세번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'cralIdvTno',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.cralLocaraTno}-${values.mexnoEncr}-${value}`;
        }
      },
    }, // [휴대전화번호]
    { fieldName: 'basePdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', editable: false },
    // 품목명
    { fieldName: 'basePdNm', header: t('MSG_TXT_ITM_NM'), width: '250', styleName: 'text-left', editable: false },
    // 매출(출고)일자
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SL_OSTR_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    // 제품수령일자
    { fieldName: 'pcsvRcgvDt', header: t('MSG_TXT_PDCT_RCG_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    // 반품상담접수일자
    { fieldName: 'rcpdt', header: t('MSG_TXT_RTRN_CNSL_REG_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    // 반품등급
    { fieldName: 'cmptGd', header: t('MSG_TXT_CALA_GD'), width: '100', styleName: 'text-center', editable: false },
    // 사번
    { fieldName: 'rcpIchrPrtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center', editable: false },
    // 담당자
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '80', styleName: 'text-center', editable: false },
    // 현물입고일자
    { fieldName: 'arvDt',
      header: {
        text: t('MSG_TXT_SPOT_STR_DT'),
        // styleName: 'essential',
      },
      width: '150',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      rules: 'required',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editable: true,
    },
    { fieldName: 'dtmChRsonCd', // 개봉여부
      header: t('MSG_TXT_OPEN_YN'),
      width: '90',
      rules: 'required',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: customCodes.dtmChRsonCd,
      placeHolder: t('MSG_TXT_SELT'),
      editable: true,
    },
    { fieldName: 'fwSppIvcNo', // 송장번호 required 추가
      header: t('MSG_TXT_IVC_NO'),
      width: '150',
      rules: 'max_value:99999999999999999999||required',
      editor: { inputCharacters: '0-9', maxLength: 20 },
      styleName: 'text-left',
      placeHolder: t('MSG_TXT_INP'),
      editable: true,
    },
    // 택배사/반품자
    { fieldName: 'dtmChRsonDtlCn', header: t('MSG_TXT_PCSV_RTNGD_USR'), width: '150', rules: 'required', styleName: 'text-center', placeHolder: t('MSG_TXT_INP'), editable: true },
    // 취소일자
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    // 철거요청일자
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_REQD_RQDT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    // 최종등급
    { fieldName: 'fnlGb', header: t('MSG_TXT_FNL_GD'), width: '70', styleName: 'text-center', editable: false },
    { fieldName: 'findGb', visible: false },
    { fieldName: 'wkPrgsStatCd', visible: false },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'locaraTno', visible: false },
    { fieldName: 'exnoEncr', visible: false },
    { fieldName: 'idvTno', visible: false },
    { fieldName: 'pdctPdCd', visible: false },
    { fieldName: 'pdUseDc', visible: false },
    { fieldName: 'rcpOgTpCd', visible: false },
    { fieldName: 'wkWareNo', visible: false },
    { fieldName: 'wareNm', visible: false },
    { fieldName: 'wareMngtPrtnrNo', visible: false },
    { fieldName: 'wareMngtPrtnrOgTpCd', visible: false },
    { fieldName: 'asLctCd', visible: false },
    { fieldName: 'asPhnCd', visible: false },
    { fieldName: 'asCausCd', visible: false },
    { fieldName: 'rpbLocaraCd', visible: false },
    { fieldName: 'siteAwSvTpCd', visible: false },
    { fieldName: 'siteAwAtcCd', visible: false },
    { fieldName: 'pdUswyCd', visible: false },
    { fieldName: 'asRefriDvCd', visible: false },
    { fieldName: 'bfsvcRefriDvCd', visible: false },
    { fieldName: 'urgtDvCd', visible: false },
    { fieldName: 'cntrCstNo', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'sellTpNm', visible: false },
    { fieldName: 'sellTpDtlCd', visible: false },
    { fieldName: 'sellTpDtlNm', visible: false },
    { fieldName: 'cntrDtlStatCd', visible: false },
    { fieldName: 'cntrDtlStatNm', visible: false },
    { fieldName: 'cntrRcpFshDtm', visible: false },
    { fieldName: 'adrId', visible: false },
    { fieldName: 'newAdrZip', visible: false },
    { fieldName: 'rnadr', visible: false },
    { fieldName: 'rdadr', visible: false },
    { fieldName: 'reqdDt', visible: false },
    { fieldName: 'mngrDvCd', visible: false },
    { fieldName: 'dgr1LevlOgId', visible: false },
    { fieldName: 'dgr3LevlOgId', visible: false },
    { fieldName: 'editYn', visible: false },
    { fieldName: 'svBizHclsfCd', visible: false },
    { fieldName: 'ostrTpCd', visible: false },
    { fieldName: 'ostrDt', visible: false },
    { fieldName: 'itmOstrNo', visible: false },
    { fieldName: 'ostrSn', visible: false },
    { fieldName: 'rmkCn', visible: false },
    { fieldName: 'partCnt', visible: false },
    { fieldName: 'pdQty', visible: false },
    { fieldName: 'logisticsPdCd', visible: false },
    { fieldName: 'logisticsPdNm', visible: false },
    { fieldName: 'logisticsPdQty', visible: false },
    { fieldName: 'istDt', visible: false },
    { fieldName: 'cstSvAsnNo', visible: false },
    { fieldName: 'ogId', visible: false },
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'prtnrNo', visible: false },
    { fieldName: 'pscocd', visible: false },
    { fieldName: 'clnSppIvcNo', visible: false },
  ];
  // 상품 동적 필드
  const pdColums = [
    { fieldName: 'partCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'partNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left', editable: false },
    {
      fieldName: 'partQty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-right',
      editable: false,
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
          editable: false,
          dataType: row.dataType,
          numberFormat: row.numberFormat,
        },
      );
    });
    // 상품 레이아웃 필드
    columnPdLayouts.push(
      {
        header: `${t('MSG_TXT_OSTR_INF')}${cnt}`,
        direction: 'horizontal',
        items: [`partCd${cnt}`, `partNm${cnt}`, `partQty${cnt}`],
      },
    );
  }
  columns.push(...columnPdTotals);
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);

  // 테스트 임시
  // view.setCheckableExpression("(value['rcgvpKnm']='배춘자')", true);
  view.setCheckableExpression("((value['wkPrgsStatCd']='00') or (value['wkPrgsStatCd']='10'))", true);
  view.setRowStyleCallback((g, { dataRow }) => {
    const editYn = 'N';
    if (editYn === g.getValue(dataRow, 'editYn')) {
      return {
        editable: false,
      };
    }
  });

  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 6, resizable: true });
  view.editOptions.editable = true;
  view.setColumnLayout([
    {
      header: t('MSG_TXT_WK_CLS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svBizDclsfCd', 'svBizDclsfNm'],
    },
    'wkPrgsStatNm',
    'reWkPrgsStatNm',
    'bcNo',
    'cntrDtlNo',
    'rcgvpKnm',
    'cralIdvTno',
    {
      header: t('MSG_TXT_ITM_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['basePdCd', 'basePdNm'],
    },
    ...columnPdLayouts,
    'cntrPdStrtdt',
    'pcsvRcgvDt',
    'rcpdt',
    'cmptGd',
    {
      header: t('MSG_TIT_APP_DTLS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rcpIchrPrtnrNo', 'prtnrKnm'],
    },
    'arvDt',
    'dtmChRsonCd',
    'fwSppIvcNo',
    'pscocd',
    'dtmChRsonDtlCn',
    'rsgFshDt',
    'rsgAplcDt',
    'fnlGb',
  ]);
});
</script>
