<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaAllowanceRedfEstimateAmtListM
3. 작성자 : daewon.kim
4. 작성일 : 2023.06.29 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수당되물림 예상액 조회
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="t('조직')">
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="codes.SELL_OG_DV_ACD"
          />
        </kw-search-item>
        <kw-search-item :label="t('실적구분')">
          <kw-option-group
            v-model="searchParams.perfDvCd"
            type="radio"
            :options="['개인', '지점']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRTNR_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            :disable="prtnrCheck"
            regex="num"
            maxlength="10"
            icon="search"
            clearable
            rules="numeric"
            :label="$t('MSG_TXT_PRTNR_NUMBER')"
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
        <kw-form-item :label="t('회원명')">
          <kw-input
            v-model="searchParams.cstNm"
            icon="search"
            clearable
            @click-icon="onClickSelectCustomer"
          />
        </kw-form-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ t('실적 현황') }}</h3>
          <span class="ml8"> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
      </kw-action-top>
      <kw-action-top>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickMainExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initGrid"
      />

      <h3>{{ t('판매리스트') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="111"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickSecondExcelDownload"
        />
        <kw-btn
          :label="t('되물림 예상액 조회')"
          secondary
          dense
          @click="onClickRedfEtAmtInqr"
        />
      </kw-action-top>

      <kw-grid
        ref="grdSecondRef"
        name="grdSecond"
        :visible-rows="5"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid2"
      />
      <h3>{{ t('되물림 예상액') }}</h3>
      <kw-action-top class="mt20">
        <template #left>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="!grdThirdExcelChk"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickThirdExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdThirdRef"
        name="grdThird"
        :visible-rows="3"
        @init="initGrid3"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, defineGrid, useDataService, useMeta, modal, alert } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const defaultDay = dayjs().subtract(0, 'month').format('YYYYMM');
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'SELL_OG_DV_ACD',
  // 'REDF_ET_PERF_DV_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

// eslint-disable-next-line no-unused-vars
let cachedParams;
const grdThirdExcelChk = ref(false);

const searchParams = ref({
  prtnrNo: '',
  perfYm: defaultDay,
  perfDvCd: '',
  cstNm: '',
  ogTpCd: codes.SELL_OG_DV_ACD[0].codeId,
});

// 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      // cstNo: searchParams.value.cstNo,
      cstNm: searchParams.value.cstNm,
      cstType: '1',
    },
  });
  if (result) {
    // searchParams.value.schCstNo = payload.cstNo;
    searchParams.value.cstNm = payload.cstNm;
  }
}

/* 목록 조회 */
async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/iz/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  // const view2 = grdSecondRef.value.getView();
  // const dataSource2 = view2.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);

  // dataSource2.checkRowStates(false);
  // dataSource2.addRows(redfes);
  // dataSource2.checkRowStates(true);
}

