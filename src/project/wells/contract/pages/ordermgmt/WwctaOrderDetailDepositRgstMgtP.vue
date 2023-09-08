<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderDetailDepositRgstMgtP - 입금등록
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0075] - 입금등록 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
    no-action
  >
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <p>{{ props.cntrNo+'-'+props.cntrSn }}</p>
        </kw-search-item>
        <!-- 판매자 -->
        <kw-search-item
          :label="$t('MSG_TXT_SELLER_PERSON')"
        >
          <p>{{ props.prtnrKnm }}</p>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입금일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_DP_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.rveDtFr"
            v-model:to="searchParams.rveDtTo"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_DP_DT')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <!-- 입금등록내역 -->
    <h3 class="mt20">
      {{ $t('MSG_TXT_DP_RGS_IZ') }}
    </h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="pageInfo.totalCount"
        />
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
    </kw-action-top>
    <kw-grid
      ref="grdDepositRgstMgtList"
      name="grdDepositRgstMgtList"
      :visible-rows="5"
      @init="initGrid3"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
  prtnrKnm: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  rveDtFr: now.add('-7', 'day').format('YYYYMMDD'), // 입금일자(시작)
  rveDtTo: now.format('YYYYMMDD'), // 입금일자(종료)
});

const pageInfo = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDepositRgstMgtList = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/deposit-registration/itemizations', { params: cachedParams });
  console.log(res.data);

  const view = grdDepositRgstMgtList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.resetCurrent();
  // view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rveDt' }, // 수납일
    { fieldName: 'perfDt' }, // 실적일
    { fieldName: 'dpMesCd' }, // 유형(입금수단코드)
    { fieldName: 'dpMesNm' }, // 유형명(입금수단코드명)
    { fieldName: 'rveAmt', dataType: 'number' }, // 금액
    { fieldName: 'cdcoCd' }, // 카드(은행사)
    { fieldName: 'cdcoNm' }, // 카드명(은행사)
    { fieldName: 'acnoEncr' }, // 계좌번호암호화(가상계좌)
    { fieldName: 'crcdnoEncr' }, // 신용카드번호암호화(가상계좌)
    { fieldName: 'crdcdIstmMcn' }, // 할부개월
    { fieldName: 'fnlMdfcPrgId' }, // 모듈
    { fieldName: 'stat' }, // 상태
  ];

  const columns = [
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일
    { fieldName: 'dpMesNm', header: t('MSG_TXT_TYPE'), width: '120', styleName: 'text-center' }, // 유형(입금수단코드)
    { fieldName: 'rveAmt', header: t('MSG_TXT_AMT'), width: '160', styleName: 'text-right' }, // 금액
    { fieldName: 'cdcoNm', header: t('MSG_TXT_CARD_BNK'), width: '120', styleName: 'text-center' }, // 카드(은행사)
    {
      fieldName: 'crcdnoEncr',
      header: t('MSG_TXT_CARD_NO_VT_AC'),
      width: '190',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { dpMesCd } = grid.getValues(index.itemIndex);
        const { acnoEncr } = grid.getValues(index.itemIndex);
        const { crcdnoEncr } = grid.getValues(index.itemIndex);
        if (dpMesCd === '01') {
          return acnoEncr;
        }
        if (dpMesCd === '02') {
          return crcdnoEncr;
        }
      },
    }, // 카드번호(가상계좌)
    { fieldName: 'crdcdIstmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '190', styleName: 'text-center' }, // 할부개월
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_MDLE'), width: '190', styleName: 'text-center' }, // 모듈
    { fieldName: 'stat', header: t('MSG_TXT_STT'), width: '190', styleName: 'text-center' }, // 상태
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
