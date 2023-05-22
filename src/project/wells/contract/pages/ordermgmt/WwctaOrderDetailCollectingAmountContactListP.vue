<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaOrderDetailCollectingAmountContactListP - 주문상세페이지 내부 팝업_집금컨택내용 관리
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0092P07] - 주문상세페이지 내부 팝업_집금컨택내용 관리 탭화면
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt30">
    <template #left>
      <kw-paging-info
        :total-count="totalCount"
      />
    </template>
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    :page-size="pageInfo.pageSize"
    :total-count="totalCount"
    @init="initGrid"
  />
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, getComponentType, useDataService } from 'kw-lib';

const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const totalCount = ref(0);

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
});

// 조회
async function fetchData() {
  const params = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
  };

  const res = await dataService.get('/sms/wells/contract/contracts/order-details/collecting-amount-contact', { params });
  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 계약번호, 계약일련번호 세팅 (부모창에서 호출)
async function setDatas(cntrNo, cntrSn) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;

  await fetchData();
}

// 외부에서 사용할 수 있도록 노출 선언
defineExpose({
  setDatas,
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'rnum' }, /* [순번] */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cttDt' }, /* [컨택일자] */
    { fieldName: 'cttTm' }, /* [컨택시간] 컨택시각/최초등록시간 */
    { fieldName: 'expDt' }, /* [예정일자] */
    { fieldName: 'clctamCttCd' }, /* 집금컨택코드 */
    { fieldName: 'clctamCttNm' }, /* [컨택사항] 집금컨택명 */
    { fieldName: 'dlqMcn' }, /* [차월] 연체개월수 */
    { fieldName: 'cttMoCn' }, /* [컨택메모] 컨택메모내용 */
    { fieldName: 'sellOgTpCd' }, /* 판매조직유형코드 */
    { fieldName: 'fstRgstUsrId' }, /* 최초등록사용자ID */
    { fieldName: 'usrNm' }, /* [등록담당] 최초등록사용자명 */
    { fieldName: 'modYn' }, /* 수정가능여부. TOBE에서는 삭제 컬럼이 삭제되면서 사용안함. */
  ];

  const columns = [
    { fieldName: 'rnum', header: t('MSG_TXT_SN'), width: '104', styleName: 'text-center' }, // [순번]
    { fieldName: 'cttDt', header: t('MSG_TXT_CTT_DT'), width: '132', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // [컨택일자]
    { fieldName: 'cttTm', header: t('MSG_TXT_CTT') + t('MSG_TXT_TIME'), width: '132', styleName: 'text-center' }, // [컨택시간]
    { fieldName: 'expDt', header: t('MSG_TXT_SCHD_DT'), width: '132', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // [예정일자]
    { fieldName: 'clctamCttNm', header: t('MSG_TXT_CNT_DET'), width: '194' }, // [컨택사항]
    { fieldName: 'dlqMcn', header: t('MSG_TXT_NMN'), width: '104', styleName: 'text-center' }, // [차월]
    { fieldName: 'cttMoCn', header: t('MSG_TXT_CTT_MO'), width: '332' }, // [컨택메모]
    { fieldName: 'usrNm', header: t('MSG_TXT_RGST_ICHR'), width: '130', styleName: 'text-center' }, // [등록담당]
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
