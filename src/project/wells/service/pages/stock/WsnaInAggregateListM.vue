<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WsnaInAggregateListM(K-W-SV-U-0265M01) - 입고 집계
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.07
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 입고 집계 (http://localhost:3000/#/service/wsna-in-aggregate-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="5"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="codes.STR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STR_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapCdTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD.filter((v) => ['2', '3'].includes(v.codeId))"
            :label="$t('MSG_TXT_WARE_DV')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCodes"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.pdCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.COD_YN"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD',
  'ITM_KND_CD',
  'PD_GD_CD',
  'COD_YN',
  'MAT_LGST_TP_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
);

const searchParams = ref({
  strTpCd: '',
  pdCdFrom: '',
  pdCdTo: '',
  sapCdFrom: '',
  sapCdTo: '',
  baseDateFrom: `${now.format('YYYYMM')}01`,
  baseDateTo: now.format('YYYYMMDD'),
  itmKndCd: '4',
  pdCd: '',
  pdGdCd: '',
  useYn: '',
  wareDvCd: '2',
});

let gridView;
let gridData;
let logisticsFields;
let tmpFields;
let fieldsObj;
let fieldsWidth;

async function getWareHouses() {
  const wareParams = {
    baseDateFrom: searchParams.value.baseDateFrom,
    wareDvCd: searchParams.value.wareDvCd,
  };
  const result = await dataService.get('/sms/wells/service/in-aggregate/ware-houses', { params: wareParams });
  if (result.data.length > 0) {
    const wareHouses = result.data;
    const wareLogisticsFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '1'); // 물류센터
    const wareTmpFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '2' || v.wareNo.substring(0, 1) === '3'); // 서비스센터
    fieldsWidth = 80; // 창고 그리드 가로폭 사이즈 설정

    logisticsFields = [];
    tmpFields = [];

    logisticsFields.push(...wareLogisticsFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    })));
    // 서비스센터 , 영업센터
    tmpFields.push(...wareTmpFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    })));
    // 필드 셋팅
    fieldsObj.setFields();
  }
}

const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/in-aggregate', { params: { ...cachedParams } });
  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await getWareHouses();
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/in-aggregate', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const productCodes = ref([]);

async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);

  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

onMounted(async () => {
  await onChangeItmKndCd();
});

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'matMngtDvCd', header: t('MSG_TXT_STOC_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '240', styleName: 'text-left' },
  ],
  totalFields: [
    {
      fieldName: 'ware999999',
      header: t('MSG_TXT_AGG'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields,
      ...logisticsFields,
      ...tmpFields,
      ...fieldsObj.totalFields];

    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      {
        direction: 'horizontal',
        header: { text: t('MSG_TXT_LGST_STOC') }, /* 물류재고 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(logisticsFields)],
      },
      {
        direction: 'horizontal',
        header: searchParams.value.wareDvCd === '2' ? { text: t('MSG_TXT_SV_CNR') } : { text: t('MSG_TXT_BSNS_CNTR') },
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(tmpFields)],
      },
      ...fieldsObj.getColumnNameArr(fieldsObj.totalFields),
    ];
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 4, resizable: true });
    gridView.columnByName('pdNm').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(objList) {
    return objList.map((obj) => ({ fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrdMain = defineGrid((data, view) => {
  const columns = [...fieldsObj.defaultFields];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  gridView = view;
  gridData = data;
});
</script>
