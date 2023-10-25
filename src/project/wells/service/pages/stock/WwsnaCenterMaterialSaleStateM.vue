<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaCenterMaterialSaleStateM - A/S(센터) 자재 매출 현황(K-W-SV-U-0256M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-10-24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- A/S(센터) 자재 매출 현황 http://localhost:3000/#/service/wsna-center-material-sale-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          :colspan="3"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          :colspan="4"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_GRP')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="itmKndCd.ITM_KND_CD"
            class="w230"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="4"
        >
          <kw-input
            v-model="searchParams.itmCdFrom"
            :max-length="50"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmCdTo"
            :max-length="50"
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
          <!-- (단위 : 건) -->
          <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
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

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
console.log(notify);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/center-material-sale-state';

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'ITM_KND_CD',
);

const wareDvCd = {
  WARE_DV_CD: [
    { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  ],
};

const itmKndCd = {
  ITM_KND_CD: [
    { codeId: '4', codeName: t('MSG_TXT_PRDT') },
    { codeId: '5', codeName: t('MSG_TXT_FLTR') },
    { codeId: '6', codeName: t('MSG_TXT_AS_MAT') },
  ],
};

const filterCodes = ref({
  wareDtlDvCd: [],
});

const searchParams = ref({
  startDt: dayjs().add(-1, 'month').startOf('month').format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  wareDtlDvCd: '',
  itmKndCd: '6', // 품목구분
  itmCdFrom: '', // 품목코드조회시작
  itmCdTo: '', // 품목코드조회종료
});

// 창고구분 변경 시, 창고상세구분 세팅
const onChangeWareDvCd = async () => {
  const filterWareDvCd = searchParams.value.wareDvCd;

  if (filterWareDvCd === '1') { // 물류센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else if (filterWareDvCd === '2') { // 서비스센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
  }
};

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
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
  await onChangeWareDvCd();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'fre', dataType: 'number' },
    { fieldName: 'recap', dataType: 'number' },
    { fieldName: 'ostrSum', dataType: 'number' },
    { fieldName: 'amtSumWon', dataType: 'number' },
    { fieldName: 'instl', dataType: 'number' },
    { fieldName: 'beforeService', dataType: 'number' },
    { fieldName: 'frisuAfterService', dataType: 'number' },
    { fieldName: 'fltr', dataType: 'number' },
    { fieldName: 'amtSum', dataType: 'number' },
    { fieldName: 'recapAfterService', dataType: 'number' },
    { fieldName: 'amt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '270', styleName: 'text-left' }, // 품목명
    { fieldName: 'fre',
      header: t('MSG_TXT_FREE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 무상
    { fieldName: 'recap',
      header: t('MSG_TXT_RECAP'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 유상
    { fieldName: 'ostrSum',
      header: t('MSG_TXT_OSTR_SUM'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 출고계
    { fieldName: 'amtSumWon',
      header: t('MSG_TXT_AMT_SUM_WON'),
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 금액계(원)
    { fieldName: 'instl',
      header: t('MSG_TXT_INSTALLATION'),
      width: '240',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 설치
    { fieldName: 'beforeService',
      header: t('MSG_TXT_BEFORE_SERVICE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // B/S
    { fieldName: 'frisuAfterService',
      header: t('MSG_TXT_FRISU_AFTER_SERVICE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // A/S(무)
    { fieldName: 'fltr',
      header: t('MSG_TXT_FLTR'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 필터
    { fieldName: 'amtSum',
      header: t('MSG_TXT_AMT_SUM'),
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 금액(합계)
    { fieldName: 'recapAfterService',
      header: t('MSG_TXT_RECAP_AFTER_SERVICE'),
      width: '180',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // A/S(유)
    { fieldName: 'amt',
      header: t('MSG_TXT_AMT'),
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 금액
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'sapMatCd',
    'pdCd',
    'pdNm',
    {
      header: t('MSG_TXT_SUM'), // 합계
      direction: 'horizontal', // merge type
      items: [
        'fre',
        'recap',
        'ostrSum',
        'amtSumWon',
      ],
    },
    {
      header: t('MSG_TXT_FREE'), // 무상
      direction: 'horizontal', // merge type
      items: [
        'instl',
        'beforeService',
        'frisuAfterService',
      ],
    },
    {
      header: t('MSG_TXT_RECAP'), // 유상
      direction: 'horizontal', // merge type
      items: [
        'fltr',
        'amtSum',
        'recapAfterService',
        'amt',
      ],
    },
  ]);

  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('pdCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-left text-weight-bold' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 3, resizable: true });
});
</script>
