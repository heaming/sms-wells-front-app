<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : WwsnaOutOfStorageIzDtlMngtListM - 출고내역상세 관리 (W-SV-U-0144M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고된 상세내역을 조회하고 자료를 이관하는 화면 (http://localhost:3000/#/service/wwsna-out-of-storage-iz-dtl-mngt-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 출고기간-->
        <kw-search-item
          :label="`${t('MSG_TXT_OSTR')}${t('MSG_TXT_PRD')}`"
          :colspan="3"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1|required"
            :label="`${t('MSG_TXT_OSTR')}${t('MSG_TXT_PRD')}`"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrHgrWareNo"
          v-model:ware-no-d="searchParams.ostrWareNo"
          sub-first-option="all"
          :colspan="4"
          :label2="$t('MSG_TXT_OSTR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeOstrDvCd"
          @update:ware-no-m="onChagneOstrWareHgrNo"
          @update:ware-no-d="onChagneOstrWareNo"
        />
        <!-- 출고창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ostrWareDtlDvCd"
            :options="filterCodes.ostrWareDtlDvCd"
            first-option="all"
            @change="onChangeOstrWareDtlDvCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :options="codes.OSTR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 입고창고-->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strHgrWareNo"
          v-model:ware-no-d="searchParams.strWareNo"
          sub-first-option="all"
          :colspan="4"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeStrDvCd"
          @update:ware-no-m="onChagneStrWareHgrNo"
          @update:ware-no-d="onChagneStrWareNo"
        />
        <!-- 입고창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.strWareDtlDvCd"
            :options="filterCodes.strWareDtlDvCd"
            first-option="all"
            @change="onChangeStrWareDtlDvCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
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

    <div class="result-area ">
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
          secondary
          dense
          icon="excel"
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
import { codeUtil, getComponentType, useMeta, defineGrid, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'OSTR_TP_CD', // 출고 유형
  'ITM_KND_CD', // 품목 종류
  'PD_GD_CD', // 상품 등급
  'WARE_DTL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'USE_YN',
);

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  stOstrDt: '',
  edOstrDt: '',
  ostrTpCd: '',
  itmGdCd: '',
  itmKndCd: '',
  itmPdCd: '',
  strWareDvCd: '2',
  strHgrWareNo: '',
  strWareNo: '',
  ostrWareDvCd: '1',
  ostrHgrWareNo: '',
  ostrWareNo: '',
  useYn: '',
  strWareDtlDvCd: '',
  ostrWareDtlDvCd: '',
});

const strWareDvCd = { WARE_DV_CD: [
  { codeId: '1', codeName: t('MSG_TXT_LGST_CNR') },
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

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

// 창고상세구분 필터링
const filterCodes = ref({
  strWareDtlDvCd: [],
  ostrWareDtlDvCd: [],
});

// 입고창고구분이 변경되었을때
const onChangeStrWareDvCd = async () => {
  const { strWareDvCd: searchStrWareDvCd } = searchParams.value;

  filterCodes.value.strWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => v.codeId.startsWith(searchStrWareDvCd));
};

watch(() => searchParams.value.strWareDvCd, (val) => {
  if (searchParams.value.strWareDvCd !== val) {
    searchParams.value.strWareDvCd = val;
  }
  onChangeStrWareDvCd();
});

// 출고창고구분이 변경되었을때
const onChangeOstrWareDvCd = async () => {
  const { ostrWareDvCd: searchOstrWareDvCd } = searchParams.value;

  filterCodes.value.ostrWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => v.codeId.startsWith(searchOstrWareDvCd));
};

watch(() => searchParams.value.ostrWareDvCd, (val) => {
  if (searchParams.value.ostrWareDvCd !== val) {
    searchParams.value.ostrWareDvCd = val;
  }
  onChangeOstrWareDvCd();
});

// 출고창고구분 변경 시
function onChangeOstrDvCd() {
  searchParams.value.ostrHgrWareNo = '';
  searchParams.value.ostrWareNo = '';
}

// 출고상위창고 변경 시
function onChagneOstrWareHgrNo() {
  searchParams.value.ostrWareNo = '';
}

// 출고창고 변경 시
function onChagneOstrWareNo() {
  const { ostrWareDtlDvCd, ostrWareNo } = searchParams.value;

  // 창고번호가 있고, 창고상세구분이 조직창고인 경우 창고상세구분 클리어
  if (!isEmpty(ostrWareNo) && (ostrWareDtlDvCd === '20' || ostrWareDtlDvCd === '30')) {
    searchParams.value.ostrWareDtlDvCd = '';
  }
}

