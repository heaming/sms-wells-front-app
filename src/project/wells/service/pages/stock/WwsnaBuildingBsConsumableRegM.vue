<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBuildingBsConsumableRegM(W-SV-U-0010M01) - 빌딩별 활동물품 배부현황 (매니저 활동물품)
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 빌딩별 BS소모품 배부를 위한 신청 및 배부확정 하고 물류 출고요청 하는 화면
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
          required
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
        <kw-search-item :label="$t('MSG_TXT_BLD_NM')">
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
          <!-- 등록기간 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_REG_PERIOD') }}
          </p>
          <kw-date-picker
            v-model="aplcCloseData.bizStrtdt"
            :label="$t('MSG_TXT_START_DATE')"
            dense
            :disable="!isBusinessSupportTeam"
          />
          <kw-time-picker
            v-model="aplcCloseData.bizStrtHh"
            :label="$t('MSG_TXT_START_TIME')"
            dense
            class="ml8"
            :disable="!isBusinessSupportTeam"
          />
          <span class="mx8">~</span>
          <kw-date-picker
            v-model="aplcCloseData.bizEnddt"
            :label="$t('MSG_TXT_END_DATE')"
            dense
            class="mr8"
            :disable="!isBusinessSupportTeam"
          />
          <kw-time-picker
            v-model="aplcCloseData.bizEndHh"
            :label="$t('MSG_TXT_END_TIME')"
            dense
            class="mr8"
            :disable="!isBusinessSupportTeam"
          />
          <!-- 등록기간 설정 -->
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
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="isDisableSave || pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          nset
          spaced
        />
        <!-- 엑셀다운로드 -->
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
        <!-- 출고요청 -->
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
import { useMeta, defineGrid, useDataService, getComponentType, gridUtil, notify, alert, confirm } from 'kw-lib';
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

// 저장버튼 활성화여부
const isDisableSave = computed(() => {
  const { bizStrtdt, bizStrtHh, bizEnddt, bizEndHh } = aplcCloseData.value;
  const nowDateTime = Number(dayjs().format('YYYYMMDDHHmm'));
  const strtDtHh = `${bizStrtdt}${bizStrtHh ?? ''}`;
  const endDtHh = `${bizEnddt}${bizEndHh ?? ''}`;

  if (!isBusinessSupportTeam.value && !(nowDateTime >= Number(strtDtHh) && nowDateTime <= Number(endDtHh))) {
    return true;
  }

  return false;
});

// 빌딩 조회
async function getBldCode() {
  bldCode.value = [];
  const { mngtYm } = searchParams.value;
  if (!isEmpty(mngtYm)) {
    const res = await dataService.get(`/sms/wells/service/building-bsconsumables/building-code/${mngtYm}`);
    bldCode.value = res.data;
  }
}

// 관리년월 변경 시
async function onChangeMngtYm() {
  await getBldCode();
}

let cachedParams;

// 품목조회
async function getItems() {
  itemsData.value = [];
  const { mngtYm } = isEmpty(cachedParams) ? searchParams.value : cachedParams;

  if (isEmpty(mngtYm)) {
    return [];
  }

  const res = await dataService.get(`/sms/wells/service/building-bsconsumables/items/${mngtYm}`);
  itemsData.value = res.data;

  return res.data;
}

// 업무마감 일정 조회
async function getBldCsmbAplcClose() {
  const { mngtYm } = cachedParams;
  const res = await dataService.get(`/sms/wells/service/building-bsconsumables/time-limit/${mngtYm}`);
  aplcCloseData.value = res.data;
}

