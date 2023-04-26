<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbHoldingCustomerPsListM - 보류고객현황 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 보류고객현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_PTRM')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_CNTR_PTRM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_DIV')">
          <kw-select
            v-model="searchParams.cttYn"
            first-option="all"
            :label="$t('MSG_TXT_DIV')"
            :options="codes.cttYn"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_NO')"
            disable-popup
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchPage"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="onChangePageInfo"
      />
      <h3>{{ t('MSG_TXT_CNT_DTL') }}</h3>
      <kw-input
        v-model="selectedMemo"
        type="textarea"
        :rows="3"
        readonly
        bg-color="bg-white"
        placeholder=""
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useDataService, useMeta, codeUtil, gridUtil } from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const codes = {
  cttYn: [
    {
      codeId: 'Y',
      codeName: t('MSG_TXT_NOT_INSTL'), /* 미설치' */
    },
    {
      codeId: 'N',
      codeName: t('MSG_TXT_NOT_CTT'), /* 미컨택' */
    },
  ],
  ...(await codeUtil.getMultiCodes(
    'COD_PAGE_SIZE_OPTIONS',
    'LC_CTT_RS_CD',
  )),
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
// const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  startDt: dayjs()
    .startOf('M')
    .format('YYYYMMDD'),
  endDt: dayjs()
    .format('YYYYMMDD'),
  cttYn: '',
  cntrNo: undefined,
  cntrSn: undefined,
});

let initialData = [];
const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/holding-customers/paging', { params });

  pageInfo.value = response.data.pageInfo;
  if (grdData.value) {
    grdData.value.setRows(response.data.list);
  } else {
    initialData = response.data.list;
  }
};

function onChangePageInfo(pageIndex, pageSize) {
  fetchPage(pageIndex, pageSize);
}

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

const selectedMemo = ref(`1. 김교원
2. 비데(BN150RWA), 렌탈료 8900
`);
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  useGridDataModel(view, {
    ogCd: {
      label: t('MSG_TXT_BLG'),
      width: 120,
      classes: 'text-center',
    },
    prtnrKnm: {
      label: t('MSG_TXT_GNR_MNG'),
      width: 100,
      classes: 'text-center',
    },
    cntrCnfmDtm: {
      label: t('MSG_TXT_RCPDT'),
      width: 120,
      datetimeFormat: 'date',
    },
    cttYn: {
      label: t('MSG_TXT_DIV'), /* 구분 */
      width: 100,
      options: codes.cttYn,
    },
    cntrNo: { displaying: false },
    cntrSn: {
      type: Number,
      displaying: false,
    },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'),
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
    },
    cstKnm: {
      label: t('MSG_TXT_CST_NM'),
      width: 100,
    },
    pdNm: {
      label: t('MSG_TXT_PRDT_NM'),
      width: 200,
    },
    cttRsCd: {
      label: t('MSG_TXT_CTT_CNTN'),
      width: 410,
      displaying: (cd) => {
        if (!cd || !codes.LC_CTT_RS_CD) { return ''; }
        return `${cd}. ${codes.LC_CTT_RS_CD.find((code) => code.codeId === cd)?.codeName || ''}`;
      },
    },
    cttMoCn: {
      label: t('MSG_TXT_SHOW_DETAIL') /* 상세보기' */,
      displaying: {
        value: t('MSG_BTN_DTL_BRWS'),
        renderer: { type: 'button' },
      },
    },
  });

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = (g, { dataRow }) => {
    const row = gridUtil.getRowValue(view, dataRow);
    selectedMemo.value = row.cttMoCn;
    return false;
  };

  data.setRows(initialData);
});

/* const testFun = () => {
  initialData = Array.from({ length: 7 }).fill(
    {
      cntrNo: 'W20231231987',
      cntrSn: 123,
      cntrCnfmDtm: '20230303125959',
      pdNm: '상품명',
      cttRsCd: '23',
      cttMoCn: '다시 찾아가야 함.',
      ogCd: '조직코도',
      prtnrKnm: '김파트너',
      cttYn: 'Y',
      cstKnm: '이고객',
    },
  );
};
testFun(); */
</script>
