<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStockContinueMonthStateM - 재고지속월 현황(K-W-SV-U-0215M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-07-26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고집계현황 http://localhost:3000/#/service/wwsna-stock-continue-month-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="3"
        >
          <!-- <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required"
            @change="onChangeDt"
          /> -->
          <kw-date-picker
            v-model="searchParams.startDt"
            @change="onChangeDt('S')"
          />
          ~
          <kw-date-picker
            v-model="searchParams.endDt"
            @change="onChangeDt('E')"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          :colspan="4"
        />
        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
            :disable="isOk"
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
            :options="tempOptions.itmGdCd"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="4"
        >
          <kw-select
            v-model="searchParams.itmKindCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            class="w120"
            @change="onChangeItmDvCd"
          />
          <kw-select
            v-model="searchParams.itmGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w120"
            @change="onChangeItmDvCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
            :multiple="true"
          />
        </kw-search-item>
        <!-- 사용 여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_YN')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="tempOptions.useYn"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- <kw-search-item>
          <kw-input
            v-model="searchParams.pdCdFrom"
            type="text"
            placeholder=""
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdTo"
            type="text"
            placeholder=""
          />
        </kw-search-item> -->
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="3"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            upper-case
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
          :colspan="6"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_STOC_CTN_MM') }}
          </p>
          <kw-select
            :model-value="stokContMmOptions"
            :options="tempOptions.stokContMmCd"
            dense
            @change="onChangestokContMm"
          />
          <kw-option-group
            dense
            :model-value="stokContMmBaseOptions"
            type="checkbox"
            :options="tempOptions.stokContMmBaseCd"
            class="ml10"
            @change="onChangeStokUtlzDvCd"
          />
        </li>
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_DIV') }}
          </p>
          <kw-option-group
            dense
            :model-value="matUtlzOptions"
            type="checkbox"
            :options="codes.MAT_UTLZ_DV_CD"
            @change="onChangeMatUtlzDvCd"
          />
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();

console.log(notify);
console.log(t);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/stock-continue-month-state';

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
  'PD_GRP_CD',
);

const tempOptions = {
  itmGdCd: [
    { codeId: 'A', codeName: t('MSG_TXT_A_GD') }, // A급
    { codeId: 'B', codeName: t('MSG_TXT_B_GD') }, // B급
    { codeId: 'E', codeName: t('MSG_TXT_EGD') }, // E급
    { codeId: 'R', codeName: t('MSG_TXT_RGD') }, // R급
    { codeId: 'X', codeName: t('MSG_TXT_XGD') }, // X급
  ],
  useYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  stokContMmCd: [
    { codeId: '1', codeName: t('MSG_TXT_STOC_CTN_MM1') }, // 재고지속월1
    { codeId: '2', codeName: t('MSG_TXT_STOC_CTN_MM2') }, // 재고지속월2
  ],
  stokContMmBaseCd: [ // 재고지속월기준
    { codeId: '1', codeName: t('MSG_TXT_1M_BLW') }, // 1개월이하
    { codeId: '2', codeName: t('MSG_TXT_2M_BLW') }, // 2.5개월이하
  ],
};

const wareDvCd = {
  WARE_DV_CD: [
    { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
    { codeId: '1', codeName: t('MSG_TXT_LGST_CNR') },
  ],
};

const searchParams = ref({
  startDt: dayjs().set('date', 1).format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  tmpStartDt: dayjs().set('date', 1).format('YYYYMMDD'),
  tmpEndDt: dayjs().format('YYYYMMDD'),
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  wareDtlDvCd: '',
  itmGdCd: 'A', // 등급
  useYn: '', // 사용여부
  itmDvCd: '', // 품목구분
  stokContMmCd: '',
  pdCdFrom: '',
  pdCdTo: '',
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
  itmKindCd: '',
  itmGrpCd: '',
  itmPdCds: [],
  matUtlzDvCds: [''],
});

const filterCodes = ref({
  wareDtlDvCd: [],
});

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/monthly-by-stock-state/products');
  const pdCds = result.data.map((v) => v.pdCd);
  optionsItmPdCd.value = result.data.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
  optionsAllItmPdCd.value = result.data;
};

