<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaFilterOutOfStorageAgrgM - 필터출고집계현황(K-W-SV-U-0264M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-08-17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 필터출고집계현황 http://localhost:3000/#/service/wwsna-filter-out-of-storage-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OSTR_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          class="w250"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            class="w150"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
          class="w250"
        >
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
            first-option="all"
            class="w150"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
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
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/filter-out-of-storage-agrg';

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
);
const customCodes = {
  findGb: [
    { codeId: '2', codeName: '엔지니어' },
    { codeId: '3', codeName: 'LP' },
  ],
};
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  itmKndCd: '', // 품목구분
  findGb: '', // 조회구분(엔지니어/LP)
});
let cachedParams;
const totalCount = ref(0);
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
onMounted(async () => {
  // 품목구분 : 상품 기본설정
  searchParams.value.itmKndCd = '12';
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_FLTR_NM'), width: '280', styleName: 'text-left' },
  ];
  const columnFieldAmtts = ['totlAmtt', /* TOTAL */
    'bs01Amtt', 'bs02Amtt', 'bs03Amtt', 'bs04Amtt', 'bs05Amtt', 'bs09Amtt', 'bs99Amtt', /* BS */
    'as00Amtt', 'as01Amtt', 'as02Amtt', 'as03Amtt', 'as04Amtt', 'as05Amtt', 'as09Amtt', 'as10Amtt', 'as99Amtt', /* AS */
    'ps01Amtt', 'ps02Amtt', 'ps02AmttFree', 'ps03Amtt', 'ps99Amtt', /* PS */
  ];

  const columnAmtts = [];
  const amtWidth = 80;
  columnFieldAmtts.forEach((row, index) => {
    columnAmtts.push({
      fieldName: row,
      width: amtWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    });
    columns.push(columnAmtts[index]);
  });

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  const columnLayout = [
    {
      header: t('MSG_TXT_DIV'),
      direction: 'horizontal',
      items: ['sapMatCd', 'pdCd', 'pdNm'],
    },
    {
      header: t('MSG_TXT_OSTR_SUM'),
      hideChildHeaders: true,
      items: ['totlAmtt'],
    },
    {
      header: t('MSG_TXT_BEFORE_SERVICE'),
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_ISTM'),
          hideChildHeaders: true,
          items: ['bs01Amtt'],
        },
        {
          header: t('MSG_TXT_RENTAL'),
          hideChildHeaders: true,
          items: ['bs02Amtt'],
        },
        {
          header: t('MSG_TXT_MEMBERSHIP'),
          hideChildHeaders: true,
          items: ['bs03Amtt'],
        },
        {
          header: t('MSG_TXT_EXN_KEEP'),
          hideChildHeaders: true,
          items: ['bs04Amtt'],
        },
        {
          header: t('MSG_TXT_COMPANY'),
          hideChildHeaders: true,
          items: ['bs05Amtt'],
        },

        {
          header: t('MSG_TXT_FLTR'),
          hideChildHeaders: true,
          items: ['bs09Amtt'],
        },
        {
          header: t('MSG_TXT_SBSUM'),
          hideChildHeaders: true,
          items: ['bs99Amtt'],
        },
      ],
    },
    {
      header: t('MSG_TXT_AFTER_SERVICE'), // colspan title
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_RECAP'),
          direction: 'horizontal',
          hideChildHeaders: true,
          items: [
            { column: 'as00Amtt' },
          ],
        },
        {
          header: t('MSG_TXT_FREE'),
          items: [
            {
              header: t('MSG_TXT_ISTM'),
              hideChildHeaders: true,
              items: ['as01Amtt'],
            },
            {
              header: t('MSG_TXT_RENTAL'),
              hideChildHeaders: true,
              items: ['as02Amtt'],
            },
            {
              header: t('MSG_TXT_MEMBERSHIP'),
              hideChildHeaders: true,
              items: ['as03Amtt'],
            },
            {
              header: t('MSG_TXT_EXN_KEEP'),
              hideChildHeaders: true,
              items: ['as04Amtt'],
            },
            {
              header: t('MSG_TXT_COMPANY'),
              hideChildHeaders: true,
              items: ['as05Amtt'],
            },
            {
              header: t('MSG_TXT_FLTR'),
              hideChildHeaders: true,
              items: ['as09Amtt'],
            },
            {
              header: t('MSG_TXT_ETC'),
              hideChildHeaders: true,
              items: ['as10Amtt'],
            },
          ],
        },
        {
          header: t('MSG_TXT_SBSUM'),
          hideChildHeaders: true,
          items: [
            { column: 'as99Amtt' },
          ],
        },
      ],
    },
    {
      header: t('MSG_TXT_FLTR_SELL'),
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_FREE'),
          hideChildHeaders: true,
          items: ['ps02AmttFree'],
        },
        {
          header: t('MSG_TXT_SELF'),
          hideChildHeaders: true,
          items: ['ps01Amtt'],
        },
        {
          header: t('MSG_TXT_VST'),
          hideChildHeaders: true,
          items: ['ps02Amtt'],
        },
        {
          header: t('MSG_TXT_ETC'),
          hideChildHeaders: true,
          items: ['ps03Amtt'],
        },
        {
          header: t('MSG_TXT_SBSUM'),
          hideChildHeaders: true,
          items: ['ps99Amtt'],
        },
      ],
    },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.columnByName('pdCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center text-weight-bold' });
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.setFixedOptions({ colCount: 3, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('sapMatCd').groupFooterUserSpans = [{ colspan: 4 }];
  view.columnByName('sapMatCd').setGroupFooters({ text: t('MSG_TXT_SBSUM'), styleName: 'text-center' });
});
</script>