/* 예상액 조회 */
async function fetchData2() {
  const view = grdThirdRef.value.getView();
  const dataSource = view.getDataSource();

  const res = await dataService.get('/sms/edu/deduction/redf/estimate-amounts/et/paging', { params: { ...pageInfo.value } });
  console.log(res.data);

  const { list: redfes, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickMainExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/??/excel-download', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('실적 현황')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSecondExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/??/excel-download', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('판매리스트')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickThirdExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/??/excel-download');
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('되물림 예상액')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickRedfEtAmtInqr() {
  const view = grdSecondRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    await alert(t('항목을 선택해주세요.'));
    return;
  }
  grdThirdRef.value.getData().clearRows();

  checkedRows.forEach((e) => {
    e.perfYm = cachedParams.perfYm;
  });

  const res = await dataService.post('/sms/wells/deduction/redf/estimate-amounts', checkedRows);

  if (res.data.processCount > 0) {
    grdThirdExcelChk.value = true;
    await fetchData2();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
  ];

  const columns = [
    /* P, M조직 공통 */
    { fieldName: 'col1', header: t('실적 구분'), width: '338', styleName: 'text-center' },

    /* P조직 개인실적 */
    { fieldName: 'col2', header: t('가전 실적'), width: '200', styleName: 'text-right' },
    { fieldName: 'col3', header: t('가전외 실적'), width: '200', styleName: 'text-right' },

    /* P조직 지점실적 */
    { fieldName: 'col4', header: t('가전 실적'), width: '200', styleName: 'text-right' },
    { fieldName: 'col5', header: t('가전외 실적'), width: '200', styleName: 'text-right' },

    /* P, M조직 공통 지점실활동(명) */
    { fieldName: 'col6', header: t('매니저'), width: '200', styleName: 'text-right' },
    { fieldName: 'col7', header: t('플래너'), width: '200', styleName: 'text-right' },

    /* M조직 개인실적 */
    { fieldName: 'col8', header: t('인정건수'), width: '120', styleName: 'text-right' },
    { fieldName: 'col9', header: t('가전 기준가'), width: '120', styleName: 'text-right' },
    { fieldName: 'col10', header: t('가전외 기준가'), width: '120', styleName: 'text-right' },

    /* M조직 지점실적 */
    { fieldName: 'col11', header: t('인정건수'), width: '120', styleName: 'text-right' },
    { fieldName: 'col12', header: t('가전 기준가'), width: '120', styleName: 'text-right' },
    { fieldName: 'col13', header: t('가전외 기준가'), width: '120', styleName: 'text-right' },
    { fieldName: 'col14', header: t('신규판매건수'), width: '120', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  const ogTpCdP = [
    'col1',
    {
      header: t('개인실적'),
      direction: 'horizontal',
      items: ['col2', 'col3'],
    },
    {
      header: t('지점실적'),
      direction: 'horizontal',
      items: ['col4', 'col5'],
    },
    {
      header: t('지점실활동(명)'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const ogTpCdM = [
    'col1',
    {
      header: t('개인실적'),
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10'],
    },
    {
      header: t('지점실적'),
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13', 'col14'],
    },
    {
      header: t('지점실활동(명)'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
  ];

  // multi row header setting
  view.setColumnLayout(ogTpCdP);

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdMainRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdP);
    } else if (val === '7') { // M조직
      grdMainRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdM);
    }
  });
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col13' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('계약번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('고객명'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('설치처'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('상품명'), width: '235', styleName: 'text-left ' },
    { fieldName: 'col5', header: t('기변유형'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('판매자'), width: '100', styleName: 'text-center' },
    { fieldName: 'col7', header: t('파트너번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'col8', header: t('자격(직급)'), width: '100', styleName: 'text-center' },
    { fieldName: 'col9', header: t('인정 실적'), width: '120', styleName: 'text-right ' },
    { fieldName: 'col13', header: t('인정건수'), width: '120', styleName: 'text-right ' },
    { fieldName: 'col10', header: t('취소되물림월'), width: '120', styleName: 'text-center ' },
    { fieldName: 'col11', header: t('연체되물림월'), width: '120', styleName: 'text-center ' },
    { fieldName: 'col12', header: t('강제되물림'), width: '120', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const ogTpCdP = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    'col9',
    'col10',
    'col11',
    'col12',
  ];

  const ogTpCdM = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    'col13',
    'col10',
    'col11',
    'col12',
  ];

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdP);
    } else if (val === '7') { // M조직
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdM);
    }
  });
});

const initGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('구분'), width: '180', styleName: 'text-center' },
    { fieldName: 'col11', header: t('합계'), width: '189', styleName: 'text-right' },

    /* P조직 */
    { fieldName: 'col2', header: t('가전 비례'), width: '120', styleName: 'text-right' },
    { fieldName: 'col3', header: t('가전외 비례'), width: '120', styleName: 'text-right' },
    { fieldName: 'col4', header: t('판매장려'), width: '120', styleName: 'text-right' },
    { fieldName: 'col5', header: t('미팅'), width: '120', styleName: 'text-right' },
    { fieldName: 'col6', header: t('기기변경'), width: '120', styleName: 'text-right' },
    { fieldName: 'col7', header: t('정착'), width: '120', styleName: 'text-right' },
    { fieldName: 'col8', header: t('가전조직비례'), width: '150', styleName: 'text-right' },
    { fieldName: 'col9', header: t('가전외조직비례'), width: '150', styleName: 'text-right' },
    { fieldName: 'col10', header: t('조직판매장려'), width: '150', styleName: 'text-right' },

    /* M조직 */
    { fieldName: 'col12', header: t('가전비례+미팅'), width: '150', styleName: 'text-right' },
    { fieldName: 'col13', header: t('가전외비례+미팅'), width: '150', styleName: 'text-right' },
    { fieldName: 'col14', header: t('교육'), width: '150', styleName: 'text-right' },
    { fieldName: 'col15', header: t('신규판매'), width: '150', styleName: 'text-right' },
    { fieldName: 'col16', header: t('조직관리'), width: '150', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  const ogTpCdP = [
    'col1',
    {
      header: t('개인수수료'),
      direction: 'horizontal',
      items: ['col2', 'col3', 'col4', 'col5', 'col6', 'col7'],
    },
    {
      header: t('지점수수료'),
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10'],
    },
    'col11',
  ];

  const ogTpCdM = [
    'col1',
    {
      header: t('개인수수료'),
      direction: 'horizontal',
      items: ['col12', 'col13', 'col4', 'col14', 'col6', 'col7'],
    },
    {
      header: t('지점수수료'),
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10', 'col15', 'col16'],
    },
    'col11',
  ];

  // multi row header setting
  view.setColumnLayout(ogTpCdP);

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdP);
    } else if (val === '7') { // M조직
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(ogTpCdM);
    }
  });
});
</script>
