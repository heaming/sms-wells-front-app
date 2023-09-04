<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaLinkProductListP - 연계상품 리스트 조회
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0129P07] 연계상품 리스트 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
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
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_CASES') }}</span> <!-- (단위:건) -->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
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
import { codeUtil, defineGrid, getComponentType, useDataService, useGlobal, gridUtil, useModal } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
const { modal } = useGlobal();
const { cancel: onClickClose } = useModal();

const props = defineProps({
  cntrNo: { type: String, default: '' }, // 부모창에서 넘어온 계약번호
  cntrSn: { type: String, default: '' }, // 부모창에서 넘어온 계약일련번호
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/link-products/paging', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn, ...pageInfo.value } });

  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 화면 마운트 완료 이벤트
onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // [계약상세번호] 계약번호
    { fieldName: 'cntrSn' }, // [계약상세번호] 계약일련번호
    { fieldName: 'cntrRelTpCd' }, // 계약관계유형코드
    { fieldName: 'cntrRelTpNm' }, // 계약관계유형코드명
    { fieldName: 'cntrRelDtlCd' }, // 계약관계상세코드
    { fieldName: 'cntrRelDtlNm' }, // [연관계약명] 계약관계상세코드명
    { fieldName: 'relDv' }, // 계약번호 구분 B:기준, O:대상
    { fieldName: 'basePdCd' }, // [상품코드] 기준상품코드
    { fieldName: 'basePdNm' }, // [상품명]
    { fieldName: 'pdQty', dataType: 'number' }, // [상품수량]
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    }, // 계약상세번호
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_RLTD_CNTR_NM'), width: '180', styleName: 'text-left' }, // 연관계약명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' }, // 상품코드
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-left' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_PROD_QUANT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 상품수량
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.column === 'cntrNo') {
      const { cntrNo, cntrSn } = gridUtil.getRowValue(g, clickData.itemIndex);
      await modal({
        component: 'WwctaOrderDetailP', // wells 주문 상세 조회 팝업
        componentProps: { cntrNo, cntrSn },
        draggable: true,
        window: true,
        windowFeatures: { width: 1300, height: 1080 },
      });
    }
  };
});
</script>
