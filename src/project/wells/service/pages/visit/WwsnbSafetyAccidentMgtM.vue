<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSafetyAccidentMgtM - 안전사고 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.06.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어가 AS처리 중에 발생한 안전사고 결과 내역을 조회하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          colspan="2"
        >
          <kw-select
            v-model="searchParams.searchOption"
            class="w150"
            :options="searchOptions"
          />
          <kw-date-range-picker
            v-model:from="searchParams.searchDtFrom"
            v-model:to="searchParams.searchDtTo"
          />
          <kw-field
            v-if="searchParams.searchOption === '2'"
            v-model="searchParams.fshDtYn"
            class="w75"
          >
            <template
              v-if="searchParams.searchOption === '2'"
              #default="{ field }"
            >
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_FSH_EXCD')"
                val=""
              />
            </template>
          </kw-field>
        </kw-search-item>
        <!-- 제목 -->
        <kw-search-item
          :label="$t('MSG_TXT_TTL')"
        >
          <kw-input
            v-model="searchParams.acdnRcpNm"
          />
        </kw-search-item>
        <!-- 제품명-->
        <kw-search-item
          :label="$t('MSG_TXT_GOODS_NM')"
        >
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객명 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-if="svcCode.length !== 1"
            v-model="searchParams.svCnrOgId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
          <kw-select
            v-if="svcCode.length === 1"
            v-model="searchParams.svCnrOgId"
            :options="svcCode"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <kw-input
            v-model="searchParams.cntrDtlNo"
          />
        </kw-search-item>
        <!-- 보상진행 -->
        <kw-search-item
          :label="$t('MSG_TXT_CPS_PRGS')"
        >
          <kw-select
            v-model="searchParams.cpsPrgsCd"
            :options="codes.CPS_PRGS_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 귀책구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_IMPTA_DV')"
        >
          <kw-select
            v-model="searchParams.imptaRsonCd"
            :options="codes.IMPTA_RSON_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 총보상액 -->
        <kw-search-item
          :label="$t('MSG_TXT_TOT_CPS_AMT') "
        >
          <kw-input
            v-model="searchParams.totCpsAmt"
            maxlength="20"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- <kw-search-row> -->
      <!-- 등록일자 -->
      <!-- <kw-search-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rgstDtmFrom"
            v-model:to="searchParams.rgstDtmTo"
          />
        </kw-search-item> -->
      <!-- 완료일자 -->
      <!-- <kw-search-item
          :label="$t('MSG_TXT_FSH_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.fshDtFrom"
            v-model:to="searchParams.fshDtTo"
          />
          <kw-field
            v-model="searchParams.fshDtYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_FSH_EXCD')"
                val=""
              />
            </template>
          </kw-field>
        </kw-search-item> -->
      <!-- </kw-search-row> -->
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

        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="(pageInfo.totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:print
          dense
          secondary
          :label="$t('MSG_TXT_AGR_PRNT')"
          @click="onClickAgreementPrint"
        />
        <kw-btn
          v-permission:print
          dense
          secondary
          :label="$t('MSG_TXT_ACDN_RPOT_PRNT')"
          @click="onClickAccidentReportPrint"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_RGST')"
          @click="onClickRegist"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
  stringUtil,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const { modal, notify } = useGlobal();
const grdMainRef = ref(getComponentType('KwGrid'));
const { t } = useI18n();
const { currentRoute } = useRouter();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const sessionUserInfo = getUserInfo();
const codes = await codeUtil.getMultiCodes(
  'CPS_PRGS_CD',
  'IMPTA_RSON_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const searchOptions = [
  { codeId: '1', codeName: t('MSG_TXT_FST_RGST_DT') }, // 등록일자
  { codeId: '2', codeName: t('MSG_TXT_FSH_DT') }, // 완료일자
];

