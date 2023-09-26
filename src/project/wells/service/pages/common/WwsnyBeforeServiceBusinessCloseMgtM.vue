<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : [W-SV-U-0069M01] WwsnyBeforeServiceBusinessCloseMgtM - BS 업무시간및 마감관리
3. 작성자 : juno.cha
4. 작성일 : 2023.01.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS 업무시간및 마감관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('관리년도')"
          required
        >
          <kw-date-picker
            v-model="searchParams.managementYear"
            type="year"
            rules="required"
            :label="$t('관리년도')"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('관리항목')"
          required
        >
          <kw-select
            v-model="searchParams.managementItem"
            :options="customCodes.MNGT_ITM"
            first-option="select"
            rules="required"
            :label="$t('관리항목')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #default>
          <kw-btn
            v-permission:update
            :label="t('MSG_BTN_SAVE')"
            grid-action
            dense
            @click="onClickSave"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="gridMainRef"
        name="gridMain"
        :visible-rows="12"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));

/*
 *  Search Parameter
 */
const searchParams = ref({
  managementYear: dayjs().format('YYYY'),
  managementItem: '0',
});

/*
 *  공통코드 조회
 */
// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );
const customCodes = {
  MNGT_ITM: [
    { codeId: '0', codeName: t('BS업무 시간관리') },
    { codeId: '1', codeName: t('매니저 등록기간(신입)') },
    { codeId: '2', codeName: t('매니저 등록기간(해약)') },
    { codeId: '3', codeName: t('접수마감일 관리') },
  ],
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  조회
 */
let cachedParams;
async function getBusinessClosePages() {
  const res = await dataService.get('/sms/wells/service/business-closes', { params: { ...cachedParams } });
  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  // view.resetCurrent(); //첫 행 selectRow 없앰.
}

/*
 *  Date Validation Check
 */
function isDateValidate(date, format) {
  if (isEmpty(format)) {
    format = 'YYYYMMDDHHmmss';
  }

  if (!dayjs(date, format).isValid()) {
    return false;
  }
  return (dayjs(date, format).format(format) === date);
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await getBusinessClosePages();
}

/*
 *  Event - 저장 버튼 클릭
 */
async function onClickSave() {
  const view = gridMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  // const changedRows = gridUtil.getChangedRowValues(view);
  const allRows = gridUtil.getAllRowValues(view);
  await dataService.post('/sms/wells/service/business-closes', allRows);

  await notify(t('MSG_ALT_SAVE_DATA'));
  await getBusinessClosePages();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'strtdt' },
    { fieldName: 'strtHh' },
    { fieldName: 'enddt' },
    { fieldName: 'endHh' },
    { fieldName: 'mngtItm' },
  ];

  const columns = [
    {
      fieldName: 'mngtYm',
      header: t('관리년월'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',
      editable: false,
    },
    {
      fieldName: 'strtdt',
      header: t('시작일자'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
      editor: {
        type: 'btdate',
        datetimeFormat: 'yyyyMMdd',
        textReadOnly: true,
        btOptions: {
          minViewMode: 0,
          maxViewMode: 0,
          beforeShowDay: (val) => {
            const selectedData = gridUtil.getCurrentRowValue(gridMainRef.value.getView());
            return (dayjs(val).format('YYYYMM') === selectedData.mngtYm);
          },
        },
      },
    },
    {
      fieldName: 'strtHh',
      header: t('시작시간'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'HH:mm:ss',
      editor: {
        mask: {
          editMask: '999999',
        },
      },
    },
    {
      fieldName: 'enddt',
      header: t('종료일자'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
      editor: {
        type: 'btdate',
        datetimeFormat: 'yyyyMMdd',
        textReadOnly: true,
        btOptions: {
          minViewMode: 0,
          maxViewMode: 0,
          beforeShowDay: (val) => {
            const selectedData = gridUtil.getCurrentRowValue(gridMainRef.value.getView());
            return (dayjs(val).format('YYYYMM') === selectedData.mngtYm);
          },
        },
      },
    },
    {
      fieldName: 'endHh',
      header: t('종료시간'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'HH:mm:ss',
      editor: {
        mask: {
          editMask: '999999',
        },
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true; // Grid Editable On

  // Data 변경 - 시간 변경 시, 해당 값의 Validation Check (Grid time picker가 없으므로 별도 Validation check)
  view.onGetEditValue = (grid, index, editResult) => {
    // if (index.column !== 'strtHh' && index.column !== 'endHh') {
    //   return;
    // }
    let orgValue = '';
    if (index.column === 'strtHh') {
      orgValue = gridUtil.getCurrentRowValue(gridMainRef.value.getView()).strtHh;
    } else if (index.column === 'endHh') {
      orgValue = gridUtil.getCurrentRowValue(gridMainRef.value.getView()).endHh;
    } else {
      return;
    }
    const strDate = `${dayjs().format('YYYYMMDD')}${editResult.value}`;
    if (!isEmpty(editResult.value) && !isDateValidate(strDate)) {
      // editResult.value = gridUtil.getCurrentRowValue(gridMainRef.value.getView()).endHh;
      editResult.value = orgValue;
    }
  };
}

</script>

<style scoped>
</style>
