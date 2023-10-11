<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaASMaterialItemGradePsListM(W-SV-U-0257M01) - AS자재 품목등급현황
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 관리자가 AS 자재의 등급현황을 조회하는 화면 (http://localhost:3000/#/service/wwsna-as-material-item-grade-ps-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_YN')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            :label="$t('MSG_TXT_USE_YN')"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            :options="codes.CMN_PART_DV_CD"
            :label="$t('MSG_TXT_MAT_DV')"
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>

        <kw-btn
          v-permission:download
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
        :page-size="pageInfo.pageSize"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { alert } = useGlobal();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  useYn: 'Y',
  matUtlzDvCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let gridView;
let gridData;
let fieldsObj;
let tmpFields = [];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'USE_YN',
  'CMN_PART_DV_CD',
);

// 창고조회
async function getWareHouseList() {
  const result = await dataService.get(
    '/sms/wells/service/as-material-item-grade-state/ware-houses',
    { params: {
      baseYm: cachedParams.baseYm,
    } },
  );
  if (result.data.length > 0) {
    const wareHouses = result.data;

    // 필드 구성
    tmpFields.push(
      ...wareHouses.map((v) => ({
        fieldName: `gd${v.wareNo}`, // 창고번호
        header: v.wareNm, // 창고명
        width: '100',
        styleName: 'text-center',
      })),
    );

    // 필드 셋팅
    fieldsObj.setFields();
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-material-item-grade-state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itmGd, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(itmGd);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  const currentMonth = dayjs().format('YYYYMM');
  const searchBaseYm = searchParams.value.baseYm;

  if (searchBaseYm > currentMonth) {
    // 기준년월 > 현재년월일 경우 메시지 처리, 현재 월까지만 조회 가능합니다
    await alert(t('MSG_ALT_INQR_CRTL_MM_PSB'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  tmpFields = [];
  // 창고조회
  await getWareHouseList();
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-material-item-grade-state/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'mgtTypNm', header: t('MSG_TXT_TYPE'), width: '106', styleName: 'text-center' }, // 유형
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '124', styleName: 'text-center' }, // SAP코드
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' }, // 품목코드
    { fieldName: 'itmPdNm', header: t('MSG_TXT_PRDT_NM'), width: '500', styleName: 'text-left' }, // 상품명
  ],

  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields, ...tmpFields];

    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      {
        header: t('MSG_TXT_SV_CNR'),
        direction: 'horizontal', // merge type
        items: [...fieldsObj.getColumnNameArr(tmpFields)],
      },
    ];

    const fields = columns.map(({ fieldName }) => ({ fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);

    gridView.setColumnLayout([...layoutColumns]);

    gridView.setFixedOptions({
      colCount: 4,
    });
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

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
