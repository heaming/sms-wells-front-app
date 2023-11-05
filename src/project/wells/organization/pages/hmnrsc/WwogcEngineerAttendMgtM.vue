<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerAttendMgtM - 엔지니어 출근 관리
3. 작성자 : 김동석
4. 작성일 : 2023-05-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 출근 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          class="equal_division--1"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            :og-tp-cd="searchParams.ogTpCd"
            :last-og-id="searchParams.ogId"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_D')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseDt"
            rules="required"
            :label="$t('MSG_TXT_BASE_D')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-size="visibleRows"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="onClickChangePage"
          />
        </template>
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
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
        name="grdMain"
        :visible-rows="visibleRows"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, useGlobal, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';
import { cloneDeep } from 'lodash-es';

const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const { modal, notify, alert } = useGlobal();
const { currentRoute } = useRouter();
const { wkOjOgTpCd, ogTpCd, baseRleCd } = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes('EGER_WRK_STAT_CD', 'OG_TP_CD', 'COD_PAGE_SIZE_OPTIONS');
const grdMainRef = ref(getComponentType('KwGrid'));
const cloneWrkStatCds = cloneDeep(codes.EGER_WRK_STAT_CD);
const egerWrkStatCds = ref([]);
const holiday = ref(['공휴일', '토', '일']);
const now = dayjs().format('YYYYMMDD');
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  baseDt: now,
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogId: undefined,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),

});

const visibleRows = ref(10);

async function fetchData() {
  return await dataService.get(`${SMS_WELLS_URI}/partner-engineer/attend/paging`, { params: { ...searchParams.value, ...pageInfo.value } });
}

