<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaChangeOfRentalStatusListM(W-SV-U-0287M01) - 렌탈 상태변경 현황
 3. 작성자 : SongTaeSung
 4. 작성일 : 2023.07.21
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 렌탈 상태변경 현황 (http://localhost:3000/#/service/wwsna-change-of-rental-status-list)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRD')"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="filterCodes.pdGdCd"
            first-option="all"
          />
        </kw-search-item>

        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="filterCodes.products"
            first-option="all"
          />
        </kw-search-item>
        <!-- 조회년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_YM')"
        >
          <kw-date-picker
            v-model="searchParams.inqrYm"
            type="month"
          />
        </kw-search-item>

        <!-- 반품처리유형 -->
        <kw-search-item :label="$t('MSG_TXT_RTNGD_PROCS_TP')">
          <kw-select
            v-model="searchParams.rentalRtngdProcsTp"
            :options="codes.RENTAL_RTNGD_PROCS_TP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 서비스센터 -->
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.svnCd"
            :options="filterCodes.warehouse"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <!-- 단위 -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
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
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useMeta, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
// const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
console.log(cachedParams);
const searchParams = ref({
  itmGdCd: '',
  pgGdCd: '',
  itmPdCd: '',
  inqrYm: dayjs().format('YYYYMM'),
  rentalRtngdProcsTp: '',
  svnCd: '',

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GD_CD',
  'RENTAL_RTNGD_PROCS_TP_CD',
  'RTNGD_PROCS_TP_CD',
);

const filterCodes = ref({
  pdGdCd: [],
  rtngdProcsTp: [],
  products: [],
  warehouse: [],
});

// 품목등급코드 필터링
function pdGdCdFilter() {
  filterCodes.value.pdGdCd = codes.PD_GD_CD.filter((v) => ['E', 'R'].includes(v.codeId));
}

// 화면로드시 품목코드 조회
async function fetchItmPdCd() {
  const res = await dataService.get('/sms/wells/service/change-rental-status/products');
  filterCodes.value.products = res.data;
}

// 화면로드시 서비스센터(창고) 조회
async function fetchWareNo() {
  const res = await dataService.get('/sms/wells/service/change-rental-status/warehouses', { params: searchParams.value });
  filterCodes.value.warehouse = res.data;
}

await Promise.all([
  pdGdCdFilter(),
  await fetchItmPdCd(),
  await fetchWareNo(),

]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/change-rental-status/paging', { params: { ...cachedParams, ...pageInfo.value }, timeout: 300000 });
  const { list: rentalItem, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(rentalItem);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/change-rental-status/excel-download', { params: cachedParams, timeout: 300000 });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svpdSapCd' }, // SAP코드
    { fieldName: 'svpdPdCd' }, // 품목코드
    { fieldName: 'svpdNmAbbr1' }, // 품목명
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'fnlVstFshDt' }, // 작업일자
    { fieldName: 'reqdDt' }, // 철거요청일자
    { fieldName: 'fnlItmGdCd' }, // 등급
    { fieldName: 'deptNm' }, // 담당센터
    { fieldName: 'useQty' }, // 수량
    { fieldName: 'cntrDtlNo' }, // 고객번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'ostrConfDt' }, // 확인일자
    { fieldName: 'ostrDt' }, // 전산반품
    { fieldName: 'rtngdProcsTpCd' }, // 반품처리유형
    { fieldName: 'rmkCn' }, // 특이사항
    { fieldName: 'rentalAssetStat' }, // 렌탈관련상태
    { fieldName: 'cntrNo' }, // 고객번호
    { fieldName: 'cntrSn' }, // 고객순번
    { fieldName: 'rtngdRvpyProcsYn' }, // 반품수불처리여부
    { fieldName: 'hgrWareNo' }, // 상위창고번호
    { fieldName: 'factoryDisposalGb' }, // 물류폐기, 공장폐기 임시구분
    { fieldName: 'svpdItemGr' }, // 품목등급
  ];

  const columns = [
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    { fieldName: 'svpdPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_ITM_NM'), width: '350', styleName: 'text-left' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_RQDT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlVstFshDt', header: t('MSG_TXT_WK_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlItmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'deptNm', header: t('MSG_TXT_ICHR_CNR'), width: '150', styleName: 'text-left' },
    { fieldName: 'useQty', header: t('MSG_TXT_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrConfDt', header: t('MSG_TXT_CONF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrDt', header: t('MSG_TXT_EDP_RTNGD'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rtngdProcsTpCd', header: t('MSG_TXT_RTNGD_PROCS_TP'), width: '100', styleName: 'text-center', options: codes.RTNGD_PROCS_TP_CD },
    { fieldName: 'rmkCn', header: t('MSG_TXT_UNUITM'), width: '200', styleName: 'text-left' },
    /* TODO: 현재 주문번호 테이블에 데이터가 5건밖에 없는데 그것마저도 확인이 제대로 안됨. */
    // { fieldName: 'rcgvpKnm', header: '주문번호', width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
