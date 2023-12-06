<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbDeliveryAggregatePsM(W-SV-U-0294M01) - BS소모품 배부집계 현황
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.05.16
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 빌딩별 BS소모품 관리계정 및 배부 현황 조회 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.mngtYmFrom"
            v-model:to="searchParams.mngtYmTo"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            type="month"
            rules="required|date_range_months:6"
            @change="onChangeMngtYm"
          />
        </kw-search-item>
        <!-- 빌딩명 -->
        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
          <kw-select
            v-model="searchParams.bldCds"
            :options="bldCodes"
            multiple
            option-value="bldCd"
            option-label="bldNm"
          />
        </kw-search-item>
        <!-- 구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.bfsvcCsmbDdlvOjCd"
            :options="codes.BFSVC_CSMB_DDLV_OJ_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목명 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-select
            v-model="searchParams.itmCd"
            :options="itmCodes"
            first-option="all"
            option-value="pdCd"
            option-label="pdNm"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
        >
          <kw-input
            v-model="searchParams.sapCdFrom"
            :label="$t('MSG_TXT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapCdTo"
            :label="$t('MSG_TXT_SAP_CD')"
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
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
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
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, codeUtil, getComponentType, useMeta, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'BFSVC_CSMB_DDLV_OJ_CD',
);

const searchParams = ref({
  mngtYmFrom: dayjs().add(-5, 'month').format('YYYYMM'),
  mngtYmTo: dayjs().format('YYYYMM'),
  bldCds: [],
  itmCd: '',
  bfsvcCsmbDdlvOjCd: '',
  sapCdFrom: '',
  sapCdTo: '',
});

const bldCodes = ref();
const itmCodes = ref();
let colItems = [];

// 품목코드 조회
async function getItemCode() {
  const res = await dataService.get('/sms/wells/service/delivery-bases/item-information');
  itmCodes.value = res.data;
}

// 빌딩명 조회
async function getBldCode() {
  const { mngtYmFrom, mngtYmTo } = searchParams.value;
  if (isEmpty(mngtYmFrom) || isEmpty(mngtYmTo)) {
    bldCodes.value = [];
    return;
  }

  const res = await dataService.get('/sms/wells/service/delivery-aggregates/building-code', { params: { ...searchParams.value } });
  bldCodes.value = res.data;
}

// SAP 시작코드 변경 시
function onChangeStrtSapCd() {
  const { sapCdFrom, sapCdTo } = searchParams.value;

  if (!isEmpty(sapCdFrom) && !isEmpty(sapCdTo) && sapCdFrom > sapCdTo) {
    searchParams.value.sapCdFrom = sapCdFrom;
    searchParams.value.sapCdTo = sapCdTo;
  }
}

// SAP 종료코드 변경 시
function onChangeEndSapCd() {
  const { sapCdFrom, sapCdTo } = searchParams.value;

  if (!isEmpty(sapCdFrom) && !isEmpty(sapCdTo) && sapCdFrom > sapCdTo) {
    searchParams.value.sapCdFrom = sapCdFrom;
    searchParams.value.sapCdTo = sapCdTo;
  }
}

