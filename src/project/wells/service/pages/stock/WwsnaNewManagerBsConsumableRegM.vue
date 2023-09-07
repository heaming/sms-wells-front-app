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
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            @change="getBldCode"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
          <kw-select
            v-model="searchParams.bldCds"
            :multiple="true"
            :options="bldCode"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="filter-box my12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            <!-- TODO: 권한 체크 후 신청기간영역 컨트롤해야함(빌딩 업무담당일 경우 날싸 및 시간 없음 :: 신청 불가) -->
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
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="isDisableSave"
          @click="onClickSave"
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

import { useMeta, getComponentType, codeUtil, useDataService, defineGrid, gridUtil, notify, alert } from 'kw-lib';
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
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  bldCds: [],
});

const isBusinessSupportTeam = computed(() => hasRoleNickName('ROL_W1580'));
const bldCode = ref();
let items1 = [];
let items2 = [];
let saveData = [];

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

const isDisableSave = computed(() => {
  const nowDateTime = Number(dayjs().format('YYYYMMDDHHmmss'));
  const strtDtHh = Number(aplcCloseData.value.bizStrtdt + aplcCloseData.value.bizStrtHh);
  const endDtHh = Number(aplcCloseData.value.bizEnddt + aplcCloseData.value.bizEndHh);

  if (!(nowDateTime >= strtDtHh && nowDateTime <= endDtHh)) {
    return true;
  }

  return false;
});

async function getItems() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/items/${searchParams.value.mngtYm}`);
  itemsData.value = res.data;

  return res.data;
}

async function getBldCode() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/building-code/${searchParams.value.mngtYm}`);
  const codeData = res.data;

  bldCode.value = codeData.map((v) => ({ codeId: v.bldCd, codeName: v.bldNm }));
}

let cachedParams;
async function getNewMCsmbAplcClose() {
  const res = await dataService.get(`/sms/wells/service/newmanager-bsconsumables/time-limit/${searchParams.value.mngtYm}`);

  aplcCloseData.value = res.data;
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
  await getNewMCsmbAplcClose();
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
    { fieldName: 'blank' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNmNo', header: t('MSG_TXT_MANAGER'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'blank', header: '', width: '80', styleName: 'text-center', editable: false }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  const gridData = await getItems(); // 고정/신청품목 그리드 헤더를 위해 조회
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1'); // 고정품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2'); // 신청품목

  let j = 1;
  for (let i = 0; i < fxnItems.length; i += 1) {
    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `fxnQty${j}` });
    columns.push({
      fieldName: `fxnQty${j}`,
      header: fxnItems[i].fxnSapMatCd,
      width: '180',
      styleName: 'text-center',
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
            items: [`fxnQty${j}`],
          },
        ],
      },
    );

    j += 1;
  }

  let k = 1;
  for (let i = 0; i < aplcItems.length; i += 1) {
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `aplcQty${k}` });
    columns.push({
      fieldName: `aplcQty${k}`,
      header: aplcItems[i].aplcSapMatCd,
      width: '180',
      styleName: 'text-center',
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
            items: [`aplcQty${k}`],
          },
        ],
      },
    );

    k += 1;
  }

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
        {
          header: t('MSG_TXT_ACTI_GDS'),
          direction: 'horizontal',
          items: [
            {
              header: t('MSG_TXT_PCKNG_UNIT'),
              direction: 'horizontal',
              items: [
                {
                  header: t('MSG_TXT_SAP'),
                  direction: 'horizontal',
                  hideChildHeaders: true,
                  items: ['blank'], // 최하위 그리드 헤더(SAP) 아래 컬럼이 있어야 헤더 생성됨
                },
              ],
            },
          ],
        },
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

  const editFields = [];

  for (let i = 0; i < aplcItems.length; i += 1) {
    let l = i + 1;
    editFields.push(`aplcQty${l}`);
    l += 1;
  }
}

