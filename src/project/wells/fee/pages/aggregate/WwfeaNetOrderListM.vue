<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderListM - 월 순주문 집계
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 순주문 집계 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <div
        v-if="isSelectVisile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.tcntDvCd"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="customCodes.div1Cd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.schDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.div2Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogDvCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="customCodes.div3Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.div4Cd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.pdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.div5Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <kw-select
              v-model="searchParams.selTp"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="customCodes.div6Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schDtStrt"
              v-model:to="searchParams.schDtEnd"
              :label="$t('MSG_TXT_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schCancDtStrt"
              v-model:to="searchParams.schCancDtEnd"
              :label="$t('MSG_TXT_CANC_DT')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.schPdCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPdCdEnd"
            />
          </kw-search-item>

          <kw-search-item
            :label="$t('MSG_TXT_PKG_CD')"
          >
            <kw-input
              v-model="searchParams.schPkgCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPkgdEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_BLG')"
          >
            <kw-input
              v-model="searchParams.schBlgCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schBlgCdEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.prtnrNo"
              :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
              icon="search"
              clearable
              :on-click-icon="onClickSearchNo"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.tcntDvCd"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="customCodes.div1Cd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.schDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.div2Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PERF_YM')"
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              rules="required"
              type="month"
              :label="$t('MSG_TXT_PERF_YM')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogDvCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="customCodes.div3Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
        />
        <div
          v-if="isSelectVisile"
        >
          <kw-separator
            vertical
            inset
            spaced
          />
          <kw-btn
            :label="$t('MSG_BTN_NTOR_AGRG')"
            secondary
            dense
            @click="openNtorAgrgPopup"
          />
          <kw-separator
            vertical
            inset
            spaced
          />
          <kw-btn
            :label="$t('MSG_BTN_NTOR_AGRG')"
            secondary
            dense
            @click="openNtorAgrgPopup"
          />
        </div>
      </kw-action-top>
      <kw-grid
        v-if="isGrid1Visile"
        ref="grdMain1Ref"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isGrid2Visile"
        ref="grdMain2Ref"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

