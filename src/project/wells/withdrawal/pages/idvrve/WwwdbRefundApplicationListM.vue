<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbRefundApplicationListM - 웰스환불 환불신청현황 W-WD-U-0108M01
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00061
- 수납 > 환불업무 > 환불신청 관리
- 환불신청현황을 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 접수일자 -->
        <!-- 2023.04.12 rules="date_range_months:1" 가 있으면, 공백 조회가 안됨. 추후 확인 필요. -->
        <kw-search-item :label="$t('MSG_TXT_RCPDT')">
          <kw-date-range-picker
            v-model:from="searchParams.startDay"
            v-model:to="searchParams.endDay"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 환불상태 -->
        <kw-search-item :label="$t('MSG_TXT_REFUND_STAT')">
          <!-- 접수(01.환불접수완료), 진행중(05.환불진행중), 반려(04.환불반려), 승인(03.환불처리완료) -->
          <kw-option-group
            v-model="searchParams.rfndStatCd"
            :options="customCodes.RFND_STAT_CD"
            type="radio"
          />
        </kw-search-item>
        <!-- 입금유형 -->
        <kw-search-item :label="$t('MSG_TXT_DP_TP')">
          <!-- /* 수납구분코드(RVE_DV_CD)가 01.계약금, 15.기타선수금 */ -->
          <kw-option-group
            v-model="searchParams.rveDvCd"
            :options="codes.RVE_DV_CD.filter((v) => v.codeId === '15' || v.codeId === '01')"
            type="radio"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 처리구분 -->
        <kw-search-item :label="$t('MSG_TXT_PROCS_DV')">
          <kw-select
            v-model="searchParams.rfndDsbDvCdCshBltf"
            :options="customCodes.RFND_DSB_DV_CD_CSH_BLTF"
          />
        </kw-search-item>
        <!-- 계약상세번호 -->
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model="searchParams.cntrNoSn"
            icon="search"
            clearable
            :on-click-icon="onClickSelectCntrnosn"
          />
        </kw-search-item>
        <!-- 고객번호 -->
        <kw-search-item :label="$t('MSG_TXT_CST_NO')">
          <kw-input
            v-model="searchParams.cstNo"
            icon="search"
            clearable
            maxlength="20"
            :label="$t('MSG_TXT_CST_NO')"
            @click-icon="onClickCstSearch"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 사업자번호 -->
        <kw-search-item :label="$t('MSG_TXT_ENTRP_NO')">
          <kw-input
            v-model="searchParams.bzrno"
            maxlength="10"
            type="number"
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
        <!-- 리포트 보기 -->
        <kw-btn
          icon="report"
          dense
          secondary
          :label="$t('MSG_BTN_RPT_BRWS')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickReportView"
        />
        <!-- 엑셀업로드 -->
        <kw-btn
          icon="upload_on"
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          secondary
          dense
          @click="onClickExcelUpload"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="excel"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 환불신청 -->
        <kw-btn
          :label="$t('MSG_BTN_APLC_RFND')"
          primary
          dense
          @click="onClickApplicationRefund"
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

// eslint-disable-next-line no-unused-vars
import { codeUtil, useGlobal, useMeta, defineGrid, getComponentType, gridUtil, useDataService, fileUtil, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// const { openReportPopup } = useCmPopup();

// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();

// eslint-disable-next-line no-unused-vars
const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
// eslint-disable-next-line no-unused-vars
const { upperDepartmentId } = userInfo;

let cachedParams;
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
// eslint-disable-next-line no-unused-vars
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'RVE_DV_CD', // 입금유형
  'CNTRW_TP_CD', // 계약서유형
  'RFND_RSON_CD', // 환불사유
);