async function fetchData() {
  await reAryGrid();
  await getNewMCsmbAplcClose();

  const res = await dataService.get('/sms/wells/service/newmanager-bsconsumables/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: bldCsmbDeliveries, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  if (bldCsmbDeliveries.length !== 0) {
    bldCsmbDeliveries.forEach((bldCsmbDelivery) => {
      // 리스트 내 고정수량 array 재조합
      for (let i = 0; i < bldCsmbDelivery.fxnQtys.length; i += 1) {
        const j = i + 1;
        const fxnKeyNm = {};
        fxnKeyNm[`fxnQty${j}`] = bldCsmbDelivery.fxnQtys[i];
        Object.assign(bldCsmbDelivery, fxnKeyNm);
      }

      // 리스트 내 신청수량 array 재조합
      for (let i = 0; i < bldCsmbDelivery.aplcQtys.length; i += 1) {
        const j = i + 1;
        const aplcKeyNm = {};
        aplcKeyNm[`aplcQty${j}`] = bldCsmbDelivery.aplcQtys[i];
        Object.assign(bldCsmbDelivery, aplcKeyNm);
      }
    });
  }

  // TODO: editable 조건에 권한별 수정 가능여부 추가해야함(빌딩 업무담당은 본인 빌딩에 대한 수량만 수정 가능)
  const editFields = [];

  for (let i = 0; i < items2.length; i += 1) {
    let l = i + 1;
    editFields.push(`aplcQty${l}`);
    l += 1;
  }

  view.onCellEditable = (grid, itemIndex) => {
    const nowDateTime = Number(dayjs().format('YYYYMMDDHHmmss'));
    const strtDtHh = Number(aplcCloseData.value.bizStrtdt + aplcCloseData.value.bizStrtHh);
    const endDtHh = Number(aplcCloseData.value.bizEnddt + aplcCloseData.value.bizEndHh);

    // TODO: 권한조회 후 빌딩 업무담당일 경우 본인 소속 빌딩 외 수정불가 로직 추가해야함
    // if (!(nowDateTime >= strtDtHh && nowDateTime <= endDtHh) || !editFields.includes(itemIndex.column)) {
    if (!(nowDateTime >= strtDtHh && nowDateTime <= endDtHh) || bldCsmbDeliveries[itemIndex.itemIndex].bfsvcCsmbDdlvStatCd === '30') {
      return false;
    }
  };

  view.getDataSource().setRows(bldCsmbDeliveries);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const checkedModifyRows = gridUtil.getCheckedRowValues(view, { isChangedOnly: true });

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (checkedModifyRows.length !== 0 && (checkedRows.length > checkedModifyRows.length)) {
    notify(t('MSG_ALT_NO_CHG_ROW_SELECT'));
    return;
  }

  // if (await gridUtil.alertIfIsNotModified(view)) { return; }
  let errorYn = false;
  checkedRows.forEach((checkedRow) => {
    let f = 1;
    let a = 1;
    for (let i = 0; i < itemsData.value.length; i += 1) {
      if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '1') {
        saveData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].fxnPdCd,
          sapMatCd: itemsData.value[i].fxnSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`fxnQty${f}`] === undefined ? '0' : checkedRow[`fxnQty${f}`], // TODO: 테스트용 삼항연산.. 추후 삭제
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10', // TODO: 권한에 따라 코드값 달라짐(세션) :: 빌딩 업무담당 - '10', wells 영업지원팀 - '20'
        });

        f += 1;
      } else if (itemsData.value[i].bfsvcCsmbDdlvTpCd === '2') {
        if (Number(itemsData.value[i].aplcPckngUnit.replace(/[^0-9]/g, '')) < Number(checkedRow[`aplcQty${a}`])) {
          // alert(t('MSG_ALT_PSBL_MAX_CNT_DATA'), [itemsData.value[i].aplcPdNm],
          //  [itemsData.value[i].aplcPckngUnit.replace(/[^0-9]/g, '')]);

          // i18n 다국어모듈 사용으로 처리하면 파라미터 값 표시 안됨. 확인 필요
          alert(`${itemsData.value[i].aplcPdNm}은(는) ${itemsData.value[i].aplcPckngUnit.replace(/[^0-9]/g, '')}개까지 가능합니다.`);
          errorYn = true;
          saveData = [];
          return;
        }

        saveData.push({
          mngtYm: searchParams.value.mngtYm,
          bfsvcCsmbDdlvOjCd: '1',
          strWareNo: checkedRow.prtnrNo,
          csmbPdCd: itemsData.value[i].aplcPdCd,
          sapMatCd: itemsData.value[i].aplcSapMatCd,
          bfsvcCsmbDdlvQty: checkedRow[`aplcQty${a}`] === undefined ? '0' : checkedRow[`aplcQty${a}`], // TODO: 테스트용 삼항연산.. 추후 삭제
          bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10', // TODO: 권한에 따라 코드값 달라짐(세션) :: 빌딩 업무담당 - '10', wells 영업지원팀 - '20'
        });

        a += 1;
      }
    }
  });

  if (!errorYn) {
    await dataService.post('/sms/wells/service/newmanager-bsconsumables', saveData);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/newmanager-bsconsumables', { params: { ...cachedParams } });
  const bldCsmbDeliveries = res.data;

  if (bldCsmbDeliveries.length !== 0) {
    bldCsmbDeliveries.forEach((bldCsmbDelivery) => {
      // 리스트 내 고정수량 array 재조합
      for (let i = 0; i < bldCsmbDelivery.fxnQtys.length; i += 1) {
        const j = i + 1;
        const fxnKeyNm = {};
        fxnKeyNm[`fxnQty${j}`] = bldCsmbDelivery.fxnQtys[i];
        Object.assign(bldCsmbDelivery, fxnKeyNm);
      }

      // 리스트 내 신청수량 array 재조합
      for (let i = 0; i < bldCsmbDelivery.aplcQtys.length; i += 1) {
        const j = i + 1;
        const aplcKeyNm = {};
        aplcKeyNm[`aplcQty${j}`] = bldCsmbDelivery.aplcQtys[i];
        Object.assign(bldCsmbDelivery, aplcKeyNm);
      }
    });
  }

  view.getDataSource().setRows(bldCsmbDeliveries);

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: bldCsmbDeliveries,
    checkBar: 'hidden',
  });
}

