<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteDiscountByTypeByTypeSellPsListM - 할인유형별 판매현황
3. 작성자 : gs.itsm210
4. 작성일 : 2023.11.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 할인유형별 판매현황정보 조회(W-SS-U-0060M01)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.srchDateGbn"
            :options="searchDateGbnOptions"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="searchParams.istStartDt"
            v-model:to="searchParams.istEndDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="date_range_required"
            @change="onChangePerfDt"
          />
        </kw-search-item>
        <!-- 상품분류 -->
        <kw-search-item
          :label="t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdHclsfId"
            :options="codes.highClass"
            first-option="all"
            first-option-val=""
            @change="onChangeHighClass(searchParams.pdHclsfId)"
          />
          <kw-select
            v-model="searchParams.pdMclsfId"
            first-option="all"
            first-option-val=""
            :options="codes.middleClass"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item
          :label="t('TXT_MSG_PD_CD')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item
          :label="t('MSG_TXT_PRDT_NM')"
          :placeholder="t('MSG_TXT_INP')"
        >
          <kw-input
            v-model="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <!-- 조직코드 -->
        <kw-search-item
          colspan="2"
          :label="$t('MSG_TXT_OG_CD')"
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgCd"
            :options="codesDgr1Levl"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_GNRDV_CHO')"
            @change="onUpdateDgr1Levl"
          />
          <kw-select
            v-model="searchParams.dgr2LevlOgCd"
            :options="filteredDgr2LevlOgCds"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_RGNL_GRP')+ ' ' +$t('MSG_TXT_SELT')"
            @change="onUpdateDgr2Levl"
          />
          <kw-select
            v-model="searchParams.dgr3LevlOgCd"
            :options="filteredDgr3LevlOgCds"
            option-value="dgr3LevlOgCd"
            option-label="dgr3LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <kw-select
            v-model="searchParams.schCstDv"
            :options="comnCode.CST_SE_APY_DV_CD.filter((v) => ['01', '02'].includes(v.codeId))"
            first-option="all"
          />
        </kw-search-item>
        <!-- 취소구분 -->
        <kw-search-item
          :label="t('MSG_TXT_CNCL_DV')"
        >
          <kw-option-group
            v-model="searchParams.canGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'N',codeName:$t('MSG_TXT_EXCLD_CANC')}]"
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
        <!-- 엑셀 다운로드 -->
        <kw-btn
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          icon="download_on"
          dense
          secondary
          :disable="!totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageSize"
        :total-count="totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, codeUtil, useDataService, gridUtil, useGlobal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const pageSize = 10;
const totalCount = ref(0);

const now = dayjs();
const searchParams = ref({
  srchDateGbn: '1',
  istStartDt: now.startOf('month').format('YYYYMMDD'),
  istEndDt: now.format('YYYYMMDD'),
  pdHclsfId: '',
  pdMclsfId: '',
  pdCd: '',
  pdNm: '',
  dgr1LevlOgCd: '', // 조직코드-총괄단
  dgr2LevlOgCd: '', // 조직코드-지역단
  dgr3LevlOgCd: '', // 조직코드-지점
  schCstDv: '',
  canGbn: '',
});

const searchDateGbnOptions = ref([
  { codeId: '1', codeName: `${t('MSG_TXT_RCPDT')}` },
  { codeId: '2', codeName: `${t('MSG_TXT_IST_DT')}` },
]);

// 조직코드 조회
const codesDgr1Levl = ref([]);
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);
const filteredDgr2LevlOgCds = ref([]);
const filteredDgr3LevlOgCds = ref([]);

const codes = ref({
  highClass: [],
  middleClass: [],
  middleClassAll: [],
});

const comnCode = await codeUtil.getMultiCodes(
  'CST_SE_APY_DV_CD',
);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// fetchCodes: 코드 가져오기
async function fetchCodes() {
  const highCodes = await dataService.get('/sms/wells/contract/product/high-classes');
  const middleCodes = await dataService.get('/sms/wells/contract/product/middle-classes');

  const initHighCodes = [];
  const initMiddleCodes = [];

  highCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) initHighCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });

  middleCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) {
      initMiddleCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm, hgrPdClsfId: v.hgrPdClsfId });
    }
  });

  Object.assign(codes.value.highClass, initHighCodes);
  Object.assign(codes.value.middleClassAll, initMiddleCodes);

  if (!isEmpty(codes.value.middleClassAll)) {
    Object.assign(codes.value.middleClass, codes.value.middleClassAll);
  }
}

