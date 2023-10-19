<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0003M01] WwsnbFalseVisitRegistrationListM - 허위방문 등록현황
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객센터에서 등록한 허위방문 등록 현황을 조회한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_REG_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_required|date_range_months:6"
            :name="$t('MSG_TXT_REG_PERIOD')"
          /><!--등록기간-->
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
        </template>
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
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
import { codeUtil, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  fromDate: now.startOf('month').format('YYYYMMDD'),
  toDate: now.endOf('month').format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('/sms/wells/service/false-visit/paging', { params: { ...cachedParams, ...pageInfo.value } });

  list.forEach((row) => {
    if (row.cralLocaraTno && row.mexnoEncr && row.cralIdvTno) { row.mobileTno = `${row.cralLocaraTno}-${row.mexnoEncr}-${row.cralIdvTno}`; }
  });

  pageInfo.value = pageInfoObj;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  if (searchParams.value.searchType === '4') {
    const numbers = searchParams.value.searchParam1.split('-');
    searchParams.value.searchParam2 = numbers.length > 0 ? numbers[0] : '';
    searchParams.value.searchParam3 = numbers.length > 1 ? numbers[1] : '';
    searchParams.value.searchParam4 = numbers.length > 2 ? numbers[2] : '';
  }

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { data } = await dataService.get('/sms/wells/service/false-visit/excel-download', { params: cachedParams });

  data.forEach((row) => {
    if (row.cralLocaraTno && row.mexnoEncr && row.cralIdvTno) {
      row.mobileTno = `${row.cralLocaraTno}-${row.mexnoEncr}-${row.cralIdvTno}`;
    }
  });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgCd' }, // 총괄단
    { fieldName: 'dgr2LevlOgCd' }, // 지역단
    { fieldName: 'dgr3LevlOgCd' }, // 소속
    { fieldName: 'prtnrNo' }, // 사번
    { fieldName: 'prtnrKnm' }, // 성명
    { fieldName: 'cralLocaraTno' }, // 휴대전화번호(1)
    { fieldName: 'mexnoEncr' }, // 휴대전화번호(2)
    { fieldName: 'cralIdvTno' }, // 휴대전화번호(3)
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'cntr' }, // 계약번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'newAdrZip' }, // 우편번호
    { fieldName: 'adr' }, // 주소
    { fieldName: 'vstFshDstnVal' }, // 거리
    { fieldName: 'vstFshDtHh' }, // BS 완료일자
    { fieldName: 'rcpdt' }, // 살담등록일시
    { fieldName: 'usrNm' }, // 상담사

    { fieldName: 'mobileTno' }, // 휴대전화번호
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '90', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '90', styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BLG'), width: '90', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '70', styleName: 'text-left' }, // 성명
    { fieldName: 'mobileTno', header: t('MSG_TXT_MPNO'), width: '120', styleName: 'text-center' }, // 휴대전화번호
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
    }, // 계약번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '70', styleName: 'text-left' }, // 고객명
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '70', styleName: 'text-center' }, // 우편번호
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '390', styleName: 'text-left' }, // 주소
    { fieldName: 'vstFshDstnVal', header: t('MSG_TXT_DSTN'), width: '80', styleName: 'text-right' }, // 거리
    { fieldName: 'vstFshDtHh', header: t('MSG_TXT_BS_FSH_DT'), width: '160', styleName: 'text-center' }, // BS 완료일자
    { fieldName: 'rcpdt', header: t('MSG_TXT_CNSL_RGST_DTM'), width: '100', styleName: 'text-center' }, // 상담등록일시
    { fieldName: 'usrNm', header: t('MSG_TXT_CNSLOR'), width: '90', styleName: 'text-left' }, // 상담사
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = (grid, clickData) => {
    if (clickData.column === 'cntr') {
      const cntr = grid.getDataSource().getValue(clickData.dataRow, 'cntr');
      const param = { cntrNo: cntr.split('-')[0], cntrSn: cntr.split('-')[1] };
      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };

  await onClickSearch();
}
</script>