async function onClickOstrAk() {
  await dataService.post(`/sms/wells/service/newmanager-bsconsumables/${searchParams.value.mngtYm}/request`);
  notify(t('MSG_ALT_AK_FSH'));
  await fetchData();
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
    { fieldName: 'blank' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNmNo', header: t('MSG_TXT_MANAGER'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'blank', header: '', width: '80', styleName: 'text-center', editable: false }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  const gridData = await getItems(); // 고정/신청품목 그리드 헤더를 위해 조회
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1'); // 고정품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2'); // 신청품목

  let j = 1;
  for (let i = 0; i < fxnItems.length; i += 1) {
    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `fxnQty${j}` });
    columns.push({
      fieldName: `fxnQty${j}`,
      header: fxnItems[i].fxnSapMatCd,
      width: '180',
      styleName: 'text-center',
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
            items: [`fxnQty${j}`],
          },
        ],
      },
    );

    j += 1;
  }

  let k = 1;
  for (let i = 0; i < aplcItems.length; i += 1) {
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `aplcQty${k}` });
    columns.push({
      fieldName: `aplcQty${k}`,
      header: aplcItems[i].aplcSapMatCd,
      width: '180',
      styleName: 'text-center',
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
            items: [`aplcQty${k}`],
          },
        ],
      },
    );

    k += 1;
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
        {
          header: t('MSG_TXT_ACTI_GDS'),
          direction: 'horizontal',
          items: [
            {
              header: t('MSG_TXT_PCKNG_UNIT'),
              direction: 'horizontal',
              items: [
                {
                  header: t('MSG_TXT_SAP'),
                  direction: 'horizontal',
                  hideChildHeaders: true,
                  items: ['blank'], // 최하위 그리드 헤더(SAP) 아래 컬럼이 있어야 헤더 생성됨
                },
              ],
            },
          ],
        },
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

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.onCellClicked = (grd, cData) => {
    if (cData.cellType !== 'check') { return false; }
  };

  const editFields = [];

  for (let i = 0; i < aplcItems.length; i += 1) {
    let l = i + 1;
    editFields.push(`aplcQty${l}`);
    l += 1;
  }

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.setFixedOptions({ colCount: 1 });
});

</script>

<style scoped>

</style>
