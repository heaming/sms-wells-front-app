<!----rveDv
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
- 2023.07.24 퍼블수정 - 2023.07.27 수정
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- rev:230724 전면수정 -->
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 접수일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_RCPDT')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.searchDt"
            :options="customCodes.INQR_DT"
            class="w200"
          />
          <kw-date-range-picker
            v-model:from="searchParams.startDay"
            v-model:to="searchParams.endDay"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 환불상태 : 진행중상태 필요여부 확인필요(02.진행중) -->
        <kw-search-item :label="$t('MSG_TXT_REFUND_STAT')">
          <kw-option-group
            v-model="searchParams.rfndStatCd"
            type="radio"
            :options="codes.RFND_AK_STAT_CD.filter((v) => v.codeId != '02')"
          />
          <!-- :model-value="'접수'"
            :options="['접수', '진행중', '반려','승인']" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 처리구분 -->
        <kw-search-item :label="$t('MSG_TXT_PROCS_DV')">
          <kw-select
            v-model="searchParams.rfndDsbDvCdCshBltf"
            first-option="all"
            first-option-value="ALL"
            :options="codes.BLTF_RFND_DV_CD"
          />
          <!-- :model-value="['']"
          :options="['선택', 'B', 'C', 'D']" -->
        </kw-search-item>
        <!-- 계약상세번호 -->
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
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
          <!-- 단위: (원)-->
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

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
          vertical
          inset
          spaced
        />
        <!-- 계약금 환불현황 -->
        <kw-btn
          v-permission:print
          :label="$t('MSG_TXT_CNTRAM_RFND_PS')"
          secondary
          dense
          @click="onClickCntramRfnd"
        />
        <!-- 기타선수금 환불현황-->
        <kw-btn
          v-permission:print
          :label="$t('MSG_TXT_ETC_ATAM_RFND_PS')"
          secondary
          dense
          @click="onClickEtcRfnd"
        />
        <kw-btn
          v-permission:print
          :label="$t('MSG_TXT_TK_AMT_DP_PS')"
          secondary
          dense
          @click="onClickTkRfnd"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 환불신청 -->
        <kw-btn
          v-permission:create
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
        @init="initGrid"
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
// eslint-disable-next-line no-unused-vars
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { getConfig } = useMeta();
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { notify } = useGlobal();

const now = dayjs();
const searchParams = ref({
  searchDt: '01',
  startDay: now.add(-1, 'M').add(1, 'day').format('YYYYMMDD'), // 접수일자 시작일 now.add(-30, 'day').format('YYYYMMDD') 1개월 이내로 하라고 에러뜸
  endDay: now.format('YYYYMMDD'), // 접수일자 종료일
  rfndStatCd: '00', // 환불상태
  rfndDsbDvCdCshBltf: 'ALL', // 처리구분
  cntrNo: '',
  cntrSn: '',
  cstNo: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'DT_TP_CD', // 일자코드 (접수일자, 처리일자 , 확정일자)
  'RFND_AK_STAT_CD', // 환불상태
  'BLTF_RFND_DV_CD', // 처리구분
  'RFND_RSON_CD', // 환불사유
);

const customCodes = {
  INQR_DT: [{ codeId: '01', codeName: t('MSG_TXT_RCPDT') }, { codeId: '02', codeName: t('MSG_TXT_PERF_DT') }, { codeId: '03', codeName: t('MSG_TXT_PRCSDT') }],
};

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/paging', { params: cachedParams, timeout: 6000000 });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  view.getDataSource().setRows(pages);
}

// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 검색조건 : 고객 번호
async function onClickCstSearch() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: { cstNo: searchParams.value.cstNo },
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/excel-download', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 환불신청 버튼
async function onClickApplicationRefund() {
  await modal({
    component: 'WwwdbRefundApplicationRegP',
    componentProps: {
      //   //   startDay: searchParams.value.startDay, // 접수일자 시작일
      //   //   endDay: searchParams.value.endDay, // 접수일자 종료일
      //   //   rfndStatCd: searchParams.value.rfndStatCd, // 환불상태
      //   //   rveDvCd: searchParams.value.rveDvCd, // 입금유형
      //   //   rfndDsbDvCdCshBltf: searchParams.value.rfndDsbDvCdCshBltf, // 처리구분
      //   //   cntrNo: searchParams.value.cntrNo, // 계약번호
      //   //   cntrSn: searchParams.value.cntrSn, // 계약일련번호
      //   //   cstNo: searchParams.value.cstNo, // 고객번호
      //   //   bzrno: searchParams.value.bzrno // 사업자등록번호
    },
  });
  await onClickSearch();
}