// 할인유형별 판매현황 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/discount-sell-present-state', { params: searchParams.value });
  const aggs = res.data;
  totalCount.value = aggs.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(aggs);
  view.resetCurrent();
}

// 조회 버튼 클릭 시
async function onClickSearch() {
  await fetchData();
}

// onChangeHighClass: 상품대분류 변경 시
function onChangeHighClass(pdId) {
  if (!isEmpty(pdId)) {
    codes.value.middleClass = codes.value.middleClassAll.filter((v) => v.hgrPdClsfId === pdId);
  } else {
    codes.value.middleClass = codes.value.middleClassAll;
  }
  searchParams.value.pdMclsfId = '';
}

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

// 엑셀 다운로드 버튼 클릭시
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}

// 조직 조회
async function searchOrg(paramDt) {
  const searchOgParams = ref({
    baseYm: isEmpty(paramDt) ? searchParams.value.istStartDt : paramDt,
  });

  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions', { params: searchOgParams.value }); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions', { params: searchOgParams.value }); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions', { params: searchOgParams.value }); // 지점
  codesDgr3Levl.value = res.data;
}

// 시작일 변경 시, 조직 재조회
async function onChangePerfDt(dt) {
  searchOrg(dt[0]);
}

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // init
  filteredDgr2LevlOgCds.value = [];
  filteredDgr3LevlOgCds.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // value init
  searchParams.value.dgr2LevlOgCd = '';
  searchParams.value.dgr3LevlOgCd = '';
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  filteredDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));

  // value init
  searchParams.value.dgr3LevlOgCd = '';
}