// 품목종류, 품목그룹 변경 시 품목 필터링
function onChangeItmDvCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKindCd, itmGrpCd } = searchParams.value;

  if (isEmpty(itmKindCd) && isEmpty(itmGrpCd)) {
    const pdCds = optionsAllItmPdCd.value.map((v) => v.pdCd);
    optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
    return;
  }
  const filterPdInfos = optionsAllItmPdCd.value.filter(
    (v) => (isEmpty(itmKindCd) || itmKindCd === v.itmKndCd) && (isEmpty(itmGrpCd) || itmGrpCd === v.itmGrpCd),
  );

  if (isEmpty(itmGrpCd)) {
    const pdCds = filterPdInfos.map((v) => v.pdCd);
    optionsItmPdCd.value = filterPdInfos.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
  } else {
    optionsItmPdCd.value = filterPdInfos;
  }
}

/** =============================================
 * 이영진 M..20240122
 * 조회 기간 변경 처리
** ============================================= */
const currentYm = ref(dayjs().format('YYYYMM'));
const sDt = ref('N');
const eDt = ref('N');
async function onChangeDt(obj) {
  let currentYn = 'N';
  if (obj === 'S') {
    currentYn = currentYm.value === searchParams.value.startDt.substring(0, 6) ? 'Y' : 'N';
    if (eDt.value === 'Y') {
      eDt.value = 'N';
      return;
    }
    if (currentYn === 'Y') {
      searchParams.value.endDt = dayjs().format('YYYYMMDD');
    } else {
      searchParams.value.endDt = dayjs(searchParams.value.startDt).subtract(0, 'month').endOf('month').format('YYYYMMDD');
    }
    sDt.value = 'Y';
  } else if (obj === 'E') {
    currentYn = currentYm.value === searchParams.value.endDt.substring(0, 6) ? 'Y' : 'N';
    if (sDt.value === 'Y') {
      sDt.value = 'N';
      if (searchParams.value.startDt.substring(0, 6) !== searchParams.value.endDt.substring(0, 6)) {
        if (currentYn !== 'Y') {
          searchParams.value.endDt = dayjs(searchParams.value.startDt).subtract(0, 'month').endOf('month').format('YYYYMMDD');
        } else {
          searchParams.value.endDt = dayjs().subtract(0, 'month').endOf('day').format('YYYYMMDD');
        }
      }
      return;
    }
    if (currentYn === 'Y') {
      searchParams.value.startDt = dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD');
    } else {
      searchParams.value.startDt = dayjs(searchParams.value.endDt).subtract(0, 'month').startOf('month').format('YYYYMMDD');
    }
    eDt.value = 'Y';
  }
}

const isOk = ref();

// 창고구분 변경 시, 창고상세구분 세팅
const onChangeWareDvCd = async () => {
  const filterWareDvCd = searchParams.value.wareDvCd;

  if (filterWareDvCd === '1') { // 물류센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else { // 서비스센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  }
};

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
});

const onDisableChk = async () => {
  const chkWareNoD = searchParams.value.wareNoD;
  if (chkWareNoD === undefined || chkWareNoD === null || chkWareNoD === '') {
    isOk.value = false;
  } else {
    isOk.value = true;
    searchParams.value.wareDtlDvCd = '';
  }
};

watch(() => searchParams.value.wareNoD, (val) => {
  if (searchParams.value.wareNoD !== val) {
    searchParams.value.wareNoD = val;
  }
  onDisableChk();
});

