<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMaterialsAssignStockMgtM - 물량배정 입고창고관리(W-SV-U-0125M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 물량배정 입고창고 정보 조회 (사번/이름/소속/빌딩/상위창고) (http://localhost:3000/#/service/wwsna-materials-assign-stock-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!-- //기준년월 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYm"
          v-model:end-ym="searchParams.baseYm"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.hgrWareNo"
          v-model:ware-no-d="searchParams.wareNo"
          name="wareSearchGroup"
          :colspan="2"
          :label1="$t('MSG_TXT_WARE_DV')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          @update:ware-no-m="onChagneWareHgrNo"
          @update:ware-no-d="onChangeWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 창고상세구분 -->
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- //창고상세구분 -->
        <!-- 담당자명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PIC_NM')"
        >
          <kw-input
            v-model="searchParams.prtnrKnm"
            :disable="searchParams.wareNo.length > 0"
            rules="max:50"
          />
        </kw-search-item>
        <!-- //담당자명 -->
        <!-- 사번 -->
        <kw-search-item
          :label="$t('MSG_TXT_EPNO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :disable="searchParams.wareNo.length > 0"
            rules="numeric|max:10"
          />
        </kw-search-item>
        <!-- //사번 -->
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
        </template>
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          dense
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:download
          dense
          icon="excel"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'WARE_DTL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
);

const wareDvCd = { WARE_DV_CD: [
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  wareDvCd: '3',
  hgrWareNo: '',
  wareNo: '',
  wareDtlDvCd: '',
  prtnrNo: '',
  prtnrKnm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const filterCodes = ref({
  wareDtlDvCd: [],
});

// 창고상세구분 필터링
function wareDvCdFilter() {
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['31', '32'].includes(v.codeId));
}

await Promise.all([
  wareDvCdFilter(),
]);

// 상위창고 변경 시
function onChagneWareHgrNo() {
  searchParams.value.wareNo = '';
}

// 창고 변경 시
function onChangeWareNo() {
  const { wareNo } = searchParams.value;
  if (wareNo !== '') {
    searchParams.value.prtnrKnm = '';
    searchParams.value.prtnrNo = '';
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/materials-assign-stocks/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: assignStocks, pageInfo: pagingResult } = res.data;
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(assignStocks);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  pageInfo.value.needTotalCount = true;

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/materials-assign-stocks/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const createdRows = gridUtil.getChangedRowValues(view);

  const res = await dataService.post('/sms/wells/service/materials-assign-stocks', createdRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 창고정보등록 팝업 호출
async function onCellClickedPrtnrNo(baseYm, wareNo) {
  const { result: isChanged } = await modal({
    component: 'WwsnaWarehouseOrganizationRegP',
    componentProps: {
      apyYm: baseYm,
      wareNo,
    },
  });

  if (isChanged) {
    notify(t('MSG_ALT_SAVE_DATA'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prtnrNo' }, // 사번
    { fieldName: 'prtnrKnm' }, // 성명
    { fieldName: 'ogId' }, // 조직ID
    { fieldName: 'ogTpCd' }, // 조직유형
    { fieldName: 'ogNm' }, // 소속
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩
    { fieldName: 'hgrWareNm' }, // 상위창고
    { fieldName: 'qomAsnApyYn' }, // 물량배정적용여부
    { fieldName: 'didyDvNm' }, // 독립매니저여부
    { fieldName: 'adrUseYn' }, // 지정주소여부
    { fieldName: 'adrZip' }, // 우편번호
    { fieldName: 'adr' }, // 주소
    { fieldName: 'wareDtlDvNm' }, // 창고상세구분
    { fieldName: 'baseYm' }, // 기준년월
    { fieldName: 'wareNo' }, // 창고번호
  ];

  const columns = [
    { fieldName: 'wareDtlDvNm', header: t('MSG_TXT_WARE_DTL_DV'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '70', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '120', styleName: 'text-left' },
    { fieldName: 'hgrWareNm', header: t('MSG_TXT_HGR_WARE'), width: '120', styleName: 'text-center' },
    { fieldName: 'qomAsnApyYn',
      header: t('MSG_TXT_QOM_ASN_APY_YN'),
      width: '70',
      styleName: 'text-center',
      editor: { type: 'dropdown' },
      options: codes.COD_YN,
    },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '70', styleName: 'text-center' },
    { fieldName: 'didyDvNm', header: t('MSG_TXT_INDP_MNGER_YN'), width: '110', styleName: 'text-center' },
    { fieldName: 'adrUseYn', header: t('MSG_TXT_DSN_ADR_YN'), width: '70', styleName: 'text-center' },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.header.minRowHeight = 47;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'prtnrNo') {
      const baseYm = g.getValue(itemIndex, 'baseYm');
      const wareNo = g.getValue(itemIndex, 'wareNo');

      onCellClickedPrtnrNo(baseYm, wareNo);
    }
  };

  view.onCellEditable = (grid, index) => {
    // 물량배정 적용여부만 수정가능
    if (index.column === 'qomAsnApyYn') {
      return true;
    }

    return false;
  };
});

</script>
