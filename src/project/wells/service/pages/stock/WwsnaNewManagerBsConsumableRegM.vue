<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaNewManagerBsConsumableRegM - 신입 웰스매니저 활동물품 배부현황 (매니저 활동물품)
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.20
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 신입 웰스매니저 BS소모품 배부를 위한 신청 및 배부확정 하고 물류 출고요청 하는 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            @change="onChangeMngtYm"
          />
        </kw-search-item>
        <!-- 빌딩명 -->
        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
          <kw-select
            v-model="searchParams.bldCds"
            :multiple="true"
            :options="bldCode"
            option-value="bldCd"
            option-label="bldNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="filter-box my12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_REG_PERIOD') }}
          </p>
          <kw-date-picker
            v-model="aplcCloseData.bizStrtdt"
            :label="$t('MSG_TXT_START_DATE')"
            dense
          />
          <kw-time-picker
            v-model="aplcCloseData.bizStrtHh"
            :label="$t('MSG_TXT_START_TIME')"
            dense
            class="ml8"
          />
          <span class="mx8">~</span>
          <kw-date-picker
            v-model="aplcCloseData.bizEnddt"
            :label="$t('MSG_TXT_END_DATE')"
            dense
            class="mr8"
          />
          <kw-time-picker
            v-model="aplcCloseData.bizEndHh"
            :label="$t('MSG_TXT_END_TIME')"
            dense
            class="mr8"
          />
          <kw-btn
            v-if="isBusinessSupportTeam"
            v-permission:create
            secondary
            dense
            :label="$t('MSG_BTN_RGST_PTRM_SE')"
            @click="onClickRgstPtrmSe"
          />
        </li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="isDisableSave || pageInfo.totalCount === 0"
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
        <kw-separator
          v-if="isBusinessSupportTeam"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isBusinessSupportTeam"
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_OSTR_AK')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickOstrAk"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useMeta, getComponentType, useDataService, defineGrid, gridUtil, notify, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig, hasRoleNickName } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  bldCds: [],
});

const isBusinessSupportTeam = computed(() => hasRoleNickName('ROL_W1580'));
const bldCode = ref();
let items1 = [];
let items2 = [];
let saveData = [];
let requestData = [];

const itemsData = ref({
  bfsvcCsmbDdlvTpCd: '',
  fxnPdCd: '',
  fxnPckngUnit: '',
  fxnPdNm: '',
  fxnSapMatCd: '',
  aplcPdCd: '',
  aplcPckngUnit: '',
  aplcPdNm: '',
  aplcSapMatCd: '',
  qty: '',
});

const aplcCloseData = ref({
  mngtYm: '',
  bizStrtdt: '',
  bizStrtHh: '',
  bizEnddt: '',
  bizEndHh: '',
});

const aplcLmQtyData = ref({
  sapMatCd: '',
  bfsvcCsmbAplcLmQty: '',
});

const isDisableSave = computed(() => {
  const nowDateTime = Number(dayjs().format('YYYYMMDDHHmm'));
  const strtDtHh = `${aplcCloseData.value.bizStrtdt}${aplcCloseData.value.bizStrtHh ?? ''}`;
  const endDtHh = `${aplcCloseData.value.bizEnddt}${aplcCloseData.value.bizEndHh ?? ''}`;

  if (!isBusinessSupportTeam.value && !(nowDateTime >= Number(strtDtHh) && nowDateTime <= Number(endDtHh))) {
    return true;
  }

  return false;
});

async function getItems() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/items/${searchParams.value.mngtYm}`);
  itemsData.value = res.data;

  return res.data;
}

// 빌딩조회
async function getBldCode() {
  bldCode.value = [];
  const { mngtYm } = searchParams.value;
  if (!isEmpty(mngtYm)) {
    const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/building-code/${mngtYm}`);
    bldCode.value = res.data;
  }
}

// 관리년월 변경 시
async function onChangeMngtYm() {
  await getBldCode();
}