let cachedParams;

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/delivery-aggregates', { params: { ...cachedParams }, timeout: 300000 });
  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 조회버튼 클릭 시
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 조회기간 변경 시
async function onChangeMngtYm() {
  const { mngtYmFrom, mngtYmTo } = searchParams.value;

  if (isEmpty(mngtYmFrom) || isEmpty(mngtYmTo)) return;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  colItems = [];
  data.setFields([]);
  view.setColumns(null);
  view.setColumnLayout([]);

  const fields = [
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'csmbPdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 품목명
    { fieldName: 'nwcmr' }, // 신입 배부유형
    { fieldName: 'indv' }, // 개인 배부유형
    { fieldName: 'bld' }, // 빌딩 배부유형
    { fieldName: 'ddlvQtySum', dataType: 'number' }, // 배부수량 합계
    { fieldName: 'vstAccSum', dataType: 'number' }, // 방문 계정 수 합계
    { fieldName: 'bdtIndv', dataType: 'number' }, // 비데(개인)
    { fieldName: 'bdtCrp', dataType: 'number' }, // 비데(법인)
    { fieldName: 'wrfr', dataType: 'number' }, // 정수기
    { fieldName: 'arcleIndv', dataType: 'number' }, // 공기청정기(개인)
    { fieldName: 'arcleCrp', dataType: 'number' }, // 공기청정기(법인)
    { fieldName: 'wtrSftnr', dataType: 'number' }, // 연수기
    { fieldName: 'msgcr', dataType: 'number' }, // 안마의자
    { fieldName: 'cffMchn', dataType: 'number' }, // 커피머신
    { fieldName: 'dryr', dataType: 'number' }, // 건조기
    { fieldName: 'wash', dataType: 'number' }, // 세탁기
    { fieldName: 'ardrssr', dataType: 'number' }, // 에어드레서
    { fieldName: 'sscling', dataType: 'number' }, // 삼성청소기
  ];

  const columns = [
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'csmbPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'nwcmr', header: t('MSG_TXT_NWCMR'), width: '80', styleName: 'text-center' },
    { fieldName: 'indv', header: t('MSG_TXT_INDV'), width: '80', styleName: 'text-center' },
    { fieldName: 'bld', header: t('MSG_TXT_BUILDING'), width: '80', styleName: 'text-center' },
    { fieldName: 'ddlvQtySum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'vstAccSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'wrfr', header: t('MSG_TXT_WRFR'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtIndv', header: t('MSG_TXT_BDT_INDV'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtCrp', header: t('MSG_TXT_BDT_CRP'), width: '80', styleName: 'text-right' },
    { fieldName: 'arcleIndv', header: t('MSG_TXT_ARCLE_INDV'), width: '120', styleName: 'text-right' },
    { fieldName: 'arcleCrp', header: t('MSG_TXT_ARCLE_CRP'), width: '120', styleName: 'text-right' },
    { fieldName: 'wtrSftnr', header: t('MSG_TXT_WTST'), width: '80', styleName: 'text-right' },
    { fieldName: 'cffMchn', header: t('MSG_TXT_CFF_MCHN'), width: '80', styleName: 'text-right' },
    { fieldName: 'msgcr', header: t('MSG_TXT_MSGCR'), width: '80', styleName: 'text-right' },
    { fieldName: 'dryr', header: t('MSG_TXT_DRYER'), width: '80', styleName: 'text-right' },
    { fieldName: 'wash', header: t('MSG_TXT_WASHER'), width: '80', styleName: 'text-right' },
    { fieldName: 'ardrssr', header: t('MSG_TXT_ARDRSSR'), width: '80', styleName: 'text-right' },
    { fieldName: 'sscling', header: t('MSG_TXT_SS_CLING_MCHN'), width: '80', styleName: 'text-right' },
  ];

  const strtYear = Number(mngtYmFrom.substring(0, 4));
  const endYear = Number(mngtYmTo.substring(0, 4));
  const strtMonth = Number(mngtYmFrom.substring(4));
  const endMonth = Number(mngtYmTo.substring(4));

  const monthCount = ((endYear - strtYear) * 12 + (endMonth - strtMonth)) + 1;
  let yy = Number(searchParams.value.mngtYmFrom.substring(2, 4));
  let mm = strtMonth;
  let mmCnt = (6 - monthCount);

  colItems.push('ddlvQtySum');

  for (let i = 1; i <= monthCount; i += 1) {
    const headerNm = `${yy}${t('MSG_TXT_YEAR')} ${mm}${t('MSG_TXT_MON')}`;
    const fieldNm = `mm${mmCnt + 1}Qty`;

    fields.push({ fieldName: fieldNm, dataType: 'number' });
    columns.push({
      fieldName: fieldNm,
      header: headerNm,
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
    });

    colItems.push(fieldNm);

    mm += 1;
    mmCnt += 1;

    if (mm > 12) {
      mm = 1;
      yy += 1;
    }
  }

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bldCd', 'bldNm', 'sapMatCd', 'csmbPdCd', 'pdNm',
    {
      header: t('MSG_TXT_DDLV_TP'),
      direction: 'horizontal',
      items: ['nwcmr', 'indv', 'bld'],
    },
    {
      header: t('MSG_TXT_DDLV_QTY'),
      direction: 'horizontal',
      items: colItems,
    },
    {
      header: t('MSG_TXT_VST_ACC'),
      direction: 'horizontal',
      items: ['vstAccSum', 'wrfr', 'bdtIndv', 'bdtCrp', 'arcleIndv', 'arcleCrp', 'wtrSftnr', 'cffMchn', 'msgcr', 'dryr', 'wash', 'ardrssr', 'sscling'],
    },
  ]);

  await getBldCode();
}

