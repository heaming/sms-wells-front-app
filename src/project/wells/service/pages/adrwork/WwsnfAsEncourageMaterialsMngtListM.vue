<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNF
2. 프로그램 ID : [W-SV-U-0198M01] WwsnfAsEncourageMaterialsMngtListM - A/S 유형별 필요자재 관리
3. 작성자 : gs.piit122
4. 작성일 : 2023.07.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- http://localhost:3000/#/service/wwsnf-as-encourage-materials-mngt-list
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
            :rules="searchParams.pdGrpCd !== '' ? 'required' : '' "
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RCP_SYMPT')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.classA"
            :options="classARef"
            first-option="all"
            @change="searchCustomerCenterClassA"
          />
          <kw-select
            v-model="searchParams.classB"
            :disable="searchParams.classA === '' "
            :options="classBRef"
            first-option="all"
            @change="searchCustomerCenterClassB"
          />
          <kw-select
            v-model="searchParams.classC"
            :disable="searchParams.classB === '' "
            :options="classCRef"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount==0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        name="grdMain"
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
import { codeUtil, defineGrid, getComponentType, useDataService, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { /* getServiceCenterOrgs, */ /* getServiceCenterPrtnr, */
  getPartMaster, getSearchCustomerCenterClass } = useSnCode();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
  classA: '',
  classB: '',
  classC: '',
});
const classARef = ref([]);
const classBRef = ref([]);
const classCRef = ref([]);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-encourage-materials-mngt', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-encourage-materials-mngt/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function searchCustomerCenterClassA() {
  classBRef.value = [];
  classCRef.value = [];
  searchParams.value.classB = '';
  searchParams.value.classC = '';
  classBRef.value = await getSearchCustomerCenterClass(searchParams.value.classA, null);
}

async function searchCustomerCenterClassB() {
  searchParams.value.classC = '';
  classCRef.value = [];
  classCRef.value = await getSearchCustomerCenterClass(searchParams.value.classA, searchParams.value.classB);
}

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'recomSapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'cnslTpLcsfCdNm' },
    { fieldName: 'cnslCn' },
    { fieldName: 'itmRcmdRnk', dataType: 'number' },
    { fieldName: 'itmRcmdQty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'recomSapCd', header: t('MSG_TXT_SAPCD'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_MATI_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_MATI_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'cnslTpLcsfCdNm', header: t('MSG_TXT_RCP_SYMPT'), width: '120', styleName: 'text-left' },
    { fieldName: 'cnslCn', header: t('MSG_TXT_RCP_SYMPT_DTL'), width: '400', styleName: 'text-left' },
    { fieldName: 'itmRcmdRnk', header: t('MSG_TXT_RCMD_RNK'), width: '80', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'itmRcmdQty', header: t('MSG_TXT_QTY'), width: '80', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  // 헤더 부분 merge
  const layoutColumns = [
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_PDCT') },
      items: ['sapMatCd', 'pdCd', 'pdNm'],
    },
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_RCMD_MAT') },
      items: ['recomSapCd', 'itmPdCd', 'itmPdNm', 'itmRcmdRnk', 'itmRcmdQty'],
    },
    'cnslTpLcsfCdNm', 'cnslCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');
  view.checkBar.visible = false;
  view.editOptions.editable = false; // Grid Editable On
  view.rowIndicator.visible = true;
});

onMounted(async () => {
  searchParams.value.classB = '';
  searchParams.value.classC = '';
  classBRef.value = [];
  classCRef.value = [];
  classARef.value = await getSearchCustomerCenterClass();
});
</script>