let cachedParams;
async function getNewMCsmbAplcClose() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/time-limit/${searchParams.value.mngtYm}`);

  aplcCloseData.value = res.data;
}

async function reAryGrid() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.setFields([]);
  view.setColumns(null);
  view.setColumnLayout([]);
  items1 = [];
  items2 = [];

  const fields = [
    { fieldName: 'reqYn' },
    { fieldName: 'bldCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'prtnrNmNo' },
    { fieldName: 'prtnrNo' },
    // { fieldName: 'blank' },
    // { fieldName: 'bfsvcCsmbDdlvStatCd' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNmNo', header: t('MSG_TXT_MANAGER'), width: '150', styleName: 'text-center', editable: false },
    // { fieldName: 'blank', header: t('SAP'),
    // width: '80', styleName: 'text-center', editable: true }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  const gridData = await getItems(); // 고정/신청품목 그리드 헤더를 위해 조회
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1'); // 고정품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2'); // 신청품목

  for (let i = 0; i < fxnItems.length; i += 1) {
    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${fxnItems[i].fxnSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `qty${fxnItems[i].fxnSapMatCd}`,
      header: fxnItems[i].fxnSapMatCd,
      width: '180',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0',
      editable: isBusinessSupportTeam.value,
    });

    // 고정품목 column layout 세팅
    items1.push(
      {
        header: `${fxnItems[i].fxnPdNm}`,
        width: '180',
        direction: 'horizontal',
        items: [
          {
            header: `${fxnItems[i].fxnPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${fxnItems[i].fxnSapMatCd}`],
          },
        ],
      },
    );
  }

  for (let i = 0; i < aplcItems.length; i += 1) {
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${aplcItems[i].aplcSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `qty${aplcItems[i].aplcSapMatCd}`,
      header: aplcItems[i].aplcSapMatCd,
      width: '180',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0',
      editable: true,
    });

    // 신청품목 column layout 세팅
    items2.push(
      {
        header: `${aplcItems[i].aplcPdNm}`,
        width: '180',
        direction: 'horizontal',
        items: [
          {
            header: `${aplcItems[i].aplcPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${aplcItems[i].aplcSapMatCd}`],
          },
        ],
      },
    );
  }

  fields.push({ fieldName: 'bfsvcCsmbDdlvStatCd' });

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    {
      header: t('MSG_TXT_BLD_INF'),
      direction: 'horizontal',
      items: [
        'reqYn',
        'bldCd',
        'bldNm',
        'prtnrNmNo',
        // {
        //   header: t('MSG_TXT_ACTI_GDS'),
        //   direction: 'horizontal',
        //   items: [
        //     {
        //       header: t('MSG_TXT_PCKNG_UNIT'),
        //       direction: 'horizontal',
        //       items: [
        //         // {
        //         //   header: t('MSG_TXT_SAP'),
        //         //   direction: 'horizontal',
        //         //   hideChildHeaders: true,
        //         //   items: ['blank'], // 최하위 그리드 헤더(SAP) 아래 컬럼이 있어야 헤더 생성됨
        //         // },
        //         'blank',
        //       ],
        //     },
        //   ],
        // },
      ],
    },
    {
      header: t('MSG_TXT_FXN'),
      direction: 'horizontal',
      items: items1,
    },
    {
      header: t('MSG_TXT_APLC'),
      direction: 'horizontal',
      items: items2,
    },
  ]);
}

async function getApplicationLimitQty() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/${cachedParams.mngtYm}/application-limit-qty`);

  aplcLmQtyData.value = res.data;
}

async function fetchData() {
  await reAryGrid();
  await getNewMCsmbAplcClose();
  await getApplicationLimitQty();

  const res = await dataService.get('/sms/wells/service/newmanager-bsconsumables', { params: { ...cachedParams, timeout: 300000 } });

  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(res.data);
}

function validateRegPeriod() {
  const strtDt = aplcCloseData.value.bizStrtdt;
  const strtHh = aplcCloseData.value.bizStrtHh;
  const endDt = aplcCloseData.value.bizEnddt;
  const endHh = aplcCloseData.value.bizEndHh;

  if ((isEmpty(strtDt) || isEmpty(strtHh) || isEmpty(endDt) || isEmpty(endHh))
  || Number(strtDt + strtHh) >= Number(endDt + endHh)) {
    return false;
  }

  return true;
}

