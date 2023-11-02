<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0301M01] WwsnaAssignComparisonHaveMatPsM - 배정건 대비 보유자재 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.08
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','depth1', 'depth2', '배정건 대비 보유자재 현황']" />
    </template>

    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item :label="t('MSG_TXT_LOOKUP_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            :rules="schDataValidation"
          />
        </kw-search-item>

        <!-- 창고(개인) -->
        <!-- <kw-search-item :label="$t('MSG_TXT_WARE') + '(' + $t('MSG_TXT_INDV') + ')'">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-input />
        </kw-search-item> -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.strtDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          sub-first-option="all"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item :label="t('MSG_TXT_ITM_DV')">
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="itmKndCdList"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('TXT_MSG_AS_ITM_CD')">
          <kw-input
            v-model.trim="searchParams.sapItemCdFrom"
            class="mr8"
            mask="#####-######"
            :rules="sapItemCdFromValidation"
            clearable
          />
          <span>~</span>
          <kw-input
            v-model.trim="searchParams.sapItemCdTo"
            mask="#####-######"
            :rules="sapItemCdToValidation"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- sap코드 -->
        <kw-search-item :label="$t('MSG_TXT_SAP_CD')">
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
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
            @change="fetchData"
          />
          <!-- (단위:원) -->
          <span class="ml8">({{ t('MSG_TXT_UNIT') }}: {{ t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, gridUtil, validate } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'WARE_DV_CD',
  'ITM_KND_CD', // 품목코드
);
console.log('codes.COD_PAGE_SIZE_OPTIONS >>>', codes.COD_PAGE_SIZE_OPTIONS);
console.log('codes.PD_GRP_CD >>>', codes.PD_GRP_CD);
console.log('codes.ITM_KND_CD >>>', codes.ITM_KND_CD);

// 품목코드
const itmKndCdList = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

const searchParams = ref({
  strtDt: dayjs().startOf('month').format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  sapItemCdFrom: '',
  sapItemCdTo: '',
  strtSapCd: '',
  endSapCd: '',
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  itmKndCd: '',
  itmPdCds: '',
});

const wareDvCd = { WARE_DV_CD: [
  { codeId: '1', codeName: '물류센터' },
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

let cachedParams;

// const itmKndCdList = ref([]);
// eslint-disable-next-line max-len
// itmKndCdList.value = (await dataService.get('/sms/wells/service/bs-regular-shipping/products', { params: searchParams.value })).data;
// console.log('itmKndCdList.value >>>', itmKndCdList.value);

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

// 품목조회
const getProductList = async () => {
  const result = await dataService.get('/sms/wells/service/independence-ware-ostrs/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

await getProductList();

console.log('optionsItmPdCd.value >>>', optionsItmPdCd.value);
console.log('optionsAllItmPdCd.value >>>', optionsAllItmPdCd.value);

async function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }
  console.log('itmKndCd >>>', itmKndCd);
  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

// onMounted(async () => {
//   await getProductList();
// });

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

async function fetchData() {
  console.log('fetchData START');
  const res = await dataService.get('/sms/wells/service/assign-cpr-hv-mat-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('fetchData res.data >>>', res.data);
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

const schDataValidation = async (val, options) => {
  const errors = [];
  errors.push(
    ...(await validate(val, 'date_range_required', options)).errors,
  );
  const monthDiff = dayjs(searchParams.value.strtDt).startOf('month').diff(dayjs(searchParams.value.endDt).startOf('month'), 'month');
  if (monthDiff <= -12) {
    errors.push(t('MSG_ALT_SEARCH_UNDER_MN', [t('12')]));
  }
  return errors[0] || true;
};

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/** =======================================
 * 배정건 대비 보유자재 현황 엑셀 다운로드
**======================================= */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/assign-cpr-hv-mat-ps/excel-download', { params: cachedParams });

  // await gridUtil.exportView(view, {
  //   fileName: currentRoute.value.meta.menuName,
  //   timePostfix: true,
  //   exportData: response.data,
  //   checkBar: 'hidden',
  // });
  await gridUtil.exportView(view, {
    fileName: '배정건 대비 보유자재 현황',
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'itmKnd', header: t('MSG_TXT_ITM_DV'), width: '120', styleName: 'text-center' }, // 품목구분
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '250', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '100', styleName: 'text-center' }, // 품목명
    { fieldName: 'wareNmUp', header: t('MSG_TXT_BSNS_CNTR') + t('MSG_TXT_NM'), width: '100', styleName: 'text-center' }, // 영업센터명
    { fieldName: 'onQtyUp', header: t('자재실 재고'), width: '100', styleName: 'text-center' }, // 자재실 재고
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' }, // 소속코드
    { fieldName: 'wareMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '100', styleName: 'text-center' }, // 담당자
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '100', styleName: 'text-center' }, // 창고명
    { fieldName: 'approvedQty', header: t('가용재고'), width: '100', styleName: 'text-left', dataType: 'number' }, // 가용재고
    { fieldName: 'nonApprovedQty', header: t('MSG_TXT_UNAPPR') + t('MSG_TXT_STOC'), width: '100', styleName: 'text-left', dataType: 'number' }, // 미승인재고
    { fieldName: 'onQty', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-left', dataType: 'number' }, // 계
    { fieldName: 'remain', header: t('MSG_TXT_AMORM'), width: '100', styleName: 'text-left', dataType: 'number' }, // 잔량
    { fieldName: 'lack', header: t('MSG_TXT_STG'), width: '100', styleName: 'text-left', dataType: 'number' }, // 부족
    { fieldName: 'partUseTotalQty', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty01', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp01', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp01', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty02', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp02', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp02', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty03', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp03', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp03', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty04', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp04', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp04', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty05', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp05', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp05', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty06', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp06', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp06', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty07', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp07', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp07', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty08', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp08', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp08', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty09', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp09', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp09', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty10', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp10', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp10', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty11', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp11', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp11', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
    { fieldName: 'partUseQty12', header: t('MSG_TXT_TOTAL_ASGN'), width: '100', styleName: 'text-left', dataType: 'number' }, // 총 배정
    { fieldName: 'qtyBsComp12', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 완료
    { fieldName: 'qtyBsNonComp12', header: t('MSG_TXT_BEFORE_SERVICE') + t('MSG_TXT_PENDING'), width: '100', styleName: 'text-left', dataType: 'number' }, // B/S 대기
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    'itmKnd',
    'sapMatCd',
    'pdCd',
    'pdNm',
    'wareNmUp',
    'onQtyUp',
    { // 창고정보
      header: { text: t('MSG_TXT_WARE_INF') },
      direction: 'horizontal',
      items: [
        'ogCd',
        'wareMngtPrtnrNo',
        'prtnrKnm',
        'wareNm',
      ],
    },
    { // 개인창고 재고
      header: { text: `${t('MSG_TXT_INDV_WARE')} ${t('MSG_TXT_STOC')}` },
      direction: 'horizontal',
      items: [
        'approvedQty',
        'nonApprovedQty',
        'onQty',
      ],
    },
    'remain',
    'lack',
    { // 배정계
      header: { text: `${t('MSG_TXT_ASGN')} ${t('MSG_TXT_AGG')}` },
      direction: 'horizontal',
      items: [
        'partUseTotalQty',
        'qtyBsComp',
        'qtyBsNonComp',
      ],
    },
    { // 1월
      header: { text: t('MSG_TXT_JAN') },
      direction: 'horizontal',
      items: [
        'partUseQty01',
        'qtyBsComp01',
        'qtyBsNonComp01',
      ],
    },
    { // 2월
      header: { text: t('MSG_TXT_FEB') },
      direction: 'horizontal',
      items: [
        'partUseQty02',
        'qtyBsComp02',
        'qtyBsNonComp02',
      ],
    },
    { // 3월
      header: { text: t('MSG_TXT_MAR') },
      direction: 'horizontal',
      items: [
        'partUseQty03',
        'qtyBsComp03',
        'qtyBsNonComp03',
      ],
    },
    { // 4월
      header: { text: t('MSG_TXT_APRI') },
      direction: 'horizontal',
      items: [
        'partUseQty04',
        'qtyBsComp04',
        'qtyBsNonComp04',
      ],
    },
    { // 5월
      header: { text: t('MSG_TXT_MAY') },
      direction: 'horizontal',
      items: [
        'partUseQty05',
        'qtyBsComp05',
        'qtyBsNonComp05',
      ],
    },
    { // 6월
      header: { text: t('MSG_TXT_JUN') },
      direction: 'horizontal',
      items: [
        'partUseQty06',
        'qtyBsComp06',
        'qtyBsNonComp06',
      ],
    },
    { // 7월
      header: { text: t('MSG_TXT_JUL') },
      direction: 'horizontal',
      items: [
        'partUseQty07',
        'qtyBsComp07',
        'qtyBsNonComp07',
      ],
    },
    { // 8월
      header: { text: t('MSG_TXT_AUG') },
      direction: 'horizontal',
      items: [
        'partUseQty08',
        'qtyBsComp08',
        'qtyBsNonComp08',
      ],
    },
    { // 9월
      header: { text: t('MSG_TXT_SEPT') },
      direction: 'horizontal',
      items: [
        'partUseQty09',
        'qtyBsComp09',
        'qtyBsNonComp09',
      ],
    },
    { // 10월
      header: { text: t('MSG_TXT_OCT') },
      direction: 'horizontal',
      items: [
        'partUseQty10',
        'qtyBsComp10',
        'qtyBsNonComp10',
      ],
    },
    { // 11월
      header: { text: t('MSG_TXT_NOV') },
      direction: 'horizontal',
      items: [
        'partUseQty11',
        'qtyBsComp11',
        'qtyBsNonComp11',
      ],
    },
    { // 12월
      header: { text: t('MSG_TXT_DECE') },
      direction: 'horizontal',
      items: [
        'partUseQty12',
        'qtyBsComp12',
        'qtyBsNonComp12',
      ],
    },
  ]);
}

</script>

<style scoped>
</style>
