<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaTradeSpcshBlkPwMgtP - 거래명세서 발송
3. 작성자 : JSY
4. 작성일 : 2023.04.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0150P01] - 거래명세서 발송
****************************************************************************************************
--->
<template>
  <!-- 거래명세서 발송 -->
  <kw-popup
    size="2xl"
  >
    <h3 class="mb20">
      {{ t('MSG_TXT_TRD_SPCSH')+' '+t('MSG_TXT_PSH_SEND') }}
    </h3>
    <kw-search @search="onClickSearch">
      <kw-search-row :cols="2">
        <!-- 기간조회 -->
        <kw-search-item
          :label="t('MSG_TXT_PRD_ENQRY')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            :name="t('MSG_TXT_PRD_ENQRY')"
            type="month"
          />
        </kw-search-item>
        <!-- 발행일 -->
        <kw-search-item
          :label="t('MSG_TXT_PUBL_DT')"
          required
        >
          <kw-select
            v-model="searchParams.spectxPblDDvCd"
            :name="t('MSG_TXT_PUBL_DT')"
            :options="codes.SPECTX_PBL_D_DV_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row :cols="2">
        <!-- 그룹번호 -->
        <kw-form-item
          :label="t('MSG_TXT_GRP_NO')"
          required
        >
          <kw-input
            v-model="searchParams.fromGrpNo"
            :name="t('MSG_TXT_GRP_NO')"
            mask="#####"
            maxlength="5"
            rules="required"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toGrpNo"
            :name="t('MSG_TXT_GRP_NO')"
            mask="#####"
            maxlength="5"
            rules="required"
          />
        </kw-form-item>
        <!-- 발급여부 -->
        <kw-search-item
          :label="t('MSG_BTN_IS')+t('MSG_TXT_YN')"
        >
          <kw-select
            v-model="searchParams.isYn"
            :name="t('MSG_BTN_IS')+t('MSG_TXT_YN')"
            :options="isYn"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
        <span class="ml8">(단위: 원)</span>
      </template>
      <!-- 발송 -->
      <kw-btn
        dense
        primary
        :label="t('MSG_BTN_SEND')"
        @click="onClickSend"
      />
    </kw-action-top>
    <kw-grid
      ref="grdTradeSpcshBlkPwMgtList"
      name="grdTradeSpcshBlkPwMgtList"
      :visible-rows="5"
      @init="initTradeSpcshBlkPwMgtList"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, getComponentType, defineGrid, useDataService, useMeta, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert, notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTradeSpcshBlkPwMgtList = ref(getComponentType('KwGrid'));
const now = dayjs();
const { getConfig } = useMeta();