// 화면 랜더링시
onMounted(async () => {
  fetchCodes();
  await searchOrg();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'hclsfNm', header: t('MSG_TXT_DEPTH1'), width: 120, styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'mclsfNm', header: t('MSG_TXT_DEPTH2'), width: 150, styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: 150, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 180, styleName: 'text-left', groupFooter: { text: t('MSG_TXT_SBSUM'), styleName: 'text-center' } },
    { fieldName: 'totSum',
      header: t('MSG_TXT_ALL'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'geDsc8',
      header: `${t('MSG_TXT_GE')} 8${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'geDsc6',
      header: `${t('MSG_TXT_GE')} 6${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'geDsc5',
      header: `${t('MSG_TXT_GE')} 5${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'geDsc4',
      header: `${t('MSG_TXT_GE')} 4${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'geDsc3',
      header: `${t('MSG_TXT_GE')} 3${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'geDsc2',
      header: `${t('MSG_TXT_GE')} 2${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'geDsc1',
      header: `${t('MSG_TXT_GE')} 1${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'usedCpsDsc6',
      header: `${t('MSG_TXT_SEC_HND_COMP')} 6${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'usedCpsDsc5',
      header: `${t('MSG_TXT_SEC_HND_COMP')} 5${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'usedCpsDsc4',
      header: `${t('MSG_TXT_SEC_HND_COMP')} 4${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'usedCpsDsc3',
      header: `${t('MSG_TXT_SEC_HND_COMP')} 3${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpDsc6',
      header: `${t('MSG_TXT_CRP')} 6${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpDsc5',
      header: `${t('MSG_TXT_CRP')} 5${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpDsc4',
      header: `${t('MSG_TXT_CRP')} 4${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpDsc3',
      header: `${t('MSG_TXT_CRP')} 3${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpDsc2',
      header: `${t('MSG_TXT_CRP')} 2${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc55',
      header: `${t('MSG_TXT_CRP_ASCT')} 55%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc50',
      header: `${t('MSG_TXT_CRP_ASCT')} 50%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc45',
      header: `${t('MSG_TXT_CRP_ASCT')} 45%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc40',
      header: `${t('MSG_TXT_CRP_ASCT')} 40%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc35',
      header: `${t('MSG_TXT_CRP_ASCT')} 35%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDscCt',
      header: `${t('MSG_TXT_CRP_ASCT')} ${t('MSG_TXT_CT_ACKMT')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc30',
      header: `${t('MSG_TXT_CRP_ASCT')} 30%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc25',
      header: `${t('MSG_TXT_CRP_ASCT')} 25%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc20',
      header: `${t('MSG_TXT_CRP_ASCT')} 20%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc15',
      header: `${t('MSG_TXT_CRP_ASCT')} 15%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc10',
      header: `${t('MSG_TXT_CRP_ASCT')} 10%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'crpAsctDsc5',
      header: `${t('MSG_TXT_CRP_ASCT')} 5%${t('MSG_TXT_DSC')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc8',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 8${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc6',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 6${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc5',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 5${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc4',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 4${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc3',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 3${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc2',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 2${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'mchdMculDapsDsc1',
      header: `${t('MSG_TXT_MCHD')}/${t('MSG_TXT_MCUL')}/${t('MSG_TXT_DAPS')} 1${t('MSG_TXT_YEAR')}`,
      width: 180,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc8',
      header: `${t('MSG_TXT_EMP')} 8${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc6',
      header: `${t('MSG_TXT_EMP')} 6${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc5',
      header: `${t('MSG_TXT_EMP')} 5${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc4',
      header: `${t('MSG_TXT_EMP')} 4${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc3',
      header: `${t('MSG_TXT_EMP')} 3${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc1',
      header: `${t('MSG_TXT_EMP')} 1${t('MSG_TXT_YEAR')}`,
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'empDsc',
      header: t('MSG_TXT_EMP'),
      width: 120,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'spayDsc',
      header: t('MSG_TXT_SNGL_PMNT'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'rernt',
      header: t('MSG_TXT_RE_RENTAL'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'pls1',
      header: t('1+1'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'pkgEra2',
      header: `${t('MSG_TXT_PKG')} 2${t('MSG_TXT_UNTT')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'pkgEra3',
      header: `${t('MSG_TXT_PKG')} 3${t('MSG_TXT_UNTT')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'pkgEra4Mrtn',
      header: `${t('MSG_TXT_PKG')} 4${t('MSG_TXT_UNTT')}${t('MSG_TXT_MRTN')}`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'sodbtSpcDsc',
      header: t('MSG_TXT_SODBT_SPC_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'spcDscAuto1',
      header: `${t('MSG_TXT_SPC_DSC')}(${t('MSG_TXT_AUTO')}1)`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'y5StplDsc',
      header: t('MSG_TXT_Y5_STPL_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'spcDscCho1',
      header: `${t('MSG_TXT_SPC_DSC')}(${t('MSG_TXT_SELT')})`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'eduAlncDsc',
      header: t('MSG_TXT_EDU_ALNC_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'eduBzsDsc',
      header: t('MSG_TXT_ALNC_BZS_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'alncPkgDsc',
      header: t('MSG_TXT_ALNC_PKG_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'y5StplRental',
      header: t('MSG_TXT_Y5_STPL_RENTAL'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'spcDscAuto2',
      header: `${t('MSG_TXT_SPC_DSC')}(${t('MSG_TXT_AUTO')}2)`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'stcfAstnCho',
      header: `${t('MSG_TXT_STCF_ASTN')}(${t('MSG_TXT_SELT')})`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'spcDscCho2',
      header: `${t('MSG_TXT_SPC_DSC')}(${t('MSG_TXT_SELT')}2)`,
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
    { fieldName: 'slfPrchsDsc',
      header: t('MSG_TXT_SLF_PRCHS_DSC'),
      width: 150,
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.groupBy(['hclsfNm']);
  view.setRowGroup({ mergeMode: true, expandedAdornments: 'footer', collapsedAdornments: 'footer' });
  view.rowIndicator.visible = true;

  view.checkBar.visible = false;

  view.setFooters({ visible: true, items: [{ height: 40 }] });
  view.setFixedOptions({ colCount: 4 });
}

</script>