// 출고창고상세구분 변경 시
function onChangeOstrWareDtlDvCd() {
  const { ostrWareDtlDvCd } = searchParams.value;

  // 창고상세구분이 조직창고인 경우 개인창고번호 클리어
  if (ostrWareDtlDvCd === '20' || ostrWareDtlDvCd === '30') {
    searchParams.value.ostrWareNo = '';
  }
}

// 입고창고구분 변경 시
function onChangeStrDvCd() {
  searchParams.value.strHgrWareNo = '';
  searchParams.value.strWareNo = '';
}

// 입고상위창고 변경 시
function onChagneStrWareHgrNo() {
  searchParams.value.strWareNo = '';
}

// 입고창고 변경 시
function onChagneStrWareNo() {
  const { strWareDtlDvCd, strWareNo } = searchParams.value;

  // 창고번호가 있고, 창고상세구분이 조직창고인 경우 창고상세구분 클리어
  if (!isEmpty(strWareNo) && (strWareDtlDvCd === '20' || strWareDtlDvCd === '30')) {
    searchParams.value.strWareDtlDvCd = '';
  }
}

// 입고창고상세구분 변경시
function onChangeStrWareDtlDvCd() {
  const { strWareDtlDvCd } = searchParams.value;

  // 창고상세구분이 조직창고인 경우 개인창고번호 클리어
  if (strWareDtlDvCd === '20' || strWareDtlDvCd === '30') {
    searchParams.value.strWareNo = '';
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-iz-dtls/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭
async function onClickSearch() {
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/out-of-storage-iz-dtls/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 초기값 설정
function defaultSet() {
  const now = dayjs();
  const toDay = now.format('YYYYMMDD');
  const startMonth = now.format('YYYYMM');
  const startDay = startMonth.concat('01');

  searchParams.value = {
    stOstrDt: startDay,
    edOstrDt: toDay,
    ostrTpCd: '',
    itmGdCd: '',
    itmKndCd: '',
    itmPdCd: '',
    strWareDvCd: '2',
    strHgrWareNo: '',
    strWareNo: '',
    ostrWareDvCd: '1',
    ostrHgrWareNo: '',
    ostrWareNo: '',
    useYn: '',
  };

  // 등급 필터링
  codes.PD_GD_CD = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));
}

// 초기화버튼 클릭
function onClickReset() {
  defaultSet();
}

onMounted(async () => {
  defaultSet();
  await onChangeStrWareDvCd();
  await onChangeOstrWareDvCd();
  await getProducts();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strWareNm' }, // 입고창고
    { fieldName: 'strPrtnrNo' }, // 입고창고파트너번호
    { fieldName: 'ostrDt' }, // 출고일자
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'pdAbbrNm' }, // 품목명
    { fieldName: 'ostrTpCd' }, // 출고유형
    { fieldName: 'mngtUnitNm' }, // 관리단위
    { fieldName: 'itmGdNm' }, // 등급
    { fieldName: 'llshcs' }, // 직배코스
    { fieldName: 'ostrWareNm' }, // 출고창고
    { fieldName: 'strRgstDt' }, // 입고일자
    { fieldName: 'ostrAkDtlNo' }, // 출고요청번호
    { fieldName: 'strDtlNo' }, // 입고관리번호
    { fieldName: 'ostrDtlNo' }, // 출고관리번호
    { fieldName: 'ostrQty', dataType: 'number' }, // 출고수량
    { fieldName: 'boxQty', dataType: 'number' }, // 박스수량
  ];

  const columns = [
    { fieldName: 'strWareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'strPrtnrNo', header: t('MSG_TXT_STR_WARE_MNGT_PRTNR_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '95', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'ostrTpCd', header: t('MSG_TXT_OSTR_TP'), options: codes.OSTR_TP_CD, width: '120', styleName: 'text-left' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_MNGT_UNIT'), width: '80', styleName: 'text-center' },
    { fieldName: 'itmGdNm', header: t('MSG_TXT_GD'), width: '60', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'ostrQty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'boxQty',
      header: t('MSG_TXT_BOX_KOR_QTY'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrAkDtlNo', header: t('MSG_TXT_OSTR_AK_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrDtlNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'strDtlNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
