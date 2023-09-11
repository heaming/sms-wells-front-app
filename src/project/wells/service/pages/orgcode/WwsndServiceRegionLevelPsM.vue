<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0146M01] WwsndServiceRegionLevelPsM - 서비스 급지현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.05
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','정보관리','급지관리', '서비스 급지현황']"
      />
    </template>
    <kw-search
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item :label="t('TXT_MSG_SV_TP_CD')">
          <!-- 서비스 유형 -->
          <kw-select
            v-model="searchParams.svBizHclsfNm"
            :options="selectCodes.SELECT_SERVICE"
            class="w150"
          />
          <!-- 서비스센터 -->
          <kw-select
            v-model="searchParams.ogCd"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
          <!-- 담당자 -->
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            class="w150"
            first-option="all"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
        <!-- 조회기준 -->
        <kw-search-item :label="t('MSG_TXT_INQR_BASE')">
          <kw-select
            v-model="searchParams.searchDateType"
            :options="selectCodes.SELECT_DAY"
          />
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_months:1"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="(pageInfo.totalCount === 0)"
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
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
import { useDataService, useMeta, getComponentType, defineGrid, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// 사용자 정의코드
const selectCodes = {
  // 서비스유형 : 01.전체, 02.설치, 03.A/S, 04.홈케어
  SELECT_SERVICE: [{ codeId: '01', codeName: t('MSG_TXT_ALL') },
    { codeId: '02', codeName: t('MSG_TXT_INSTALLATION') },
    { codeId: '03', codeName: t('MSG_TXT_AFTER_SERVICE') },
    { codeId: '04', codeName: t('MSG_TXT_HOME_CARE') }],
  // 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
  SELECT_DAY: [{ codeId: '01', codeName: t('MSG_TXT_RCPDT') },
    { codeId: '02', codeName: t('MSG_TXT_SCHD_DT') },
    { codeId: '03', codeName: t('MSG_TXT_PRCSDT') },
    { codeId: '04', codeName: t('MSG_TXT_VST_CNFM_D') }],
};

let cachedParams;

const searchParams = ref({
  svBizHclsfNm: '', // 서비스유형 : 01.전체, 02.설치, 03.A/S, 04.홈케어
  ogCd: '', // 서비스센터
  prtnrNo: '', // 담당자
  searchDateType: '01', // 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
  fromDate: dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD'),
  toDate: dayjs().subtract(0, 'month').endOf('day').format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 서비스센터 조회
const { data: serviceCenters } = await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } });
// 엔지니어 조회
const { data: engineers } = await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } });

/** ==============================
 * 서비스 급지 현황 엑셀 다운로드
**============================== */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/service-region-level-ps/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