// 사용자 정의코드
const customCodes = {
  // 환불상태 : 01.접수, 05.진행중, 04.반려, 03.승인
  RFND_STAT_CD: [{ codeId: '01', codeName: t('MSG_TXT_RCP') }, { codeId: '05', codeName: t('MSG_TXT_APRV_INPRGS') }, { codeId: '04', codeName: t('MSG_BTN_RJT') }, { codeId: '03', codeName: t('MSG_TXT_APPR') }],
  // 처리구분 : 1.카드전금, 2.현금전금, 3.카드환불, 4.현금환불, 5.선환불, 6.카드현금
  RFND_DSB_DV_CD_CSH_BLTF: [{ codeId: '1', codeName: t('MSG_TXT_CARD_BLTF') }, { codeId: '2', codeName: t('MSG_TXT_CSH_BLTF') }, { codeId: '3', codeName: t('MSG_TXT_CARD_REFUND') }, { codeId: '4', codeName: t('MSG_TXT_CASH_REFND') }, { codeId: '5', codeName: t('MSG_TXT_PPYM_RFND') }, { codeId: '6', codeName: t('MSG_TXT_CARD_CSH') }],
};
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const searchParams = ref({
  startDay: now.format('YYYYMM01'), // 접수일자 시작일
  endDay: now.format('YYYYMMDD'), // 접수일자 종료일
  // startDay: undefined, // 접수일자 시작일
  // endDay: undefined, // 접수일자 종료일
  rfndStatCd: '01', // 환불상태
  rveDvCd: '01', // 입금유형
  rfndDsbDvCdCshBltf: undefined, // 처리구분
  cntrNoSn: undefined, // 계약상세번호
  cstNo: undefined, // 고객번호
  bzrno: undefined, // 사업자등록번호
});

// 검색조건 : 계약상세번호
async function onClickSelectCntrnosn() {
  searchParams.value.cntrNoSn = '';
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP' });
  if (result) {
    searchParams.value.cntrNoSn = `${payload.cntrNo}-${payload.cntrSn}`;
  }
}
// 검색조건 : 고객 번호
async function onClickCstSearch() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