let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  console.log('searchParams.value >>>', searchParams.value);
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);

  if (searchParams.value.wareDvCd === '1') {
    view.columnByName('lgstBtdStocGdQty').visible = true; // 파주물류
    view.columnByName('svCnrBtdStocGdQty').visible = true; // 센터 조직창고
    view.columnByName('svEgerBtdStocGdQty').visible = true; // 엔지니어 개인창고
    view.columnByName('lstmmWkEtcOstrGdQty').visible = true; // 전월출고
    view.columnByName('wkEtcOstrGdQty').visible = true; // 당월출고
    view.columnByName('lgstStrQty').visible = true; // 당월물류 구매입고
    view.columnByName('svCnrStrQty').visible = false; // 당월센터 정상입고
    view.columnByName('svEgerStrQty').visible = false; // 당월 엔지니어 개인창고 정상입고
    view.columnByName('lgstPitmStocGdQty').visible = true; // 파주물류물류센터 조직창고 기말재고
    view.columnByName('svCnrPitmStocGdQty').visible = true; // 서비스센터 조직창고 기말재고
    view.columnByName('svEgerLgstPitmStocGdQty').visible = false; // 엔지니어 개인창고 기말재고
    view.columnByName('lgstKeppMm1').visible = true; // 재고지속월 1(물류센터)
    view.columnByName('lgstKeppMm2').visible = true; // 재고지속월 2(물류센터)
    view.columnByName('svCnrKeppMm1').visible = false; // 재고지속월 1(서비스센터)
    view.columnByName('svCnrKeppMm2').visible = false; // 재고지속월 2(서비스센터)
    view.columnByName('svEgerKeppMm1').visible = false; // 재고지속월 1(엔지니어)
    view.columnByName('svEgerKeppMm2').visible = false; // 재고지속월 2(엔지니어)
  } else if (searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
    view.columnByName('lgstBtdStocGdQty').visible = false; // 파주물류
    view.columnByName('svCnrBtdStocGdQty').visible = false; // 센터 조직창고
    view.columnByName('svEgerBtdStocGdQty').visible = true; // 엔지니어 개인창고
    view.columnByName('lstmmWkEtcOstrGdQty').visible = true; // 전월출고
    view.columnByName('wkEtcOstrGdQty').visible = true; // 당월출고
    view.columnByName('lgstStrQty').visible = false; // 당월물류 구매입고
    view.columnByName('svCnrStrQty').visible = false; // 당월센터 정상입고
    view.columnByName('svEgerStrQty').visible = true; // 당월 엔지니어 개인창고 정상입고
    view.columnByName('lgstPitmStocGdQty').visible = false; // 파주물류물류센터 조직창고 기말재고
    view.columnByName('svCnrPitmStocGdQty').visible = false; // 서비스센터 조직창고 기말재고
    view.columnByName('svEgerLgstPitmStocGdQty').visible = true; // 엔지니어 개인창고 기말재고
    view.columnByName('lgstKeppMm1').visible = false; // 재고지속월 1(물류센터)
    view.columnByName('lgstKeppMm2').visible = false; // 재고지속월 2(물류센터)
    view.columnByName('svCnrKeppMm1').visible = false; // 재고지속월 1(서비스센터)
    view.columnByName('svCnrKeppMm2').visible = false; // 재고지속월 2(서비스센터)
    view.columnByName('svEgerKeppMm1').visible = true; // 재고지속월 1(엔지니어)
    view.columnByName('svEgerKeppMm2').visible = true; // 재고지속월 2(엔지니어)
  } else {
    view.columnByName('lgstBtdStocGdQty').visible = false; // 파주물류
    view.columnByName('svCnrBtdStocGdQty').visible = true; // 센터 조직창고
    view.columnByName('svEgerBtdStocGdQty').visible = true; // 엔지니어 개인창고
    view.columnByName('lstmmWkEtcOstrGdQty').visible = true; // 전월출고
    view.columnByName('wkEtcOstrGdQty').visible = true; // 당월출고
    view.columnByName('lgstStrQty').visible = false; // 당월물류 구매입고
    view.columnByName('svCnrStrQty').visible = true; // 당월센터 정상입고
    view.columnByName('svEgerStrQty').visible = false; // 당월 엔지니어 개인창고 정상입고
    view.columnByName('lgstPitmStocGdQty').visible = false; // 파주물류물류센터 조직창고 기말재고
    view.columnByName('svCnrPitmStocGdQty').visible = true; // 서비스센터 조직창고 기말재고
    view.columnByName('svEgerLgstPitmStocGdQty').visible = false; // 엔지니어 개인창고 기말재고
    view.columnByName('lgstKeppMm1').visible = false; // 재고지속월 1(물류센터)
    view.columnByName('lgstKeppMm2').visible = false; // 재고지속월 2(물류센터)
    view.columnByName('svCnrKeppMm1').visible = true; // 재고지속월 1(서비스센터)
    view.columnByName('svCnrKeppMm2').visible = true; // 재고지속월 2(서비스센터)
    view.columnByName('svEgerKeppMm1').visible = false; // 재고지속월 1(엔지니어)
    view.columnByName('svEgerKeppMm2').visible = false; // 재고지속월 2(엔지니어)
  }

  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  const selPdLength = cachedParams.itmPdCds.length;
  const allPdLength = optionsItmPdCd.value.length;

  if (selPdLength === allPdLength) {
    cachedParams.itmPdCds = [];
  }

  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

