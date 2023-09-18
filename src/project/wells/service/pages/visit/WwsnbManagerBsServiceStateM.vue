<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbManagerBsServiceStateM - 매니저 BS 서비스 현황(K-W-SV-U-0039M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-09-15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매니저 BS 서비스 현황 http://localhost:3000/#/service/wsnb-manager-bs-service-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.baseYy"
            type="year"
            rules="required"
            :label="$t('MSG_TXT_BASE_YEAR')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.cnfmPsicDvCd"
            :options="tempOptions.cnfmPsicDvCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WK_CLS')"
        >
          <kw-select
            v-model="searchParams.vstPrgsStatCd"
            :options="tempOptions.vstPrgsStatCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          class="w500"
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <!--상품그룹-->
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w200"
            @change="changePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            class="w300"
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
import { cloneDeep, toInteger } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/manager-bs-service-state';

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
);

const tempOptions = {
  cnfmPsicDvCd: [ // 관리구분
    { codeId: '1', codeName: t('LP') }, // LP
    { codeId: '2', codeName: t('엔지니어') }, // 엔지니어
  ],
  vstPrgsStatCd: [ // 작업구분
    { codeId: '00', codeName: t('배정') }, // 배정
    { codeId: '20', codeName: t('완료') }, // 완료
  ],
};

const searchParams = ref({
  baseYy: now.format('YYYY'),
  pdGrpCd: '',
  pdCd: '',
  cnfmPsicDvCd: '',
  vstPrgsStatCd: '00',
});

let cachedParams;
const totalCount = ref(0);
const pds = ref([]);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  let tcntTotal = 0;
  // 총합계
  list.forEach((item) => {
    tcntTotal += toInteger(item.tcnt);
  });
  // 개별 합계 / 총합계 * 100 (비율)
  list.forEach((item, idx) => {
    list[idx].per = ((item.tcnt / tcntTotal) * 100).toFixed(2);
    console.log(list[idx].per);
  });
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

async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster('4', searchParams.value.pdGrpCd, 'M');
  } else pds.value = [];
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'yyyy',
      width: '100',
      styleName: 'text-center',
      mergeRule: { criteria: 'value' },
    },
    {
      fieldName: 'dgBizTpNm',
      header: t('MSG_TXT_DIV'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'tcnt',
      header: t('MSG_TXT_SUM'),
      width: '120',
      styleName: 'text-right text-blue',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    },
    {
      fieldName: 'per',
      header: `${t('MSG_TXT_RAT')}(%)`,
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
  ];
  const colWidth = 80;
  for (let mm = 1; mm <= 12; mm += 1) {
    columns.push({
      fieldName: `acol${mm}`,
      header: `${mm}${t('MSG_TXT_MON')}`,
      width: colWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    });
  }
  const columnLayout = [
    {
      direction: 'horizontal',
      hideChildHeaders: true,
      items: ['yyyy', 'dgBizTpNm'],
      header: { text: t('MSG_TXT_DIV') },
    },
    'acol1',
    'acol2',
    'acol3',
    'acol4',
    'acol5',
    'acol6',
    'acol7',
    'acol8',
    'acol9',
    'acol10',
    'acol11',
    'acol12',
    'tcnt',
    'per',
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('dgBizTpNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center text-weight-bold' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
