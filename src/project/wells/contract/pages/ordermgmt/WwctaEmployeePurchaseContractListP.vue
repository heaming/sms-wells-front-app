<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaEmployeePurchaseContractListP - 직원구매 상품권 지급관리
3. 작성자 : JSY
4. 작성일 : 2023.04.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0105P01] - 직원구매 상품권 지급관리
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    :title="$t('MSG_TIT_EMP_PRCH_INST_PS')"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
      </template>
      <span>{{ t('MSG_TXT_UNIT_MCNT') }}</span> <!-- 단위:개월 -->
    </kw-action-top>
    <kw-grid
      ref="grdEmployeePurchaseGcfDsbList"
      name="grdEmployeePurchaseGcfDsbList"
      @init="initEmployeePurchaseGcfDsbList"
    />
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, useDataService, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdEmployeePurchaseGcfDsbList = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();
const { cancel: onClickClose } = useModal();

const props = defineProps({
  stYy: { type: String, required: true, default: '' },
  colDv: { type: String, required: false, default: '' },
  empno: { type: String, required: false, default: '' },
  srchGbn: { type: String, required: false, default: '' },
  cntrtRelCd: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  stYy: props.stYy,
  colDv: props.colDv,
  empno: props.empno,
  srchGbn: props.srchGbn,
  cntrtRelCd: props.cntrtRelCd,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('sms/wells/contract/contracts/employee-purchases', { params: cachedParams });

  const view = grdEmployeePurchaseGcfDsbList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initEmployeePurchaseGcfDsbList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'hmnrscEmpno' }, // 인사사원번호
    { fieldName: 'prtnrKnm' }, // 판매자명
    { fieldName: 'ogNm' }, // 조직명
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'bryyMmdd' }, // 고객 생년월일
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdTpCd' }, // 상품유형
    { fieldName: 'cntrCnfmDtm' }, // 계약확정일시
    { fieldName: 'sppDuedt' }, // 배송예정일자
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'cntrCanDtm' }, // 취소일
    { fieldName: 'stplPtrm' }, // 약정기간
  ];

  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '94', styleName: 'text-center' }, // 판매자명
    { fieldName: 'ogNm', header: t('MSG_TXT_SELLER_BLG'), width: '157', styleName: 'text-center' }, // 판매자소속
    { fieldName: 'hmnrscEmpno', header: t('MSG_TXT_SELLER_ID'), width: '124', styleName: 'text-center' }, // 판매자사번
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '154', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '94', styleName: 'text-center' }, // 고객명
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_CST_BRYY'), width: '124', styleName: 'text-center', datetimeFormat: 'date' }, // 고객생년
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '259', styleName: 'text-left' }, // 상품명
    { fieldName: 'pdTpCd', header: t('MSG_TXT_PRDT_TYPE'), width: '124', styleName: 'text-center' }, // 상품유형
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_RCP_D'), width: '124', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '124', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '124', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '124', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'stplPtrm', header: t('TXT_MSG_CNTR_PTRM_DV_CD'), width: '98', styleName: 'text-center' }, // 계약기간
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
