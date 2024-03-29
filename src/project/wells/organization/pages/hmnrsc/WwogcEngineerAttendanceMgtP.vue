<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerAttendanceMgtP - 휴가정보상세
3. 작성자 : 김동석
4. 작성일 : 2023-05-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 휴가정보상세
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl "
  >
    <h3>{{ props.prtnrNo }} / {{ props.prtnrKnm }} / {{ props.rolDvNm }} / {{ props.wkGrpNm }}</h3>
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
        v-permission:delete
        grid-action
        :label="$t('MSG_BTN_DEL')"
        @click="onClickRemove"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        v-permission:create
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <kw-btn
        v-permission:update
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, useMeta, defineGrid, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';

const grdMainRef = ref(getComponentType('KwGrid'));
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { t } = useI18n();
const { wkOjOgTpCd } = getUserInfo();

const now = dayjs().format('YYYYMM');

console.log(now);

const props = defineProps({
  prtnrNo: {
    type: String,
    default: () => '',
  },
  rolDvNm: {
    type: String,
    default: () => '',
  },
  prtnrKnm: {
    type: String,
    default: () => '',
  },
  wkGrpNm: {
    type: String,
    default: () => '',
  },
  ogTpCd: {
    type: String,
    default: () => '',
  },

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'EGER_WRK_STAT_CD',
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  prtnrNo: props.prtnrNo,

});

// 조회
async function fetchData() {
  if (props.prtnrNo) {
    const res = await dataService.get(`${SMS_WELLS_URI}/partner-engineer/vacations`, { params: { ...searchParams.value, ...pageInfo.value } });
    const { list, pageInfo: pagingResult } = res.data;
    pageInfo.value = pagingResult;

    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(list);
    // view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 행 추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    prtnrNo: props.prtnrNo,
  });
}

// 행 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  changedRows.forEach((obj) => {
    obj.oriVcnStrtDt = gridUtil.getOrigCellValue(view, obj.dataRow, 'vcnStrtDt');
  });

  changedRows.forEach((obj) => {
    const vcn = gridUtil.getCellValue(view, obj.dataRow, 'vcnStrtDt');
    console.log(vcn);
  });

  console.log(changedRows);
  await dataService.post(`${SMS_WELLS_URI}/partner-engineer/vacations`, changedRows);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// 행 삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  deletedRows.forEach((obj) => {
    obj.oriVcnStrtDt = gridUtil.getOrigCellValue(view, obj.dataRow, 'vcnStrtDt');
  });

  if (deletedRows.length === 0) return;

  console.log(deletedRows);
  await dataService.put(`${SMS_WELLS_URI}/partner-engineer/vacations`, deletedRows);
  await fetchData();
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'egerWrkStatCd',
      header: t('MSG_TXT_VCN_TYPE'),
      options: codes.EGER_WRK_STAT_CD,
      editor: {
        type: 'dropdown',
        values: codes.EGER_WRK_STAT_CD.filter((v) => v.codeId !== '000' && v.codeId !== '990').map((v) => v.codeId),
        labels: codes.EGER_WRK_STAT_CD.filter((v) => v.codeId !== '000' && v.codeId !== '990').map((v) => v.codeName),
      },
    },
    { fieldName: 'vcnStrtDt', header: t('MSG_TXT_STRT_DATE'), width: '130', styleName: 'text-center', editor: { type: 'btdate' }, editable: true, datetimeFormat: 'date' },
    { fieldName: 'vcnEndDt', header: t('MSG_TXT_END_DT'), width: '130', styleName: 'text-center', editor: { type: 'btdate' }, editable: true, datetimeFormat: 'date' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_ARTC'), width: '250', styleName: 'text-left', editable: true, editor: { type: 'text', maxLength: 3500 } },
    { fieldName: 'bizAgntPrtnrNo', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-left, rg-button-icon--search', editor: { type: 'text' }, editable: true, button: 'action' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', visible: false },

  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_VCN'),
      direction: 'horizontal',
      items: ['egerWrkStatCd', 'vcnStrtDt', 'vcnEndDt', 'rmkCn'],
    },
    {
      header: t('MSG_TXT_BIZ_AGNT_PRTNR'),
      direction: 'horizontal',
      items: ['bizAgntPrtnrNo', 'prtnrKnm'],
    },

  ]);

  view.onCellButtonClicked = async (grid, { dataRow, column }) => {
    // 파트너조회
    if (column === 'bizAgntPrtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          ogTpCd: wkOjOgTpCd === null ? 'W06' : wkOjOgTpCd,
        },
      });
      if (result) {
        data.setValue(dataRow, 'bizAgntPrtnrNo', payload.prtnrNo);
        data.setValue(dataRow, 'prtnrKnm', payload.prtnrKnm);
      }
    }
  };
});
</script>
<style scoped>
</style>
