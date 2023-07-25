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
        <kw-search-item label="출고유형">
          <kw-select
            v-model="searchParams.ostrTpCd"
            first-option="all"
            :options="codes.OSTR_TP_CD"
          />
        </kw-search-item>
        <kw-search-item label="품목코드">
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
        <kw-search-item label="SAP코드">
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
        <kw-search-item label="출고일자">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            label="출고일자"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          label="품목구분"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            class="w166"
            :options="codes.ITM_KND_CD"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itmPdCdFilter"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="등급">
          <kw-select
            v-model="searchParams.itmGdCd"
            first-option="all"
            :options="codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId))"
          />
        </kw-search-item>
        <kw-search-item label="사용여부">
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
          />
        </kw-search-item>
        <kw-search-item label="자재구분">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            first-option="all"
            :options="codes.MAT_UTLZ_DV_CD.filter((v) => ['01','02'].includes(v.codeId))"
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

// const customCodes = {
//   ex: [
//     { codeId: '1234', codeName: '5678' },
//   ],
// };

let cachedParams;
const searchParams = ref({
  startDt: now.subtract(30, 'day').format('YYYYMMDD'),
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

});

const totalCount = ref(0);
const itmPdCdFilter = ref();

// 품목구분-하위품목 가져오기
watch(() => searchParams.value.itmKndCd, async () => {
  const { data } = await dataService.get(`${baseUrl}/filter-items`, { params: searchParams.value });
  itmPdCdFilter.value = data;
  searchParams.value.itmPdCd = '';
});
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;
  console.log(list);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

let gridView;
let gridData;
let logisticsFields = [];
let serviceFields = [];
let businessFields = [];
let fieldsObj;
let fieldsWidth;
// 창고조회
async function getWareHouseList() {
  const result = await dataService.get(`${baseUrl}/ware-houses`);
  if (result.data.length > 0) {
    const wareHouses = result.data;
    const wareLogistics = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '1'); // 물류센터
    const wareService = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '2'); // 서비스센터
    const wareBusiness = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '3'); // 영업센터
    fieldsWidth = 80; // 창고 그리드 가로폭 사이즈 설정

    logisticsFields.push(...wareLogistics.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
    })));
    serviceFields.push(...wareService.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
    })));
    businessFields.push(...wareBusiness.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
    })));
    // 필드 셋팅
    fieldsObj.setFields();
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  logisticsFields = [];
  serviceFields = [];
  businessFields = [];
  // 창고조회
  await getWareHouseList();
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

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'svpdMgtTypNm', header: '재고유형', width: '106', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '178', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '322', styleName: 'text-left' },
  ],

  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields,
      ...logisticsFields,
      ...serviceFields,
      ...businessFields];

    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      {
        direction: 'horizontal',
        header: { text: t('물류센터') }, /* 물류센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(logisticsFields)],
      },
      {
        direction: 'horizontal',
        header: { text: t('서비스센터') }, /* 서비스센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(serviceFields)],
      },
      { direction: 'horizontal',
        header: { text: t('영업센터') }, /* 영업센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameArr(businessFields)],
      },
    ];
    const fields = columns.map(({ fieldName }) => ({ fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 4, resizable: true });
    gridView.setColumnLayout([...layoutColumns]);
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
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
