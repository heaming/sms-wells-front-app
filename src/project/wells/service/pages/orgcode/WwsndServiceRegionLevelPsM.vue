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
            v-model="searchParams.svTpCd"
            :options="selectCodes.SELECT_SERVICE"
            first-option="all"
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} :  Km, {{ t('MSG_TXT_TIME') }}, {{ t('MSG_TXT_CUR_WON') }})
          </span>
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
import { useDataService, useMeta, getComponentType, defineGrid, codeUtil, gridUtil, stringUtil } from 'kw-lib';
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
  'SV_DV_CD', // 서비스유형
);

// 사용자 정의코드
const selectCodes = {
  // 서비스유형 : all.전체, 1.설치, 3.A/S, 4.홈케어
  SELECT_SERVICE: codes.SV_DV_CD.filter((v) => v.codeId !== '2').map((rtnData) => ({ codeId: rtnData.codeId, codeName: rtnData.codeName })),
  // 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
  SELECT_DAY: [{ codeId: '01', codeName: t('MSG_TXT_RCPDT') },
    { codeId: '02', codeName: t('MSG_TXT_SCHD_DT') },
    { codeId: '03', codeName: t('MSG_TXT_PRCSDT') },
    { codeId: '04', codeName: t('MSG_TXT_VST_CNFM_D') }],
};

let cachedParams;