// 그리드 셋팅
async function reAryGrid() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.setFields([]);
  view.setColumns(null);
  view.setColumnLayout([]);
  items1 = [];
  items2 = [];

  const fields = [
    { fieldName: 'reqYn' }, // 상태
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'rsppPrtnrNo' }, // 수취인
    { fieldName: 'vstCstN', dataType: 'number' }, // 방문고객수
    { fieldName: 'blank' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'rsppPrtnrNo', header: t('MSG_TXT_ADRS'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'vstCstN', header: t('MSG_TXT_VST_CST_N'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'blank', header: '', width: '80', styleName: 'text-center', editable: false }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  // 품목 조회 (고정/신청품목 그리드 헤더)
  const gridData = await getItems();
  // 고정품목
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1');
  // 신청품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2');

  for (let i = 0; i < fxnItems.length; i += 1) {
    const { fxnSapMatCd, fxnPdNm, fxnPckngUnit } = fxnItems[i];
    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${fxnSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `qty${fxnSapMatCd}`,
      header: fxnSapMatCd,
      width: '120',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0|max_value:999999',
      editable: isBusinessSupportTeam.value,
    });

    // 고정품목 column layout 세팅
    items1.push(
      {
        header: `${fxnPdNm}`,
        width: '120',
        direction: 'horizontal',
        items: [
          {
            header: `${fxnPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${fxnSapMatCd}`],
          },
        ],
      },
    );
  }

  for (let i = 0; i < aplcItems.length; i += 1) {
    const { aplcSapMatCd, aplcPdNm, aplcPckngUnit } = aplcItems[i];
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `aplcQty${aplcSapMatCd}`, dataType: 'number' });
    columns.push({
      fieldName: `aplcQty${aplcSapMatCd}`,
      header: aplcSapMatCd,
      width: '120',
      styleName: 'text-center',
      dataType: 'number',
      rules: 'min_value:0|max_value:999999',
      editable: true,
    });

    // 신청품목 column layout 세팅
    items2.push(
      {
        header: `${aplcPdNm}`,
        width: '120',
        direction: 'horizontal',
        items: [
          {
            header: `${aplcPckngUnit}`,
            direction: 'horizontal',
            items: [`aplcQty${aplcSapMatCd}`],
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
      items: ['reqYn', 'bldCd', 'bldNm', 'rsppPrtnrNo', 'vstCstN',
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

  view.setFixedOptions({ colCount: 1 });
}

// 신청제한 수량 조회
async function getApplicationLimitQty() {
  const { mngtYm } = cachedParams;
  const res = await dataService.get(`/sms/wells/service/building-bsconsumables/${mngtYm}/application-limit-qty`);

  aplcLmQtyData.value = res.data;
}

// 조회
async function fetchData() {
  // 그리드 셋팅
  await reAryGrid();
  // 등록기간 조회
  await getBldCsmbAplcClose();
  // 신청제한 수량 조회
  await getApplicationLimitQty();

  const res = await dataService.get('/sms/wells/service/building-bsconsumables', { params: { ...cachedParams }, timeout: 300000 });

  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(res.data);
}

// 조회버튼 클릭
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 등록기간 유효성체크
function validateRegPeriod() {
  const { bizStrtdt: strtDt, bizStrtHh: strtHh, bizEnddt: endDt, bizEndHh: endHh } = aplcCloseData.value;

  if ((isEmpty(strtDt) || isEmpty(strtHh) || isEmpty(endDt) || isEmpty(endHh))
  || Number(strtDt + strtHh) >= Number(endDt + endHh)) {
    return false;
  }

  return true;
}

// 등록기간 설정
async function onClickRgstPtrmSe() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  // 그리드 변경상태가 있을 경우
  if (!isEmpty(changedRows)) {
    if (!await confirm(t('MSG_ALT_CHG_CNTN'))) return;
  }

  if (!validateRegPeriod()) {
    // 등록 기간을 확인해주십시오.
    notify(t('MSG_ALT_RGST_PTRM_CHECK'));
    return;
  }

  const { mngtYm } = isEmpty(cachedParams) ? searchParams.value : cachedParams;
  if (isEmpty(mngtYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_MGT_YNM')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  aplcCloseData.value.mngtYm = mngtYm;

  // 등록기간 저장
  const res = await dataService.post('/sms/wells/service/building-bsconsumables/period-term', aplcCloseData.value);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    if (isEmpty(cachedParams)) {
      await onClickSearch();
    } else {
      await fetchData();
    }
  }
}

// 저장
async function onClickSave() {
  saveData = [];

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;

  const { mngtYm } = cachedParams;

  checkedRows.forEach((checkedRow) => {
    for (let i = 0; i < itemsData.value.length; i += 1) {
      const { bfsvcCsmbDdlvTpCd, fxnPdCd, fxnSapMatCd, aplcPdCd, aplcSapMatCd } = itemsData.value[i];

      let csmbPdCd = '';
      let sapMatCd = '';
      let bfsvcCsmbDdlvQty = 0;

      if (bfsvcCsmbDdlvTpCd === '1') {
        csmbPdCd = fxnPdCd;
        sapMatCd = fxnSapMatCd;
        bfsvcCsmbDdlvQty = checkedRow[`qty${fxnSapMatCd}`] === undefined ? '0' : checkedRow[`qty${fxnSapMatCd}`];
      } else if (bfsvcCsmbDdlvTpCd === '2') {
        csmbPdCd = aplcPdCd;
        sapMatCd = aplcSapMatCd;
        bfsvcCsmbDdlvQty = checkedRow[`aplcQty${aplcSapMatCd}`] === undefined ? '0' : checkedRow[`aplcQty${aplcSapMatCd}`];
      }

      saveData.push({
        mngtYm,
        bfsvcCsmbDdlvOjCd: '3',
        strWareNo: checkedRow.bldCd,
        csmbPdCd,
        sapMatCd,
        bfsvcCsmbDdlvQty,
        bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
      });
    }
  });

  const res = await dataService.post('/sms/wells/service/building-bsconsumables', saveData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
    checkBar: 'hidden',
  });
}

// 출고요청 클릭 시
async function onClickOstrAk() {
  requestData = [];

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (!await gridUtil.validate(view, { isCheckedOnly: true })) { return; }

  const { mngtYm } = cachedParams;

  let errorYn = false;

  checkedRows.forEach((checkedRow) => {
    if (checkedRow.bfsvcCsmbDdlvStatCd !== '20') {
      // {0}의 신청 상태를 확인해 주세요.
      alert(`${checkedRow.bldNm}(${checkedRow.bldCd})${t('MSG_ALT_APLC_STAT_CONF')}`);
      errorYn = true;
      return;
    }

    for (let i = 0; i < itemsData.value.length; i += 1) {
      const { bfsvcCsmbDdlvTpCd, fxnPdCd, fxnSapMatCd, aplcPdCd, aplcSapMatCd } = itemsData.value[i];

      let csmbPdCd = '';
      let sapMatCd = '';
      let bfsvcCsmbDdlvQty = 0;

      if (bfsvcCsmbDdlvTpCd === '1') {
        csmbPdCd = fxnPdCd;
        sapMatCd = fxnSapMatCd;
        bfsvcCsmbDdlvQty = checkedRow[`qty${fxnSapMatCd}`] === undefined ? '0' : checkedRow[`qty${fxnSapMatCd}`];
      } else if (bfsvcCsmbDdlvTpCd === '2') {
        csmbPdCd = aplcPdCd;
        sapMatCd = aplcSapMatCd;
        bfsvcCsmbDdlvQty = checkedRow[`aplcQty${aplcSapMatCd}`] === undefined ? '0' : checkedRow[`aplcQty${aplcSapMatCd}`];
      }

      requestData.push({
        mngtYm,
        bfsvcCsmbDdlvOjCd: '3',
        strWareNo: checkedRow.bldCd,
        csmbPdCd,
        sapMatCd,
        bfsvcCsmbDdlvQty,
        bfsvcCsmbDdlvStatCd: isBusinessSupportTeam.value ? '20' : '10',
      });
    }
  });

  if (!errorYn) {
    const res = await dataService.post('/sms/wells/service/building-bsconsumables/request', requestData, { timeout: 300000 });
    const { processCount } = res.data;
    if (processCount > 0) {
      notify(t('MSG_ALT_AK_FSH'));
      await fetchData();
    }
  }
}

onMounted(async () => {
  // 빌딩명 조회
  getBldCode();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'reqYn' }, // 상태
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'rsppPrtnrNo' }, // 책임파트너번호
    { fieldName: 'vstCstN', dataType: 'number' }, // 방문고객수
    { fieldName: 'blank' },
  ];

  const columns = [
    { fieldName: 'reqYn', header: t('MSG_TXT_STT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'rsppPrtnrNo', header: t('MSG_TXT_ADRS'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'vstCstN', header: t('MSG_TXT_VST_CST_N'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'blank', header: '', width: '80', styleName: 'text-center', editable: false }, // 헤더 정상 생성을 위한 필드, 사용은 안함
  ];

  const gridData = await getItems(); // 고정/신청품목 그리드 헤더를 위해 조회
  const fxnItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '1'); // 고정품목
  const aplcItems = gridData.filter((v) => v.bfsvcCsmbDdlvTpCd === '2'); // 신청품목

  for (let i = 0; i < fxnItems.length; i += 1) {
    const { fxnSapMatCd, fxnPdNm, fxnPckngUnit } = fxnItems[i];

    // 고정품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `qty${fxnSapMatCd}` });
    columns.push({
      fieldName: `qty${fxnSapMatCd}`,
      header: fxnSapMatCd,
      width: '120',
      styleName: 'text-center',
      editable: isBusinessSupportTeam.value,
    });

    // 고정품목 column layout 세팅
    items1.push(
      {
        header: `${fxnPdNm}`,
        width: '120',
        direction: 'horizontal',
        items: [
          {
            header: `${fxnPckngUnit}`,
            direction: 'horizontal',
            items: [`qty${fxnSapMatCd}`],
          },
        ],
      },
    );
  }

  for (let i = 0; i < aplcItems.length; i += 1) {
    const { aplcSapMatCd, aplcPdNm, aplcPckngUnit } = aplcItems[i];
    // 신청품목 갯수만큼 field, column 추가
    fields.push({ fieldName: `aplcQty${aplcSapMatCd}` });
    columns.push({
      fieldName: `aplcQty${aplcSapMatCd}`,
      header: aplcSapMatCd,
      width: '120',
      styleName: 'text-center',
      editable: true,
    });

    // 신청품목 column layout 세팅
    items2.push(
      {
        header: `${aplcPdNm}`,
        width: '120',
        direction: 'horizontal',
        items: [
          {
            header: `${aplcPckngUnit}`,
            direction: 'horizontal',
            items: [`aplcQty${aplcSapMatCd}`],
          },
        ],
      },
    );
  }

  const columnLayout = [
    {
      header: t('MSG_TXT_BLD_INF'),
      direction: 'horizontal',
      items: ['reqYn', 'bldCd', 'bldNm', 'rsppPrtnrNo', 'vstCstN',
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

  fields.push({ fieldName: 'bfsvcCsmbDdlvStatCd' });

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFixedOptions({ colCount: 1 });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellClicked = (grd, cData) => {
    if (cData.cellType !== 'check') { return false; }
  };

  view.onCellEditable = (grid, itemIndex) => {
    const nowDateTime = Number(dayjs().format('YYYYMMDDHHmm'));
    const { bizStrtdt, bizStrtHh, bizEnddt, bizEndHh } = aplcCloseData.value;

    const strtDtHh = `${bizStrtdt}${bizStrtHh ?? ''}`;
    const endDtHh = `${bizEnddt}${bizEndHh ?? ''}`;

    const { bfsvcCsmbDdlvStatCd } = grid.getValues(itemIndex.itemIndex);

    if ((!isBusinessSupportTeam.value && !(nowDateTime >= Number(strtDtHh) && nowDateTime <= Number(endDtHh)))
    || (!isBusinessSupportTeam.value && bfsvcCsmbDdlvStatCd === '20')
    || bfsvcCsmbDdlvStatCd === '30') {
      return false;
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    grid.checkItem(itemIndex, true);
    const { fieldName } = grid.getColumn(fieldIndex);

    const aplcQty = view.getValue(row, fieldIndex);

    if (fieldName.indexOf('aplcQty') !== -1) {
      const sapMatCd = grid.getColumn(fieldIndex).header.text;
      const aplcLmQty = aplcLmQtyData.value.find((obj) => obj.sapMatCd === sapMatCd)?.bfsvcCsmbAplcLmQty;

      if (Number(aplcQty) > Number(aplcLmQty)) {
        // 신청 제한 수량을 초과하였습니다.
        await alert(`${t('MSG_ALT_APLC_LM_ENU_OVR')}\n[${t('MSG_TXT_APLC_LM_QTY')} : ${aplcLmQty}]`);
        view.setValue(row, fieldIndex, 0);
      }
    }
  };

  view.setCheckableCallback((dataSource, item) => {
    const { bfsvcCsmbDdlvStatCd } = gridUtil.getRowValue(view, item.dataRow);

    // 출고요청완료 이거나 업무담당이면서 신청확인인 경우
    if (bfsvcCsmbDdlvStatCd === '30' || (!isBusinessSupportTeam.value && bfsvcCsmbDdlvStatCd === '20')) {
      return false;
    }
    return true;
  }, true);
});

</script>
