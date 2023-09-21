<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdbConsumablesRefundMgtM - 소모품환불관리 PGE_WDB_00047
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 소모품환불관리
- W-WD-U-0121M01
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @reset="onClickReset"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 업무구분 -->
        <kw-search-item
          :label="t('MSG_TXT_TASK_DIV')"
        >
          <!-- 계약금(청약) -->
          <!-- 수납구분코드(RVE_DV_CD)가 01.계약(청약)금, 08.할부금 -->
          <kw-option-group
            v-model="searchParams.rveDvCd"
            :options="codes.RVE_DV_CD.filter((v) => v.codeId === '01' || v.codeId === '08' )"
            type="radio"
          />
          <!-- :options="['계약금(청약)', '할부금']" -->
        </kw-search-item>
        <!-- 일자선택 -->
        <kw-search-item
          :label="t('MSG_TXT_DT_SELT')"
          :colspan="2"
        >
          <!-- 처리일자 또는 실적일자 -->
          <kw-select
            v-model="searchParams.selectDay"
            :options="customCodes.SELECT_DAY"
            class="w170"
          />
          <kw-date-range-picker
            v-model:from="searchParams.startDay"
            v-model:to="searchParams.endDay"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 계약상세번호 -->
        <kw-search-item
          required
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        <!-- rules="required" -->
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
          <!-- (단위:원) -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          v-permission:download
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
        <!-- 환불등록 -->
        <kw-btn
          v-permission:create
          secondary
          dense
          :label="$t('MSG_TXT_RFND_RGST')"
          @click="onClickRegistration"
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
import { codeUtil, useGlobal, useMeta, defineGrid, getComponentType, gridUtil, useDataService, modal, fileUtil } from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue'; // 계약상세번호 팝업
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();

let cachedParams;
const { currentRoute } = useRouter();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'RVE_DV_CD', // 입금유형
  'KW_GRP_CO_CD', // 교원그룹회사코드
  'DSB_TP_ACD', // 지급 유형 앱코드
  'RFND_DSB_DV_CD', // 지급구분. 환불금지급구분코드 : 01.현금환불, 02.카드환불, 03.전금
);

// 사용자 정의코드
const customCodes = {
  // 일자선택 : 01.처리일자, 02.실적일자
  SELECT_DAY: [{ codeId: '01', codeName: t('MSG_TXT_PRCSDT') }, { codeId: '02', codeName: t('MSG_TXT_PERF_DT') }],
};

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const searchParams = ref({
  rveDvCd: '01', // 업무구분
  selectDay: '01', // 일자 종류 선택, 01.처리일자, 02.실적일자
  startDay: now.format('YYYYMM01'), // 일자 시작일
  endDay: now.format('YYYYMMDD'), // 일자 종료일
  rfndDsbDvCdCshBltf: '', // 처리구분
  cntrNo: '', // 계약상세번호
  cntrSn: '',
});

// 초기화. 계약상세번호 팝업으로 호출하면서 별도 생성해야함.
async function onClickReset() {
  searchParams.value = {
    rveDvCd: '01', // 업무구분
    selectDay: '01', // 일자 종류 선택, 01.처리일자, 02.실적일자
    startDay: now.format('YYYYMM01'), // 일자 시작일
    endDay: now.format('YYYYMMDD'), // 일자 종료일
    rfndDsbDvCdCshBltf: '', // 처리구분
    cntrNo: '', // 계약상세번호
    cntrSn: '',
  };
}

// 조회 준비
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/consumables-refunds/paging', { params: cachedParams });
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

