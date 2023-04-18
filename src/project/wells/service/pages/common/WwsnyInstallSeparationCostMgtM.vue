<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyInstallSeparationCostMgtM - 설치/분리비용 관리
3. 작성자 : kyunglyn.lee
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 설치 및 분리 비용을 관리하는 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <!-- 상품그룹: 상품그룹-->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGr"
            :options="codes.PD_GRP_CD"
          />
        </kw-search-item>
        <!-- 상품그룹: 상품명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-select
            v-model="searchParams.pdCd"
            :options="pdNm"
          />
          <kw-field
            v-model="searchParams.apyMtrChk"
          >
            <template #default="{ field }">
              <!-- 현재적용자료 -->
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_CRTL_APY_MTR')"
              />
            </template>
          </kw-field>
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
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          primary
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
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
import dayjs from 'dayjs';
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useMeta,
  useDataService,
  gridUtil,
  notify,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD', // 상품그룹
  'PRD_MNGT_TP_CD', // 주기관리유형코드
  'SEP_IST_CS_ATC_CD', // 분리 설치 비용 항목
  'SEP_IST_CS_DTL_CD', // 분리 설치 비용 상세
  'COD_YN',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

/* 조회조건 */
const searchParams = ref({
  pdCd: '', /* 상품코드 */
  pdGr: '1',
  apyMtrChk: 'N',
});

const pdNm = ref([]);

async function onChangePdGr() {
  const res = await dataService.get('/sms/wells/service/installation-separation-costs/filter-products', { params: searchParams.value });
  pdNm.value = res.data;
  searchParams.value.pdCd = pdNm.value[0]?.codeId ?? '';

  const view = grdMainRef.value.getView();
  const pdCd = view.columnByField('pdCd');
  pdCd.editable = true;
  pdCd.labels = pdNm.value.map((v) => v.codeName);
  pdCd.values = pdNm.value.map((v) => v.codeId);
}
// 상품그룹: 상품명
watch(() => searchParams.value.pdGr, async (val) => {
  if (val === '') {
    pdNm.value = [];
  }
  await onChangePdGr();
});

function searchConditionReset() {
  searchParams.value.pdCd = pdNm.value[0]?.codeId ?? '';
  searchParams.value.pdGr = '1';
  searchParams.value.apyMtrChk = 'N';
}
function onClickReset() {
  searchConditionReset();
}

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/installation-separation-costs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: installSeperationCsMgt, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(installSeperationCsMgt);
  view.resetCurrent();
  await gridUtil.reset(view);

  console.log(gridUtil.confirmIfIsModified);
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

const now = dayjs();
async function onClickAdd() {
  const view = grdMainRef.value.getView();

  await gridUtil.insertRowAndFocus(view, 0, {
    apyStrtdt: now.format('YYYYMMDD'),
    apyEnddt: '99991231' });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deleteRows.length > 0) {
    await dataService.delete('/sms/wells/service/installation-separation-costs', { data: [...deleteRows] });
  }

  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/installation-separation-costs/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_Excel`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    await dataService.post('sms/wells/service/installation-separation-costs', chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

onMounted(async () => {
  await onChangePdGr();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellTpCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'svBizMclsfCd' },
    { fieldName: 'svBizMclsfNm' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'wkCsAmt' },
    { fieldName: 'recapSvYn' },
    { fieldName: 'rmkCn' },
    { fieldName: 'izSn' },
  ];

  const columns = [
    {
      fieldName: 'sellTpCd',
      header: {
        text: t('MSG_TXT_SEL_TYPE'),
        styleName: 'essential',
      },
      width: '110',
      editable: true,
      editor: { type: 'list' },
      options: codes.PRD_MNGT_TP_CD,
      styleName: 'text-center',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 판매유형
    {
      fieldName: 'pdCd',
      header: {
        text: t('MSG_TXT_PRDT_NM'),
        styleName: 'essential',
      },
      width: '270',
      editor: { type: 'list' },
      options: pdNm.value,
      styleName: 'text-left',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 상품명
    {
      fieldName: 'svBizMclsfCd',
      header: {
        text: t('TXT_MSG_PD_HCLSF_ID'),
        styleName: 'essential',
      },
      width: '190',
      editor: { type: 'list' },
      options: codes.SEP_IST_CS_ATC_CD,
      styleName: 'text-left',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 대분류
    {
      fieldName: 'svBizDclsfCd',
      header: {
        text: t('TXT_MSG_PD_LCLSF_ID'),
        styleName: 'essential',
      },
      width: '160',
      editor: { type: 'list' },
      options: codes.SEP_IST_CS_DTL_CD,
      styleName: 'text-left',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 소분류
    {
      fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'),
        styleName: 'essential',
      },
      width: '150',
      editor: { type: 'btdate' },
      styleName: 'text-center',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 적용시작일
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
    }, // 적용종료일
    {
      fieldName: 'wkCsAmt',
      header: {
        text: t('MSG_TXT_UPRC_WON'),
        styleName: 'essential',
      },
      width: '120',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 단가(원)
    {
      fieldName: 'recapSvYn',
      header: {
        text: t('MSG_TXT_RECAP_SV'),
        styleName: 'essential',
      },
      width: '130',
      editor: { type: 'list' },
      options: codes.COD_YN,
      styleName: 'text-center',
      rules: 'required',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 항시유상서비스
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '158',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { editable: true };
        }
        return { editable: false };
      },
    }, // 비고
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  const columnLayout = [
    'sellTpCd', 'pdCd',
    {
      header: t('MSG_TXT_PROCS_DV'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svBizMclsfCd', 'svBizDclsfCd'],
    }, // 처리구분
    'apyStrtdt', 'apyEnddt', 'wkCsAmt', 'recapSvYn', 'rmkCn',
  ];
  view.setColumnLayout(columnLayout);

  view.onCellEdited = (grid, itemIndex, row, field) => {
    grid.checkItem(itemIndex, true);
    const { sellTpCd, pdCd, svBizMclsfCd, svBizDclsfCd, apyStrtdt, wkCsAmt, rmkCn } = grid.getValues(itemIndex);
    grid.getDataSource().getOrgFieldName(field);

    grid.setValue(itemIndex, 'sellTpCd', sellTpCd);
    grid.setValue(itemIndex, 'pdCd', pdCd);
    grid.setValue(itemIndex, 'svBizMclsfCd', svBizMclsfCd);
    grid.setValue(itemIndex, 'svBizDclsfCd', svBizDclsfCd);
    grid.setValue(itemIndex, 'apyStrtdt', apyStrtdt);
    grid.setValue(itemIndex, 'wkCsAmt', wkCsAmt);
    grid.setValue(itemIndex, 'rmkCn', rmkCn);
  };
});
</script>

<style scoped>
</style>