async function onClickSearch() {
  pageInfo.value.pageIndex = '1';
  const res = await fetchData();
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${SMS_WELLS_URI}/partner-engineer/attend/excel-download`, { params: { ...searchParams.value } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 행 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  const { prtnrNo } = changedRows[0];

  console.log(changedRows);
  await dataService.post(`${SMS_WELLS_URI}/partner-engineer/${prtnrNo}`, changedRows);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// function editableCallback() {
//   if (searchParams.value.baseDt < now) {
//     return { editable: false };
//   }
//   return { editable: true };
// }

function onClickChangePage(val1, val2) {
  visibleRows.value = val2;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_CODE'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_CNT_NM'), width: '166', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_ROLE_1'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'wkGrpNm', header: t('MSG_TXT_WK_GRP'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'bizAgntYn', header: t('MSG_TXT_BIZ_AGNT'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'wrkDt', header: t('MSG_TXT_WRK_DT'), width: '130', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'dowDv', header: t('MSG_TXT_WRK_DOW'), width: '106', styleName: 'text-center', editable: false },
    {
      fieldName: 'egerWrkStatCd',
      header: t('MSG_TXT_WRK_STAT'),
      editor: { type: 'dropdown' },
      styleCallback(g, dataCell) {
        const ret = {};
        const { dowDv } = g.getValues(dataCell.index.itemIndex);
        if (holiday.value.map((obj) => dowDv.includes(obj)).filter((o) => o).length > 0) {
          egerWrkStatCds.value = codes.EGER_WRK_STAT_CD.map((item) => { if (item.codeId === '000') item.codeName = ''; return item; });
        } else {
          egerWrkStatCds.value = cloneWrkStatCds;
        }
        ret.editor = {
          type: 'list',
          values: egerWrkStatCds.value.map((item) => item.codeId),
          labels: egerWrkStatCds.value.map((item) => item.codeName),
          textReadOnly: true,
          displayLabels: 'label',
          editable: !(((baseRleCd === 'W6010' || baseRleCd === 'W6020' || baseRleCd === 'W6040' || baseRleCd === 'W4020'))),
        };
        return ret;
      },
      displayCallback(g, index, val) {
        const { dowDv } = g.getValues(index.itemIndex);
        if (holiday.value.map((obj) => dowDv.includes(obj)).filter((o) => o).length > 0) {
          egerWrkStatCds.value = codes.EGER_WRK_STAT_CD.map((item) => { if (item.codeId === '000') item.codeName = ''; return item; });
        } else {
          egerWrkStatCds.value = cloneWrkStatCds;
        }
        const option = egerWrkStatCds.value.filter((item) => item.codeId === val);
        if (option.length > 0) return option[0].codeName;
        return '';
      },
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_RMK_ARTC'),
      width: '146',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'text', maxLength: 3500 },
      styleCallback() {

      },
    },
    { fieldName: 'vcnInfo', header: t('MSG_TXT_VCN_INFO'), width: '107', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_VCN_INFO') },
    { fieldName: 'vcnStrtDt', header: t('MSG_TXT_STRT_DATE'), width: '178', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'vcnEndDt', header: t('MSG_TXT_END_DT'), width: '178', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'bizAgntNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'bizAgntPrtnrNo', header: t('MSG_TXT_EPNO'), width: '128', styleName: 'text-left', editable: false },
    { fieldName: 'pcpPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'pcpPrtnrNo', header: t('MSG_TXT_EPNO'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'procsDtm', header: t('MSG_TIT_PROC_DTM'), width: '182', styleName: 'text-center', editable: false, datetimeFormat: 'datetime' },

  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([

    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['ogCd', 'ogNm'],
    },
    {
      header: t('MSG_TXT_EGER'),
      direction: 'horizontal',
      items: ['prtnrKnm', 'prtnrNo', 'rsbDvNm', 'pstnDvNm', 'wkGrpNm'],
    },
    'bizAgntYn',
    'wrkDt',
    'dowDv',
    'egerWrkStatCd',
    'rmkCn',
    'vcnInfo',
    {
      header: t('MSG_TXT_VCN_USE_PTRM'),
      direction: 'horizontal',
      items: ['vcnStrtDt', 'vcnEndDt'],
    },
    {
      header: t('MSG_TXT_BIZ_AGNT_PRTNR'),
      direction: 'horizontal',
      items: ['bizAgntNm', 'bizAgntPrtnrNo'],
    },
    {
      header: t('MSG_TXT_PCP'),
      direction: 'horizontal',
      items: ['pcpPrtnrNm', 'pcpPrtnrNo'],
    },
    'procsDtm',
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      const res = await fetchData();
      view.getDataSource().addRows(res.data.list);
    }
  };

  // view.onCellButtonClicked = async (grid, { dataRow, column }) => {
  //   // 파트너조회
  //   if (column === 'bizAgntPrtnrNo') {
  //     const { bizAgntPrtnrNo } = gridUtil.getRowValue(grid, dataRow);
  //     const { result, payload } = await modal({
  //       component: 'ZwogzPartnerListP',
  //       componentProps: { prtnrNo: bizAgntPrtnrNo, ogTpCd: 'W06' },
  //     });
  //     if (result) {
  //       data.setValue(dataRow, 'bizAgntPrtnrNo', payload.prtnrNo);
  //       data.setValue(dataRow, 'agntPrtnrKnm', payload.prtnrKnm);
  //     }
  //   }
  // };

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    // 휴가정보
    if (column === 'vcnInfo') {
      const { prtnrNo } = gridUtil.getRowValue(g, dataRow);
      const { rolDvNm } = gridUtil.getRowValue(g, dataRow);
      const { prtnrKnm } = gridUtil.getRowValue(g, dataRow);
      const { wkGrpNm } = gridUtil.getRowValue(g, dataRow);
      const { wrkDt } = gridUtil.getRowValue(g, dataRow);

      const { result } = await modal({
        component: 'WwogcEngineerAttendanceMgtP',
        componentProps: { prtnrNo, ogTpCd: 'W06', rolDvNm, prtnrKnm, wkGrpNm, wrkDt },
      });

      if (result) {
        await fetchData();
      }
    }
  };

  view.onCellEdited = (grid, itemIndex, dataRow, field) => {
    const { egerWrkStatCd } = grid.getValues(itemIndex, field);
    if (egerWrkStatCd !== '000' && egerWrkStatCd !== '990') {
      grid.setValue(itemIndex, 'egerWrkStatCd', '000');

      alert(t('MSG_TXT_VCN_INFO_REG'));
    }
  };

  view.onCellEditable = (grid, index) => {
    if ((['egerWrkStatCd', 'rmkCn'].includes(index.column) && ((baseRleCd === 'W6010' || baseRleCd === 'W6020' || baseRleCd === 'W6040' || baseRleCd === 'W4020') && searchParams.value.baseDt < now))) {
      return false;
    }
    return true;
  };
});
</script>

<style scoped>
</style>