async function onClickRgstPtrmSe() {
  aplcCloseData.value.mngtYm = aplcCloseData.value.bizStrtdt.substring(0, 6);

  if (!validateRegPeriod()) {
    notify(t('MSG_ALT_RGST_PTRM_CHECK'));
    return;
  }

  aplcCloseData.value.bizStrtHh = aplcCloseData.value.bizStrtHh.substring(0, 4);
  aplcCloseData.value.bizEndHh = aplcCloseData.value.bizEndHh.substring(0, 4);

  await dataService.post('/sms/wells/service/newmanager-bsconsumables/period-term', aplcCloseData.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (!await gridUtil.validate(view)) { return; }

  const errorYn = false;
  checkedRows.forEach((checkedRow) => {
    for (let i = 0; i < itemsData.value.length; i += 1) {
      if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '1') {
        saveData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].fxnPdCd,
          sapMatCd: itemsData.value[i].fxnSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`qty${itemsData.value[i].fxnSapMatCd}`] === undefined ? '0' : checkedRow[`qty${itemsData.value[i].fxnSapMatCd}`],
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
        });
      } else if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '2') {
        saveData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].aplcPdCd,
          sapMatCd: itemsData.value[i].aplcSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`qty${itemsData.value[i].aplcSapMatCd}`] === undefined ? '0' : checkedRow[`qty${itemsData.value[i].aplcSapMatCd}`],
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
        });
      }
    }
  });

  if (!errorYn) {
    await dataService.post('/sms/wells/service/newmanager-bsconsumables', saveData);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
    saveData = [];
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
    checkBar: 'hidden',
  });
}

async function onClickOstrAk() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  let errorYn = false;

  checkedRows.forEach((checkedRow) => {
    if (checkedRow.bfsvcCsmbDdlvStatCd !== '20') {
      alert(`${checkedRow.prtnrNmNo}님의 신청 상태를 확인해주세요`);
      errorYn = true;
      return;
    }

    for (let i = 0; i < itemsData.value.length; i += 1) {
      if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '1') {
        requestData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].fxnPdCd,
          sapMatCd: itemsData.value[i].fxnSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`qty${itemsData.value[i].fxnSapMatCd}`] === undefined ? '0' : checkedRow[`qty${itemsData.value[i].fxnSapMatCd}`],
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
        });
      } else if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '2') {
        requestData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].aplcPdCd,
          sapMatCd: itemsData.value[i].aplcSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`qty${itemsData.value[i].aplcSapMatCd}`] === undefined ? '0' : checkedRow[`qty${itemsData.value[i].aplcSapMatCd}`],
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
        });
      }
    }
  });

  if (!errorYn) {
    await dataService.post('/sms/wells/service/newmanager-bsconsumables/request', requestData);
    notify(t('MSG_ALT_AK_FSH'));
    await fetchData();
    requestData = [];
  } else {
    requestData = [];
  }
}