const searchParams = ref({
  svTpCd: '', // 서비스유형 : all.전체, 1.설치, 3.A/S, 4.홈케어
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
console.log('serviceCenters >>>>', serviceCenters);
console.log('engineers >>>>', engineers);

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
  // if (list.length > 0) {
  //   list.forEach((data) => {
  //     data.grdTotAmt = data.wrkGrdAmt + data.mvGrdAmt;
  //   });
  // }
  // console.log('list >>>', list);
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
  // 51ea
  const fields = [
    { fieldName: 'ogCd' }, // 서비스센터 코드
    { fieldName: 'ogNm' }, // 서비스센터명
    { fieldName: 'ichrPrtnrNo' }, // 담당자 사번
    { fieldName: 'prtnrKnm' }, // 담당자 명
    { fieldName: 'ac025EmpOr' }, // 직책
    { fieldName: 'custCd' }, // 계약번호+일련번호 화면표시용
    { fieldName: 'newAdrZip' }, // 신우편번호
    { fieldName: 'ctpvNm' }, // 시도명
    { fieldName: 'ctctyNm' }, // 시군구명
    { fieldName: 'amtdNm' }, // 행정동명
    { fieldName: 'ac112EmdKorNm' }, // 읍면동명
    { fieldName: 'itemNm' }, // 상품명
    { fieldName: 'co410FeeGb' }, // 수당항목 명
    { fieldName: 'arrDttm' }, // 작업도착
    { fieldName: 'wkFshDt' }, // 작업완료일자
    { fieldName: 'wkFshHh' }, // 작업완료시간
    { fieldName: 'orgShpNm' }, // 기본출고지명
    { fieldName: 'orgShpAdd' }, // 기본출고지 주소
    { fieldName: 'chuljangNm' }, // 출장출고지 명
    { fieldName: 'chuljangAdd' }, // 출장출고지 주소
    { fieldName: 'strShpNm' }, // 출발출고지명
    { fieldName: 'strShpAdd' }, // 출발주소
    { fieldName: 'strIslandYn' }, // 출발 섬구분
    { fieldName: 'endShpNm' }, // 도착출고지명
    { fieldName: 'endShpAdd' }, // 도착출고지주소
    { fieldName: 'endIslandYn' }, // 도착 섬구분
    { fieldName: 'timeStand' }, // 시간대 (작업)
    { fieldName: 'al170MvDistance' }, // 경로 - 이동거리
    { fieldName: 'al170MvTime' }, // 경로 - 이동시간
    { fieldName: 'al170MvFee' }, // 경로  - 요금
    { fieldName: 'mvGrd' }, // 이동급지 - 등급
    { fieldName: 'mvGrdAmt' }, // 이동급지 - 급지수당
    { fieldName: 'grdTotAmt' }, // 급지합계
    { fieldName: 'mvDistance' }, // 이동합계
    { fieldName: 'wrkGrd' }, // 업무급지 - 등급
    { fieldName: 'wrkGrdAmt' }, // 업무급지 - 급지수당
    { fieldName: 'bsdt' }, // 기준일자
    { fieldName: 'dgr1LevlOgNm' }, // 상위 조직명
    { fieldName: 'dgr1LevlOgCd' }, // 상위 조직코드
    { fieldName: 'dgr1LevlOgId' }, // 상위 조직 ID
    { fieldName: 'ogId' }, // 서비스센터 조직 ID  참조용
    { fieldName: 'rglvlSn' }, // 급지일련번호
    { fieldName: 'ogTpCd' }, // 조직유형코드 W06
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'procStusNm' }, // 작업상태   작업진행상태
    { fieldName: 'al170BasePdlvNo' }, // 기본출고지번호
    { fieldName: 'dptuPdlvNo' }, // 출장출고지번호
    { fieldName: 'arvPdlvNo' }, // 도착출고지번호
    { fieldName: 'mvSisock' }, // 시속(경로)
    { fieldName: 'mvTime' }, // 이동시간 (계산시 필요함)
  ];
  /**------------------------------------------------------------------
   * 확인필요 컬럼
   * 직책, 작업상태
  **------------------------------------------------------------------*/
  const columns = [
    // 배정정보..1dept
    /**
     * 2dept
     * 서비스센터, 지점, 담당사번, 담당성명, 직책
     * , 계약번호, 우편번호, 시도명, 시군구명, 행정동명
     * , 읍면동, SAP코드, 품목코드, 상품명, 수당항목
     * , 작업도착, 작업완료, 소요시간
     */
    { fieldName: 'ogCd', header: t('MSG_TXT_SV_CNR'), width: '150' }, // 서비스센터 코드..서비스센터
    { fieldName: 'ogNm', header: t('MSG_TXT_BRANCH'), width: '150' }, // 서비스센터명..지점
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' }, // 파트너번호..담당사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: '100' }, // 파트너명..담당성명
    { fieldName: 'ac025EmpOr', header: t('MSG_TXT_RSB'), width: '100' }, // 직책
    { fieldName: 'custCd', header: t('MSG_TXT_CNTR_NO'), width: '150', styleName: 'text-center' }, // 계약번호+일련번호 화면표시용 ~> 계약번호
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, // 우편번호
    { fieldName: 'ctpvNm', header: t('MSG_TXT_CTPV_NM'), width: '100', styleName: 'text-center' }, // 시도명
    { fieldName: 'ctctyNm', header: t('MSG_TXT_CTCTY_NM'), width: '100' }, // 시군구명
    { fieldName: 'amtdNm', header: t('MSG_TXT_AMTD_NM'), width: '100' }, // 행정동명
    { fieldName: 'ac112EmdKorNm', header: t('MSG_TXT_EMD_NM'), width: '150' }, // 읍면동명
    // SAP코드, 품목코드..차후 추가
    { fieldName: 'itemNm', header: t('MSG_TXT_PRDT_NM'), width: '245' }, // 상품명
    { fieldName: 'co410FeeGb', header: t('수당항목'), width: '150' }, // 수당항목
    { fieldName: 'arrDttm', header: t('작업도착'), width: '150' }, // 작업도착
    { fieldName: 'wkFshDt', header: t('MSG_TXT_WK_FSH'), width: '150' }, // 작업완료일자..작업완료
    { fieldName: 'wkFshHh', header: t('MSG_TXT_LDTM'), width: '150' }, // 작업완료시간..소요시간
    // 기본출고지..1dept
    // 2dept..출고지명, 출장출고지주소
    { fieldName: 'orgShpNm', header: t('MSG_TXT_PDLV_NM'), width: '150' }, // 출고지명
    { fieldName: 'orgShpAdd', header: t('출장출고지주소'), width: '150' }, // 출장출고지주소
    // 출장출고지..1dept
    // 2dept..출고지명, 출장출고지주소
    { fieldName: 'chuljangNm', header: t('MSG_TXT_PDLV_NM'), width: '150' }, // 출고지명
    { fieldName: 'chuljangAdd', header: t('출장출고지주소'), width: '150' }, // 출장출고지주소
    // 출발..1dept
    // 2dept..출고지/주민센터, 출발주소, 섬구분
    { fieldName: 'strShpNm', header: t('출고지/주민센터'), width: '150' }, // 출고지/주민센터
    { fieldName: 'strShpAdd', header: t('출발주소'), width: '150' }, // 출발주소
    { fieldName: 'strIslandYn', header: t('MSG_TXT_ILD_DV'), width: '50' }, // 섬구분
    // 도착..1dept
    // 2dept..출고지/주민센터, 출발주소, 섬구분
    { fieldName: 'endShpNm', header: t('출고지/주민센터'), width: '150' }, // 출고지/주민센터
    { fieldName: 'endShpAdd', header: t('출발주소'), width: '150' }, // 출발주소
    { fieldName: 'endIslandYn', header: t('MSG_TXT_ILD_DV'), width: '50' }, // 섬구분
    // 작업..1dept
    // 2dept..시간대
    { fieldName: 'timeStand', header: t('시간대'), width: '100' }, // 시간대
    // 경로..1dept
    // 2dept..이동거리, 이동시간, 요금
    { fieldName: 'al170MvDistance', header: t('이동거리'), width: '100' }, // 이동거리
    { fieldName: 'al170MvTime', header: t('MSG_TXT_MMT_HH'), width: '100' }, // 이동시간
    { fieldName: 'al170MvFee', header: t('MSG_TXT_CHARGE'), width: '100', dataType: 'number' }, // 요금
    // 업무급지..1dept
    // 2dept..등급, 급지수당
    { fieldName: 'wrkGrd', header: t('MSG_TXT_GD'), width: '100' }, // 등급
    { fieldName: 'wrkGrdAmt', header: t('MSG_TXT_RGLVL_AW'), width: '150', dataType: 'number', numberFormat: '#.##' }, // 급지수당
    // 이동급지..1dept
    // 2dept..이동합계, 등급, 급지수당
    { fieldName: 'mvDistance', header: t('이동합계'), width: '150' }, // 이동합계
    { fieldName: 'mvGrd', header: t('MSG_TXT_GD'), width: '100' }, // 등급
    { fieldName: 'mvGrdAmt', header: t('MSG_TXT_RGLVL_AW'), width: '150', dataType: 'number', numberFormat: '#.##' }, // 급지수당
    // 급지합계..하위dept 없음
    // 계산해야 하는듯
    {
      fieldName: 'grdTotAmt',
      header: t('급지합계'),
      width: '150',
      numberFormat: '#.##',
      styleName: 'text-right',
      displayCallback(g, index) {
        const { wrkGrdAmt, mvGrdAmt } = g.getValues(index.itemIndex);
        return stringUtil.getNumberWithComma((wrkGrdAmt + mvGrdAmt));
      },
    }, // 급지합계
    // 접수자..1dept
    // 2dept..접수자소속, 접수자
    { fieldName: 'dgr1LevlOgNm', visible: false }, // 상위 조직명
    { fieldName: 'dgr1LevlOgCd', visible: false }, // 상위 조직코드
    { fieldName: 'dgr1LevlOgId', visible: false }, // 상위 조직 ID
    { fieldName: 'rcgvpKnm', visible: false }, // 고객명
    { fieldName: 'al170BasePdlvNo', visible: false }, // 기본출고지번호
    { fieldName: 'arvPdlvNo', visible: false }, // 도착출고지번호
    { fieldName: 'dptuPdlvNo', visible: false }, // 출장출고지번호
    { fieldName: 'rglvlSn', visible: false }, // 급지일련번호
    { fieldName: 'ogTpCd', visible: false }, // 조직유형코드 W06
    { fieldName: 'cntrNo', visible: false }, // 계약번호
    { fieldName: 'cntrSn', visible: false }, // 계약일련번호
    { fieldName: 'procStusNm', visible: false }, // 작업상태   작업진행상태
    { fieldName: 'mvSisock', visible: false }, // 시속(경로)
    { fieldName: 'mvTime', visible: false }, // 이동시간 (계산시 필요함)
    { fieldName: 'bsdt', visible: false }, // 기준일자
    { fieldName: 'ogId', visible: false }, // 서비스센터 조직 ID  참조용
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    { // 배정정보
      header: { text: t('MSG_TXT_ASGN_INF') },
      direction: 'horizontal',
      items: [
        'ogCd',
        'ogNm',
        'ichrPrtnrNo',
        'prtnrKnm',
        'ac025EmpOr',
        'custCd',
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
    },
    { // 기본출고지
      header: { text: `${t('MSG_TXT_DFLT')} ${t('출고지')}` },
      direction: 'horizontal',
      items: [
        'orgShpNm',
        'orgShpAdd',
      ],
    },
    { // 출장출고지
      header: { text: `${t('출장출고지')}` },
      direction: 'horizontal',
      items: [
        'chuljangNm',
        'chuljangAdd',
      ],
    },
    { // 출발
      header: { text: `${t('출발')}` },
      direction: 'horizontal',
      items: [
        'strShpNm',
        'strShpAdd',
        'strIslandYn',
      ],
    },
    { // 도착
      header: { text: `${t('도착')}` },
      direction: 'horizontal',
      items: [
        'endShpNm',
        'endShpAdd',
        'endIslandYn',
      ],
    },
    { // 작업
      header: { text: `${t('작업')}` },
      direction: 'horizontal',
      items: [
        'timeStand',
      ],
    },
    { // 경로
      header: { text: `${t('경로')}` },
      direction: 'horizontal',
      items: [
        'al170MvDistance',
        'al170MvTime',
        'al170MvFee',
      ],
    },
    { // 업무급지
      header: { text: `${t('업무급지')}` },
      direction: 'horizontal',
      items: [
        'wrkGrd',
        'wrkGrdAmt',
      ],
    },
    { // 이동급지
      header: { text: `${t('이동급지')}` },
      direction: 'horizontal',
      items: [
        'mvDistance',
        'mvGrd',
        'mvGrdAmt',
      ],
    },
    // 급지합계
    'grdTotAmt',
    // { // 접수자
    //   header: { text: `${t('접수자')}` },
    //   direction: 'horizontal',
    //   items: [
    //     'mvDistance',
    //     'mvGrd',
    //   ],
    // },
  ]);
});
</script>