/** ============================
 * 서비스 급지 현황 조회
**============================ */
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/service-region-level-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  const resData = list;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resData);
  view.clearCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  console.log('searchParams.value >>>', searchParams.value);
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  // const fields = [
  //   { fieldName: 'bsdt' },
  //   { fieldName: 'dgr1LevlOgNm' },
  //   { fieldName: 'dgr1LevlOgCd' },
  //   { fieldName: 'dgr1LevlOgId' },
  //   { fieldName: 'ogCd' },
  //   { fieldName: 'ogNm' },
  //   { fieldName: 'ogId' },
  //   { fieldName: 'ichrPrtnrNo' },
  //   { fieldName: 'rglvlSn' },
  //   { fieldName: 'prtnrKnm' },
  //   { fieldName: 'ac025EmpOr' },
  //   { fieldName: 'ogTpCd' },
  //   { fieldName: 'cntrNo' },
  //   { fieldName: 'cntrSn' },
  //   { fieldName: 'custCd' },
  //   { fieldName: 'rcgvpKnm' },
  //   { fieldName: 'procStusNm' },
  //   { fieldName: 'newAdrZip' },
  //   { fieldName: 'ctpvNm' },
  //   { fieldName: 'ctctyNm' },
  //   { fieldName: 'ac112EmdKorNm' },
  //   { fieldName: 'amtdNm' },
  //   { fieldName: 'co410FeeGb' },
  //   { fieldName: 'itemNm' },
  //   { fieldName: 'arrDttm' },
  //   { fieldName: 'wkFshDt' },
  //   { fieldName: 'wkFshHh' },
  //   { fieldName: 'timeStand' },
  //   { fieldName: 'al170BasePdlvNo' },
  //   { fieldName: 'dptuPdlvNo' },
  //   { fieldName: 'arvPdlvNo' },
  //   { fieldName: 'mvSisock' },
  //   { fieldName: 'al170MvDistance' },
  //   { fieldName: 'al170MvTime' },
  //   { fieldName: 'al170MvFee' },
  //   { fieldName: 'orgShpNm' },
  //   { fieldName: 'orgShpAdd' },
  //   { fieldName: 'chuljangCd' },
  //   { fieldName: 'chuljangAdd' },
  //   { fieldName: 'strShpNm' },
  //   { fieldName: 'strShpAdd' },
  //   { fieldName: 'endShpNm' },
  //   { fieldName: 'endShpAdd' },
  //   { fieldName: 'mvDistance' },
  //   { fieldName: 'mvGrd' },
  //   { fieldName: 'mvGrdAmt' },
  //   { fieldName: 'mvTime' },
  //   { fieldName: 'wrkGrd' },
  //   { fieldName: 'wrkGrdAmt' },
  //   { fieldName: 'strIslandYn' },
  //   { fieldName: 'endIslandYn' },
  // ];

  // const columns = [
  //   { fieldName: 'bsdt', visible: false }, // 기준일자
  //   { fieldName: 'dgr1LevlOgNm', visible: false }, // 1차레벨조직ID
  //   { fieldName: 'dgr1LevlOgCd', header: t('담당사번'), width: '150' }, // 1차레벨조직코드
  //   { fieldName: 'dgr1LevlOgId', header: t('담당성명'), width: '150' }, // 1차레벨조직명
  //   { fieldName: 'ogCd', header: t('MSG_TXT_RSB'), width: '150' }, // 조직코드
  //   { fieldName: 'ogNm', header: t('MSG_TXT_CNTR_NO'), width: '150' }, // 조직명
  //   { fieldName: 'ogId', header: t('MSG_TXT_ZIP'), width: '150' }, // 조직ID
  //   { fieldName: 'ichrPrtnrNo', visible: false }, // 담당파트너번호
  //   { fieldName: 'rglvlSn', visible: false }, // 급지일련번호
  //   { fieldName: 'prtnrKnm', header: t('MSG_TXT_PRTNR_FNM'), width: '150' }, // 파트너한글명
  //   { fieldName: 'ac025EmpOr', header: t('MSG_TXT_PRTNR_GD'), width: '150' }, // 파트너등급코드
  //   { fieldName: 'ogTpCd', visible: false }, // 조직유형코드
  //   { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '150' }, // 계약번호
  //   { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '150' }, // 계약일련번호
  //   { fieldName: 'custCd', header: t('MSG_TXT_CNTR_NO'), width: '150' }, // 계약번호 '-' 계약일련번호
  //   { fieldName: 'rcgvpKnm', visible: false }, // 담당성명
  //   { fieldName: 'procStusNm', visible: false },
  //   { fieldName: 'newAdrZip', visible: false }, // 우편번호
  //   { fieldName: 'ctpvNm', visible: false }, // 시도명
  //   { fieldName: 'ctctyNm', visible: false }, // 시군구명
  //   { fieldName: 'ac112EmdKorNm', visible: false }, // 법정읍면동명
  //   { fieldName: 'amtdNm', visible: false }, // 행정동명
  //   { fieldName: 'co410FeeGb', visible: false },
  //   { fieldName: 'itemNm', visible: false }, // 상품명????
  //   { fieldName: 'arrDttm', visible: false },
  //   { fieldName: 'wkFshDt', visible: false }, // 작업완료일자
  //   { fieldName: 'wkFshHh', visible: false }, // 작업완료시간
  //   { fieldName: 'timeStand', visible: false },
  //   { fieldName: 'al170BasePdlvNo', visible: false }, // 기준출고지번호
  //   { fieldName: 'dptuPdlvNo', visible: false }, // 출발출고지번호
  //   { fieldName: 'arvPdlvNo', visible: false }, // 도착출고지번호
  //   { fieldName: 'mvSisock', visible: false },
  //   { fieldName: 'al170MvDistance', visible: false },
  //   { fieldName: 'al170MvTime', visible: false },
  //   { fieldName: 'al170MvFee', visible: false },
  //   { fieldName: 'orgShpNm', visible: false }, // 출고지명
  //   { fieldName: 'orgShpAdd', visible: false }, // 출고지주소
  //   { fieldName: 'chuljangCd', visible: false },
  //   { fieldName: 'chuljangAdd', visible: false },
  //   { fieldName: 'strShpNm', visible: false },
  //   { fieldName: 'strShpAdd', visible: false },
  //   { fieldName: 'endShpNm', visible: false },
  //   { fieldName: 'endShpAdd', visible: false },
  //   { fieldName: 'mvDistance', visible: false },
  //   { fieldName: 'mvGrd', visible: false },
  //   { fieldName: 'mvGrdAmt', visible: false },
  //   { fieldName: 'mvTime', visible: false },
  //   { fieldName: 'wrkGrd', visible: false },
  //   { fieldName: 'wrkGrdAmt', visible: false },
  //   { fieldName: 'strIslandYn', visible: false },
  //   { fieldName: 'endIslandYn', visible: false },
  // ];

  const fields = [
    { fieldName: 'bsdt' },
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr1LevlOgId' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ogId' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'rglvlSn' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ac025EmpOr' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'custCd' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'procStusNm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'ac112EmdKorNm' },
    { fieldName: 'amtdNm' },
    { fieldName: 'co410FeeGb' },
    { fieldName: 'itemNm' },
    { fieldName: 'arrDttm' },
    { fieldName: 'wkFshDt' },
    { fieldName: 'wkFshHh' },
    { fieldName: 'timeStand' },
    { fieldName: 'al170BasePdlvNo' },
    { fieldName: 'dptuPdlvNo' },
    { fieldName: 'arvPdlvNo' },
    { fieldName: 'mvSisock' },
    { fieldName: 'al170MvDistance' },
    { fieldName: 'al170MvTime' },
    { fieldName: 'al170MvFee' },
    { fieldName: 'orgShpNm' },
    { fieldName: 'orgShpAdd' },
    { fieldName: 'chuljangCd' },
    { fieldName: 'chuljangAdd' },
    { fieldName: 'strShpNm' },
    { fieldName: 'strShpAdd' },
    { fieldName: 'endShpNm' },
    { fieldName: 'endShpAdd' },
    { fieldName: 'mvDistance' },
    { fieldName: 'mvGrd' },
    { fieldName: 'mvGrdAmt' },
    { fieldName: 'mvTime' },
    { fieldName: 'wrkGrd' },
    { fieldName: 'wrkGrdAmt' },
    { fieldName: 'strIslandYn' },
    { fieldName: 'endIslandYn' },
  ];
  /**------------------------------------------------------------------
   * 확인필요 컬럼
   * 직책, 작업상태
  **------------------------------------------------------------------*/
  const columns = [
    // 배정정보
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_SV_CNR'), width: '150' }, // 1차레벨조직ID ~> 서비스센터
    { fieldName: 'ichrPrtnrNo', header: t('담당사번'), width: '150' }, // 담당파트너번호
    { fieldName: 'ogNm', header: t('담당성명'), width: '150' }, // 조직명..지점명? ~> 담당성명
    { fieldName: 'custCd', header: t('MSG_TXT_CNTR_NO'), width: '150' }, // 계약번호 '-' 계약일련번호 ~> 고객번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '150' }, // 고객명
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '150' }, // 우편번호
    { fieldName: 'ctpvNm', header: t('MSG_TXT_CTPV_NM'), width: '150' }, // 시도명
    { fieldName: 'ctctyNm', header: t('MSG_TXT_CTCTY_NM'), width: '150' }, // 시군구명
    { fieldName: 'amtdNm', header: t('MSG_TXT_AMTD_NM'), width: '150' }, // 행정동명
    { fieldName: 'ac112EmdKorNm', header: t('법정읍면동명'), width: '150' }, // 법정읍면동명
    { fieldName: 'itemNm', header: t('MSG_TXT_PRDT_NM'), width: '150' }, // 상품명????
    { fieldName: 'co410FeeGb', visible: false }, // 수당항목
    { fieldName: 'arrDttm', visible: false }, // 작업도착
    { fieldName: 'wkFshDt', visible: false }, // 작업완료일자
    { fieldName: 'wkFshHh', visible: false }, // 작업완료시간

    // 기본출고지
    { fieldName: 'orgShpAdd', header: t('MSG_TXT_PDLV_ADR'), width: '150' }, // 출고지주소
    { fieldName: 'al170BasePdlvNo', header: t('기준출고지번호'), width: '150' }, // 기준출고지번호
    // 출장출고지
    { fieldName: 'arvPdlvNo', header: t('도착출고지번호'), width: '150' }, // 도착출고지번호

    // 출발
    { fieldName: 'orgShpNm', header: t('MSG_TXT_PDLV_NM'), width: '150' }, // 출고지명
    { fieldName: 'dptuPdlvNo', header: t('출발출고지번호'), width: '150' }, // 출발출고지번호

    // 도착

    // 작업

    // 경로

    // 업무급지

    // 이동급지

    // 접수자

    { fieldName: 'ogCd', visible: false }, // 조직코드..지점? ~> 담당사번
    { fieldName: 'rglvlSn', visible: false }, // 급지일련번호
    { fieldName: 'prtnrKnm', visible: false }, // 파트너한글명
    { fieldName: 'ac025EmpOr', visible: false }, // 파트너등급코드
    { fieldName: 'ogTpCd', visible: false }, // 조직유형코드
    { fieldName: 'cntrNo', visible: false }, // 계약번호
    { fieldName: 'cntrSn', visible: false }, // 계약일련번호
    { fieldName: 'procStusNm', visible: false },
    { fieldName: 'timeStand', visible: false },
    { fieldName: 'mvSisock', visible: false },
    { fieldName: 'al170MvDistance', visible: false },
    { fieldName: 'al170MvTime', visible: false },
    { fieldName: 'al170MvFee', visible: false },
    { fieldName: 'chuljangCd', visible: false },
    { fieldName: 'chuljangAdd', visible: false },
    { fieldName: 'strShpNm', visible: false },
    { fieldName: 'strShpAdd', visible: false },
    { fieldName: 'endShpNm', visible: false },
    { fieldName: 'endShpAdd', visible: false },
    { fieldName: 'mvDistance', visible: false },
    { fieldName: 'mvGrd', visible: false },
    { fieldName: 'mvGrdAmt', visible: false },
    { fieldName: 'mvTime', visible: false },
    { fieldName: 'wrkGrd', visible: false },
    { fieldName: 'wrkGrdAmt', visible: false },
    { fieldName: 'strIslandYn', visible: false },
    { fieldName: 'endIslandYn', visible: false },
    { fieldName: 'bsdt', visible: false }, // 기준일자
    { fieldName: 'dgr1LevlOgCd', visible: false }, // 1차레벨조직코드
    { fieldName: 'dgr1LevlOgId', visible: false }, // 1차레벨조직명
    { fieldName: 'ogId', visible: false }, // ?
  ];

  const columnLayout = [
    { // 배정정보
      direction: 'horizontal',
      items: [
        'dgr1LevlOgNm',
        'ichrPrtnrNo',
        'ogNm',
        'custCd',
        'rcgvpKnm',
        'newAdrZip',
        'ctpvNm',
        'ctctyNm',
        'amtdNm',
        'ac112EmdKorNm',
        'itemNm',
        'co410FeeGb',
        'arrDttm',
        'wkFshDt',
        'wkFshHh',
      ],
      header: { text: t('MSG_TXT_ASGN_INF') },
    },
    { // 기본출고지
      direction: 'horizontal',
      items: [
        'orgShpAdd',
        'al170BasePdlvNo',
      ],
      header: { text: `${t('MSG_TXT_DFLT')} ${t('출고지')}` },
    },
    { // 출장출고지
      direction: 'horizontal',
      items: ['arvPdlvNo'],
      header: { text: `${t('출장출고지')}` },
    },
    { // 출발
      direction: 'horizontal',
      items: [
        'orgShpNm',
        'dptuPdlvNo',
      ],
      header: { text: `${t('출발')}` },
    },
    // 도착
    // 작업
    // 경로
    // 업무급지
    // 이동급지
    // 접수자
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  // view.setColumnLayout([
  //   {
  //     header: '배정정보', // colspan title
  //     direction: 'horizontal', // merge type
  //     items: ['pdCd', 'hgrPdCd', 'pdTpCd', 'bzHdqDvCd'],
  //   },
  // ]);
});
</script>
