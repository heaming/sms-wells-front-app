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
            rules="date_range_required|date_range_months:1"
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
            rules="required"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toGrpNo"
            :name="t('MSG_TXT_GRP_NO')"
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
            :options="codes.PMOT_PRMIT_YN_ACD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="50" />
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

    <template #action>
      <!-- 닫기 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, getComponentType, defineGrid, useDataService, useMeta, useGlobal, useModal } from 'kw-lib';
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
const { cancel: onClickClose } = useModal();

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
);

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
    { fieldName: 'slClYm' }, // 기간
    { fieldName: 'cstKnm' }, // 고객한글명
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
    { fieldName: 'cntrCn' }, // 계약건수
    { fieldName: 'basePdCd' }, // 대표상품코드
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'nomSlAmt' }, // 매출액
    { fieldName: 'emadr' }, // 이메일
    { fieldName: 'faxLocaraTno' }, // 팩스지역전화번호
    { fieldName: 'faxExno' }, // 팩스전화국번호
    { fieldName: 'faxIdvTno' }, // 팩스개별전화번호
    { fieldName: 'lstmmYn' }, // 전월여부
  ];

  const columns = [
    { fieldName: 'preview', header: '미리보기', width: '112', styleName: 'text-center' }, // 미리보기
    { fieldName: 'spectxGrpNo', header: '그룹번호', width: '112', styleName: 'text-center' }, // 그룹번호
    { fieldName: 'cstNm', header: '발급명', width: '155', styleName: 'text-left' }, // 발급명
    { fieldName: 'slClYm', header: '기간', width: '130', styleName: 'text-center' }, // 기간
    { fieldName: 'spectxPblDDvCd', header: '발행일자', width: '112', styleName: 'text-center' }, // 발행일자
    { fieldName: 'spectxPrntDt', header: '출력일', width: '112', styleName: 'text-center' }, // 출력일
    { fieldName: 'isYn', header: '발급여부', width: '112', styleName: 'text-center' }, // 발급여부
    { fieldName: 'spectxFwD', header: '발급일시', width: '165', styleName: 'text-center' }, // 발급일시
    { fieldName: 'spectxFwTm', header: '발급시간', width: '165', styleName: 'text-center' }, // 발급시간
    { fieldName: 'dpTpCd', header: '수납유형', width: '112', styleName: 'text-center' }, // 수납유형
    {
      fieldName: 'cntrDtlNo',
      header: '계약상세번호',
      width: '146',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrNo) && !isEmpty(cntrSn) ? `${cntrNo}-${cntrSn}` : '';
      },
    }, // 계약상세번호
    { fieldName: 'cntrCn', header: '계약건수', width: '148', styleName: 'text-center' }, // 계약건수
    { fieldName: 'basePdNm', header: '상품명', width: '246', styleName: 'text-left' }, // 상품명
    { fieldName: 'nomSlAmt', header: '매출액', width: '130', styleName: 'text-right' }, // 매출액
    { fieldName: 'emadr', header: '이메일', width: '246', styleName: 'text-left' }, // 이메일
    { fieldName: 'faxLocaraTno', header: '팩스지역전화번호', width: '188', styleName: 'text-left' }, // 팩스번호1
    { fieldName: 'faxExno', header: '팩스전화국번호', width: '188', styleName: 'text-left' }, // 팩스번호2
    { fieldName: 'faxIdvTno', header: '팩스개별전화번호', width: '188', styleName: 'text-left' }, // 팩스번호3
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
