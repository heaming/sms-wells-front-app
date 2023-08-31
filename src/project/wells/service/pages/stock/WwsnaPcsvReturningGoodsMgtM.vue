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
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            option-value="pdCd"
            option-label="pdNm"
            first-option="select"
            first-option-value=""
            placeholder="선택"
            rules="required"
            :label="$t('MSG_TXT_ITM_NM')"
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
            rules="date_range_required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_WK_STS')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
          />
        </kw-search-item>
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
      </kw-search-row>
      <kw-search-row>
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrint"
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
    { codeId: '00', codeName: t('MSG_TXT_RTRN_RQST') },
    { codeId: '10', codeName: t('MSG_TXT_RTRN_RGST') },
    { codeId: '11', codeName: t('MSG_TXT_CANCEL_COMP') },
    { codeId: '20', codeName: t('MSG_TXT_RTRN_COMP') },
  ],
  dtmChRsonCd: [
    { codeId: '', codeName: t('MSG_TXT_SELT') },
    { codeId: '91', codeName: t('MSG_TXT_OPEN') },
    { codeId: '92', codeName: t('MSG_TXT_UNOPEN') },
  ],
};

const searchParams = ref({
  wareNo: '100002', /* 교원파주물류센터 */
  pdCd: '', /* 공기청정기 임시 */
  findGb: '00',
  startDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'),
  cntrCstNo: '', /* 계약고객번호 */
  rcgvpKnm: '', /* 고객명 */
  bcNo: '', /* 시리얼넘버 */
});

const totalCount = ref(0);

let cachedParams;
const logisticsCenters = ref();
const products = ref();

/* 물류센터 조회 */
async function fetchLogisticsCenters() {
  const res = await dataService.get(`${baseUrl}/logistics-centers`, {});
  logisticsCenters.value = res.data;
}

/* 상품 조회 */
async function fetchProducts() {
  const res = await dataService.get(`${baseUrl}/products`, { params: { svBizDclsfCd: '3460' } });
  console.log(res);
  products.value = res.data;
}

await fetchLogisticsCenters();
await fetchProducts();

/* 택배상품 반품조회 */
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  const list = res.data;
  console.log(list);
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  console.log(grdMainRef);
  console.log(view);
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'pcsvReturningGoodsMgt',
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickPrint() {
  // TODO : 출력 기능 연결
  notify('TODO : 출력기능?');
}
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    const response = await dataService.post(`${baseUrl}`, chkRows);
    console.log(response);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'findGb' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'cntrDtlStatCd' },
    { fieldName: 'cntrDtlStatNm' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdNm' },
    { fieldName: 'cntrRcpFshDtm' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'cralLocaraTno' }, // [휴대전화번호1]
    { fieldName: 'mexnoEncr' }, // [휴대전화번호2]
    { fieldName: 'cralIdvTno' }, // [휴대전화번호3]
    { fieldName: 'hpNo' },
    { fieldName: 'locaraTno' }, // [전화번호1]
    { fieldName: 'exnoEncr' }, // [전화번호2]
    { fieldName: 'idvTno' }, // [전화번호3]
    { fieldName: 'rsgAplcDt' },
    { fieldName: 'rsgFshDt' },
    { fieldName: 'pdHclsfId' },
    { fieldName: 'pdMclsfId' },
    { fieldName: 'pdLclsfId' },
    { fieldName: 'pdDclsfId' },
    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdGdCd' },
    { fieldName: 'svBizHclsfCd' }, // 서비스대분류코드
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'wkPrgsStatCd' },
    { fieldName: 'wkPrgsStatNm' },
    { fieldName: 'editYn' },
    { fieldName: 'istDt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'ogId' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'asRefriDvCd' },
    { fieldName: 'bfsvcRefriDvCd' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'useQty' },
    { fieldName: 'wareNo' },
    { fieldName: 'vstRqdt' },
    { fieldName: 'ogNm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pdArvDt' },
    { fieldName: 'pdUseDc' },
    { fieldName: 'rtngdGd' },
    { fieldName: 'arvDt' },
    { fieldName: 'dtmChRsonCd' },
    { fieldName: 'sppIvcNo' },
    { fieldName: 'sppProcsBzsNm' },
    { fieldName: 'rtngdNm' },
    { fieldName: 'fnlRtngdGd' },
    { fieldName: 'bcNo' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'asLctCd' },
    { fieldName: 'asPhnCd' },
    { fieldName: 'asCausCd' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'siteAwSvTpCd' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'pdUswyCd' },
    { fieldName: 'urgtDvCd' },
    { fieldName: 'wellsReqdDt' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrDt' },
  ];

  const columns = [ // t('')
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_TASK_TYPE_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'bcNo', header: t('MSG_TXT_SE_NO'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'cntrNo', // 계약상세번호
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
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
    { fieldName: 'basePdNm', header: t('MSG_TXT_ITM_NM'), width: '250', styleName: 'text-left', editable: false }, // 품목명
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SL_OSTR_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_PDCT_RCG_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'vstRqdt', header: t('MSG_TXT_RTRN_CNSL_REG_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'rtngdGd', header: t('MSG_TXT_CALA_GD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'arvDt',
      header: {
        text: t('MSG_TXT_SPOT_STR_DT'), // 현물입고일자
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
    { fieldName: 'sppIvcNo', // 송장번호
      header: t('MSG_TXT_IVC_NO'),
      width: '150',
      rules: 'required',
      styleName: 'text-left',
      placeHolder: t('MSG_TXT_INP'),
      editable: true,
    },
    { fieldName: 'sppProcsBzsNm', header: t('MSG_TXT_PCSV_CO'), width: '100', rules: 'required', styleName: 'text-center', placeHolder: t('MSG_TXT_INP'), editable: true },
    { fieldName: 'rtngdNm', header: t('MSG_TXT_RTNGD_USR'), width: '80', rules: 'required', styleName: 'text-center', placeHolder: t('MSG_TXT_INP'), editable: true },
    { fieldName: 'ReqdDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_REQD_RQDT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'fnlRtngdGd', header: t('MSG_TXT_FNL_GD'), width: '70', styleName: 'text-center', editable: false },

  ];
  data.setFields(fields);
  view.setCheckableExpression("(value['editYn']='Y')", true);
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
    'bcNo',
    'cntrNo',
    'rcgvpKnm',
    'cralIdvTno',
    {
      header: t('MSG_TXT_ITM_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['basePdCd', 'basePdNm'],
    },
    'cntrPdStrtdt',
    'cntrRcpFshDtm',
    'vstRqdt',
    'rtngdGd',
    {
      header: t('MSG_TIT_APP_DTLS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fstRgstUsrId', 'prtnrKnm'],
    },
    'arvDt',
    'dtmChRsonCd',
    'sppIvcNo',
    'sppProcsBzsNm',
    'rtngdNm',
    'ReqdDt',
    'rsgAplcDt',
    'fnlRtngdGd',
  ]);
});
</script>
