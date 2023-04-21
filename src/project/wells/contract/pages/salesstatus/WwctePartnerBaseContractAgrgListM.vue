<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwctePartnerBaseContractAgrgListM - 플래너별 계약 집계
3. 작성자 : gs.piit159
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 플래너별 계약 집계정보 조회(지점장)(W-SS-U-0059M01)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.condCls"
            class="w100"
            :options="[{codeId: 1, codeName: $t('MSG_TXT_PRTNR')},
                       {codeId: 2, codeName: $t('MSG_TXT_BRANCH')}]"
            @change="onChangeCondCls"
          />
          <kw-input
            v-if="searchParams.condCls===1"
            v-model="searchParams.prtnrNo"
            :max-length="10"
            class="w200"
            icon="search"
            :on-click-icon="onClickSearchPrtnr"
          />
          <kw-input
            v-if="searchParams.condCls===2"
            v-model="searchParams.ogNm"
            :max-length="10"
            class="w200"
            icon="search"
            :on-click-icon="onClickSearchOg"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          primary
          dense
          :label="$t('MSG_TXT_CNTR_MGT')"
          @click="onClickCntrMgt"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="Math.max(10, Math.min(Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')), totalCount))"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, modal, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const router = useRouter();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({
  condCls: 1,
  prtnrNo: '',
  ogTpCd: '',
  ogNm: '',
  ogCd: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/partner-aggregations', { params: searchParams.value });
  const aggs = res.data;
  totalCount.value = aggs.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(aggs);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onChangeCondCls() {
  searchParams.value.prtnrNo = '';
  searchParams.value.ogTpCd = '';
  searchParams.value.ogCd = '';
}

async function onClickSearchPrtnr() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W01',
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.ogTpCd = payload.ogTpCd;
  }
}

async function onClickSearchOg() {
  const { result, payload } = await modal({
    component: 'ZwogzOrganizationListP',
    componentProps: {
      ogNm: searchParams.value.ogNm,
      ogTpCd: 'W01',
      baseYm: dayjs().format('YYYYMM'),
    },
  });
  if (result) {
    searchParams.value.ogNm = payload.ogNm;
    searchParams.value.ogCd = payload.ogCd;
  }
}

async function onClickCntrMgt() {
  router.push({
    path: '/contract/wwcta-contract-management-list',
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'ogCd' },
    { fieldName: 'c20', dataType: 'number' },
    { fieldName: 'c40', dataType: 'number' },
    { fieldName: 'c60', dataType: 'number' },
    { fieldName: 'c50', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: 120, styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: 150, styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BRCH_CD'), width: 150, styleName: 'text-center' },
    { fieldName: 'c20', header: t('MSG_TXT_DRFT_CMPL'), width: 150, styleName: 'text-right' },
    { fieldName: 'c40', header: t('MSG_TXT_APP_IN_PRG'), width: 150, styleName: 'text-right' },
    { fieldName: 'c60', header: t('MSG_TXT_TOT_CNFM'), width: 150, styleName: 'text-right' },
    { fieldName: 'c50', header: t('MSG_TXT_STLM_FSH'), width: 150, styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
}

</script>
