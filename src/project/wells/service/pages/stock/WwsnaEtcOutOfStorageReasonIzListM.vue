<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaEtcOutOfStorageReasonIzListM - 기타출고 사유내역
3. 작성자 : songTaeSung
4. 작성일 : 2023.01.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 기타출고 사유내역 (http://localhost:3000/#/service/wwsna-etc-out-of-storage-reason-iz-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
            name="$t('MSG_TXT_OSTR_DT')"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ostrWareNo"
            :options="center"
            first-option="all"
          />
        </kw-search-item>
        <!-- 청구사유 -->
        <kw-search-item :label="$t('MSG_TXT_BIL_RSON')">
          <kw-select
            v-model="searchParams.bilRsonCd"
            :options="codes.BIL_RSON_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 등급 -->
        <kw-search-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_DV')">
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.startItemCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endItemCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <!-- 엑셀다운로드 -->
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

import { codeUtil, getComponentType, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getters } = useStore();

const { userId: sessionUserId, employeeIDNumber: epNo } = getters['meta/getUserInfo'];
// TODO: 현재 세션값으로 부서ID가 아닌 조직코드로 변경되거나 해야하는 과정이므로 강제로 값을 넣어 테스트진행중
let { departmentId: deptId } = getters['meta/getUserInfo'];
// const { departmentId: deptId } = getters['meta/getUserInfo'];

console.log(sessionUserId);
console.log(epNo);
// console.log(deptId);
console.log(getters['meta/getUserInfo']);

const { t } = useI18n();
const dataService = useDataService();

// const { getConfig } = useMeta();
// const { notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'BIL_RSON_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
);

const searchParams = ref({
  stOstrDt: '',
  edOstrDt: '',
  bilRsonCd: '',
  pdGdCd: '',
  itmKndCd: '',
  startItemCd: '',
  endItemCd: '',
  ostrWareNo: '',
});

const totalCount = ref(0);

let cachedParams;
async function fetchData() {
  let etcValue;
  if (deptId === '2') {
    const res = await dataService.get('/sms/wells/service/etc-out-of-storage-resons', { params: cachedParams });
    etcValue = res.data;
  } else {
    const res = await dataService.get(
      '/sms/wells/service/etc-out-of-storage-resons/business',
      { params: cachedParams },
    );
    etcValue = res.data;
  }
  totalCount.value = etcValue.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(etcValue);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

searchParams.value.stOstrDt = dayjs().set('date', 1).format('YYYYMMDD');
searchParams.value.edOstrDt = dayjs().format('YYYYMMDD');

const center = ref();
async function fetchDefalutData() {
  if (deptId === '2') {
    const res = await dataService.get('/sms/wells/service/etc-out-of-storage-resons/service-centers', { params: { stOstrDt: searchParams.value.stOstrDt } });
    center.value = res.data;
  } else {
    const res = await dataService.get('/sms/wells/service/etc-out-of-storage-resons/business-centers', { params: { stOstrDt: searchParams.value.stOstrDt } });
    center.value = res.data;
  }
}

// TODO: 사용자 세션에 따라 분기처리로 서비스센터, 영업센터 두개의 쿼리를 조회해 와야함(창고테이블변경 후 작업예정)
onMounted(async () => {
  deptId = '2';
  await fetchDefalutData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itemNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'ostrDt' },
    { fieldName: 'ostrQty' },
    { fieldName: 'whlsUprcAmt', dataType: 'number' },
    { fieldName: 'csmrUprcAmt', dataType: 'number' },
    { fieldName: 'totalAmt', dataType: 'number' },
    { fieldName: 'deptNm2' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'wareNm' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itemNm', header: t('MSG_TXT_ITM_NM'), width: '500' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '78', styleName: 'text-center' },
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), width: '126', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrQty', header: t('MSG_TXT_QTY'), width: '126', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'csmrUprcAmt', header: t('MSG_TXT_CSPRC'), width: '126', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totalAmt', header: t('MSG_TXT_SUM_AMT'), width: '126', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'deptNm2', header: t('MSG_TXT_BIL_DEPARTMENT'), width: '140' },
    { fieldName: 'ostrRsonCd', header: t('MSG_TXT_BIL_RSON'), width: '140' },
    { fieldName: 'wareNm', header: t('MSG_TXT_SV_CNR'), width: '140' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '140' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