// 엑셀 다운로드
async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/consumables-refunds/excel-download', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/consumables-refunds', { data: deletedRows });
    await fetchData();
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/withdrawal/idvrve/consumables-refunds', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// 환불등록
async function onClickRegistration() {
  const { result: isChanged } = await modal({
    component: 'WwwdbConsumablesRefundRegP',
  });

  if (isChanged) {
    notify(t('MSG_ALT_REGISTERED'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rfndRcpNoSn' }, // 일련번호
    { fieldName: 'rfndRcpNo' }, // 환불접수번호
    { fieldName: 'rfndRcpDtlSn' }, // 환불접수일련번호
    { fieldName: 'kwGrpCoCd' }, // 법인구분
    { fieldName: 'rfndRveDt', dataType: 'date' }, // 수납일자
    { fieldName: 'rfndPerfDt', dataType: 'date' }, // 실적일자
    { fieldName: 'cntrNoSn' }, // 계약상세번호
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'tmp1' }, // 상세
    { fieldName: 'ogNm' }, // 부서명
    { fieldName: 'prtnrKnm' }, // 파트너명
    { fieldName: 'rfndRcpPrtnrNo' }, // 번호
    { fieldName: 'rfndDsbDuedt', dataType: 'date' }, // 예정일자
    { fieldName: 'rfndDsbDt', dataType: 'date' }, // 매출일자
    { fieldName: 'rfndFshDt', dataType: 'date' }, // 환불일자
    { fieldName: 'tmp2' }, // 유형
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
    { fieldName: 'cntrAmt', dataType: 'number' }, // 계약금액
    { fieldName: 'rfndCshAmt' }, // 처리금액 현금
    { fieldName: 'rfndCardAmt' }, // 처리금액 카드
    { fieldName: 'rfndBltfAmt' }, // 처리금액 전금
    { fieldName: 'rfndCshCardBltAmt' }, // 처리금액
    { fieldName: 'rfndDsbDvCd' }, // 지급구분
    { fieldName: 'cardCshRfndAcnoEncr' }, // 카드번호/계좌번호
    { fieldName: 'cardRfndCrdcdAprno' }, // 승인번호
    { fieldName: 'cardRfndCrdcdIstmMcn' }, // 할부개월
    { fieldName: 'rfndEvidMtrFileId' }, // 자료보관
  ];

  const columns = [
    { // 일련번호
      fieldName: 'rfndRcpNoSn',
      header: t('MSG_TXT_SERIAL_NUMBER'),
      width: '100',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rfndRcpNo, rfndRcpDtlSn } = grid.getValues(index.itemIndex);
        return `${rfndRcpNo}-${rfndRcpDtlSn}`;
      },
    }, // 일련번호
    { fieldName: 'rfndRcpNo', visible: false }, // 환불접수번호
    { fieldName: 'rfndRcpDtlSn', visible: false }, // 환불접수일련번호

    { fieldName: 'kwGrpCoCd', header: t('MSG_TXT_CRP_DV'), width: '100', styleName: 'text-center', options: codes.KW_GRP_CO_CD }, // 법인구분
    { fieldName: 'rfndRveDt', header: t('MSG_TXT_RVE_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자
    { fieldName: 'rfndPerfDt', header: t('MSG_TXT_PERF_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { // 계약상세번호
      fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-left',
      width: '120',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-left' }, // 고객명
    { fieldName: 'tmp1', header: t('MSG_TXT_DTL'), width: '120', styleName: 'text-left' }, // 상세
    { fieldName: 'ogNm', header: t('MSG_TXT_DEPT_NM'), width: '120', styleName: 'text-left' }, // 부서명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: '120', styleName: 'text-left' }, // 파트너명
    { fieldName: 'rfndRcpPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-left' }, // 번호
    { fieldName: 'rfndDsbDuedt', header: t('MSG_TXT_SCHD_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일자
    { fieldName: 'rfndDsbDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'rfndFshDt', header: t('MSG_TXT_RFND_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 환불일자
    { fieldName: 'tmp2', header: t('MSG_TXT_TYPE'), width: '120', styleName: 'text-center', options: codes.DSB_TP_ACD }, // 유형. 지급 유형 앱코드
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '120', styleName: 'text-right' }, // 판매금액
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTR_AMT'), width: '120', styleName: 'text-right' }, // 계약금액
    { fieldName: 'rfndCshAmt', visible: false }, // 처리금액 현금
    { fieldName: 'rfndCardAmt', visible: false }, // 처리금액 카드
    { fieldName: 'rfndBltfAmt', visible: false }, // 처리금액 전금
    { // 처리금액 현금+카드+전금
      fieldName: 'rfndCshCardBltAmt',
      header: t('MSG_TXT_PROCS_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      displayCallback(grid, index, value) {
        const { rfndCshAmt, rfndCardAmt, rfndBltfAmt } = grid.getValues(index.itemIndex);
        value = Number(rfndCshAmt) + Number(rfndCardAmt) + Number(rfndBltfAmt);
        return `${Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      },
    },
    { fieldName: 'rfndDsbDvCd', header: t('MSG_TXT_DSB_DV'), width: '120', styleName: 'text-left', options: codes.RFND_DSB_DV_CD }, // 지급구분
    { // 카드번호/계좌번호
      fieldName: 'cardCshRfndAcnoEncr',
      header: `${t('MSG_TXT_CARD_NO')}/${t('MSG_TXT_AC_NO')}`,
      width: '225',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        if (!isEmpty(value)) {
          value = grid.getValue(index.itemIndex, 'rfndDsbDvCd') === '01'
            ? `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(6, 12)}` // 현금
            : `${value.substring(0, 4)}-${value.substring(4, 8)}-${value.substring(8, 12)}-${value.substring(12, 16)}`; // 카드
          return `${value}`;
        }
      },
    },
    { fieldName: 'cardRfndCrdcdAprno', header: t('MSG_TXT_APR_NO'), width: '130', styleName: 'text-center' }, // 승인번호
    { fieldName: 'cardRfndCrdcdIstmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '100', styleName: 'text-right' }, // 할부개월
    { // 자료보관
      fieldName: 'rfndEvidMtrFileId',
      header: t('MSG_TXT_MTR_KEP'),
      width: '130',
      styleName: 'text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        if (value !== '') { return t('MSG_TXT_MTR_KEP'); } // 자료보관버튼
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    const { rfndEvidMtrFileId } = gridUtil.getRowValue(grid, dataRow); // 자료보관

    // 자료보관
    if (column === 'rfndEvidMtrFileId') {
      if (rfndEvidMtrFileId !== null) { // 증빙첨부이 있는 경우
        notify('화면 내용 확인 필요.');
        fileUtil.download({ rfndEvidMtrFileId }, 'storage');
      }
    }
  };
});

</script>
<style scoped>
</style>
