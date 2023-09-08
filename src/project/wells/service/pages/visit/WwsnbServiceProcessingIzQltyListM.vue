<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbServiceProcessingIzQltyListM - 서비스처리 내역(품질)
 3. 작성자 : hyewon.kim
 4. 작성일 : 2023.06.22
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 서비스처리 내역(품질) (http://localhost:3000/#/service/wwsnb-service-processing-iz-qlty-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.serviceType"
            :options="serviceTypes"
            first-option="all"
            class="w150"
          />
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w247"
          />
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            first-option="all"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>

        <!-- 유/무상구분 -->
        <kw-search-item :label="$t('MSG_TXT_REFRI_DV')">
          <kw-select
            v-model="searchParams.refriType"
            :options="refriTypes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w150"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            first-option="all"
            :disable="searchParams.pdGrpCd === ''"
          />
        </kw-search-item>

        <!-- 조회기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.inquiryBase"
            :options="inquiryBases"
            class="w247"
          />
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 업무유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="codes.SV_BIZ_DCLSF_CD"
            first-option="all"
          />
        </kw-search-item>

        <!-- 작업상태 -->
        <kw-search-item
          :label="$t('MSG_TXT_WK_STS')"
        >
          <kw-select
            v-model="searchParams.wkPrgsStatCd"
            :options="codes.WK_PRGS_STAT_CD"
            first-option="all"
          />
        </kw-search-item>

        <!-- 설치기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_IST_BASE')"
        >
          <kw-select
            v-model="searchParams.installBase"
            :options="installBases"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty, toNumber } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const router = useRouter();

const dataService = useDataService();

const serviceTypes = [
  { codeId: '1', codeName: '설치' },
  { codeId: '2', codeName: 'A/S' },
  { codeId: '3', codeName: '홈케어' },
  { codeId: '9', codeName: '홈쇼핑설치만' },
];

const refriTypes = [
  { codeId: '1', codeName: '무상서비스' },
  { codeId: '2', codeName: '유상서비스' },
  { codeId: '3', codeName: '유상(아웃소싱제외)' },
  { codeId: '4', codeName: '유상(아웃소싱)' },
];

const inquiryBases = [
  { codeId: '1', codeName: '접수일자' },
  { codeId: '2', codeName: '처리일자' },
  { codeId: '3', codeName: '방문확정일' },
];

const installBases = [
  { codeId: '1', codeName: '1년 이내' },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  serviceType: '',
  ogId: '',
  prtnrNo: '',
  refriType: '',
  pdGrpCd: '',
  pdCd: '',
  svBizDclsfCd: '',
  inquiryBase: '1',
  baseDateFrom: dayjs().format('YYYYMMDD'),
  baseDateTo: dayjs().format('YYYYMMDD'),
  wkPrgsStatCd: '',
  installBase: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'SV_BIZ_DCLSF_CD',
  'WK_PRGS_STAT_CD',
);

const { data: serviceCenters } = await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } });
const engineerRes = await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } });
const engineers = ref(engineerRes.data);

watch(() => searchParams.value.ogId, async (val) => {
  if (!isEmpty(val)) {
    engineers.value = engineerRes.data.filter((v) => v.ogId === val);
  } else {
    engineers.value = engineerRes.data;
  }
});

const products = ref([]);
async function fetchProducts() {
  const res = await dataService.get('/sms/wells/service/service-processing/products', { params: { pdGrpCd: searchParams.value.pdGrpCd } });
  products.value = res.data;
}

watch(() => searchParams.value.pdGrpCd, async (val) => {
  if (val === '') {
    products.value = [];
    searchParams.value.pdCd = '';
    return;
  }
  await fetchProducts();
});

function getPhoneNo(locaraTno, exnoEncr, idvTno) {
  if (isEmpty(locaraTno) || isEmpty(exnoEncr) || isEmpty(idvTno)) return '';
  return `${locaraTno}-${exnoEncr}-${idvTno}`;
}