onMounted(async () => {
  await getBldCode();
  await getItemCode();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'csmbPdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 품목명
    { fieldName: 'nwcmr' }, // 신입 배부유형
    { fieldName: 'indv' }, // 개인 배부유형
    { fieldName: 'bld' }, // 빌딩 배부유형
    { fieldName: 'ddlvQtySum', dataType: 'number' }, // 배부수량 합계
    { fieldName: 'vstAccSum', dataType: 'number' }, // 방문 계정 수 합계
    { fieldName: 'bdtIndv', dataType: 'number' }, // 비데(개인)
    { fieldName: 'bdtCrp', dataType: 'number' }, // 비데(법인)
    { fieldName: 'wrfr', dataType: 'number' }, // 정수기
    { fieldName: 'arcleIndv', dataType: 'number' }, // 공기청정기(개인)
    { fieldName: 'arcleCrp', dataType: 'number' }, // 공기청정기(법인)
    { fieldName: 'wtrSftnr', dataType: 'number' }, // 연수기
    { fieldName: 'msgcr', dataType: 'number' }, // 안마의자
    { fieldName: 'cffMchn', dataType: 'number' }, // 커피머신
    { fieldName: 'dryr', dataType: 'number' }, // 건조기
    { fieldName: 'wash', dataType: 'number' }, // 세탁기
    { fieldName: 'ardrssr', dataType: 'number' }, // 에어드레서
    { fieldName: 'sscling', dataType: 'number' }, // 삼성청소기
  ];

  const columns = [
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'csmbPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'nwcmr', header: t('MSG_TXT_NWCMR'), width: '80', styleName: 'text-center' },
    { fieldName: 'indv', header: t('MSG_TXT_INDV'), width: '80', styleName: 'text-center' },
    { fieldName: 'bld', header: t('MSG_TXT_BUILDING'), width: '80', styleName: 'text-center' },
    { fieldName: 'ddlvQtySum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'vstAccSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'wrfr', header: t('MSG_TXT_WRFR'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtIndv', header: t('MSG_TXT_BDT_INDV'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtCrp', header: t('MSG_TXT_BDT_CRP'), width: '80', styleName: 'text-right' },
    { fieldName: 'arcleIndv', header: t('MSG_TXT_ARCLE_INDV'), width: '120', styleName: 'text-right' },
    { fieldName: 'arcleCrp', header: t('MSG_TXT_ARCLE_CRP'), width: '120', styleName: 'text-right' },
    { fieldName: 'wtrSftnr', header: t('MSG_TXT_WTST'), width: '80', styleName: 'text-right' },
    { fieldName: 'cffMchn', header: t('MSG_TXT_CFF_MCHN'), width: '80', styleName: 'text-right' },
    { fieldName: 'msgcr', header: t('MSG_TXT_MSGCR'), width: '80', styleName: 'text-right' },
    { fieldName: 'dryr', header: t('MSG_TXT_DRYER'), width: '80', styleName: 'text-right' },
    { fieldName: 'wash', header: t('MSG_TXT_WASHER'), width: '80', styleName: 'text-right' },
    { fieldName: 'ardrssr', header: t('MSG_TXT_ARDRSSR'), width: '80', styleName: 'text-right' },
    { fieldName: 'sscling', header: t('MSG_TXT_SS_CLING_MCHN'), width: '80', styleName: 'text-right' },
  ];

  const { mngtYmFrom, mngtYmTo } = searchParams.value;

  const strtYear = Number(mngtYmFrom.substring(0, 4));
  const endYear = Number(mngtYmTo.substring(0, 4));
  const strtMonth = Number(mngtYmFrom.substring(4));
  const endMonth = Number(mngtYmTo.substring(4));

  const monthCount = ((endYear - strtYear) * 12 + (endMonth - strtMonth)) + 1;
  let yy = Number(searchParams.value.mngtYmFrom.substring(2, 4));
  let mm = strtMonth;
  let mmCnt = (6 - monthCount);

  colItems.push('ddlvQtySum');

  for (let i = 1; i <= monthCount; i += 1) {
    const headerNm = `${yy}${t('MSG_TXT_YEAR')} ${mm}${t('MSG_TXT_MON')}`;
    const fieldNm = `mm${mmCnt + 1}Qty`;

    fields.push({ fieldName: fieldNm, dataType: 'number' });
    columns.push({
      fieldName: fieldNm,
      header: headerNm,
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
    });

    colItems.push(fieldNm);

    mm += 1;
    mmCnt += 1;

    if (mm > 12) {
      mm = 1;
      yy += 1;
    }
  }

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bldCd', 'bldNm', 'sapMatCd', 'csmbPdCd', 'pdNm',
    {
      header: t('MSG_TXT_DDLV_TP'),
      direction: 'horizontal',
      items: ['nwcmr', 'indv', 'bld'],
    },
    {
      header: t('MSG_TXT_DDLV_QTY'),
      direction: 'horizontal',
      items: colItems,
    },
    {
      header: t('MSG_TXT_VST_ACC'),
      direction: 'horizontal',
      items: ['vstAccSum', 'wrfr', 'bdtIndv', 'bdtCrp', 'arcleIndv', 'arcleCrp', 'wtrSftnr', 'cffMchn', 'msgcr', 'dryr', 'wash', 'ardrssr', 'sscling'],
    },
  ]);
});
</script>
