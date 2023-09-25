<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbBsContactVisitPsM (K-W-SV-U-0289M01)- B/S 컨택방문현황
3. 작성자 : jungheejin
4. 작성일 : 2023-09-26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B/S 컨택방문현황  http://localhost:3000/#/service/wwsnb-bs-contact-visit-ps
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_ASN_YM')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
          v-model:prtnr-no="searchParams.prtnrNo"
          dgr1-levl-og-required
          dgr2-levl-og-required
          use-og-level="3"
          use-partner
          dgr3-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
        />
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
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

import { getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
const router = useRouter();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/bs-contact-visit-ps';
const searchParams = ref({
  asnOjYm: now.format('YYYYMM'),
  prtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
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
  const columns = [
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BLG'), width: '90', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_NAME'), width: '70', styleName: 'text-left' }, // 이름
    { fieldName: 'qlfDvNm', header: t('MSG_TXT_PSTN_DV'), width: '110', styleName: 'text-left' }, // 직급구분
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' }, // 고객명
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'npPtrm', header: t('MSG_TXT_NO_PROC_PRD'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' }, // 미처리기간
    { fieldName: 'cntcDt', header: t('MSG_TXT_CTT_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' }, // 컨택일자
    { fieldName: 'absncRsonNm', header: t('MSG_TXT_CTT_RS'), width: '120', styleName: 'text-center' }, // 컨택결과
    { fieldName: 'vstDueDt', header: t('MSG_TXT_VST_EXP_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' }, // 방문예정일
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
