<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0197M01] WwsnbFinishLocationListM - 완료 위치 내역 조회
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 완료건에 대한 위치 내역 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_YM')"
          required
        >
          <!--방문년월-->
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            rules="required"
            :name="$t('MSG_TXT_VST_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MNGT_DV')">
          <!--관리구분-->
          <kw-select
            v-model="searchParams.mngtDvCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.LOCARA_MNGT_DV_CD"
            @change="onChangeMngtDvCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_STD_DSTN')">
          <!--기준거리-->
          <kw-select
            v-model="searchParams.fshBaseDstn"
            first-option="all"
            first-option-value="ALL"
            :options="codes.WK_FSH_BASE_DSTN_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row v-if="searchParams.mngtDvCd === '1'">
        <wwsn-manager-og-search-item-group
          v-model:partner="searchParams.partner"
          use-og-level="2"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
          partner-required
          :dgr2-levl-og-always-search="false"
        />
      </kw-search-row>
      <kw-search-row v-else-if="searchParams.mngtDvCd === '2'">
        <wwsn-engineer-og-search-item-group
          v-model:partner="searchParams.partner"
          use-og-level="1"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
          partner-required
        />
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
          icon="print"
          secondary
          dense
          :label="t('MSG_BTN_PRTG')"
        />
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
import { useDataService, useMeta, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LOCARA_MNGT_DV_CD',
  'WK_FSH_BASE_DSTN_CD',
  'SELL_TP_CD',
);

const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  asnOjYm: now.format('YYYYMM'),
  mngtDvCd: 'ALL',
  fshBaseDstn: 'ALL',

  partner: {},
  ogTpCd: '',
  prtnrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('/sms/wells/service/finish-location/paging', { params: { ...cachedParams, ...pageInfo.value } });

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
  if (searchParams.value.mngtDvCd !== 'ALL') {
    const { ogTpCd, prtnrNo } = searchParams.value.partner;
    searchParams.value.ogTpCd = ogTpCd;
    searchParams.value.prtnrNo = prtnrNo;
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onChangeMngtDvCd() {
  searchParams.value.partner = {};
  searchParams.value.ogTpCd = '';
  searchParams.value.prtnrNo = '';
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { data } = await dataService.get('/sms/wells/service/finish-location/excel-download', { params: cachedParams });
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
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'asnOjYm' },
    { fieldName: 'cntr' }, // 계약번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'svpdSapCd' }, // SAP코드
    { fieldName: 'pdctPdCd' }, // 품목코드
    { fieldName: 'svpdNmAbbr1' }, // 품목명
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'adr' }, // 주소
    { fieldName: 'prtnrKnm' }, // 처리자
    { fieldName: 'vstFshDstnVal' }, // 거리
    { fieldName: 'status' }, // 거리

    { fieldName: 'mobileTno' }, // 연락처
  ];

  const columns = [
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
    }, // 계약상세번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-left' }, // 고객명
    { fieldName: 'mobileTno', header: t('MSG_TXT_CONTACT'), width: '120', styleName: 'text-center' }, // 연락처
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '200', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' }, // 품목코드
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_ITM_NM'), width: '120', styleName: 'text-left' }, // 품목명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '80', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '500', styleName: 'text-left' }, // 주소
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PCP'), width: '70', styleName: 'text-left' }, // 처리자
    { fieldName: 'vstFshDstnVal',
      header: t('MSG_TXT_DSTN'),
      width: '90',
      styleName: 'text-right',
      styleCallback(grid, dataCell) {
        const status = grid.getValue(dataCell.index.itemIndex, 'status');
        if (status === 'ERROR') {
          return { styleName: 'text-right text-red' };
        }

        return { styleName: 'text-right' };
      },
    }, // 거리
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  view.onCellItemClicked = (grid, clickData) => {
    if (clickData.column === 'cntr') {
      const param = { cntrNo: grid.getDataSource().getValue(clickData.dataRow, 'cntrNo'), cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };

  // await onClickSearch();
}

</script>
