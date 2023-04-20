<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaIndividualWarehouseOstrMgtM(W-SV-U-0192M01) - 개인창고출고관리
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.02.18
 5. 수정일 : 2023.03.20 - inho.choi
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 관리자가 물류센터로 독립창고에 물량을 일괄요청하는 화면
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <!-- 배정년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
          />
        </kw-search-item>
        <!-- 회차 -->
        <kw-search-item
          :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
        >
          <kw-input
            v-model="searchParams.asnTnN"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :options="logistics"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.filterItmKndCd"
            first-option="all"
            class="w150"
          />
          <kw-select
            v-model="searchParams.itmKndCdD"
            :options="itemKndCdD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 총출고 -->
        <kw-search-item
          :label="$t('MSG_TXT_TOT_OSTR')"
        >
          <kw-input />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            type="date"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYmd"
          v-model:end-ym="searchParams.baseYmd"
          v-model:options-ware-dv-cd="ostrWareDvCd"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrWareNoM"
          v-model:ware-no-d="searchParams.ostrWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_STR_DT')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input />
          <span>~</span>
          <kw-input />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- sap코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
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
          dense
          grid-action
          :label="$t('MSG_TXT_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            구분
          </p>
          <kw-field
            :model-value="[]"
          >
            <template #default="{ field }">
              <!-- TODO: 추후 로직구성 -->
              <kw-checkbox
                v-bind="field"
                label="미출고수량제외"
                val="미출고수량제외"
              />
            </template>
          </kw-field>
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        name="grdMain"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useDataService, getComponentType, useMeta, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const { t } = useI18n();
const { getConfig } = useMeta();
const { notify } = useGlobal();

const baseURI = '/sms/wells/service/individual-ware-ostrs';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
);

// 품목구분 필터링
const filterCodes = ref({
  filterItmKndCd: [],
});

codes.ITM_KND_CD.forEach((e) => {
  if (e.codeId === '4' || e.codeId === '5'
    || e.codeId === '6') {
    filterCodes.value.filterItmKndCd.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const totalCount = ref(0);

let cachedParams;

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  baseYmd: dayjs().format('YYYYMMDD'),
  asnOjYm: dayjs().format('YYYYMM'),
  itmKndCd: '',
  asnTnN: '1',
  ostrOjWareNo: '',
  ostrWareDvCd: '3',
  ostrWareNoM: '',
  ostrWareNoD: '',
  ostrDt: dayjs().format('YYYYMMDD'),
  itmKndCdD: '',
  sapMatCdFrom: '',
  sapMatCdTo: '',
});

const ostrWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

const itemKndCdD = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const onChangeItmKndCd = async () => {
  // const paramItmKndCd = searchParams.value.itmKndCd;
  // const itmKndCd = cloneDeep(searchParams.value.itmKndCd);
  // const res = await dataService.get(`/sms/wells/service/individual-ware-ostrs/${itmKndCd}`);
  const res = await dataService.get(`${baseURI}/filter-items`, { params: searchParams.value });
  itemKndCdD.value = res.data;
  searchParams.value.itmKndCdD = itemKndCdD.value[0].codeId;
};

watch(() => searchParams.value.itmKndCd, (val) => {
  if (searchParams.value.itmKndCd !== val) {
    searchParams.value.itmKndCd = val;
  }
  onChangeItmKndCd();
});

// 기준년월이 변경되었을때
function onChangeBaseYm() {
  searchParams.value.baseYmd = `${searchParams.value.baseYm}01`;
}

const logisticParams = ref({
  apyYm: dayjs().format('YYYYMM'),
});

const logistics = ref();

async function fetchDefaultData() {
  const res = await dataService.get(`${baseURI}/logistic`, { params: logisticParams.value });
  logistics.value = res.data;
  console.log(logistics.value);
  searchParams.value.ostrOjWareNo = logistics.value[0].codeId;
}

async function fetchData() {
  const res = await dataService.get(baseURI, { params: cachedParams });
  console.log(res);
  const baseData = res.data;
  totalCount.value = baseData.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(baseData);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NO_CHG_CNTN'));

    return false;
  }
}

onMounted(async () => {
  await fetchDefaultData();
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'wareNm', header: t('MSG_TXT_STR_WARE'), width: '160', styleName: 'text-left' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'filtUseQty', header: t('MSG_TXT_FILT_NED_QTY'), width: '106', styleName: 'text-right' },
    { fieldName: 'under20per', header: t('MSG_TXT_ASN_QTY_CPR_STOC_QTY_STG'), width: '130', styleName: 'text-right' },
    { fieldName: 'stocIzUpOnQty', header: t('MSG_TXT_CNR_STOC'), width: '110', styleName: 'text-right' },
    { fieldName: 'toutQty', header: t('MSG_TXT_TOT_OSTR'), width: '100', styleName: 'text-right' },
    { fieldName: 'mgtUntNm', header: t('MSG_TXT_MNGT_UNIT'), width: '106', styleName: 'text-right' },
    { fieldName: 'mgtGdCd', header: t('MSG_TXT_GD'), width: '80', styleName: 'text-right' },
    { fieldName: 'stocIzOnQty', header: t('MSG_TXT_HGR_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_UNIT_QTY'), width: '136', styleName: 'text-right' },
    { fieldName: 'crtlStocQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'nedQty', header: t('MSG_TXT_NED_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'cfrmQty', header: t('MSG_TXT_QTY'), width: '84', styleName: 'text-right' },
    { fieldName: 'boxUnitQty1', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'mcbyAcuOstrQty', header: t('MSG_TXT_AGGS'), width: '84', styleName: 'text-right' },
    { fieldName: 'accBoxQty', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'asnIzOutBoxQty', header: t('MSG_TXT_FILT_BOX_QTY'), width: '130', styleName: 'text-right' },
    { fieldName: 'outQty', header: t('MSG_TXT_OSTR_QTY'), width: '110', styleName: 'text-right' },
    { fieldName: 'rmks', header: t('MSG_TXT_NOTE'), width: '240', styleName: 'text-left' },
  ];

  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'wareNm',
    'sapMatCd',
    'itmPdCd',
    'pdAbbrNm',
    'filtUseQty',
    'under20per',
    'stocIzUpOnQty',
    'toutQty',
    'mgtUntNm',
    'mgtGdCd',
    'stocIzOnQty',
    'boxUnitQty',
    'crtlStocQty', // single
    'nedQty',
    {
      header: t('MSG_TXT_QOM_ASN_CNFM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cfrmQty', 'boxUnitQty1'],
    },
    {
      header: t('MSG_TXT_QOM_ASN_OSTR'),
      direction: 'horizontal',
      items: ['mcbyAcuOstrQty', 'accBoxQty'],
    },
    'asnIzOutBoxQty', 'outQty', 'rmks',
  ]);
});

</script>
