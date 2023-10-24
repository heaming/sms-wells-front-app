<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStoreDetailItemizationListM - 입고상세내역 조회(W-SV-U-0133M01)
3. 작성자 : songTaeSung
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 입고상세내역 조회 (http://localhost:3000/#/service/wwsna-store-detail-itemization-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="9"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 입고기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_PTRM')"
          :colspan="3"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stStrDt"
            v-model:to="searchParams.edStrDt"
            rules="required"
            :label="$t('MSG_TXT_STR_PTRM')"
          />
        </kw-search-item>
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStrDt"
          v-model:end-ym="searchParams.edStrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="4"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeStrDvCd"
          @update:ware-no-m="onChagneStrWareHgrNo"
        />
        <!-- 입고창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.strWareDtlDvCd"
            :options="filterCodes.filterStrWareDtlDvCd"
            first-option="all"
            :disable="isStrOk"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="strTpCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStrDt"
          v-model:end-ym="searchParams.edStrDt"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrWareNoM"
          v-model:ware-no-d="searchParams.ostrWareNoD"
          sub-first-option="all"
          :colspan="4"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_OSTR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeOstrDvCd"
          @update:ware-no-m="onChagneOstrWareHgrNo"
        />
        <!-- 출고창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ostrWareDtlDvCd"
            :options="filterCodes.filterOstrWareDtlDvCd"
            first-option="all"
            :disable="isOstrOk"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 등급 -->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.pgGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="4"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
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
            @change="fetchData"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
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

// import { codeUtil, getComponentType, useDataService, defineGrid } from 'kw-lib';
import { codeUtil, getComponentType, defineGrid, useDataService, gridUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const grdMainRef = ref(getComponentType('KwGrid'));

const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  stStrDt: '',
  edStrDt: '',
  strTpCd: '',
  strWareDvCd: '2',
  strWareNoD: '',
  strWareNoM: '',
  ostrWareDvCd: '1',
  ostrWareNoD: '',
  ostrWareNoM: '',
  pgGdCd: '',
  itmKndCd: '',
  useYn: '',
  itmPdCd: '',
  strWareDtlDvCd: '',
  ostrWareDtlDvCd: '',
});

// 창고상세구분 필터링
const filterCodes = ref({
  filterStrWareDtlDvCd: [],
  filterOstrWareDtlDvCd: [],
});

const isOstrOk = ref();
const isStrOk = ref();

const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD',
  'WARE_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'USE_YN',
  'WARE_DTL_DV_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const strTpCd = codes.STR_TP_CD.filter((v) => v.codeId !== '110');
const strWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

searchParams.value.stStrDt = dayjs().set('date', 1).format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

// 등급 필터링
codes.PD_GD_CD = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/out-of-storage-iz-dtls/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCd = '';
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

function onChangeOstrDvCd() {
  searchParams.value.ostrWareNoM = '';
  searchParams.value.ostrWareNoD = '';
  searchParams.value.ostrWareDtlDvCd = '';
}

function onChagneOstrWareHgrNo() {
  searchParams.value.ostrWareNoD = '';
  searchParams.value.ostrWareDtlDvCd = '';
}

function onChangeStrDvCd() {
  searchParams.value.strWareNoM = '';
  searchParams.value.strWareNoD = '';
  searchParams.value.strWareDtlDvCd = '';
}

function onChagneStrWareHgrNo() {
  searchParams.value.strWareNoD = '';
  searchParams.value.strWareDtlDvCd = '';
}

// 입고창고구분이 변경되었을때
const onChangeStrWareDvCd = async () => {
  const filterStrWareDvCd = searchParams.value.strWareDvCd;

  if (filterStrWareDvCd === '2') {
    filterCodes.value.filterStrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else {
    filterCodes.value.filterStrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
  }
};

watch(() => searchParams.value.strWareDvCd, (val) => {
  if (searchParams.value.strWareDvCd !== val) {
    searchParams.value.strWareDvCd = val;
  }
  onChangeStrWareDvCd();
});

// 출고창고구분이 변경되었을때
const onChangeOstrWareDvCd = async () => {
  const filterOstrWareDvCd = searchParams.value.ostrWareDvCd;

  if (filterOstrWareDvCd === '1') {
    filterCodes.value.filterOstrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else if (filterOstrWareDvCd === '2') {
    filterCodes.value.filterOstrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else {
    filterCodes.value.filterOstrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
  }
};

watch(() => searchParams.value.ostrWareDvCd, (val) => {
  if (searchParams.value.ostrWareDvCd !== val) {
    searchParams.value.ostrWareDvCd = val;
  }
  onChangeOstrWareDvCd();
});

const onDisableStrChk = async () => {
  const chkStrWareNoD = searchParams.value.strWareNoD;
  if (isEmpty(chkStrWareNoD)) {
    isStrOk.value = false;
    return;
  }
  isStrOk.value = true;
  searchParams.value.strWareDtlDvCd = '';
};

const onDisableOstrChk = async () => {
  const chkOstrWareNoD = searchParams.value.ostrWareNoD;
  if (isEmpty(chkOstrWareNoD)) {
    isOstrOk.value = false;
    return;
  }
  isOstrOk.value = true;
  searchParams.value.ostrWareDtlDvCd = '';
};

watch(() => searchParams.value.strWareNoD, (val) => {
  if (searchParams.value.strWareNoD !== val) {
    searchParams.value.strWareNoD = val;
  }
  onDisableStrChk();
});

watch(() => searchParams.value.ostrWareNoD, (val) => {
  if (searchParams.value.ostrWareNoD !== val) {
    searchParams.value.ostrWareNoD = val;
  }
  onDisableOstrChk();
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/store-detail-itemizations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: store, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(store);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/store-detail-itemizations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

onMounted(async () => {
  await onChangeStrWareDvCd();
  await onChangeOstrWareDvCd();
  await getProducts();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strRgstDt' }, // 입고등록일자
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'pdAbbrNm' }, // 상품약어명
    { fieldName: 'strTpNm' }, // 입고유형명
    { fieldName: 'mngtUnitNm' }, // 관리단위명
    { fieldName: 'itmGdNm' }, // 상품등급명
    { fieldName: 'strQty', dataType: 'number' }, // 입고수량
    { fieldName: 'ostrWareNm' }, // 출고창고명
    { fieldName: 'strWareNm' }, // 입고창고명
    { fieldName: 'itmStrNo' }, // 품목입고번호
    { fieldName: 'itmOstrNo' }, // 품목출고번호
  ];

  const columns = [
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), datetimeFormat: 'date', width: '150', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '300' },
    { fieldName: 'strTpNm', header: t('MSG_TXT_STR_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmGdNm', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'strQty', header: t('MSG_TXT_QTY'), dataType: 'number', numberFormat: '#,##0', width: '100', styleName: 'text-right' },
    { fieldName: 'strWareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '200', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>