const sessionRole = sessionUserInfo.roles.map((x) => x.roleNickName);
let svcCode;
svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
if (!sessionRole.includes('ROL_W1560')) { // WellsCS운영팀이 아니면
  svcCode = svcCode.filter((v) => v.ogId === sessionUserInfo.ogId);
}
const searchParams = ref({
  svCnrOgId: (svcCode.length === 1 ? svcCode[0].ogId : ''),
  vstDtFrom: dayjs().subtract(3, 'month').format('YYYYMMDD'),
  vstDtTo: dayjs().format('YYYYMMDD'),
  acdnRcpNm: '',
  cstNm: '',
  cntrDtlNo: '',
  cntrNo: '',
  cntrSn: '',
  pdNm: '',
  imptaRsonCd: '',
  rgstDtmFrom: dayjs().format('YYYYMMDD'),
  rgstDtmTo: dayjs().format('YYYYMMDD'),
  fshDtFrom: '',
  fshDtTo: '',
  fshDtYn: 'N',
  totCpsAmt: '',
  device: 'W',
  searchOption: '1',
});
let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/safety-accidents/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/safety-accidents/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: places, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(places);
  view.clearCurrent();
}

async function onClickSearch() {
  const splited = (searchParams.value.cntrDtlNo).split('-');
  searchParams.value.cntrNo = splited[0];
  searchParams.value.cntrSn = splited[1];

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickAgreementPrint() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  const { acdnRcpId } = chkRows[0];
  const ozParam = ref({
    args: {
      searchApiUrl: `/api/v1/anonymous/sms/wells/service/safety-accident-agreement/${acdnRcpId}`,
    },
    height: 1600,
    width: 1300,
  });

  // 조회 팝업
  openReportPopup(
    '/kyowon_as/safetyAccidentAgr.ozr',
    '/kyowon_as/safetyAccidentAgr.odi',
    JSON.stringify(ozParam.value.args),
    { width: ozParam.width, height: ozParam.height },
  );
}

async function onClickAccidentReportPrint() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const acdnRcpId = (chkRows.length === 0 ? '' : chkRows[0].acdnRcpId);
  await modal({
    component: 'WwsnbSafetyAccidentReportP',
    componentProps: {
      acdnRcpId,
    },
  });
}