onMounted(async () => {
  getBldCode();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'reqYn' },
    { fieldName: 'bldCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'prtnrNmNo' },
    { fieldName: 'prtnrNo' },
    // { fieldName: 'blank' },
    // { fieldName: 'bfsvcCsmbDdlvStatCd' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNmNo', header: t('MSG_TXT_MANAGER'), width: '150', styleName: 'text-center', editable: false },
    // { fieldName: 'blank', header: '',
    // width: '80', styleName: 'text-center', editable: false }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  const gridData = await getItems(); // 고정/신청품목 그리드 헤더를 위해 조회
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1'); // 고정품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2'); // 신청품목

  // let j = 1;
  for (let i = 0; i < fxnItems.length; i += 1) {
    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${fxnItems[i].fxnSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `qty${fxnItems[i].fxnSapMatCd}`,
      header: fxnItems[i].fxnSapMatCd,
      width: '180',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0',
      editable: isBusinessSupportTeam.value,
    });

    // 고정품목 column layout 세팅
    items1.push(
      {
        header: `${fxnItems[i].fxnPdNm}`,
        width: '180',
        direction: 'horizontal',
        items: [
          {
            header: `${fxnItems[i].fxnPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${fxnItems[i].fxnSapMatCd}`],
          },
        ],
      },
    );

    // j += 1;
  }

  // let k = 1;
  for (let i = 0; i < aplcItems.length; i += 1) {
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${aplcItems[i].aplcSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `qty${aplcItems[i].aplcSapMatCd}`,
      header: aplcItems[i].aplcSapMatCd,
      width: '180',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0',
      editable: true,
    });

    // 신청품목 column layout 세팅
    items2.push(
      {
        header: `${aplcItems[i].aplcPdNm}`,
        width: '180',
        direction: 'horizontal',
        items: [
          {
            header: `${aplcItems[i].aplcPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${aplcItems[i].aplcSapMatCd}`],
          },
        ],
      },
    );

    // k += 1;
  }

  const columnLayout = [
    {
      header: t('MSG_TXT_BLD_INF'),
      direction: 'horizontal',
      items: [
        'reqYn',
        'bldCd',
        'bldNm',
        'prtnrNmNo',
        // {
        //   header: t('MSG_TXT_ACTI_GDS'),
        //   direction: 'horizontal',
        //   items: [
        //     {
        //       header: t('MSG_TXT_PCKNG_UNIT'),
        //       direction: 'horizontal',
        //       items: [
        //         {
        //           header: t('MSG_TXT_SAP'),
        //           direction: 'horizontal',
        //           hideChildHeaders: true,
        //           items: ['blank'], // 최하위 그리드 헤더(SAP) 아래 컬럼이 있어야 헤더 생성됨
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
    },
    {
      header: t('MSG_TXT_FXN'),
      direction: 'horizontal',
      items: items1,
    },
    {
      header: t('MSG_TXT_APLC'),
      direction: 'horizontal',
      items: items2,
    },
  ];

  fields.push({ fieldName: 'bfsvcCsmbDdlvStatCd' });

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.setFixedOptions({ colCount: 1 });

  view.onCellClicked = (grd, cData) => {
    if (cData.cellType !== 'check') { return false; }
  };

  view.onCellEditable = (grid, itemIndex) => {
    const nowDateTime = Number(dayjs().format('YYYYMMDDHHmm'));
    const strtDtHh = `${aplcCloseData.value.bizStrtdt}${aplcCloseData.value.bizStrtHh ?? ''}`;
    const endDtHh = `${aplcCloseData.value.bizEnddt}${aplcCloseData.value.bizEndHh ?? ''}`;
    const { bfsvcCsmbDdlvStatCd } = grid.getValues(itemIndex.itemIndex);

    if ((!isBusinessSupportTeam.value && !(nowDateTime >= Number(strtDtHh) && nowDateTime <= Number(endDtHh)))
    || (!isBusinessSupportTeam.value && ['20', '30'].includes(bfsvcCsmbDdlvStatCd))
    || bfsvcCsmbDdlvStatCd === '30') {
      return false;
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    grid.checkItem(itemIndex, true);

    const fixedFieldIndex = fieldIndex - 1;
    const sapMatCd = grid.getColumn(fixedFieldIndex).header.text;
    const aplcQty = view.getValue(row, fieldIndex);
    const aplcLmQty = aplcLmQtyData.value.find((obj) => obj.sapMatCd === sapMatCd)?.bfsvcCsmbAplcLmQty;

    if (!aplcLmQty || Number(aplcLmQty) === 0) {
      await alert(t(`${sapMatCd}의 신청 제한 갯수가 0개입니다.`));
      view.setValue(row, fieldIndex, 0);
      return;
    }

    if (Number(aplcQty) > Number(aplcLmQty)) {
      await alert(t(`${sapMatCd}은 ${aplcLmQty}개까지 신청 가능합니다.`));
      view.setValue(row, fieldIndex, 0);
    }
  };

  view.setCheckableCallback((dataSource, item) => {
    const { bfsvcCsmbDdlvStatCd } = gridUtil.getRowValue(view, item.dataRow);

    if (bfsvcCsmbDdlvStatCd === '30' || (!isBusinessSupportTeam.value && ['20', '30'].includes(bfsvcCsmbDdlvStatCd))) {
      return false;
    }
    return true;
  }, true);
});

</script>

<style scoped>

</style>
