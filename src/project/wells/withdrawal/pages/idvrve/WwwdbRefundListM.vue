<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdbRefundListM - 환불현황 (K-W-WD-U-0183M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
환불현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenter"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_WK_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.wkStartDtm"
            v-model:to="searchParams.wkEndDtm"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_WK_DT')"
          />
        </kw-search-item>
        <!-- 환불구분 -->
        <kw-search-item
          :label="t('MSG_TXT_CLSF_REFUND')"
        >
          <kw-select
            v-model="searchParams.rfndDvCd"
            :options="codes.RFND_DV_CD"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 리포트 보기 -->
        <kw-btn
          v-permission:print
          icon="report"
          dense
          secondary
          :label="$t('MSG_BTN_RPT_BRWS')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickReportView"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
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
// eslint-disable-next-line no-unused-vars
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, modal, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const { getUserInfo } = useMeta();
const { getServiceCenterOrgs } = useSnCode();
const { notify } = useGlobal();

// eslint-disable-next-line no-unused-vars
const userInfo = getUserInfo();
const now = dayjs();

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RFND_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const serviceCode = ['71350', '71352', '71355', '71356', '71357', '71359', '71360', '71361', '71363', '71364', '71365', '71366', '71367', '71387', '71784', '71917', '71918', '71919', '71937'];
const serviceCenterOrgs = await getServiceCenterOrgs();
const serviceCenter = serviceCenterOrgs.filter((item) => serviceCode.some((code) => code === item.ogCd));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  ogId: '',
  wkStartDtm: now.date(1).format('YYYYMMDD'), // 등록시작일,
  wkEndDtm: now.format('YYYYMMDD'), // 등록종료일,
  rfndDvCd: '',
});

let cachedParams;

// 리포트 보기
async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  notify('개발중');
  // await openReportPopup(
  //   '/eformsample.ozr',
  //   '/eformsample.odi',
  //   JSON.stringify({ param1: 'test1', param2: 'test2' }),
  // );
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const url = '/sms/wells/withdrawal/idvrve/refund-list/paging';

  const res = await dataService.get(url, { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view2 = grdMainRef.value.getView();

  /* 백단(서비스) 엑셀 다운로드 */
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-list/excel-download', { params: cachedParams });

  await gridUtil.exportView(view2, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'tno' },
    { fieldName: 'mpno' },
    { fieldName: 'partAmt', dataType: 'number' },
    { fieldName: 'tcfee', dataType: 'number' },
    { fieldName: 'trcs', dataType: 'number' },
    { fieldName: 'etcCs', dataType: 'number' },

    { fieldName: 'rveIzAmt', dataType: 'number' },
    { fieldName: 'cardDpAmt', dataType: 'number' },
    { fieldName: 'cshDpAmt', dataType: 'number' },
    { fieldName: 'dpAmt', dataType: 'number' },
    { fieldName: 'rfndRqdt' },
    { fieldName: 'rfndDsbDt' },
    { fieldName: 'rfndAkAmt', dataType: 'number' },
    { fieldName: 'cshRfndFnitNm' },
    { fieldName: 'cshRfndAcnoEncr' },
    { fieldName: 'cardRfndFnitNm' },

    { fieldName: 'cardRfndCrcdnoEncr' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '220', styleName: 'text-left' },
    { fieldName: 'tno', header: t('MSG_TXT_TEL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'mpno', header: t('MSG_TXT_MPNO'), width: '120', styleName: 'text-left' },
    { fieldName: 'partAmt', header: t('MSG_TXT_PART_COST'), width: '120', styleName: 'text-left' },
    { fieldName: 'tcfee', header: t('MSG_TXT_TECH_CST'), width: '120', styleName: 'text-center' },
    { fieldName: 'trcs', header: t('MSG_TXT_BSTR_CST'), width: '120', styleName: 'text-center' },
    { fieldName: 'etcCs', header: t('MSG_TXT_ETC_CS'), width: '120', styleName: 'text-left' },

    { fieldName: 'rveIzAmt', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-center' },
    { fieldName: 'cardDpAmt', header: t('MSG_TXT_CASH'), width: '120', styleName: 'text-center' },
    { fieldName: 'cshDpAmt', header: t('MSG_TXT_CARD'), width: '120', styleName: 'text-center' },
    { fieldName: 'dpAmt', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-center' },
    { fieldName: 'rfndRqdt', header: t('MSG_TXT_RFND_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'rfndDsbDt', header: t('MSG_TXT_DSB_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'rfndAkAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '120', styleName: 'text-center' },
    { fieldName: 'cshRfndFnitNm', header: t('MSG_TXT_DSB_BNK'), width: '120', styleName: 'text-center' },
    { fieldName: 'cshRfndAcnoEncr', header: t('MSG_TXT_AC_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'cardRfndFnitNm', header: t('MSG_TXT_CARD_DV'), width: '120', styleName: 'text-center' },

    { fieldName: 'cardRfndCrcdnoEncr', header: t('MSG_TXT_CARD_NO'), width: '180', styleName: 'text-center' },

  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    'cntrNo',
    'cstKnm',
    'sellTpNm',
    'pdNm',
    'tno',
    'mpno',
    {
      header: t('MSG_TXT_RVE_IZ'),
      direction: 'horizontal',
      items: ['partAmt', 'tcfee', 'trcs', 'etcCs', 'rveIzAmt'],
    },
    {
      header: t('MSG_TXT_STLM_IZ'),
      direction: 'horizontal',
      items: ['cardDpAmt', 'cshDpAmt', 'dpAmt'],
    },
    {
      header: t('MSG_TXT_RFND_IZ'),
      direction: 'horizontal',
      items: ['rfndRqdt', 'rfndDsbDt', 'rfndAkAmt'],
    },
    {
      header: t('MSG_TXT_CLSF_REFUND'),
      direction: 'horizontal',
      items: ['cshRfndFnitNm', 'cshRfndAcnoEncr', 'cardRfndFnitNm', 'cardRfndCrcdnoEncr'],
    },
  ]);
}
</script>
<style scoped>
</style>
