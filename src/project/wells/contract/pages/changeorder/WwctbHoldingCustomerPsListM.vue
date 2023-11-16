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
      ref="srchMainRef"
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
      <h3>{{ t('MSG_TXT_CNT_DTL') }}</h3>
      <kw-input
        v-if="isShow"
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
import { getComponentType, useDataService, useMeta, codeUtil, gridUtil } from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'LC_CTT_RS_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

codes.cttYn = [
  { codeId: 'Y', codeName: t('MSG_TXT_NOT_INSTL') }, /* 미설치' */
  { codeId: 'N', codeName: t('MSG_TXT_NOT_CTT') }, /* 미컨택' */
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const srchMainRef = ref(getComponentType('KwSearch'));
const grdRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const isShow = ref(false);

const searchParams = ref({
  startDt: dayjs().startOf('M').format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  cttYn: '',
  cntrNo: '',
  cntrSn: '',
});

let cachedParams;
async function fetchPage() {
  // 조회 전 필수체크 (페이징사이즈 변경시 필요함.)
  if (!await srchMainRef.value.validate()) { return; }

  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/holding-customers/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  pageInfo.value.pageIndex = 1;
  isShow.value = false;

  await fetchPage();
}

const selectedMemo = ref('');
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'cttYn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdNm' },
    { fieldName: 'cttRsCd' },
    { fieldName: 'cttMoCn' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_GNR_MNG'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_RCPDT'), width: '180', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cttYn', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center', options: codes.cttYn },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250' },
    {
      fieldName: 'cttRsCd',
      header: t('MSG_TXT_CTT_CNTN'),
      width: '200',
      options: codes.LC_CTT_RS_CD,
    },
    {
      fieldName: 'cttMoCn',
      header: t('MSG_TXT_SHOW_DETAIL'),
      renderer: {
        type: 'button',
        hideWhenEmpty: false, // default value, 생략 가능
      },
      displayCallback: () => t('MSG_TXT_SHOW_DETAIL'),
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  view.onCellItemClicked = async (g, { dataRow }) => {
    const moCn = g.getValue(dataRow, 'cttMoCn');

    isShow.value = true;
    if (isEmpty(moCn)) {
      selectedMemo.value = '';
    } else {
      selectedMemo.value = moCn;
    }
  };

  data.setRows([]);
}
</script>