// 조회 준비
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-application-present-state/paging', { params: cachedParams });
  const { list: application, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(application);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 리포트 보기
async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  notify('개발중');
  // await openReportPopup(
  //   '/eformsample.ozr',
  //   '/eformsample.odi',
  //   JSON.stringify({ param1: 'test1', param2: 'test2' }),
  // );
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-application-present-state/excel-download', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 엑셀 업로드
// 본사 담당자 엑셀업로드 시 환불신청(등록) 및 승인처리 가능
// 고객센터 엑셀업로드 시 환불신청(등록)만 됨
async function onClickExcelUpload() {
  // TODO: 엑셀 양식 만든 후 엑셀 업로드 만들기
  const apiUrl = '/sms/wells/withdrawal/idvrve/refund-application-present-state/excel-upload';
  const templateId = 'RefundApplication'; // 확인필요.
  const { result } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId }, // 템플릿을 그리드 기준으로 작성해서 만듬
  });
  if (result.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 환불신청
async function onClickApplicationRefund() {
  // TODO: 일정을 위해 4월 21일까지로 미뤄짐
  notify('개발중');
  await modal({
    component: 'WwwdbRefundApplicationRegP',
    componentProps: {
      startDay: searchParams.value.startDay, // 접수일자 시작일
      endDay: searchParams.value.endDay, // 접수일자 종료일
      rfndStatCd: searchParams.value.rfndStatCd, // 환불상태
      rveDvCd: searchParams.value.rveDvCd, // 입금유형
      rfndDsbDvCdCshBltf: searchParams.value.rfndDsbDvCdCshBltf, // 처리구분
      cntrNoSn: searchParams.value.cntrNoSn, // 계약상세번호
      cstNo: searchParams.value.cstNo, // 고객번호
      bzrno: searchParams.value.bzrno }, // 사업자등록번호
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rfndStatCd' }, // 환불상태
    { fieldName: 'col2' }, // 환불상세
    { fieldName: 'fnlMdfcDtm', dataType: 'date' }, // 접수일자
    { fieldName: 'cntrwTpCd' }, // 계약유형
    { fieldName: 'cntrNoSn' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 계약자
    { fieldName: 'cntrCnfmDtm', dataType: 'date' }, // 계약일자
    { fieldName: 'rveDvCd' }, // 입금유형
    { fieldName: 'rveDt', dataType: 'date' }, // 매출일자
    { fieldName: 'cntrCanDtm', dataType: 'date' }, // 취소일자
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'rfndAkAmt', dataType: 'number' }, // 환불요청금액(원)
    { fieldName: 'fnm' }, // 신청자
    { fieldName: 'fnlMdfcUsrId' }, // 번호
    { fieldName: 'rfndFshDt', dataType: 'date' }, // 승인일자
    { fieldName: 'exRfndRsonCn' }, // 처리내용
    { fieldName: 'rfndFshDtTmp', dataType: 'date' }, // 지급일자
    { fieldName: 'rfndDsbDvCdCshBltf' }, // 처리구분
    { fieldName: 'rfndRsonCd' }, // 환불사유
    { fieldName: 'rfndRsonCn' }, // 환불내용
    { fieldName: 'rfndEvidMtrFileId' }, // 첨부파일

  ];

  const columns = [

    { // 환불상태
      fieldName: 'rfndStatCd',
      header: t('MSG_TXT_REFUND_STAT'),
      width: '130',
      styleName: 'text-center rg-button-link',
      options: customCodes.RFND_STAT_CD,
      renderer: { type: 'button' },
    },
    { // 환불상세
      fieldName: 'col2',
      header: t('MSG_TXT_RFND_DTL'),
      width: '130',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_BTN_DTL') },
    // 접수일자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_RCPDT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 계약유형 : 계약서유형코드
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_CONTR_TYPE'), width: '130', styleName: 'text-left', options: codes.CNTRW_TP_CD },
    // 계약상세번호 : 표시방법 = 계약번호-계약일련번호
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    // 계약자
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTRT'), width: '130', styleName: 'text-left' },
    // 계약일자
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 입금유형
    { fieldName: 'rveDvCd', header: t('MSG_TXT_DP_TP'), width: '120', styleName: 'text-left', options: codes.RVE_DV_CD },
    // 매출일자
    { fieldName: 'rveDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 취소일자
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-left' },
    // 환불요청금액(원)
    { fieldName: 'rfndAkAmt', header: t('MSG_TXT_RFND_AK_AMT'), width: '129', styleName: 'text-right' },
    // 신청자
    { fieldName: 'fnm', header: t('MSG_TXT_APPL_USER'), width: '100', styleName: 'text-left' },
    // 번호
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    // 승인일자
    { fieldName: 'rfndFshDt', header: t('MSG_TXT_APR_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 처리내용
    { fieldName: 'exRfndRsonCn', header: t('MSG_TXT_PROCS_CN'), width: '100', styleName: 'text-left' },
    // 지급일자
    { fieldName: 'rfndFshDtTmp', header: t('MSG_TXT_DSB_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    // 처리구분 RFND_DSB_DV_CD_CSH_BLTF
    { fieldName: 'rfndDsbDvCdCshBltf', header: t('MSG_TXT_PROCS_DV'), width: '120', styleName: 'text-left', options: customCodes.RFND_DSB_DV_CD_CSH_BLTF },
    // 환불사유
    { fieldName: 'rfndRsonCd', header: t('MSG_TXT_RFND_RSON'), width: '120', styleName: 'text-left', options: codes.RFND_RSON_CD },
    // 환불내용
    { fieldName: 'rfndRsonCn', header: t('MSG_TXT_RFND_CN'), width: '120', styleName: 'text-left' },
    // 첨부파일
    { fieldName: 'rfndEvidMtrFileId',
      header: t('MSG_TXT_ATTH_FILE'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button' },
      // 다운로드
      displayCallback(grid, index, value) {
        if (value !== '') { return t('MSG_BTN_DLOAD'); }
      },
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  // view.setColumnLayout(columnLayout); 를 view.setColumns(columns); 보다 위에 두면 columns의 width 적용 안됨.
  const columnLayout = [
    'rfndStatCd', // 환불상태
    'col2', // 환불상세
    'fnlMdfcDtm', // 접수일자
    'cntrwTpCd', // 계약유형
    'cntrNoSn', // 계약상세번호
    'cstKnm', // 계약자
    'cntrCnfmDtm', // 계약일자
    'rveDvCd', // 입금유형
    'rveDt', // 매출일자
    'cntrCanDtm', // 취소일자
    'pdNm', // 상품명
    'rfndAkAmt', // 환불요청금액(원)
    'fnm', // 신청자
    'fnlMdfcUsrId', // 번호
    'rfndFshDt', // 승인일자
    'exRfndRsonCn', // 처리내용
    'rfndFshDtTmp', // 지급일자
    'rfndDsbDvCdCshBltf', // 처리구분
    'rfndRsonCd', // 환불사유
    'rfndRsonCn', // 환불내용
    'rfndEvidMtrFileId', // 첨부파일
  ];
  if (upperDepartmentId === null) { // 임시.접속한 사용자의 정보 예시 = 부서ID 기준으로 만듬.
    view.setColumnLayout(columnLayout);
  } else {
    columnLayout.splice(1, 1); // columnLayout 에서 1번 인덱스부터 1개 요소 제거
    view.setColumnLayout(columnLayout);
  }

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 그리드 클릭 이벤트 시작
  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    // 조회된 데이터를 request 할때 사용할것
    const {
      rfndStatCd, // 환불상태
      rfndEvidMtrFileId, // 첨부파일ID
    } = gridUtil.getRowValue(grid, dataRow);

    if (column === 'rfndStatCd') { // 환불상태
      // 접수, 진행중, 반려, 승인 중 해당 데이터 노출. 환불상태 : 01.접수, 05.진행중, 04.반려, 03.승인
      // 접수, 진행중 클릭 시 환불신청[W-WD-U-108P01] 팝업 노출하여 신청내역 조회
      // 반려, 승인 클릭 시 환불상세[W-WD-U-108P03] 팝업 노출하여 신청결과 조회
      if (rfndStatCd === '01' || rfndStatCd === '05') { // 01.접수, 05.진행중
        // TODO: 일정을 위해 4월 21일까지로 미뤄짐
        notify('개발중 01.접수, 05.진행중');
        await modal({
          component: 'WwwdbRefundApplicationRegP', // W-WD-U-0108P01 환불신청팝업
          componentProps: {
            rfndStatCd, // 환불상태
          },
        });
      }
      if (rfndStatCd === '04' || rfndStatCd === '03') { // 04.반려, 03.승인
        // TODO: 일정을 위해 4월 21일까지로 미뤄짐
        notify('개발중 04.반려, 03.승인');
        await modal({
          component: 'WwwdbRefundApplicationDtlP', // W-WD-U-0108P03 환불상세팝업
          componentProps: {
            rfndStatCd, // 환불상태
          },
        });
      }
    }

    if (column === 'col2') { // 환불상세
      // TODO: 일정을 위해 4월 21일까지로 미뤄짐
      notify('개발중 환불상세 팝업');
      await modal({
        component: 'WwwdbRefundApplicationDtlP',
        componentProps: {
          rfndStatCd, // 환불상태
        },
      });
    }
    // 첨부파일 다운로드
    if (column === 'rfndEvidMtrFileId') {
      // TODO: 일정을 위해 4월 21일까지로 미뤄짐
      // console.log(fileUtil.download);
      // fileUtil.download({ fileUid: rfndEvidMtrFileId }, 'storage');
      notify('개발중');
      fileUtil.download(rfndEvidMtrFileId, 'storage');
    }
  };
});

</script>

<style scoped>
</style>
