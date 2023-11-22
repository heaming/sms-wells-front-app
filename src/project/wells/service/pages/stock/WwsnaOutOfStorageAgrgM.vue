<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaOutOfStorageAgrgM - 출고집계현황(K-W-SV-U-0266M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-07-13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고집계현황 http://localhost:3000/#/service/wwsna-out-of-storage-agrg
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OSTR_TP')">
          <kw-select
            v-model="searchParams.ostrTpCd"
            first-option="all"
            :options="codes.OSTR_TP_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
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
        <kw-search-item :label="$t('MSG_TXT_SAPCD')">
          <kw-input
            v-model="searchParams.sapMatCdFrom"
            :max-length="50"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
            :max-length="50"
          />
        </kw-search-item>
      </kw-search-row>
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
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            class="w166"
            :options="codes.ITM_KND_CD"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itmPdCds"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="searchParams.itmGdCd"
            first-option="all"
            :options="codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId))"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            first-option="all"
            :options="codes.MAT_UTLZ_DV_CD.filter((v) => ['01','02'].includes(v.codeId))"
            @update:model-value="onChangeMatUtlzDvCd"
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
const baseUrl = '/sms/wells/service/out-of-storage-agrg';

const codes = await codeUtil.getMultiCodes(
  'OSTR_TP_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
  'USE_YN',
);

let cachedParams;
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  ostrTpCd: '', // 출고유형
  sapMatCdFrom: '', // SAP코드 검색(시작)
  sapMatCdTo: '', // SAP코드 검색(종료)
  itmCdFrom: '', // 품목코드 검색(시작)
  itmCdTo: '', // 품목코드 검색(종료)
  itmGdCd: '', // 등급
  itmKndCd: '', // 품목구분
  itmPdCd: '', // 품목
  matUtlzDvCd: '', // 자재구분
  useYn: '', // 사용여부
  wareDvCd: '',
});

let gridView;
let gridData;
let logisticsFields;
let serviceFields;
let businessFields;
let fieldsObj;
let fieldsWidth;

const totalCount = ref(0);
const initTotalCount = ref(0);
const itmPdCds = ref();

const svpdBaseColorGbFilter = [{ name: 'svpdBaseColorGbFilter', criteria: "value = 'Y'" }];
const svpdCommGbFilter = [{ name: 'svpdCommGbFilter', criteria: "value = '01'" }];
async function onChangeMatUtlzDvCd() {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('svpdBaseColorGb', false);
  view.activateAllColumnFilters('svpdCommGb', false);

  if (searchParams.value.matUtlzDvCd === '01') {
    view.activateColumnFilters('svpdBaseColorGb', 'svpdBaseColorGbFilter', true);
    totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
  } else if (searchParams.value.matUtlzDvCd === '02') {
    view.activateColumnFilters('svpdCommGb', 'svpdCommGbFilter', true);
    totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
  } else {
    totalCount.value = initTotalCount.value; // 필터 해제시 초기 데이터 건수 노출
  }
}
// 창고조회
async function getWareHouses() {
  const wareParams = {
    baseDt: searchParams.value.startDt,
    wareDvCd: searchParams.value.wareDvCd,
  };
  const result = await dataService.get(`${baseUrl}/ware-houses`, { params: wareParams });
  if (result.data.length > 0) {
    const wareHouses = result.data;
    const wareLogisticsFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '1'); // 물류센터
    const wareServiceFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '2'); // 서비스센터
    const wareBusinessFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '3'); // 영업센터
    fieldsWidth = 80; // 창고 그리드 가로폭 사이즈 설정

    logisticsFields = [];
    serviceFields = [];
    businessFields = [];

    logisticsFields.push(...wareLogisticsFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    })));
    serviceFields.push(...wareServiceFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    })));
    businessFields.push(...wareBusinessFields.map((v) => ({
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
onMounted(async () => {
  // 품목구분 : 상품 기본설정
  searchParams.value.itmKndCd = '4';
});
// 품목구분-하위품목 가져오기
watch(() => searchParams.value.itmKndCd, async () => {
  const { data } = await dataService.get(`${baseUrl}/filter-items`, { params: searchParams.value });
  itmPdCds.value = data;
  searchParams.value.itmPdCd = '';
});
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  // 요청사항반영[그리드 명칭 변경 및 0 미노출 통일 요청]
  list.forEach((item, idx) => {
    if (list[idx].ware100000 === 0) {
      list[idx].ware100000 = '';
    }
    if (list[idx].ware200000 === 0) {
      list[idx].ware200000 = '';
    }
    if (list[idx].ware300000 === 0) {
      list[idx].ware300000 = '';
    }
    if (list[idx].ware999999 === 0) {
      list[idx].ware999999 = '';
    }
  });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();

  view.activateAllColumnFilters('svpdBaseColorGb', false); // 필터 해제 처리
  view.activateAllColumnFilters('svpdCommGb', false); // 필터 해제 처리

  initTotalCount.value = totalCount.value; // 초기 데이터 건수
}

async function onClickSearch() {
  searchParams.value.matUtlzDvCd = '';
  cachedParams = cloneDeep(searchParams.value);
  await getWareHouses();
  await nextTick();
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'svpdMgtTypNm', header: t('MSG_TXT_STOC_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '240', styleName: 'text-left' },
    { fieldName: 'svpdBaseColorGb', styleName: 'text-center', visible: false, autoFilter: false }, /* 필터시 사용 */
    { fieldName: 'svpdCommGb', styleName: 'text-center', visible: false, autoFilter: false }, /* 필터시 사용 */
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
      ...serviceFields,
      ...businessFields,
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
        header: { text: t('MSG_TXT_SV_CNR') }, /* 서비스센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(serviceFields)],
      },
      { direction: 'horizontal',
        header: { text: t('MSG_TXT_BSNS_CNTR') }, /* 영업센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(businessFields)],
      },
      ...fieldsObj.getColumnNameArr(fieldsObj.totalFields),
    ];
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 4, resizable: true });
    gridView.columnByName('pdAbbrNm').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnFilters('svpdBaseColorGb', svpdBaseColorGbFilter); // 필터 적용
    gridView.setColumnFilters('svpdCommGb', svpdCommGbFilter); // 필터 적용
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
