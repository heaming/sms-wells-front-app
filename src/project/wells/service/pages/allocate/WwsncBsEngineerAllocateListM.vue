<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncBsEngineerAllocateListM(K-W-SV-U-0147M01) - B/S배정현황(엔지니어)
3. 작성자 : jaehunlee
4. 작성일 : 2023.09.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 엔지니어 배정현황 (http://localhost:3000/#/service/wwsnc-bs-engineer-allocate-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
          :colspan="1"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SRVC_CNTR')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w180"
            @update:model-value="onUpdateSvcCode"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EGER')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.engId"
            :options="engineers"
            first-option="all"
            class="w200"
          />
          <kw-field
            v-model="searchParams.rgsnYn"
            @update:model-value="onUpdateRgsnYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.pdGrpCds"
            :options="codes.PD_GRP_CD"
            multiple
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WK_CNTN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.svBizDclsfCds"
            :options="filterSvBizDclsfCd"
            multiple
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_ALL_PS') }}</h3>
      <kw-grid
        ref="grdSubRef1"
        :visible-rows="1"
        @init="initGrid1"
      />

      <h3>{{ $t('MSG_TXT_PENDING') + $t('MSG_TXT_DTL_PS') }}</h3>
      <kw-grid
        ref="grdSubRef2"
        :visible-rows="1"
        @init="initGrid2"
      />

      <h3>{{ $t('MSG_TXT_EXCD') + $t('MSG_TXT_DTL_PS') }}</h3>
      <kw-grid
        ref="grdSubRef3"
        :visible-rows="1"
        @init="initGrid3"
      />

      <kw-action-top class="mt30">
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        @init="initGrid4"
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
import { useDataService, codeUtil, useMeta, gridUtil, getComponentType, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const router = useRouter();
const { t } = useI18n();
const { modal, alert } = useGlobal();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD', // 상품그룹
  'SV_BIZ_DCLSF_CD', // 작업내용(업무유형 세분류)
  'COD_PAGE_SIZE_OPTIONS',
);
const filterSvBizDclsfCd = ref([]);
filterSvBizDclsfCd.value = codes.SV_BIZ_DCLSF_CD.filter((v) => v.codeId.substring(0, 1) === '2');

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const engineers = ref([]);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  ogId: '',
  engId: '',
  rgsnYn: 'Y',
  pdGrpCds: [],
  svBizDclsfCds: [],
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function setEngineers() {
  if (searchParams.value.ogId === '') {
    engineers.value = [];
  } else {
    const eng = (await dataService.get('/sms/wells/service/organizations/engineer', { params: { dgr1LevlOgId: searchParams.value.ogId, authYn: 'N' } })).data;
    if (searchParams.value.rgsnYn === 'Y') {
      const wrkEngByOdId = eng.filter((v) => v.cltnDt === null || v.cltnDt === '');
      engineers.value = wrkEngByOdId.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
      return;
    }
    engineers.value = eng.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
  }
}

async function onUpdateSvcCode() {
  searchParams.value.engId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.engId = '';
  setEngineers();
}

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef1 = ref(getComponentType('KwGrid'));
const grdSubRef2 = ref(getComponentType('KwGrid'));
const grdSubRef3 = ref(getComponentType('KwGrid'));

async function aggregateData() {
  // 전체현황
  const grid1 = [
    {
      col1: 0, // 전체
      col2: 0, // 전체(제외)
      col3: 0, // 작업완료
      col4: 0, // 작업대기
      col5: 0, // 작업제외
      col6: 0, // 처리율(%)
    },
  ];

  // 대기상세현황
  const grid2 = [
    {
      col1: 0, // 문자
      col2: 0, // 안내
      col3: 0, // 월초
      col4: 0, // 월중
      col5: 0, // 월말
      col6: 0, // 빈칸
    },
  ];

  // 제외상세현황
  const grid3 = [
    {
      col1: 0, // 두절
      col2: 0, // 만료
      col3: 0, // 이관
      col4: 0, // 익월
      col5: 0, // 취소
      col6: 0, // 취예
      col7: 0, // 판매
      col8: 0, // 방문중지
      col9: 0, // 거부
    },
  ];
  const res = await dataService.get('/sms/wells/service/bs-engineer-allocate/aggregate', { params: { ...cachedParams } });

  for (let i = 0; i < res.data.length; i += 1) {
    if (res.data[i].vstPrgsStatCd === '00') {
      if (res.data[i].statNmDtl === '문자') grid2[0].col1 += 1;
      else if (res.data[i].statNmDtl === '안내') grid2[0].col2 += 1;
      else if (res.data[i].statNmDtl === '월초') grid2[0].col3 += 1;
      else if (res.data[i].statNmDtl === '월중') grid2[0].col4 += 1;
      else if (res.data[i].statNmDtl === '월말') grid2[0].col5 += 1;
      else if (res.data[i].statNmDtl === '') grid2[0].col6 += 1;

      else if (res.data[i].statNmDtl === '두절') grid3[0].col1 += 1;
      else if (res.data[i].statNmDtl === '만료') grid3[0].col2 += 1;
      else if (res.data[i].statNmDtl === '이관') grid3[0].col3 += 1;
      else if (res.data[i].statNmDtl === '익월') grid3[0].col4 += 1;
      else if (res.data[i].statNmDtl === '취소') grid3[0].col5 += 1;
      else if (res.data[i].statNmDtl === '취예') grid3[0].col6 += 1;
      else if (res.data[i].statNmDtl === '판매') grid3[0].col7 += 1;
      else if (res.data[i].statNmDtl === '거부') grid3[0].col9 += 1;
    } else if (res.data[i].vstPrgsStatCd === '20') grid1[0].col3 += 1;
    else if (res.data[i].vstPrgsStatCd === '73') grid1[0].col3 += 1;
  }

  const waitTotal = grid2[0].col1 + grid2[0].col2 + grid2[0].col3 + grid2[0].col4 + grid2[0].col5 + grid2[0].col6;
  const exclTotal = grid3[0].col1 + grid3[0].col2 + grid3[0].col3 + grid3[0].col4 + grid3[0].col5 + grid3[0].col6
                  + grid3[0].col7 + grid3[0].col8 + grid3[0].col9;

  grid1[0].col1 = grid1[0].col3 + waitTotal + exclTotal;
  grid1[0].col2 = grid1[0].col3 + exclTotal;
  grid1[0].col4 = waitTotal;
  grid1[0].col5 = exclTotal;
  grid1[0].col6 = ((grid1[0].col3 / (grid1[0].col3 + waitTotal)) * 100).toFixed(2);

  const viewSub1 = grdSubRef1.value.getView();
  const viewSub2 = grdSubRef2.value.getView();
  const viewSub3 = grdSubRef3.value.getView();
  viewSub1.getDataSource().setRows(grid1);
  viewSub2.getDataSource().setRows(grid2);
  viewSub3.getDataSource().setRows(grid3);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/bs-engineer-allocate/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  await aggregateData();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/bs-engineer-allocate/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function getPhoneNo(locaraTno, exnoEncr, idvTno) {
  if (isEmpty(locaraTno) || isEmpty(exnoEncr) || isEmpty(idvTno)) return '';
  return `${locaraTno}-${exnoEncr}-${idvTno}`;
}

function getCntrNo(cntrNo, cntrSn) {
  if (isEmpty(cntrNo) || isEmpty(cntrSn)) return '';
  return `${cntrNo}-${cntrSn}`;
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid1(data, view) {
  const fields = [
    { fieldName: 'col1', dataType: 'number' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ALL'), width: '150', styleName: 'text-center' },
    { fieldName: 'col2', header: `${t('MSG_TXT_ALL')}(${t('MSG_TXT_EXCD')})`, width: '150', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_WK_FSH'), width: '150', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_WORK_PENDING'), width: '150', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_OSTR_WK') + t('MSG_TXT_EXCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_PROCS_RT'), width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

function initGrid2(data, view) {
  const fields = [
    { fieldName: 'col1', dataType: 'number' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CHAR'), width: '150', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_GUIDANCE'), width: '150', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_BOMN'), width: '150', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_MNWL'), width: '150', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EOM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_NULL'), width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
}

function initGrid3(data, view) {
  const fields = [
    { fieldName: 'col1', dataType: 'number' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CUT_OFF'), width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_EXN'), width: '130', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_TF'), width: '130', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_NTXM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CANCEL'), width: '130', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_EXP'), width: '130', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_SELL'), width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_VST') + t('MSG_TXT_STP'), width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_NGTV'), width: '130', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
}

function initGrid4(data, view) {
  const fields = [
    { fieldName: 'barcodeIssue' },
    { fieldName: 'cstGd' },
    { fieldName: 'spcAsTp' },
    { fieldName: 'contYn' },
    { fieldName: 'vstPrgsStat' },
    { fieldName: 'statNmDtl' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'telNo' },
    { fieldName: 'phoneNo' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellTp' },
    { fieldName: 'mngerRglvlDv' },
    { fieldName: 'expPart' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'adrDtl' },
    { fieldName: 'ogNm' },
    { fieldName: 'svBizDclsf' },
    { fieldName: 'bfVstDuedt' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'vstExpDuedt' },
    { fieldName: 'vstExpHh' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'vstFshHh' },
    { fieldName: 'cstUnuitmCn' },
    { fieldName: 'fstRgstDt' },
    { fieldName: 'fstRgstTm' },
    { fieldName: 'engOgNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'hirFom' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'feamSite' },
    { fieldName: 'svProcsCn' },
    { fieldName: 'cstSignCn' },
    { fieldName: 'chngs' },
  ];

  const columns = [
    { fieldName: 'barcodeIssue', header: t('MSG_TXT_BARCODE'), width: '90', styleName: 'text-center' },
    { fieldName: 'cstGd', header: t('MSG_TXT_CST_GRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'spcAsTp', header: t('MSG_TXT_SPC_AS'), width: '100' },
    { fieldName: 'contYn', header: t('MSG_TXT_CTT_FSH'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstPrgsStat', header: t('MSG_TXT_PRGS_STATUS'), width: '100', styleName: 'text-center' },
    { fieldName: 'statNmDtl', header: t('MSG_TXT_STATUS_DTL'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (grid, index) => {
        const { cntrNo, cntrSn } = grid.getValues(index.dataRow);
        return getCntrNo(cntrNo, cntrSn);
      } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '110', styleName: 'text-center' },
    { fieldName: 'telNo',
      header: t('MSG_TXT_CONTACT'),
      width: '170',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { locaraTno, exnoEncr, idvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(locaraTno, exnoEncr, idvTno);
      } },
    { fieldName: 'phoneNo',
      header: t('MSG_TXT_MPNO'),
      width: '170',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(cralLocaraTno, mexnoEncr, cralIdvTno);
      } },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'sellTp', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngerRglvlDv', header: t('MSG_TXT_RGLVL'), width: '100', styleName: 'text-left' },
    { fieldName: 'expPart',
      header: t('MSG_TXT_EXP_PART'),
      width: '100',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      displayCallback: () => '+' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_IST_ZIP'), width: '136', styleName: 'text-center' },
    { fieldName: 'adrDtl', header: t('MSG_TXT_ADDR'), width: '280', styleName: 'text-left' },
    { fieldName: 'ogNm', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'svBizDclsf', header: t('MSG_TXT_WK_CNTN'), width: '200', styleName: 'text-left' },
    { fieldName: 'bfVstDuedt', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_VST_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: t('MSG_TXT_UPCMG_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstExpDuedt', header: t('MSG_TXT_PROM_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstExpHh', header: t('MSG_TXT_PROM_HH'), width: '110', styleName: 'text-center' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_FSH_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstFshHh', header: t('MSG_TXT_FSH_HH'), width: '110', styleName: 'text-center' },
    { fieldName: 'cstUnuitmCn', header: t('MSG_TXT_UNUITM'), width: '250', styleName: 'text-left' },
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_IN_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_IN_HH'), width: '110', styleName: 'text-center' },
    { fieldName: 'engOgNm', header: t('MSG_TXT_PIC_BLG'), width: '140', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC') + t('MSG_TXT_EMPL_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_CNT_PER'), width: '110', styleName: 'text-center' },
    { fieldName: 'hirFom', header: t('MSG_TXT_PSTN_DV'), width: '130', styleName: 'text-left' },
    { fieldName: 'siteAwAtcCd', header: t('MSG_TXT_AW') + t('MSG_TXT_ITEM'), width: '150', styleName: 'text-left' },
    { fieldName: 'feamSite', header: `${t('MSG_TXT_AW')}(${t('MSG_TXT_CUR_WON')})`, width: '130', styleName: 'text-right' },
    { fieldName: 'svProcsCn', header: t('MSG_TXT_PROCS_IZ'), width: '250', styleName: 'text-left' },
    { fieldName: 'cstSignCn',
      header: t('MSG_BTN_CST_SIGN'),
      width: '100',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: true,
      },
      displayCallback: () => t('MSG_BTN_CST_SIGN') },
    { fieldName: 'chngs', header: t('MSG_TXT_CHG_ANNM'), width: '140', styleName: 'text-center' },
  ];

  const columnLayout = [
    'barcodeIssue',
    'cstGd',
    'spcAsTp',
    'contYn',
    'vstPrgsStat',
    'statNmDtl',
    'cntrNo',
    'cstKnm',
    'telNo',
    'phoneNo',
    'pdNm',
    'sellTp',
    'mngerRglvlDv',
    'expPart',
    'newAdrZip',
    'adrDtl',
    'ogNm',
    'svBizDclsf',
    'bfVstDuedt',
    'vstDuedt',
    'vstExpDuedt',
    'vstExpHh',
    'vstFshDt',
    'vstFshHh',
    'cstUnuitmCn',
    'fstRgstDt',
    'fstRgstTm',
    'engOgNm',
    'prtnrNo',
    'prtnrKnm',
    'hirFom',
    'siteAwAtcCd',
    'feamSite',
    'svProcsCn',
    'cstSignCn',
    'chngs',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    } else if (column === 'cstSignCn') {
      const cstSignCn = g.getValue(itemIndex, 'cstSignCn');
      await modal({
        component: 'WwsnzSignPreviewP',
        componentProps: { sign: cstSignCn },
      });
    } else if (column === 'expPart') {
      alert('예정부품 팝업 개발 완료 시 적용 예정');
    }
  };
}

</script>
<style scoped></style>
