<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeWellsManagerListM - WM수수료생성관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- WM수수료생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ $t('MSG_TXT_UNIT') }} : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_ETC_FEE_ULD')"
          @click="onClickEtcFeeUpload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_MNGER_FEE_CRT')"
          @click="onClickManagerFeeCreate"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { modal, confirm, alert } = useGlobal();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYY-MM'),
  no: '',
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/organization-fees/wms', { params: searchParams.value });
  const wmFee = res.data;

  totalCount.value = wmFee.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(wmFee);
  view.resetCurrent();
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// WM수수료생성 버튼 클릭 이벤트
async function onClickManagerFeeCreate() {
  if (isEmpty(searchParams.value.perfYm)) {
    await alert('실적년월은 필수 항목입니다.');
    return;
  }

  if (!await confirm(t('MSG_ALT_CREATED'))) { return; }
  await dataService.post('/sms/wells/fee/organization-fees', { perfYm: searchParams.value.perfYm });
  fetchData();
}

// 기타수수료 업로드 버튼 클릭 이벤트
async function onClickEtcFeeUpload() {
  // TODO:추후작업. 공통팝업 호출
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '111' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '111' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '111' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '121', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '111' },
    { fieldName: 'col6', header: t('MSG_TXT_RSB'), width: '92' },
    { fieldName: 'col7', header: t('MSG_TXT_NMN'), width: '90', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_OPNG_MM'), width: '92', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col9', header: t('MSG_TXT_CLTN_MM'), width: '92', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col10', header: t('MSG_TXT_FNL_CLTN_MM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_RE_OPNG') + t('MSG_TXT_NMN'), width: '92', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE') + t('MSG_TXT_DSB') + t('MSG_TXT_TYPE'), width: '148' },
    { fieldName: 'col13', header: t('MSG_TXT_FEE_SUM'), width: '126', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col14', header: t('MSG_TXT_FEE_SUM'), width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col15', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '107', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col16', header: `${t('MSG_TXT_CHNG')}1${t('MSG_TXT_COUNT')}`, width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col17', header: t('MSG_TXT_PD_ACC_CNT'), width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col18', header: t('MSG_TXT_CMPLTD'), width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col19', header: `W1${t('MSG_TXT_RGLVL')}${t('MSG_TXT_COUNT')}`, width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col20', header: `W2${t('MSG_TXT_RGLVL')}${t('MSG_TXT_COUNT')}`, width: '108', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col21', header: t('MSG_TXT_VISIT_RECORD'), width: '126', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col22', header: t('MSG_TXT_FER'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col23', header: t('MSG_TXT_VST') + t('MSG_TXT_FEE'), width: '126', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col24', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col25', header: t('MSG_TXT_SELL') + t('MSG_TXT_METG'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col26', header: t('MSG_TXT_STMNT'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col27', header: t('MSG_TXT_STMNT') + t('MSG_TXT_SPLM'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col28', header: t('MSG_TXT_RGLVL') + t('MSG_TXT_FEE'), width: '126', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col29', header: t('MSG_TXT_MAT_HODT') + t('MSG_TXT_FEE'), width: '126', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col30', header: t('MSG_TXT_TELC_ASTN'), width: '113', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col31', header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'), width: '126', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col32', header: t('MSG_TXT_UNIFORM'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col33', header: t('MSG_TXT_PRR_VST'), width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col34', header: t('MSG_TXT_SRTUP') + t('MSG_TXT_MON'), width: '126', styleName: 'text-right' },
    { fieldName: 'col35', header: `OJT${t('MSG_TXT_DC')}`, width: '99', styleName: 'text-right' },
    { fieldName: 'col36', header: `5${t('MSG_TXT_SUN')}${t('MSG_TXT_ASN_N')}`, width: '99', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col37', header: t('MSG_TXT_ENPSC_CRSE_CPC_YN'), width: '99', styleName: 'text-center' },
    { fieldName: 'col38', header: `${t('MSG_TXT_MANAGER') + t('MSG_TXT_STMNT')}2${t('MSG_TXT_CPC_YN')}`, width: '161', styleName: 'text-center' },
    { fieldName: 'col39', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '99', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_CMPF_EDUC_YN'), width: '99', styleName: 'text-center' },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
