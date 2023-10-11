<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaItemOrderQuantityComputationListM(W-SV-U-0296M01) - BS자재 발주수량 산출
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 관리년월에 해당하는 BS자재 발주수량을 산출하기 위한 화면 (http://localhost:3000/#/service/wwsna-item-order-quantity-computation-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.inqrYm"
            type="month"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            :label="$t('MSG_TXT_ITM_DV')"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_NM')"
            option-value="pdCd"
            option-label="pdNm"
            :multiple="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>
        <kw-btn
          v-permission:download
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          secondary
          dense
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_CMPT_EXCD_ITM_MNGT')"
          primary
          dense
          :disable="isSearch"
          @click="openExcludeItemP"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { modal, alert } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  inqrYm: dayjs().format('YYYYMM'),
  itmKndCd: '',
  itmPdCds: [],
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
);

const filterCodes = ref({
  itmKndCd: [],
});

// 품목종류 필터링
function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/computation-exclude-items/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

// SAP 시작코드 변경 시
function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

// SAP 종료코드 변경 시
function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

let gridView;
let gridData;
let fieldsObj;
let tmpFields1;
let tmpFields2;

// pivot 필드 셋팅
function setTmpFields() {
  tmpFields1 = [];
  tmpFields2 = [];

  const { inqrYm } = searchParams.value;
  const months = ['', '', '', '', ''];

  if (!isEmpty(inqrYm)) {
    months.forEach((e, idx) => {
      months[idx] = dayjs(inqrYm, 'YYYYMM').add(idx + 1, 'month').format('M');
    });
  }

  months.forEach((e, idx) => {
    const field = {
      fieldName: `etNedQty${idx + 1}`,
      header: `${e}${t('MSG_TXT_MON')}`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    };

    if (idx > 3) {
      field.header = `${field.header} ${t('MSG_TXT_ET_NED_QT')}`;
      tmpFields2.push(field);
      return;
    }
    tmpFields1.push(field);
  });
}

await Promise.all([
  itmKndCdFilter(),
  setTmpFields(),
  getProducts(),
]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/item-order-quantity/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: excludeItem, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(excludeItem);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

const isSearch = ref(true);
// 조회버튼 클릭
async function onClickSearch() {
  const { itmKndCd, itmPdCds, itmPdCd, strtSapCd, endSapCd } = searchParams.value;

  if (isEmpty(itmKndCd) && isEmpty(itmPdCds) && isEmpty(itmPdCd) && isEmpty(strtSapCd) && isEmpty(endSapCd)) {
    // 품목구분, 품목코드, SAP코드 중 1개는 필수 입력입니다.
    await alert(t('MSG_ALT_REQ_INPUT_ITM_SAPCD'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  isSearch.value = false;
  cachedParams = cloneDeep(searchParams.value);
  // 필드 설정
  setTmpFields();
  // 필드 셋팅
  fieldsObj.setFields();
  await fetchData();
}

// 산출 제외품목 등록 팝업 호출
async function openExcludeItemP() {
  const { inqrYm } = cachedParams;
  if (isEmpty(inqrYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_MGT_YNM')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }
  await modal({
    component: 'WwsnaComputationExcludeItemRegP',
    componentProps: { ...cachedParams, products: optionsAllItmPdCd.value },
  });

  pageInfo.value.needTotalCount = true;
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/item-order-quantity/excel-download', { params: cachedParams, timeout: 300000 });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'commGbNm', header: t('MSG_TXT_PRD_GRP'), width: '120', styleName: 'text-left', dataType: 'text' }, // 제품군
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', dataType: 'text' }, // SAP코드
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '200', styleName: 'text-center', dataType: 'text' }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-left', dataType: 'text' }, // 품목명
  ],
  // 기초재고 산출 - 재고현황
  stockFields: [
    { fieldName: 'bznsOgQty', // 영업부(조직)
      header: `${t('MSG_TXT_SLS')}(${t('MSG_TXT_OG')})`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'bznsIndvQty', // 영업부(개인)
      header: `${t('MSG_TXT_SLS')}(${t('MSG_TXT_INDV')})`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'svCnrQty', // 서비스(조직+개인)
      header: `${t('MSG_TXT_SERVICE')}(${t('MSG_TXT_OG')}+${t('MSG_TXT_INDV')})`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'logisticCnrQty', // 물류
      header: t('MSG_TXT_LGST'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'thmQomAsnQty', // 당월 물량배정
      header: t('MSG_TXT_THM_QOM_ASN'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'logisticSum', // 물류 계
      header: t('MSG_TXT_LGST_SUM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
  ],
  orderFields: [
    { fieldName: 'totGoQty', // 총 발주량
      header: t('MSG_TXT_TOT_GO_QT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'moq', // MOQ
      header: t('MSG_TXT_MOQ'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
    { fieldName: 'leadTime', // L/T
      header: t('MSG_TXT_LEAD_TIME_SHORT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
    },
  ],
  setFields() {
    const columns = [...fieldsObj.defaultFields,
      ...fieldsObj.stockFields,
      ...tmpFields1,
      ...fieldsObj.orderFields,
      ...tmpFields2];

    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      { direction: 'horizontal',
        header: { text: t('MSG_TXT_BTD_STOC_CMPT') },
        items: [
          { direction: 'horizontal',
            items: [...fieldsObj.getColumnNameArr(fieldsObj.stockFields)],
            header: { text: t('MSG_TXT_STOC_PS') },
          },
        ],
      },
      { direction: 'horizontal',
        header: { text: t('MSG_TXT_ET_NED_QT') },
        items: [...fieldsObj.getColumnNameArr(tmpFields1)],
      },
      ...fieldsObj.getColumnNameArr(fieldsObj.orderFields),
      { direction: 'horizontal',
        header: { text: t('MSG_TXT_FILT_NED_PS') },
        items: [...fieldsObj.getColumnNameArr(tmpFields2)],
      },
    ];

    const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setColumnLayout(layoutColumns);
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
  const columns = [...fieldsObj.defaultFields,
    ...fieldsObj.stockFields,
    ...tmpFields1,
    ...fieldsObj.orderFields,
    ...tmpFields2];

  // 헤더 부분 merge
  const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_BTD_STOC_CMPT') },
      items: [
        { direction: 'horizontal',
          items: [...fieldsObj.getColumnNameArr(fieldsObj.stockFields)],
          header: { text: t('MSG_TXT_STOC_PS') },
        },
      ],
    },
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_ET_NED_QT') },
      items: [...fieldsObj.getColumnNameArr(tmpFields1)],
    },
    ...fieldsObj.getColumnNameArr(fieldsObj.orderFields),
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_FILT_NED_PS') },
      items: [...fieldsObj.getColumnNameArr(tmpFields2)],
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
