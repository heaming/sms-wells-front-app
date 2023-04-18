<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbCorporationDepositSspMgtM - 법인입금 예정관리/대사처리 -SSP제휴
3. 작성자 : sojeong.Shin
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 법인 입금 SSP제휴 관리
****************************************************************************************************
--->
<template>
  <kw-search
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- label="실적일자" -->
      <kw-search-item
        :label="t('MSG_TXT_PERF_DT')"
        required
      >
        <kw-date-picker
          v-model="searchParams.perfDt"
          :label="t('MSG_TXT_PERF_DT')"
          rules="required"
        />
      </kw-search-item>
      <!-- label="수납일자" -->
      <kw-search-item
        :label="t('MSG_TXT_RVE_DT')"
        required
      >
        <kw-date-picker
          v-model="searchParams.rveDt"
          :label="t('MSG_TXT_RVE_DT')"
          rules="required"
        />
      </kw-search-item>
      <!-- label="계좌번호" -->
      <kw-search-item
        :label="t('MSG_TXT_AC_NO')"
        required
      >
        <kw-input
          v-model="searchParams.crpAcno"
          :label="t('MSG_TXT_AC_NO')"
          rules="required"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- label="입금자명" -->
      <kw-search-item
        :label="t('MSG_TXT_DPR_NM')"
      >
        <kw-input
          v-model="searchParams.alncmpDprNm"
        />
      </kw-search-item>
      <!-- 수납코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_RVE_CD')"
      >
        <kw-input
          v-model="searchParams.rveCd"
          icon="search"
          @click-icon="onClickSelectRveCd"
        />
        <!-- :options="optionList" -->
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
          @change="fetchData"
        />
        <!-- (단위 : 원) -->
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <!-- label="저장" -->
      <kw-btn
        :label="t('MSG_BTN_SAVE')"
        grid-action
        dense
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- label="엑셀업로드" -->
      <kw-btn
        icon="upload_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_UPLOAD')"
        @click="onClickExcelUpload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- label="엑셀다운로드" -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <!-- label="통합입금번호" -->
      <kw-input
        v-model="searchParams.itgDpNo"
        icon="search"
        clearable
        dense
        :placeholder="t('MSG_TXT_ITG_DP_NO')"
        @click-icon="onClickitgDpNo"
      />
      <!-- label="입금등록" -->
      <kw-btn
        dense
        primary
        :label="t('MSG_BTN_DP_RGST')"
        @click="onClickDepositRgst"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, confirm, getComponentType, gridUtil, modal, notify, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { getters } = useStore();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));

const { companyCode } = getters['meta/getUserInfo'];

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  perfDt: '', // 실적일자
  rveDt: '', // 수납일자
  crpAcno: '', // 계좌번호
  alncmpDprNm: '', // 입금자명
  rveCd: '', // 수납코드
  itgDpNo: '',
});

// 엑셀업로드
async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/withdrawal/idvrve/corporation-dp-ssp/excel-upload';
  const templateId = 'FOM_MSG_RESO_XLS_UP';

  let company;

  if (companyCode === '1200') {
    company = 'E';
  } else {
    company = 'W';
  }

  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });

  if (result) {
    const view = grdMainRef.value.getView();
    const data = view.getDataSource();

    payload.excelData.forEach((param) => {
      param.cntrDtlNo = company + param.cstY + param.cstCd + param.cstSeqn;
      param.cntrNo = company + param.cstY + param.cstCd;
      param.cntrSn = param.cstSeqn;
      param.sellTpCd = Math.floor(param.sellTpCd);
    });

    data.addRows(payload.excelData);
  }
}

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/corporation-dp-ssp/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

// 검색
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/corporation-dp-ssp/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장버튼
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  // TODO: 메시지자원 변경가능성 있음
  if (isEmpty(searchParams.value.itgDpNo)) {
    return notify(t('통합입금번호 입력/조회 후 클릭해주세요'));
  }
  if (!await confirm(t('통합입금번호로 자료를 생성하시겠습니까?'))) { return; }

  const popupResult = gridUtil.getAllRowValues(view);

  for (let i = 0; i < popupResult.length; i += 1) {
    view.setValue(i, 'itgDpNo', searchParams.value.itgDpNo);
  }
  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.post('/sms/wells/withdrawal/idvrve/corporation-dp-ssp', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  fetchData();
}

// 수납코드 조회 팝업
async function onClickSelectRveCd() {
  const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
    componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  console.log(payload);
  if (result) {
    console.log(payload);
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
  }
}

// 통합입금팝업
async function onClickitgDpNo() {
  const { payload } = await modal({ component: 'WwwdbIntegrationDepositNumberP' });
  searchParams.value.itgDpNo = payload;
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'itgDpNo' }, // 통합입금번호
    { fieldName: 'alncmpSuscOrdNo' }, // 구독주문번호
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'crpAcno' }, // 계좌번호
    { fieldName: 'alncmpDprNm' }, // 입금자명
    { fieldName: 'alncmpDpAmt', dataType: 'number' }, // 기본금액
    { fieldName: 'alncmpFee', dataType: 'number' }, // 수수료
    { fieldName: 'sumAmt', dataType: 'number' }, // 합계금액
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
  ];

  const columns = [
    { fieldName: 'itgDpNo', header: t('MSG_TXT_ITG_DP_NO'), width: '150' }, // 통합입금번호
    { fieldName: 'alncmpSuscOrdNo', header: t('MSG_TXT_SUSC_ORD_NO'), width: '134', styleName: 'text-center' }, // 구독주문번호
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'), // 판매유형
      width: '130',
      options: codes.SELL_TP_CD,
    },
    { fieldName: 'crpAcno', header: t('MSG_TXT_AC_NO'), width: '180' }, // 계좌번호
    { fieldName: 'alncmpDprNm', header: t('MSG_TXT_DPR_NM'), width: '150' }, // 입금자명
    { fieldName: 'alncmpDpAmt', header: t('MSG_TXT_BAS_AMT'), width: '150', styleName: 'text-right' }, // 기본금액
    { fieldName: 'alncmpFee', header: t('MSG_TXT_FEE'), width: '131', styleName: 'text-right' }, // 수수료
    { fieldName: 'sumAmt', header: t('MSG_TXT_SUM_AMT'), width: '150', styleName: 'text-right' }, // 합계금액

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}

</script>