await Promise.all([
  getProducts(),
]);

onMounted(async () => {
  await onChangeWareDvCd();
});

const stokContMmOptions = ref([]);

const onChangestokContMm = (val) => {
  searchParams.value.stokContMm = val;
};

const stokContMmBaseOptions = ref([]);

const onChangeStokUtlzDvCd = (val) => {
  const view = grdMainRef.value.getView();
  const stokContMmCd = searchParams.value.stokContMm;
  console.log('stokContMmCd  ==>', stokContMmCd);
  console.log('val ==>', val);
  console.log('wareDvCd  ==>', searchParams.value.wareDvCd);
  console.log('wareDtlDvCd  ==>', searchParams.value.wareDtlDvCd);

  const filter1 = [{
    name: 'lgstKeppMm1Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter2 = [{
    name: 'lgstKeppMm1Blow2YnFilter',
    criteria: 'value="Y"',
  }];
  const filter3 = [{
    name: 'lgstKeppMm2Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter4 = [{
    name: 'lgstKeppMm2Blow2YnFilter',
    criteria: 'value="Y"',
  }];
  const filter5 = [{
    name: 'svCnrKeppMm1Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter6 = [{
    name: 'svCnrKeppMm1Blow2YnFilter',
    criteria: 'value="Y"',
  }];
  const filter7 = [{
    name: 'svCnrKeppMm2Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter8 = [{
    name: 'svCnrKeppMm2Blow2YnFilter',
    criteria: 'value="Y"',
  }];
  const filter9 = [{
    name: 'svEgerKeppMm1Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter10 = [{
    name: 'svEgerKeppMm1Blow2YnFilter',
    criteria: 'value="Y"',
  }];
  const filter11 = [{
    name: 'svEgerKeppMm2Blow1YnFilter',
    criteria: 'value="Y"',
  }];
  const filter12 = [{
    name: 'svEgerKeppMm2Blow2YnFilter',
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('lgstKeppMm1Blow1Yn', filter1);
  view.setColumnFilters('lgstKeppMm1Blow2Yn', filter2);
  view.setColumnFilters('lgstKeppMm2Blow1Yn', filter3);
  view.setColumnFilters('lgstKeppMm2Blow2Yn', filter4);
  view.setColumnFilters('svCnrKeppMm1Blow1Yn', filter5);
  view.setColumnFilters('svCnrKeppMm1Blow2Yn', filter6);
  view.setColumnFilters('svCnrKeppMm2Blow1Yn', filter7);
  view.setColumnFilters('svCnrKeppMm2Blow2Yn', filter8);
  view.setColumnFilters('svEgerKeppMm1Blow1Yn', filter9);
  view.setColumnFilters('svEgerKeppMm1Blow2Yn', filter10);
  view.setColumnFilters('svEgerKeppMm2Blow1Yn', filter11);
  view.setColumnFilters('svEgerKeppMm2Blow2Yn', filter12);

  if (stokContMmCd === '1') { // 재고지속 I 유형
    if (val.includes('1') && searchParams.value.wareDvCd === '1') { // 1개월 이하
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', false);
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', ['lgstKeppMm1Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', false);
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', ['svCnrKeppMm1Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', false);
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', ['svEgerKeppMm1Blow1YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', ['lgstKeppMm1Blow1YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', ['svCnrKeppMm1Blow1YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', ['svEgerKeppMm1Blow1YnFilter'], false);
    }
    if (val.includes('2') && searchParams.value.wareDvCd === '1') { // 2.5개월 이하
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', false);
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', ['lgstKeppMm1Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', false);
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', ['svCnrKeppMm1Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', false);
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', ['svEgerKeppMm1Blow2YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', ['lgstKeppMm1Blow2YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', ['svCnrKeppMm1Blow2YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', ['svEgerKeppMm1Blow2YnFilter'], false);
    }
  } else if (stokContMmCd === '2') { // 재고지속 II 유형
    if (val.includes('1') && searchParams.value.wareDvCd === '1') { // 1개월 이하
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', false);
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', ['lgstKeppMm2Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', false);
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', ['svCnrKeppMm2Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', false);
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', ['svEgerKeppMm2Blow1YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', ['lgstKeppMm2Blow1YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', ['svCnrKeppMm2Blow1YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', ['svEgerKeppMm2Blow1YnFilter'], false);
    }
    if (val.includes('2') && searchParams.value.wareDvCd === '1') { // 2.5개월 이하
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', false);
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', ['lgstKeppMm2Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', false);
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', ['svCnrKeppMm2Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', false);
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', ['svEgerKeppMm2Blow2YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', ['lgstKeppMm2Blow2YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', ['svCnrKeppMm2Blow2YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', ['svEgerKeppMm2Blow2YnFilter'], false);
    }
  } else { // 재고지속 II 유형 없음
    if (val.includes('1') && searchParams.value.wareDvCd === '1') { // 1개월 이하
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', false);
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', ['lgstKeppMm1Blow1YnFilter'], true);
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', false);
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', ['lgstKeppMm2Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', false);
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', ['svCnrKeppMm1Blow1YnFilter'], true);
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', false);
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', ['svCnrKeppMm2Blow1YnFilter'], true);
    } else if (val.includes('1') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', false);
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', ['svEgerKeppMm1Blow1YnFilter'], true);
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', false);
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', ['svEgerKeppMm2Blow1YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm1Blow1Yn', ['lgstKeppMm1Blow1YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm1Blow1Yn', ['svCnrKeppMm1Blow1YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm1Blow1Yn', ['svEgerKeppMm1Blow1YnFilter'], false);
      view.activateColumnFilters('lgstKeppMm2Blow1Yn', ['lgstKeppMm2Blow1YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm2Blow1Yn', ['svCnrKeppMm2Blow1YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm2Blow1Yn', ['svEgerKeppMm2Blow1YnFilter'], false);
    }
    if (val.includes('2') && searchParams.value.wareDvCd === '1') { // 2.5개월 이하
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', false);
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', ['lgstKeppMm1Blow2YnFilter'], true);
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', false);
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', ['lgstKeppMm2Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd !== '21') {
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', false);
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', ['svCnrKeppMm1Blow2YnFilter'], true);
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', false);
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', ['svCnrKeppMm2Blow2YnFilter'], true);
    } else if (val.includes('2') && searchParams.value.wareDvCd === '2' && searchParams.value.wareDtlDvCd === '21') {
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', false);
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', ['svEgerKeppMm1Blow2YnFilter'], true);
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', false);
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', ['svEgerKeppMm2Blow2YnFilter'], true);
    } else {
      view.activateColumnFilters('lgstKeppMm1Blow2Yn', ['lgstKeppMm1Blow2YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm1Blow2Yn', ['svCnrKeppMm1Blow2YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm1Blow2Yn', ['svEgerKeppMm1Blow2YnFilter'], false);
      view.activateColumnFilters('lgstKeppMm2Blow2Yn', ['lgstKeppMm2Blow2YnFilter'], false);
      view.activateColumnFilters('svCnrKeppMm2Blow2Yn', ['svCnrKeppMm2Blow2YnFilter'], false);
      view.activateColumnFilters('svEgerKeppMm2Blow2Yn', ['svEgerKeppMm2Blow2YnFilter'], false);
    }
  }
};

const matUtlzOptions = ref([]);

const onChangeMatUtlzDvCd = (val) => {
  const view = grdMainRef.value.getView();

  const filter1 = [{
    name: 'cmnPartFilter', // 중수리 01
    criteria: 'value="01"',
  }];
  const filter2 = [{
    name: 'ordnyHvMatFilter', // 기초자재 Y
    criteria: 'value="Y"',
  }];
  const filter3 = [{
    name: 'trnoverFilter', // 회전율 Y
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  view.setColumnFilters('trnovrRtOjYn', filter3);

  if (val.includes('01')) {
    view.activateColumnFilters('cmnPartDvCd', false);
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], true);
  } else {
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], false);
  }

  if (val.includes('02')) {
    view.activateAllColumnFilters('ordnyHvMatYn', false);
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], true);
  } else {
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], false);
  }

  if (val.includes('03')) {
    view.activateColumnFilters('trnovrRtOjYn', false);
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], false);
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdCd' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'asLdtm' },
    { fieldName: 'asMatMngTpCd' },
    { fieldName: 'minGoQty' },
    { fieldName: 'lgstBtdStocGdQty', dataType: 'number' }, // 파주물류
    { fieldName: 'svCnrBtdStocGdQty', dataType: 'number' }, // 센터 조직창고
    { fieldName: 'svEgerBtdStocGdQty', dataType: 'number' }, // 엔지니어 개인창고
    { fieldName: 'lstmmWkEtcOstrGdQty', dataType: 'number' }, // 전월출고
    { fieldName: 'wkEtcOstrGdQty', dataType: 'number' }, // 당월출고
    { fieldName: 'lgstStrQty', dataType: 'number' }, // 당월물류 구매입고
    { fieldName: 'svCnrStrQty', dataType: 'number' }, // 당월센터 정상입고
    { fieldName: 'svEgerStrQty', dataType: 'number' }, // 당월 엔지니어 개인창고 정상입고
    { fieldName: 'lgstPitmStocGdQty', dataType: 'number' }, // 파주물류물류센터 조직창고 기말재고
    { fieldName: 'svCnrPitmStocGdQty', dataType: 'number' }, // 서비스센터 조직창고 기말재고
    { fieldName: 'svEgerLgstPitmStocGdQty', dataType: 'number' }, // 엔지니어 개인창고 기말재고
    { fieldName: 'lgstKeppMm1', dataType: 'number' }, // 재고지속월 1(물류센터)
    { fieldName: 'lgstKeppMm2', dataType: 'number' }, // 재고지속월 2(물류센터)
    { fieldName: 'svCnrKeppMm1', dataType: 'number' }, // 재고지속월 1(서비스센터)
    { fieldName: 'svCnrKeppMm2', dataType: 'number' }, // 재고지속월 2(서비스센터)
    { fieldName: 'svEgerKeppMm1', dataType: 'number' }, // 재고지속월 1(엔지니어)
    { fieldName: 'svEgerKeppMm2', dataType: 'number' }, // 재고지속월 2(엔지니어)
    { fieldName: 'itmGdCd' },
    { fieldName: 'cmnPartDvCd' },
    { fieldName: 'ordnyHvMatYn' },
    { fieldName: 'trnovrRtOjYn' },
    { fieldName: 'lgstKeppMm1Blow1Yn' },
    { fieldName: 'lgstKeppMm1Blow2Yn' },
    { fieldName: 'lgstKeppMm2Blow1Yn' },
    { fieldName: 'lgstKeppMm2Blow2Yn' },
    { fieldName: 'svCnrKeppMm1Blow1Yn' },
    { fieldName: 'svCnrKeppMm1Blow2Yn' },
    { fieldName: 'svCnrKeppMm2Blow1Yn' },
    { fieldName: 'svCnrKeppMm2Blow2Yn' },
    { fieldName: 'svEgerKeppMm1Blow1Yn' },
    { fieldName: 'svEgerKeppMm1Blow2Yn' },
    { fieldName: 'svEgerKeppMm2Blow1Yn' },
    { fieldName: 'svEgerKeppMm2Blow2Yn' },
  ];

  // 물류센터<조직창고 그리드
  const columns = [ // SAP코드
    { fieldName: 'sapMatCd',
      header: t('MSG_TXT_SAPCD'),
      width: '180',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdCd', // 품목코드
      header: t('MSG_TXT_ITM_CD'),
      width: '120',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdNm', // 품목명
      header: t('MSG_TXT_ITM_NM'),
      width: '180',
      footer: {
        styleName: 'text-left',
      } },
    { fieldName: 'asLdtm', // 리드타임
      header: t('TXT_MSG_AS_LDTM'),
      width: '70',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      } },
    { fieldName: 'minGoQty', // MOQ(최소발주수량)
      header: t('MSG_TXT_MIN_GO_QTY_MOQ'),
      width: '150',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      } },
    { fieldName: 'lgstBtdStocGdQty', // 파주물류
      header: t('MSG_TXT_PAJU_LGST'),
      width: '80',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      visible: false,
    },
    { fieldName: 'svCnrBtdStocGdQty', // 센터 조직창고
      header: t('MSG_TXT_CNR_OG_WARE'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'svEgerBtdStocGdQty', // 엔지니어 개인창고
      header: t('MSG_TXT_EGER_INDV_WARE'),
      width: '120',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'lstmmWkEtcOstrGdQty', // 전월출고
      header: t('MSG_TXT_LSTMM_OSTR'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'wkEtcOstrGdQty', // 당월출고
      header: t('MSG_TXT_THM_OSTR'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'lgstStrQty', // 당월물류 구매입고
      header: t('MSG_TXT_THM_LGST_PRCHS_STR'),
      width: '140',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      visible: false,
    },
    { fieldName: 'svCnrStrQty', // 당월센터 정상입고 THM_CNR_NOM_STR
      header: t('MSG_TXT_THM_CNR_NOM_STR'),
      width: '140',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'svEgerStrQty', // 당월엔지니어 개인창고 정상입고 THM_EGER_INDV_WARE_NOM_STR
      header: t('MSG_TXT_THM_EGER_INDV_WARE_NOM_STR'),
      width: '140',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'lgstPitmStocGdQty', // 파주물류센터 조직창고 기말재고
      header: t('MSG_TXT_PAJU_LGST_CNR_OG_WARE_EOT_STOC'),
      width: '200',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      visible: false,
    },
    { fieldName: 'svCnrPitmStocGdQty', // 서비스센터 조직창고 기말재고
      header: t('MSG_TXT_SERVICE_CNR_OG_WARE_EOT_STOC'),
      width: '200',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'svEgerLgstPitmStocGdQty', // 엔지니어 개인창고 기말재고
      header: t('MSG_TXT_EGER_INDV_WARE_EOT_STOC'),
      width: '200',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      visible: false,
    },
    { fieldName: 'lgstKeppMm1', // 재고지속월I(구매입고 미포함) - 물류센터
      header: '재고지속월I\n(구매입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      },
      visible: false,
    },
    { fieldName: 'lgstKeppMm2', // 재고지속월II(구매입고 미포함) - 물류센터
      header: '재고지속월II\n(구매입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      },
      visible: false,
    },
    { fieldName: 'svCnrKeppMm1', // 재고지속월I(정상입고 미포함) - 서비스센터
      header: '재고지속월I\n(정상입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      } },
    { fieldName: 'svCnrKeppMm2', // 재고지속월II(정상입고 미포함) - 서비스센터
      header: '재고지속월II\n(정상입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      } },
    { fieldName: 'svEgerKeppMm1', // 재고지속월I(정상입고 미포함) - 엔지니어
      header: '재고지속월I\n(정상입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      },
      visible: false,
    },
    { fieldName: 'svEgerKeppMm2', // 재고지속월II(정상입고 미포함) - 엔지니어
      header: '재고지속월II\n(정상입고 미포함)',
      width: '200',
      numberFormat: '#,##0.##',
      styleName: 'text-right',
      footer: {
        styleName: 'text-right',
      },
      visible: false,
    },
    { fieldName: 'itmGdCd', // 등급
      header: t('MSG_TXT_GD'),
      width: '50',
      styleName: 'text-center',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'cmnPartDvCd', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'ordnyHvMatYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'trnovrRtOjYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'lgstKeppMm1Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'lgstKeppMm1Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'lgstKeppMm2Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'lgstKeppMm2Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svCnrKeppMm1Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svCnrKeppMm1Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svCnrKeppMm2Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svCnrKeppMm2Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svEgerKeppMm1Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svEgerKeppMm1Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svEgerKeppMm2Blow1Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'svEgerKeppMm2Blow2Yn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('pdNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = true;
  view.setColumnLayout([
    'sapMatCd',
    'pdCd',
    'pdNm',
    'asLdtm',
    'minGoQty',
    {
      header: t('MSG_TXT_THM_BTD_STOC'), // 당월 기초재고
      direction: 'horizontal', // merge type
      items: ['lgstBtdStocGdQty', 'svCnrBtdStocGdQty', 'svEgerBtdStocGdQty'],
    },
    'lstmmWkEtcOstrGdQty',
    'wkEtcOstrGdQty',
    'lgstStrQty',
    'svCnrStrQty',
    'lgstPitmStocGdQty',
    'svCnrPitmStocGdQty',
    'svEgerLgstPitmStocGdQty',
    'lgstKeppMm1',
    'lgstKeppMm2',
    'svCnrKeppMm1',
    'svCnrKeppMm2',
    'svEgerKeppMm1',
    'svEgerKeppMm2',
    'itmGdCd',
    'cmnPartDvCd',
    'ordnyHvMatYn',
    'trnovrRtOjYn',
    'lgstKeppMm1Blow1Yn',
    'lgstKeppMm1Blow2Yn',
    'lgstKeppMm2Blow1Yn',
    'lgstKeppMm2Blow2Yn',
    'svCnrKeppMm1Blow1Yn',
    'svCnrKeppMm1Blow2Yn',
    'svCnrKeppMm2Blow1Yn',
    'svCnrKeppMm2Blow2Yn',
    'svEgerKeppMm1Blow1Yn',
    'svEgerKeppMm1Blow2Yn',
    'svEgerKeppMm2Blow1Yn',
    'svEgerKeppMm2Blow2Yn',
  ]);
  view.setFixedOptions({ colCount: 3 });
});
</script>