async function onClickRegist() {
  await modal({
    component: 'WwsnbSafetyAccidentRegP',
    componentProps: {
      acdnRcpId: '',
    },
  });
  onClickSearch();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fshDt' },
    { fieldName: 'finishYn' }, // 완료여부
    { fieldName: 'agrDocRcvYn' }, // 합의서수신여부
    { fieldName: 'rcpdt' },
    { fieldName: 'pdNm' },
    { fieldName: 'cstNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'acdnRcpId' },
    { fieldName: 'acdnRcpNm' },
    { fieldName: 'tno' },
    { fieldName: 'mpno' },
    { fieldName: 'istAdr' },
    { fieldName: 'istDtlAdr' },
    { fieldName: 'istReferAdr' },
    { fieldName: 'istDt' }, // 설치일시
    { fieldName: 'acdnDtm' }, // 사고일시
    { fieldName: 'fstRgstUsrId' }, // 등록자
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'rcpMoCn' }, // 접수내용
    { fieldName: 'acdnCausCn' }, // 사고원인
    { fieldName: 'cstDmdCn' }, // 고객요구
    { fieldName: 'acdnRsCn' }, // 결과
    { fieldName: 'fnlMdfcDtm' }, // 수정일자
    { fieldName: 'rptrNm' }, // 보고자명
    { fieldName: 'svCnrNm' },
    { fieldName: 'imptaRsonNm' },
    { fieldName: 'cpsPrgsNm' },
    { fieldName: 'totCpsAmt', dataType: 'number' },
    { fieldName: 'kwCpsAmt', dataType: 'number' },
    { fieldName: 'insrcoCpsAmt', dataType: 'number' },
  ];

  const columns = [
    {
      fieldName: 'finishYn',
      header: t('MSG_TXT_FSH_YN'),
      width: '100',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { fshDt } = grid.getValues(index.itemIndex, 'fshDt');
        return (isEmpty(fshDt) ? 'N' : 'Y');
      },
    },
    {
      fieldName: 'agrDocRcvYn',
      header: t('MSG_TXT_AGR_SIGN_YN'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'rcpdt',
      header: t('MSG_TXT_AS_RCP_DT'),
      width: '100',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_GOODS_NM'),
      width: '200',
    },
    {
      fieldName: 'cstNm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '200',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (grid, index) => {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    {
      fieldName: 'acdnRcpNm',
      header: t('MSG_TXT_TTL'),
      width: '200',
    },
    {
      fieldName: 'tno',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'mpno',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'istAdr',
      header: t('MSG_TXT_ADDR'),
      width: '250',
    },
    {
      fieldName: 'istDtlAdr',
      header: t('MSG_TXT_DETAIL_ADDR'),
      width: '250',
    },
    {
      fieldName: 'istReferAdr',
      header: t('MSG_TXT_REFER_ADR'),
      width: '200',
    },
    {
      fieldName: 'istDt',
      header: t('MSG_TXT_IST_DT'),
      width: '100',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'acdnDtm',
      header: t('MSG_TXT_ACDN_DTM'),
      width: '150',
      displayCallback: (grid, index) => {
        const { acdnDtm } = grid.getValues(index.itemIndex);
        return stringUtil.getDatetimeFormat(acdnDtm);
      },
    },
    {
      fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_FST_RGST_USR'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_RGST_DTM'),
      width: '150',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'rcpMoCn',
      header: t('MSG_TXT_RCP_CN'),
      width: '250',
    },
    {
      fieldName: 'acdnCausCn',
      header: t('MSG_TXT_ACDN_CAUS'),
      width: '250',
    },
    {
      fieldName: 'cstDmdCn',
      header: t('MSG_TXT_CST_DMD'),
      width: '150',
    },
    {
      fieldName: 'acdnRsCn',
      header: t('MSG_TXT_RSULT'),
      width: '150',
    },
    {
      fieldName: 'fnlMdfcDtm',
      header: t('MSG_TXT_MDFC_DATE'),
      width: '150',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'rptrNm',
      header: t('MSG_TXT_RPTR'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'svCnrNm',
      header: t('MSG_TXT_CNT_NM'),
      width: '100',
    },
    {
      fieldName: 'imptaRsonNm',
      header: t('MSG_TXT_IMPTA_YN'),
      width: '100',
    },
    {
      fieldName: 'cpsPrgsNm',
      header: t('MSG_TXT_CPS_PRGS'),
      width: '100',
    },
    {
      fieldName: 'totCpsAmt',
      header: t('MSG_TXT_TOT_CPS_AMT'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
    {
      fieldName: 'kwCpsAmt',
      header: t('MSG_TXT_KW_BU'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
    {
      fieldName: 'insrcoCpsAmt',
      header: t('MSG_TXT_INSRCO_BU'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
  ];

  const columnLayout = [
    'finishYn',
    'agrDocRcvYn',
    'rcpdt',
    'acdnDtm',
    'pdNm',
    'cstNm',
    'cntrNo',
    'acdnRcpNm',
    'tno',
    'mpno',
    'istAdr',
    'istDtlAdr',
    'istDt',
    'svCnrNm',
    'fstRgstUsrId',
    'fstRgstDtm',
    'fnlMdfcDtm',
    'rcpMoCn',
    'acdnCausCn',
    'cstDmdCn',
    'rptrNm',
    'imptaRsonNm',
    'cpsPrgsNm',
    'totCpsAmt',
    'kwCpsAmt',
    'insrcoCpsAmt',
    'acdnRsCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true; // create checkbox column
  view.checkBar.exclusive = true; // 한 행만 체크 가능.
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (grid, index) => {
    if (index.column === 'cntrNo') {
      const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };

  view.onCellDblClicked = async (g, clickData) => {
    const { acdnRcpId } = g.getValues(clickData.itemIndex);
    await modal({
      component: 'WwsnbSafetyAccidentRegP',
      componentProps: {
        acdnRcpId,
      },
    });
    await fetchData();
  };
});
</script>
