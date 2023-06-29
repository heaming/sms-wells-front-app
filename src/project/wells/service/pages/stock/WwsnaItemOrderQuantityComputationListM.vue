<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaItemOrderQuantityComputationListM(W-SV-U-0296M01) - BS자재 발주수량 산출
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.06.28
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - BS자재 발주수량 산출 (http://localhost:3000/#/service/wwsna-item-order-quantity-computation-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.inqrYm"
            type="month"
            :label="t('MSG_TXT_MGT_YNM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_ITM_DV')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            :label="t('MSG_TXT_ITM_DV')"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
            :multiple="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="t('MSG_TXT_END_SAP_CD')"
            rules="numeric"
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
          />
          <span class="ml8">(단위 : EA)</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          secondary
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_CMPT_EXCD_ITM_MNGT')"
          primary
          dense
          @click="openExcludeItemP"
        />
      </kw-action-top>
      <div class="grid-blank" />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useMeta, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal } = useGlobal();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  inqrYm: dayjs().format('YYYYMM'),
  itmKndCd: '',
  itmPdCds: [],
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
);

const filterCodes = ref({
  itmKndCd: [],
});

function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/computation-exclude-items/products');
  optionsItmPdCd.value = optionsAllItmPdCd.value;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

await Promise.all([
  itmKndCdFilter(),
  getProducts(),
]);

async function openExcludeItemP() {
  const { result } = await modal({
    component: 'WwsnaComputationExcludeItemRegP',
    componentProps: { ...searchParams.value },
  });
  debugger;
  console.log(result);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
