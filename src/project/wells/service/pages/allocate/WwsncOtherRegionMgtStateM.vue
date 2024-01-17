<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncOtherRegionMgtStateM(타지역단 관리현황)
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 타지역단 관리현황 (http://localhost:3000/#/service/wwsnc-other-region-mgt-state)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
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
            rules="required"
          />
        </kw-search-item>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.mgtDept"
          v-model:dgr2-levl-og-id="searchParams.rgnlGrp"
          v-model:dgr3-levl-og-id="searchParams.branch"
          use-og-level="3"
          :use-partner="false"
          dgr1-levl-og-required
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr3-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
          :disable="true"
        />
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
        >
          <kw-input
            v-model="searchParams.zipFrom"
            type="text"
            placeholder="00001"
            mask="#####"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            type="text"
            placeholder="99999"
            mask="#####"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useDataService, codeUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
// const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
let cachedParams;

/*
 *  Search Parameter
 */
const searchParams = ref({
  mgtYnm: now.format('YYYYMM'), // 관리년월
  mgtDept: '', // 총괄단
  rgnlGrp: '', // 지역단
  branch: '', // 지점
  zipFrom: '', // 우편번호
  zipTo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
});

/*
 * 공통 코드
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GNRDV_ACD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/other-region-mgt-state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  console.log(res.data);

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  const zipFromValue = cloneDeep(searchParams.value.zipFrom);
  const zipToValue = cloneDeep(searchParams.value.zipTo);

  // 우편번호 Validation Check
  // eslint-disable-next-line max-len
  if (zipFromValue !== null && zipFromValue.length > 0 && zipToValue !== null && zipToValue.length > 0 && zipFromValue > zipToValue) {
    searchParams.value.zipFrom = zipToValue;
    searchParams.value.zipTo = zipFromValue;
  }

  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/other-region-mgt-state/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostFix: true,
    exportData: response.data,
  });
}

// // -------------------------------------------------------------------------------------------------
// // Initialize Grid
// // -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtRgnlGrpNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'cstAdr' },
    { fieldName: 'ltnAdr' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cstCp' },
    { fieldName: 'vstRgnlGrpOgnm' },
    { fieldName: 'ogNm' },
    { fieldName: 'mngtPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'bldNm' },
    { fieldName: 'fxnPrtnrYn' },
    { fieldName: 'mngerRglvlDvCd' },
  ];

  const columns = [
    { fieldName: 'mngtRgnlGrpNm', header: t('MSG_TXT_MGT') + t('MSG_TXT_RGNL_GRP'), width: '160', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' },
    { fieldName: 'cstAdr', header: t('MSG_TXT_ADDR'), width: '150', styleName: 'text-center' },
    { fieldName: 'ltnAdr', header: t('MSG_TXT_EMD'), width: '200', styleName: 'text-center' },
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_CP'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'mexnoEncr', header: t('MSG_TXT_CP'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cralIdvTno', header: t('MSG_TXT_CP'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cstCp',
      header: t('MSG_TXT_CP'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        // eslint-disable-next-line max-len
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return !isEmpty(no1) && !isEmpty(no2) && !isEmpty(no3) ? `${no1}-${no2}-${no3}` : '';
      },
    },
    { fieldName: 'vstRgnlGrpOgnm', header: t('MSG_TXT_VST'), width: '130', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BRANCH'), width: '110', styleName: 'text-center' },
    { fieldName: 'mngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_MNGER_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrYn', header: t('MSG_TXT_FXN'), width: '105', styleName: 'text-center' },
    { fieldName: 'mngerRglvlDvCd', header: t('MSG_TXT_RGLVL'), width: '130', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