// const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const isExcelDown = ref(false);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const isSelectVisile = ref(true);
const isSelectVisile2 = ref(false);
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const now = dayjs();
const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain2Ref = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const customCodes = {
  div1Cd: [{ codeId: '01', codeName: '1차' }, { codeId: '02', codeName: '2차' }],
  div2Cd: [{ codeId: '01', codeName: '상세' }, { codeId: '02', codeName: '집계' }],
  div3Cd: [{ codeId: '01', codeName: 'M추진단' }, { codeId: '02', codeName: 'P추진단' }, { codeId: '03', codeName: '홈마스터' }, { codeId: '04', codeName: 'B2B' }, { codeId: '05', codeName: '총판' }, { codeId: '06', codeName: '기타' }],
  div4Cd: [{ codeId: '01', codeName: '접수' }, { codeId: '02', codeName: '예약' }, { codeId: '03', codeName: '매출' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  div5Cd: [{ codeId: '01', codeName: '환경' }, { codeId: '02', codeName: '환경외' }, { codeId: '03', codeName: '웰스팜' }, { codeId: '04', codeName: '홈케어' }, { codeId: '05', codeName: '캡슐' }, { codeId: '06', codeName: '기타' }],
  div6Cd: [{ codeId: '01', codeName: '렌탈' }, { codeId: '02', codeName: '정기구매' }, { codeId: '03', codeName: '할부' }, { codeId: '04', codeName: '홈케어' }, { codeId: '05', codeName: '재약정' }, { codeId: '06', codeName: '멤버십' }],
};

const searchParams = ref({
  tcntDvCd: '01',
  schDvCd: '01',
  ogDvCd: '',
  schDv: '01',
  pdctTp: '',
  selTp: '',
  schDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  schCancDtStrt: '',
  schCancDtEnd: '',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schPkgCdStrt: '',
  schPkgdEnd: '',
  schBlgCdStrt: '',
  schBlgCdEnd: '',
  prtnrNo: '',
  perfYm: now.add(-1, 'month').format('YYYYMM'),
});
let cachedParams;

/*
 *  Event - 조회구분 선택 시 하단 그리드 변경※
 */
async function onChangedDvcd() {
  const { schDvCd } = searchParams.value;
  if (schDvCd === '01') { /* 상세선택 */
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    isSelectVisile.value = true;
    isSelectVisile2.value = false;
  } else if (schDvCd === '02') { /* 집계선택 */
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isSelectVisile.value = false;
    isSelectVisile2.value = true;
  }
}

async function onClickExcelDownload() {
  const view = grdMain1Ref.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function fetchData(apiUrl) {
  const response = await dataService.get(`/sms/wells/fee/monthly-net/${apiUrl}`, { params: cachedParams });
  const netOrders = response.data;
  totalCount.value = netOrders.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }

  const view = grdMain1Ref.value.getView();
  view.getDataSource().setRows(netOrders);
}

async function onClickSearch() {
  const { schDvCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  if (schDvCd === '01') {
    await fetchData('orders');
  } else {
    await fetchData('fees');
  }
  await fetchData();
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W02',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

/*
 *  Event - 순주문 집계 버튼 클릭
 */
async function openNtorAgrgPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYY-MM'),
  };

  const { result: isChanged } = await modal({
    component: 'WwfeaNetOrderRegP',
    componentProps: param,
  });

  if (isChanged) {
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellOg' },
    { fieldName: 'blg' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'selType' },
    { fieldName: 'pdctTp' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCd' },
    { fieldName: 'pkgCd' },
    { fieldName: 'istm' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'cancDt' },
    { fieldName: 'demDt' },
    { fieldName: 'rtlfe' },
  ];

  const columns = [
    { fieldName: 'sellOg', header: t('MSG_TXT_SELL_OG'), width: '120', styleName: 'text-center' },
    { fieldName: 'blg', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'selType', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdctTp', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center' },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'prdtCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '120', styleName: 'text-center' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'cancDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'demDt', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '120', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellOg' },
    { fieldName: 'totCt' },
    { fieldName: 'rental' },
    { fieldName: 'rglr' },
    { fieldName: 'istm' },
    { fieldName: 'homeCare1' },
    { fieldName: 'rstl' },
    { fieldName: 'membership' },
    { fieldName: 'envr' },
    { fieldName: 'envrExcp' },
    { fieldName: 'welsf' },
    { fieldName: 'homeCare2' },
    { fieldName: 'capsl' },
    { fieldName: 'etc' },

  ];

  const columns = [
    { fieldName: 'sellOg', header: t('MSG_TXT_SELL_OG'), width: '120', styleName: 'text-center' },
    { fieldName: 'totCt', header: t('MSG_TXT_TOT_CT'), width: '120', styleName: 'text-center' },
    { fieldName: 'rental', header: t('MSG_TXT_RENTAL'), width: '120', styleName: 'text-center' },
    { fieldName: 'rglr', header: t('MSG_TXT_RGLR'), width: '120', styleName: 'text-center' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '120', styleName: 'text-center' },
    { fieldName: 'homeCare1', header: t('MSG_TXT_HOME_CARE'), width: '120', styleName: 'text-center' },
    { fieldName: 'rstl', header: t('MSG_TXT_RSTL'), width: '120', styleName: 'text-center' },
    { fieldName: 'membership', header: t('MSG_TXT_MEMBERSHIP'), width: '120', styleName: 'text-center' },
    { fieldName: 'envr', header: t('MSG_TXT_ENVR'), width: '120', styleName: 'text-center' },
    { fieldName: 'envrExcp', header: t('MSG_TXT_ENVR_EXCP'), width: '120', styleName: 'text-center' },
    { fieldName: 'welsf', header: t('MSG_TXT_WELSF'), width: '120', styleName: 'text-center' },
    { fieldName: 'homeCare2', header: t('MSG_TXT_HOME_CARE'), width: '120', styleName: 'text-center' },
    { fieldName: 'capsl', header: t('MSG_TXT_CAPSL'), width: '120', styleName: 'text-center' },
    { fieldName: 'etc', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center' },
  ];

  // multi row header setting
  view.setColumnLayout([
    'sellOg', 'totCt', 'rental',
    {
      header: t('MSG_TXT_SEL_TYPE'),
      direction: 'horizontal',
      items: ['rglr', 'istm', 'homeCare1', 'rstl', 'membership'],
    },
    {
      header: t('MSG_TXT_PDCT_TP'),
      direction: 'horizontal',
      items: ['envr', 'envrExcp', 'welsf', 'homeCare2', 'capsl', 'etc'],
    },
  ]);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
