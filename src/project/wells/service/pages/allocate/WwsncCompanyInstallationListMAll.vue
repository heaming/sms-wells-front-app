<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationListMAll(회사설치 현황(전체))
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 현황 (전체) (http://localhost:3000/#/service/wwsnc-company-installation-list)
****************************************************************************************************
--->

<template>
  <kw-search
    :cols="3"
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 관리년월 -->
      <kw-search-item
        :label="$t('MSG_TXT_MGT_YNM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.mgtYnm"
          type="month"
          :rules="required"
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
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="gridAllRef"
      name="grid_all"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta, codeUtil } from 'kw-lib';
import { getCodeNames } from '~/modules/sms-common/product/utils/pdUtil';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridAllRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

/*
 *  Search Parameter
 */
const searchParams = ref({
  mgtYnm: now.format('YYYYMM'), // 관리년월
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

/*
 * 공통 코드
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD',
  'REFRI_DV_CD', // 유무상
  'SV_BIZ_DCLSF_CD', // 서비스업무세분류콪ㄷ드
);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/company-ist-state/all/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: allState, pageInfo: pagingResult } = res.data;
  pageInfo.value = gridAllRef.value.getView();

  pageInfo.value = pagingResult;

  const view = gridAllRef.value.getView();
  view.getDataSource().setRows(allState);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 전체(tab1), 필터(tab2), 부자재(tab3) 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  console.log(searchParams.value);

  console.log(pageInfo.value);

  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridAllRef.value.getView();

  const response = await dataService.get('/sms/wells/service/company-ist-state/all/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostFix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNoSn' }, // 계약번호
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'ogId' }, // 부서
    { fieldName: 'ogNm' }, // 부서명
    { fieldName: 'cscnCd' }, // 코스트센터
    { fieldName: 'deptNm1' }, // 본부
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'svcTpNm' }, // 관리유형
    { fieldName: 'fnlPdCd' }, // 상품코드
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'svBizHclsfCd' }, // 작업유형
    { fieldName: 'svBizDclsfCd' }, // 작업유형상세
    { fieldName: 'svBizDclsfNm' }, // 작업유형명
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 부품명
    { fieldName: 'useQty' }, // 사용수량
    { fieldName: 'pdctUprc' }, // 실제원가
    { fieldName: 'pdctUprcSum' }, // 원가합계
    { fieldName: 'csmrUprcAmt' }, // 소비자가
    { fieldName: 'csmrUprcAmtSum' }, // 소비자가합계
    // { fieldName: 'refriDvCd' }, // 작업구분
    // { fieldName: 'wrkPrtnrClsfCd' }, // 유무상구분
    { fieldName: 'prtnrClsfCd' }, // 작업자구분
    { fieldName: 'ichrPrtnrNo' }, // 작업자사번
    { fieldName: 'prtnrKnm' }, // 작업자성명
    { fieldName: 'prtnrOgNm' }, // 작업자소속
    { fieldName: 'cstAdr' }, // 고객주소
  ];

  const columns = [
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '160',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => (`${gridUtil.getCellValue(grid, index.dataRow, 'cntrNo')}-${gridUtil.getCellValue(grid, index.dataRow, 'cntrSn')}`),
    },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'ogId', header: t('MSG_TXT_DEPT'), width: '90', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_DEPT_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'cscnCd', header: t('MSG_TXT_COST_CNR'), width: '150', styleName: 'text-center' },
    { fieldName: 'deptNm1', header: t('MSG_TXT_HDQ'), width: '200' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'svcTpNm', header: t('MSG_TXT_MGT_TYP'), width: '130', styleName: 'text-center' },
    { fieldName: 'fnlPdCd', header: t('MSG_TXT_PRDT_CODE'), width: '110', styleName: 'text-right' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'svBizHclsfCd', header: t('MSG_TXT_WORK_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WORK_TYPE') + t('MSG_TXT_DTL'), width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm',
      header: t('MSG_TXT_WORK_TYPE') + t('MSG_TXT_NM'),
      width: '105',
      styleName: 'text-center',
      displayCallback: (grid, index) => getCodeNames(codes.SV_BIZ_DCLSF_CD, grid.getValue(index.itemIndex, 'svBizDclsfCd')),
    },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-right' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'useQty', header: t('MSG_TXT_USE') + t('MSG_TXT_QTY'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdctUprc', header: t('MSG_TXT_ACTUAL_COST'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdctUprcSum', header: t('MSG_TXT_COST') + t('MSG_TXT_SUM_AMT'), width: '105', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmt', header: t('MSG_TXT_CSPRC'), width: '105', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmtSum', header: t('MSG_TXT_CSPRC') + t('MSG_TXT_SUM_AMT'), width: '130', styleName: 'text-center' },
    // { fieldName: 'refriDvCd', header: t('MSG_TXT_RECAP_OR_FREE'), width: '100', styleName: 'text-right' },
    // eslint-disable-next-line max-len
    // { fieldName: 'prtnrClsfCd', header: t('MSG_TXT_WKP') + t('MSG_TXT_DIV'), width: '110', styleName: 'text-center' },
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_WKP') + t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_WKP') + t('MSG_TXT_EMPL_NM'), width: '105', styleName: 'text-center' },
    { fieldName: 'prtnrOgNm', header: t('MSG_TXT_WKP') + t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstAdr', header: t('MSG_TXT_CST_ADR'), width: '105', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
