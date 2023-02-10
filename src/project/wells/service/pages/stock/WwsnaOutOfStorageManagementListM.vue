<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaOutOfStorageManagementListM - 출고관리
3. 작성자 : songTaeSung
4. 작성일 : 2023-01-27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고관리 (http://localhost:3000/#/service/wwsna-out-of-storage-management-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
            option-label="codeName"
            option-value="code"
          />
        </kw-search-item>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :options="codes.OSTR_TP_CD"
            first-option="all"
            @change="divideData"
          />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-d="searchParams.ostrWareNoD"
          v-model:ware-no-m="searchParams.ostrWareNoM"
          first-option="all"
          :colspan="2"
          label1="출고기간"
          label2="입고창고"
          label3="창고"
          label4="창고"
        />
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
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
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useGlobal, codeUtil, defineGrid, useDataService, getComponentType, gridUtil } from 'kw-lib';
import snConst from '~sms-wells/service/constants/snConst';
// TODO: 추후 공통서비스 변경후 적용 예정 (조직창고 , 조직창고에 해당하는 엔지니어조회)
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const grdMainRef = ref(getComponentType('KwGrid'));

const dataService = useDataService();

const { t } = useI18n();
const { alert } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  stOstrDt: '',
  edOstrDt: '',
  ostrTpCd: '',
  wareDvCd: '',
  strOjWareNo: '',
  ostrWareDvCd: '2',
  ostrWareNoD: '',
  ostrWareNoM: '',
  divide: '0',
});

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
});

const codes = await codeUtil.getMultiCodes(
  'OSTR_TP_CD',
  'WARE_DV_CD',
);

const totalCount = ref(0);

// 창고구분코드 필터링
// const wareDvCd = codes.WARE_DV_CD.filter((v) => v.codeId !== '1');
const strWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

searchParams.value.stOstrDt = dayjs().format('YYYYMMDD');
searchParams.value.edOstrDt = dayjs().format('YYYYMMDD');

let cachedParams;
async function fetchData() {
  console.log(searchParams.value.divide);
  const res = await dataService.get('/sms/wells/service/out-of-storage-itemizations', { params: cachedParams });
  const outOfItem = res.data;
  totalCount.value = outOfItem.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(outOfItem.map((v) => ({ ...v, txtNote: ' ' })));
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/out-of-storage-itemizations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'outOfStorageManagementList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const warehouses = ref();
async function fetchDefaultData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/warehouses', { params: wharehouseParams.value });
  warehouses.value = res.data;
  searchParams.value.strOjWareNo = warehouses.value[0].code;
}

const divideData = (val) => {
  // OSTR_TP_CD_NOM : 정상출고(221)
  // OSTR_TP_CD_QOM : 물량배정(222)
  // OSTR_TP_CD_QOM_MMT : 물량이동 (223)
  // OSTR_TP_CD_RTNGD_INSI : 반품(내부)(261)
  // OSTR_TP_CD_RTNGD_OTSD : 반품(외부)(262)
  // OSTR_TP_CD_DSU : 폐기출고(212)
  // OSTR_TP_CD_ETC : 기타출고(217)
  console.log(val);
  switch (val) {
    case snConst.OSTR_TP_CD_NOM:
      searchParams.value.divide = '1';
      break;
    case snConst.OSTR_TP_CD_QOM:
    case snConst.OSTR_TP_CD_QOM_MMT:
    case snConst.OSTR_TP_CD_RTNGD_INSI:
      searchParams.value.divide = '2';
      break;
    case snConst.OSTR_TP_CD_RTNGD_OTSD:
    case snConst.OSTR_TP_CD_DSU:
    case snConst.OSTR_TP_CD_ETC:
      searchParams.value.divide = '3';
      break;
    default:
      searchParams.value.divide = '0';
  }
  console.log(searchParams.value.divide);
};

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'strWareNo' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'ostrDt' },
    { fieldName: 'ostrSn' },
    { fieldName: 'wareNm' },
    { fieldName: 'wareAdrId' },
    // { fieldName: 'newAdrZip' },
    { fieldName: 'txtNote' },

  ];

  const columns = [
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), datetimeFormat: 'date', width: '126', styleName: 'text-center' },
    { fieldName: 'ostrTpCd', header: t('MSG_TXT_OSTR_TP'), options: codes.OSTR_TP_CD, width: '100', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'txtNote',
      header: t('MSG_TXT_NOTE'),
      width: '150',
      styleName: 'text-center',
      renderer: {
        type: 'button',
      },
      // displayCallback: () => t('MSG_TXT_OSTR_AK_CH'),
      displayCallback: (g, index, val) => {
        const { ostrTpCd } = g.getValues(index.itemIndex);
        console.log(val);
        // 정상출고
        if (['221', '222', '223'].includes(ostrTpCd)) {
          return t('MSG_TXT_NOM_OSTR');
        } if (ostrTpCd === '217') {
          return t('MSG_TXT_ETC_OSTR');
        } if (['212', '261', '262'].includes(ostrTpCd)) {
          return t('MSG_TXT_RTNGD_OSTR');
        }
        return ' ';
      },
    },
    // { fieldName: 'col7', header: t('MSG_TXT_ZIP'), width: '120', styleName: 'text-center' },
    // { fieldName: 'col8', header: t('MSG_TXT_ADDR'), width: '390', styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    console.log(gridUtil.getRowValue(g, dataRow));
    const { ostrTpCd } = gridUtil.getRowValue(g, dataRow);

    if (column === 'txtNote') {
      if (ostrTpCd === '217') {
        alert('현재 단위 테스트 대상이 아닙니다.');
      } if (['221', '222', '223'].includes(ostrTpCd)) {
        alert('현재 단위 테스트 대상이 아닙니다.');
      } if (ostrTpCd === '217') {
        alert('현재 단위 테스트 대상이 아닙니다.');
      } if (['212', '261', '262'].includes(ostrTpCd)) {
        alert('현재 단위 테스트 대상이 아닙니다.');
      }
    }
  };
});

</script>