async function onClickCntramRfnd() {
  await notify(t('준비중입니다.')); // TODO:OZ 출력
}
async function onClickEtcRfnd() {
  await notify(t('준비중입니다.')); // TODO:OZ 출력
}
async function onClickTkRfnd() {
  await notify(t('준비중입니다.')); // TODO:OZ 출력
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
/**
 * 23.08.10 kimoon.lim
 * TODO: 검색시 환불상태, 접수번호 기준에 맞춰 정렬(번호에 맞게 그룹화되어있음)
 * 환불상태는 총5개중 현재 4개 사용중 (임시저장, 접수, 승인, 반려) - 진행중상태값은 인수인계 때 빼라는요청으로 빼고 진행함 RFND_AK_STAT_CD:02
 * 순서: 환불신청 -> 접수 -> 승인
   상태 - 임시저장, 접수일 때, 환불상태 그리드 선택 -> P01
        - 승인,반려일 때, 환불상태 그리드 선택 -> P03
   ---------------------------------------------
  조정필요 : 환불 상세시 '승인자'에 기준이 필요
          + 그리드 엑셀 업로드 기능 확인 필요
 */

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rfndAkStatCd' }, /* 환불상태 */
    { fieldName: 'rfndAkDtlCd' }, /* 환불상세 (화면상 승인자에게 보여주는값 ) */
    { fieldName: 'rfndAkDtm' }, /* 접수일자 */
    { fieldName: 'rfndAkNo' }, /* 접수번호 */
    { fieldName: 'rfndPsbAmt', dataType: 'number' }, /* 환불가능금액 - 확인 후 처리 */
    { fieldName: 'rfndAkAmt', dataType: 'number' }, /* 환불요청금액 */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cntrDtlNo' }, /* 계약상세번호 */
    { fieldName: 'rfndCshAkAmt', dataType: 'number' }, /* 현금환불금액 */
    { fieldName: 'rfndCardAkAmt', dataType: 'number' }, /* 카드환불금액 */
    { fieldName: 'crdcdFeeAmt', dataType: 'number' }, /* 카드수수료 */
    { fieldName: 'rfndBltfAkAmt', dataType: 'number' }, /* 전금금액 */
    { fieldName: 'fnlMdfcUsrNm' }, /* 신청자 */
    { fieldName: 'fnlMdfcUsrId' }, /* 번호(수정자번호) */
    { fieldName: 'rfndFshDt' }, /* 승인일자 */
    { fieldName: 'rfndProcsCn' }, /* 처리내용 */
    { fieldName: 'rfndRsonCd' }, /* 환불사유 */
    { fieldName: 'rfndRsonCn' }, /* 환불내용 */
    { fieldName: 'rfndEvidMtrFileId' }, /* 첨부파일: 환불증빙자료파일 */
  ];

  const columns = [
    { fieldName: 'rfndAkStatCd',
      mergeRule: {
        criteria: 'values["rfndAkNo"] + value', // TODO: (그룹구분방법)
      },
      header: t('MSG_TXT_REFUND_STAT'),
      /* header: '환불상태' */
      width: '100',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      options: codes.RFND_AK_STAT_CD },
    { fieldName: 'rfndAkDtlCd',
      header: t('MSG_TXT_RFND_DTL'),
      /* header: '환불상세' */
      mergeRule: {
        criteria: 'values["rfndAkNo"] + value',
      },
      width: '100',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' } },
    { fieldName: 'rfndAkDtm',
      header: t('MSG_TXT_RCPDT'),
      /* header: '접수일자' */
      mergeRule: {
        criteria: 'values["rfndAkNo"] + value',
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'rfndAkNo',
      header: t('MSG_TXT_RCPT_NO'),
      /* header: '접수번호' */
      mergeRule: {
        criteria: 'values["rfndAkNo"] + value',
      },
      width: '185',
      styleName: 'text-center' },
    { fieldName: 'rfndPsbAmt',
      header: t('MSG_TXT_REFUND_AMT'),
      /* header: '환불가능금액' */
      // mergeRule: {
      //   criteria: 'value',
      // },
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'rfndAkAmt',
      header: t('MSG_TXT_RFND_APLC_AMT'),
      /* header: '환불신청금액' */
      // mergeRule: {
      //   criteria: 'value',
      // },
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      /* header: '계약상세번호' */
      width: '150',
      styleName: 'text-center' },
    { fieldName: 'rfndCshAkAmt',
      header: t('MSG_TXT_CSH_RFND_AMT'),
      /* header: '현금환불금액' */
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'rfndCardAkAmt',
      header: t('MSG_TXT_CARD_RFND_AMT'),
      /* header: '카드환불금액' */
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'crdcdFeeAmt',
      header: t('MSG_TXT_CARD_FEE'),
      /* header: '카드수수료' */
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'rfndBltfAkAmt',
      header: t('MSG_TXT_BLTF_AMT'),
      /* header: '전금금액' */
      width: '130',
      styleName: 'text-right' },
    { fieldName: 'fnlMdfcUsrNm',
      header: t('MSG_TXT_APPL_USER'),
      /* header: '신청자' */
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId',
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      /* header: '번호' */
      width: '130',
      styleName: 'text-center' },
    { fieldName: 'rfndFshDt',
      header: t('MSG_TXT_APR_DT'),
      /* header: '승인일자' */
      width: '130',
      styleName: 'text-center' },
    { fieldName: 'rfndRsonCd',
      header: t('MSG_TXT_RFND_RSON'),
      /* header: '환불사유' */
      width: '130',
      styleName: 'text-center',
      options: codes.RFND_RSON_CD },
    { fieldName: 'rfndRsonCn',
      header: t('MSG_TXT_RFND_CN'),
      /* header: '환불내용' */
      width: '130',
      styleName: 'text-center' },
    { fieldName: 'rfndEvidMtrFileId',
      header: t('MSG_TXT_ATTH_FILE'),
      /* header: '첨부파일' */
      width: '130',
      styleName: 'text-center',
      renderer: { type: 'button' },
      displayCallback(/* grid, index */) {
        // const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        // if (no1 != null) {
        //   return `${no1}-${no2}-${no3}`;
        // }
        // 화면상에는 id값이 아닌 글자만 보여줘야함.
        return t('MSG_BTN_DLOAD'); // 다운로드
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setFixedOptions({
    colCount: 7,
  });

  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    // 조회된 데이터를 request 할때 사용할것
    const {
      fnlMdfcUsrNm, /* 신청자 - P03용 */
      fnlMdfcUsrId, /* 번호 - P03용 */
      rfndAkDtm, /* 신청일자  */
      rfndAkStatCd, // 환불상태
      rfndEvidMtrFileId, // 첨부파일ID
      cntrNo, // 계약번호
      cntrSn, // 계약일련번호
      rfndAkNo, /* 환불요청번호 */
    } = gridUtil.getRowValue(grid, dataRow);

    if (column === 'rfndAkStatCd') { // 환불상태
      // 접수, 진행중, 반려, 승인 중 해당 데이터 노출. 환불상태 : 01.접수, 05.진행중, 04.반려, 03.승인
      // 접수, 진행중 클릭 시 환불신청[W-WD-U-108P01] 팝업 노출하여 신청내역 조회
      // 반려, 승인 클릭 시 환불상세[W-WD-U-108P03] 팝업 노출하여 신청결과 조회
      if (rfndAkStatCd === '00') { // 01.임시저장, 01. 접수
        await modal({
          component: 'WwwdbRefundApplicationRegP', // W-WD-U-0108P01 환불신청팝업
          componentProps: {
            rfndAkStatCd, // 환불상태
            cntrNo, // 계약번호
            cntrSn, // 계약일련번호
            rfndAkNo, // 환불요청번호
          },
        });
        await onClickSearch();
      }
      if (rfndAkStatCd === '03' || rfndAkStatCd === '99' || rfndAkStatCd === '01') { // 04.반려, 03.승인
        await modal({
          component: 'WwwdbRefundApplicationDtlP', // W-WD-U-0108P03 환불상세팝업
          componentProps: {
            rfndAkStatCd, // 환불상태
            cntrNo, // 계약번호
            cntrSn, // 계약일련번호
            rfndAkNo, // 환불접수번호
            fnlMdfcUsrNm, // 신청자
            fnlMdfcUsrId, // 번호
            rfndAkDtm, /* 신청일자 */
          },
        });
        await onClickSearch();
      }
    }

    if (column === 'rfndAkDtlCd') { // 환불상세
      if (rfndAkStatCd === '00') { // 01.임시저장, 01. 접수
        await modal({
          component: 'WwwdbRefundApplicationRegP', // W-WD-U-0108P01 환불신청팝업
          componentProps: {
            rfndAkStatCd, // 환불상태
            cntrNo, // 계약번호
            cntrSn, // 계약일련번호
            rfndAkNo, // 환불요청번호
          },
        });
      } else {
        await modal({
          component: 'WwwdbRefundApplicationDtlP',
          componentProps: {
            rfndAkStatCd, // 환불상태
            cntrNo, // 계약번호
            cntrSn, // 계약일련번호
            rfndAkNo, // 환불접수번호
            fnlMdfcUsrNm, // 신청자
            fnlMdfcUsrId, // 번호
            rfndAkDtm, /* 신청일자 */
          },
        });
      }

      await onClickSearch();
    }
    // 첨부파일 다운로드
    if (column === 'rfndEvidMtrFileId') {
      // TODO: WwwdbConsumablesRefundMgtM , 업로드 확인불가로, 확인필요사항.
      fileUtil.download({ rfndEvidMtrFileId }, 'storage');
    }
  };
});
</script>
 <!--// rev:230724 전면수정 -->
<style scoped>
</style>