let cachedParams;
const searchParams = ref({
  fromDate: now.format('YYYYMM'),
  toDate: now.format('YYYYMM'),
  spectxPblDDvCd: '',
  fromGrpNo: '',
  toGrpNo: '',
  isYn: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'PMOT_PRMIT_YN_ACD',
  'SPECTX_PBL_D_DV_CD',
  'DP_TP_CD',
);

const isYn = ref([
  { codeId: '1', codeName: 'Y' },
  { codeId: '2', codeName: 'N' },
]);

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('sms/wells/contract/contracts/send-trade-specification-sheets', { params: cachedParams });

  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  const view = grdTradeSpcshBlkPwMgtList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickSend() {
  const view = grdTradeSpcshBlkPwMgtList.value.getView();

  const checkRows = gridUtil.getCheckedRowValues(view);
  if (checkRows.length === 0) {
    notify(t('MSG_ALT_CHK_ID', [t('MSG_TXT_FW_CN')]));
    return;
  }
  await dataService.post('sms/wells/contract/contracts/send-trade-specification-sheets', checkRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initTradeSpcshBlkPwMgtList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'preview' }, // 미리보기
    { fieldName: 'spectxGrpNo' }, // 그룹번호
    { fieldName: 'cstNm' }, // 발급명
    { fieldName: 'cstNmEncr' }, // 발급명
    { fieldName: 'slClYm' }, // 기간
    { fieldName: 'cstKnm' }, // 고객한글명
    { fieldName: 'cstKnmEncr' }, // 고객한글명 마스킹
    { fieldName: 'cstNo' }, // 고객번호
    { fieldName: 'spectxPblDDvCd' }, // 발행일
    { fieldName: 'spectxPrntDt' }, // 출력일
    { fieldName: 'spectxPrdDvCd' }, // 거래명세서주기구분코드
    { fieldName: 'isYn' }, // 발급여부
    { fieldName: 'spectxFwDtm' }, // 발급일시
    { fieldName: 'spectxFwD' }, // 거래명세서발송일
    { fieldName: 'spectxFwTm' }, // 거래명세서발송일시
    { fieldName: 'dpTpCd' }, // 수납유형
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrCn', dataType: 'number' }, // 계약건수
    { fieldName: 'basePdCd' }, // 대표상품코드
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'nomSlAmt', dataType: 'number' }, // 매출액
    { fieldName: 'emadr' }, // 이메일
    { fieldName: 'emadrEncr' }, // 이메일
    { fieldName: 'faxTelNo' }, // 팩스번호
    { fieldName: 'faxLocaraTno' }, // 팩스지역전화번호
    { fieldName: 'faxExno' }, // 팩스전화국번호
    { fieldName: 'faxIdvTno' }, // 팩스개별전화번호
  ];

  const columns = [
    { fieldName: 'preview', header: t('MSG_TXT_PREVIEW'), width: '112', styleName: 'text-center rg-button-report', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_SPCSH_VIEW') }, // 미리보기
    { fieldName: 'spectxGrpNo', header: t('MSG_TXT_GRP_NO'), width: '112', styleName: 'text-center' }, // 그룹번호
    { fieldName: 'cstNmEncr', header: t('MSG_TXT_IS_USR'), width: '155', styleName: 'text-left' }, // 발급담당자
    { fieldName: 'slClYm', header: t('MSG_TXT_PRD'), width: '130', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 기간
    { fieldName: 'spectxPblDDvCd', header: t('MSG_TXT_PBL_DT'), width: '112', styleName: 'text-center', options: codes.SPECTX_PBL_D_DV_CD }, // 발행일자
    { fieldName: 'spectxPrntDt', header: t('MSG_TXT_PRNT_DT'), width: '112', styleName: 'text-center', datetimeFormat: 'date' }, // 출력일자
    { fieldName: 'isYn', header: t('MSG_TXT_IS_YN'), width: '112', styleName: 'text-center', options: isYn.value }, // 발급여부
    { fieldName: 'spectxFwD', header: t('MSG_TXT_IS_DTM'), width: '165', styleName: 'text-center', datetimeFormat: 'date' }, // 발급일자
    { fieldName: 'spectxFwTm', header: t('MSG_TXT_IS_HH'), width: '165', styleName: 'text-center', datetimeFormat: 'time' }, // 발급시간
    { fieldName: 'dpTpCd', header: `${t('MSG_TXT_RVE')}${t('MSG_TXT_TYPE')}`, width: '112', styleName: 'text-center', options: codes.DP_TP_CD }, // 수납유형
    {
      fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '146',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrNo) && !isEmpty(cntrSn) ? `${cntrNo}-${cntrSn}` : '';
      },
    }, // 계약상세번호
    { fieldName: 'cntrCn', header: t('MSG_TXT_CNTR_CT'), width: '148', styleName: 'text-right', numberFormat: '#,##0' }, // 계약건수
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '246', styleName: 'text-left' }, // 상품명
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0' }, // 매출금액
    { fieldName: 'emadrEncr', header: t('MSG_TXT_EMAIL'), width: '246', styleName: 'text-left' }, // 이메일
    { fieldName: 'faxTelNo',
      header: t('MSG_TXT_FAX_LOCARA_TNO'),
      width: '188',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { faxLocaraTno, faxExno, faxIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(faxLocaraTno) && !isEmpty(faxExno) && !isEmpty(faxIdvTno) ? `${faxLocaraTno}-${faxExno}-${faxIdvTno}` : '';
      },
    }, // 팩스번호
    { fieldName: 'faxLocaraTno', header: t('MSG_TXT_FAX_LOCARA_TNO'), width: '188', styleName: 'text-left', visible: false }, // 팩스번호1
    { fieldName: 'faxExno', header: t('MSG_TXT_FAX_MEXNO'), width: '188', styleName: 'text-left', visible: false }, // 팩스번호2
    { fieldName: 'faxIdvTno', header: t('MSG_TXT_FAX_IDV_TNO'), width: '188', styleName: 'text-left', visible: false }, // 팩스번호3
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column }) => {
    // TODO: 미리보기 팝업화면 개발진행 후 변경 예정
    if (column === 'preview') {
      notify(t('팝업 준비중 입니다.')); // 리포트 팝업 준비 중
    }
  };
});
</script>