function getTime(minutes) {
  if (isEmpty(minutes)) return '';
  const hour = Math.floor(toNumber(minutes) / 60);
  const minute = toNumber(minutes) % 60;
  return `${hour}시간 ${minute}분`;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/service-processing-quality/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/service-processing-quality/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      footer: { text: t('MSG_TXT_SUM') },
      renderer: { type: 'button' },
      // preventCellItemFocus: true,
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'copnDvNm', header: t('MSG_TXT_INDV_CRP_DV'), width: '150', styleName: 'text-center' }, // 개인법인구분
    { fieldName: 'cttIchr', header: t('MSG_TXT_CTT_ICHR'), width: '100', styleName: 'text-center' }, // 컨택담당
    { fieldName: 'hsp', header: t('MSG_TXT_HSP'), width: '150', styleName: 'text-center' }, // 홈쇼핑
    { fieldName: 'alncBzsNm', header: t('MSG_TXT_ALNC'), width: '150', styleName: 'text-center' }, // 제휴
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRE_EXPN'), width: '100', styleName: 'text-center' }, // 무료체험
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-center' }, // 고객유형
    { fieldName: 'cralLocaraTno' }, // 휴대전화번호1
    { fieldName: 'mexnoEncr' }, // 휴대전화번호2
    { fieldName: 'cralIdvTno' }, // 휴대전화번호3
    { fieldName: 'cralTno',
      header: t('MSG_TXT_TEL_NO'),
      width: 150,
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(cralLocaraTno, mexnoEncr, cralIdvTno);
      },
    }, // 전화번호
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, // 우편번호
    { fieldName: 'radr', header: t('MSG_TXT_ADDR'), width: '145', styleName: 'text-center' }, // 주소
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '145' }, // 상품명
    { fieldName: 'modelNm', header: t('MSG_TXT_MDL_NM'), width: '145' }, // 모델명
    { fieldName: 'scnYn', header: t('MSG_TXT_SCN'), width: '80', styleName: 'text-center' }, // 스캔
    { fieldName: 'bfMnftCoId', header: t('MSG_TXT_BF_MNFT_NO'), width: '145' }, // 이전제조번호
    { fieldName: 'bcNo', header: t('MSG_TXT_MNFT_NO'), width: '145' }, // 제조번호
    { fieldName: 'prdtYm', header: t('MSG_TXT_MNFT_YM'), width: '145' }, // 제조년월
    { fieldName: 'ogNm', header: t('MSG_TXT_RCST_BLG'), width: '145' }, // 접수자소속
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RCST_MARK'), width: '145' }, // 접수자표시
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_RCP_IZ'), width: '145' }, // 접수내역
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'useMcn', header: t('MSG_TXT_USE_MCNT'), width: '145', styleName: 'text-right' }, // 사용개월
    { fieldName: 'svBizHclsfNm', header: t('MSG_TXT_SV_TP'), width: '145', styleName: 'text-center' }, // 서비스유형
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_SV_TP_DTL'), width: '145', styleName: 'text-center' }, // 서비스유형상세
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_PTY_CST_NO'), width: '145', styleName: 'text-center' }, // 상대고객번호
    { fieldName: 'asRefriDvNm', header: t('MSG_TXT_AS_CST_DV'), width: '145', styleName: 'text-center' }, // A/S고객구분
    { fieldName: 'bfsvcRefriDvNm', header: t('MSG_TXT_BFSVC_CST_DV'), width: '145', styleName: 'text-center' }, // B/S고객구분
    { fieldName: 'refriDvNm', header: t('MSG_TXT_REFRI_DV'), width: '145', styleName: 'text-center' }, // 유/무상구분
    { fieldName: 'egerCnrNm', header: t('MSG_TXT_ICHR_CNR'), width: '145', styleName: 'text-center' }, // 담당센터
    { fieldName: 'prtnr', header: t('MSG_TXT_ICHR_EGER'), width: '145', styleName: 'text-center' }, // 담당엔지니어
    { fieldName: 'prtnrPstnDv', header: t('MSG_TXT_PSTN_DV'), width: '145', styleName: 'text-center' }, // 직급구분
    { fieldName: 'siteAwDvNm', header: t('MSG_TXT_ITEM_NM'), width: '145', styleName: 'text-center' }, // 현장수당(항목명)
    { fieldName: 'siteAwAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
    { fieldName: 'awAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
    { fieldName: 'siteAwTot', header: t('MSG_TXT_TOT_SUM'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(총계)
    { fieldName: 'contactCralLocaraTno' }, // 연락처(핸드폰)1
    { fieldName: 'contactMexnoEncr' }, // 연락처(핸드폰)2
    { fieldName: 'contactCralIdvTno' }, // 연락처(핸드폰)3
    { fieldName: 'contactCralTno',
      header: t('MSG_TXT_CTPLC_CPHON'),
      width: '145',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { contactCralLocaraTno, contactMexnoEncr, contactCralIdvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(contactCralLocaraTno, contactMexnoEncr, contactCralIdvTno);
      },
    }, // 연락처(핸드폰)
    { fieldName: 'fnlRcpdt', header: t('MSG_TXT_RCPDT'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'vstDuedt', header: t('MSG_TXT_SCHD_DT'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'date' }, // 예정일자
    { fieldName: 'vstChYn', header: t('MSG_TXT_CH'), width: '145', styleName: 'text-center' }, // 변경
    { fieldName: 'vstCnfmdt', header: t('MSG_TXT_CNFM_DT'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'date' }, // 확정일자
    { fieldName: 'vstCnfmHh', header: t('MSG_TXT_CNFM_DTM'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'time' }, // 확정일시
    { fieldName: 'dtmChCausNm', header: t('MSG_TXT_CH_CAUS'), width: '145' }, // 변경원인
    { fieldName: 'dtmChRsonNm', header: t('MSG_TXT_CH_RSON'), width: '145', options: codes.WK_DTM_CH_RSON_DTL_CD }, // 변경사유
    { fieldName: 'dtmChRsonDtlCn', header: t('MSG_TXT_CH_RSON_DTL'), width: '145' }, // 변경사유상세
    { fieldName: 'smsFwYn', header: t('MSG_TXT_MMS'), width: '80', styleName: 'text-center' }, // MMS
    { fieldName: 'promHh', header: t('MSG_TXT_PROM_HH'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'time' }, // 약속시간
    { fieldName: 'arvDtm', header: t('MSG_TXT_ARV'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'datetime' }, // 작업시간(도착)
    { fieldName: 'vstFshDtm', header: t('MSG_TXT_COMPLETE'), width: '145', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'datetime' }, // 작업시간(완료)
    { fieldName: 'wkLdtm',
      header: t('MSG_TXT_LDTM'),
      width: '145',
      styleName: 'text-right',
      displayCallback: (grid, index) => {
        const { wkLdtm } = grid.getValues(index.dataRow);
        return getTime(wkLdtm);
      },
    }, // 소요시간
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '145', styleName: 'text-center' }, // 작업상태
    { fieldName: 'wkCanRsonNm', header: t('MSG_TXT_CAN_RSON'), width: '145' }, // 취소사유
    { fieldName: 'wkCanMoCn', header: t('MSG_TXT_DTL_IZ'), width: '145' }, // 상세내역
    { fieldName: 'fgptDsbYn', header: t('MSG_TXT_FGPT'), width: '80', styleName: 'text-center' }, // 사은품
    { fieldName: 'badDvNm', header: t('MSG_TXT_BAD_DV'), width: '145' }, // 결과입력(불량구분)
    { fieldName: 'asLctNm', header: t('MSG_TXT_FLT_LCT'), width: '145' }, // 결과입력(고장위치)
    { fieldName: 'asPhnCdNm', header: t('MSG_TXT_FLT_PHN'), width: '145' }, // 결과입력(고장현상)
    { fieldName: 'asLctCdNm', header: t('MSG_TXT_LCT_DTL'), width: '145' }, // 결과입력(위치상세)
    { fieldName: 'svProcsFomNm', header: t('MSG_TXT_PROCS_FOM'), width: '145' }, // 결과입력(처리형태)
    { fieldName: 'imptaRsonNm', header: t('MSG_TXT_IMPT'), width: '145' }, // 결과입력(귀책)
    { fieldName: 'asCdEyn', header: t('MSG_TXT_AS_CD_NTHNG'), width: '80', styleName: 'text-center' }, // AS코드없음
    { fieldName: 'sftAcdnYn', header: t('MSG_TXT_SFT_ACDN'), width: '80', styleName: 'text-center' }, // 안전사고
    { fieldName: 'plsSvYn', header: t('MSG_TXT_PLS_SV'), width: '80', styleName: 'text-center' }, // 플러스서비스
    { fieldName: 'peslArtcDfrnYn', header: t('MSG_TXT_PESL_ARTC_DIFF'), width: '145', styleName: 'text-center' }, // 인적사항다름
    { fieldName: 'cwtrWprsVal', header: t('MSG_TXT_WPRS_COLD'), width: '145', styleName: 'text-center' }, // 수압(냉)
    { fieldName: 'wwtWprsVal', header: t('MSG_TXT_WPRS_HOT'), width: '145', styleName: 'text-center' }, // 수압(온)
    { fieldName: 'svProcs', header: t('MSG_TXT_DTL'), width: '145' }, // 상세
    { fieldName: 'svProcsCn', header: t('MSG_TXT_DTL_IZ'), width: '145' }, // 상세내역
    { fieldName: 'pu1Part', header: t('MSG_TXT_PART01'), width: '120', styleName: 'text-center' }, // 투입부품(부품01)
    { fieldName: 'pu2Part', header: t('MSG_TXT_PART02'), width: '120', styleName: 'text-center' }, // 투입부품(부품02)
    { fieldName: 'pu3Part', header: t('MSG_TXT_PART03'), width: '120', styleName: 'text-center' }, // 투입부품(부품03)
    { fieldName: 'pu4Part', header: t('MSG_TXT_PART04'), width: '120', styleName: 'text-center' }, // 투입부품(부품04)
    { fieldName: 'pu5Part', header: t('MSG_TXT_PART05'), width: '120', styleName: 'text-center' }, // 투입부품(부품05)
    { fieldName: 'pu6Part', header: t('MSG_TXT_PART06'), width: '120', styleName: 'text-center' }, // 투입부품(부품06)
    { fieldName: 'pu7Part', header: t('MSG_TXT_PART07'), width: '120', styleName: 'text-center' }, // 투입부품(부품07)
    { fieldName: 'pu8Part', header: t('MSG_TXT_PART08'), width: '120', styleName: 'text-center' }, // 투입부품(부품08)
    { fieldName: 'pu9Part', header: t('MSG_TXT_PART09'), width: '120', styleName: 'text-center' }, // 투입부품(부품09)
    { fieldName: 'pu10Part', header: t('MSG_TXT_PART10'), width: '120', styleName: 'text-center' }, // 투입부품(부품10)
    { fieldName: 'pu1Uprc', header: t('MSG_TXT_PART_COST01'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품01)
    { fieldName: 'pu2Uprc', header: t('MSG_TXT_PART_COST02'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품02)
    { fieldName: 'pu3Uprc', header: t('MSG_TXT_PART_COST03'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품03)
    { fieldName: 'pu4Uprc', header: t('MSG_TXT_PART_COST04'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품04)
    { fieldName: 'pu5Uprc', header: t('MSG_TXT_PART_COST05'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품05)
    { fieldName: 'pu6Uprc', header: t('MSG_TXT_PART_COST06'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품06)
    { fieldName: 'pu7Uprc', header: t('MSG_TXT_PART_COST07'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품07)
    { fieldName: 'pu8Uprc', header: t('MSG_TXT_PART_COST08'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품08)
    { fieldName: 'pu9Uprc', header: t('MSG_TXT_PART_COST09'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품09)
    { fieldName: 'pu10Uprc', header: t('MSG_TXT_PART_COST10'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용(부품10)
    { fieldName: 'totalPuUprc', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 투입부품비용 계
    { fieldName: 'partCs', header: t('MSG_TXT_PART_COST'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(부품비)
    { fieldName: 'tcfee', header: t('MSG_TXT_TCFEE'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(기술료)
    { fieldName: 'bstrCs', header: t('MSG_TXT_BSTR_CS'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(출장료)
    { fieldName: 'etcCs', header: t('MSG_TXT_ETC_CS'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(기타비용)
    { fieldName: 'rveCsTot', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(계)
    { fieldName: 'cashStlm', header: t('MSG_TXT_CASH'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(현금)
    { fieldName: 'cardStlm', header: t('MSG_TXT_CARD'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(카드)
    { fieldName: 'elcStlm', header: t('MSG_TXT_ELC_STLM'), width: '145', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(전자결제)
    { fieldName: 'cstSignHsYn', header: t('MSG_BTN_CST_SIGN'), width: '145', styleName: 'text-center' }, // 고객서명
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.setColumnLayout([
    { column: 'cntrNoSn', footerUserSpans: [{ colspan: 2 }] },
    'cstKnm',
    'copnDvNm',
    'cttIchr',
    'hsp',
    'alncBzsNm',
    'frisuYn',
    'sellTpNm',
    'cralTno',
    'newAdrZip',
    'radr',
    'cntrCnfmDtm',
    'pdNm',
    'modelNm',
    'scnYn',
    'bfMnftCoId',
    'bcNo',
    'prdtYm',
    'ogNm',
    'prtnrKnm',
    'cnslMoCn',
    'istDt',
    'useMcn',
    'svBizHclsfNm',
    'svBizDclsfNm',
    'cntrCstNo',
    'asRefriDvNm',
    'bfsvcRefriDvNm',
    'refriDvNm',
    'egerCnrNm',
    'prtnr',
    'prtnrPstnDv',
    {
      header: t('MSG_TXT_SITE_AW'), // 현장수당
      direction: 'horizontal',
      items: ['siteAwDvNm', 'siteAwAmt', 'awAmt', 'siteAwTot'],
    },
    'contactCralTno',
    'fnlRcpdt',
    'vstDuedt',
    'vstChYn',
    'vstCnfmdt',
    'vstCnfmHh',
    'dtmChCausNm',
    'dtmChRsonNm',
    'dtmChRsonDtlCn',
    'smsFwYn',
    'promHh',
    {
      header: t('MSG_TXT_WK_HH'), // 작업시간
      direction: 'horizontal',
      items: ['arvDtm', 'vstFshDtm'],
    },
    'wkLdtm',
    'wkPrgsStatNm',
    'wkCanRsonNm',
    'wkCanMoCn',
    'fgptDsbYn',
    {
      header: t('MSG_TXT_RS_IN'), // 결과입력
      direction: 'horizontal',
      items: ['badDvNm', 'asLctNm', 'asPhnCdNm', 'asLctCdNm', 'svProcsFomNm', 'imptaRsonNm', 'asCdEyn', 'sftAcdnYn',
        'plsSvYn', 'peslArtcDfrnYn', 'cwtrWprsVal', 'wwtWprsVal', 'svProcs', 'svProcsCn'],
    },
    {
      header: t('MSG_TXT_PU_PART'), // 투입부품
      direction: 'horizontal',
      items: ['pu1Part', 'pu2Part', 'pu3Part', 'pu4Part', 'pu5Part', 'pu6Part', 'pu7Part', 'pu8Part', 'pu9Part', 'pu10Part'],
    },
    {
      header: t('MSG_TXT_PU_PART_CS'), // 투입부품 비용
      direction: 'horizontal',
      items: ['pu1Uprc', 'pu2Uprc', 'pu3Uprc', 'pu4Uprc', 'pu5Uprc', 'pu6Uprc', 'pu7Uprc', 'pu8Uprc', 'pu9Uprc', 'pu10Uprc', 'totalPuUprc'],
    },
    {
      header: t('MSG_TXT_RVE'), // 수납
      direction: 'horizontal',
      items: ['partCs', 'tcfee', 'bstrCs', 'etcCs', 'rveCsTot'],
    },
    {
      header: t('MSG_TXT_STLM'), // 결제
      direction: 'horizontal',
      items: ['cashStlm', 'cardStlm', 'elcStlm'],
    },
    'cstSignHsYn',
  ]);

  view.setFixedOptions({ colCount: 2 });
  view.setFooters({ visible: true, items: [{ height: 42 }] });
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { cntrNo, cntrSn } = grid.getValues(itemIndex);

    if (column === 'cntrNoSn') {
      router.push({ path: '/service/wwsnb-individual-service-list', query: { cntrNo, cntrSn } });
    }
  };
});
</script>

<style scoped>
</style>

<style scoped>
</style>
