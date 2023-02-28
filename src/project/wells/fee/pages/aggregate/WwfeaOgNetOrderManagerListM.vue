<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderManagerListM - M조직 수수료 순주문 관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 순주문 관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <div
        v-if="isSelectVisile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['매출', '접수', '예약', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="['전체', 'B', 'C', 'D']"
              rules="required"
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
            :label="$t('MSG_TXT_DT_OF_SALE')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_DT_OF_SALE')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile1"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['매출', '접수', '예약', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="['전체', 'B', 'C', 'D']"
              rules="required"
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
            :label="$t('MSG_TXT_RCPDT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DT_OF_SALE')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_DT_OF_SALE')"
              rules="date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['매출', '접수', '예약', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="['전체', 'B', 'C', 'D']"
              rules="required"
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
            :label="$t('MSG_TXT_RCPDT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile3"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['매출', '접수', '예약', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="['전체', 'B', 'C', 'D']"
              rules="required"
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
            :label="$t('MSG_TXT_PERF_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.schPerfYm"
              :label="$t('MSG_TXT_PERF_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DT_OF_SALE')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_DT_OF_SALE')"
              rules="date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile4"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['서비스 실적', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
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
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_VST_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schVstDtStrt"
              v-model:to="searchParams.schVstDtEnd"
              :label="$t('MSG_TXT_VST_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile5"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_TASK_DIV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schBizDv"
              :label="$t('MSG_TXT_TASK_DIV')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_SELL'), 'BS']"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="['서비스 실적', '수수료 실적 집계 대상']"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
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
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PERF_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.schPerfYm"
              :label="$t('MSG_TXT_PERF_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_VST_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schVstDtStrt"
              v-model:to="searchParams.schVstDtEnd"
              :label="$t('MSG_TXT_VST_DT')"
              rules="date_range_required|date_range_months:1"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="'BS'+$t('MSG_BTN_PERF_AGRG')"
          secondary
          dense
          @click="openBfsvcPerfAgrgPopup"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          @click="openFeePerfCnfmPopup"
        />
      </kw-action-top>

      <kw-grid
        v-if="isGridVisile"
        ref="grdMainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-grid
        v-if="isGrid2Visile"
        ref="grdMainRef"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
      <kw-grid
        v-if="isGrid3Visile"
        ref="grdMainRef"
        name="grd3Main"
        :visible-rows="10"
        @init="initGrd3Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isSelectVisile = ref(true);
const isSelectVisile1 = ref(false);
const isSelectVisile2 = ref(false);
const isSelectVisile3 = ref(false);
const isSelectVisile4 = ref(false);
const isSelectVisile5 = ref(false);
const isGridVisile = ref(true);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(false);
const searchParams = ref({

  schBizDv: '판매',
  schDv: '매출',
  schPdctTp: '전체',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schSlDtStrt: '',
  schSlDtEnd: '',
  schRcpDtStrt: '',
  schRcpDtEnd: '',
  schPerfYm: '',
  schVstDtStrt: '',
  schVstDtEnd: '',
});
let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
 */
async function initSearchParams() {
  searchParams.value.schPdCdStrt = '';
  searchParams.value.schPdCdEnd = '';
  searchParams.value.schPerfYm = '';
  searchParams.value.schRcpDtStrt = '';
  searchParams.value.schRcpDtEnd = '';
  searchParams.value.schVstDtStrt = '';
  searchParams.value.schVstDtEnd = '';
  searchParams.value.schSlDtStrt = '';
  searchParams.value.schSlDtEnd = '';
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeBizDv() {
  const { schDv } = searchParams.value;
  const { schBizDv } = searchParams.value;

  if (schBizDv === '판매') {
    if (searchParams.value.schPdctTp.length === 0) {
      searchParams.value.schPdctTp = '전체';
    }

    if (schDv === '매출' || schDv === '서비스 실적') {
      searchParams.value.schDv = '매출';
      isSelectVisile.value = true;
      isSelectVisile1.value = false;
      isSelectVisile2.value = false;
      isSelectVisile3.value = false;
      isSelectVisile4.value = false;
      isSelectVisile5.value = false;
      isGridVisile.value = true;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      initSearchParams();
    }
    if (schDv === '접수') {
      isSelectVisile.value = false;
      isSelectVisile1.value = true;
      isSelectVisile2.value = false;
      isSelectVisile3.value = false;
      isSelectVisile4.value = false;
      isSelectVisile5.value = false;
      isGridVisile.value = true;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      await initSearchParams();
    } else if (schDv === '예약') {
      isSelectVisile.value = false;
      isSelectVisile1.value = false;
      isSelectVisile2.value = true;
      isSelectVisile3.value = false;
      isSelectVisile4.value = false;
      isSelectVisile5.value = false;
      isGridVisile.value = true;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      initSearchParams();
    } else if (schDv === '수수료 실적 집계 대상') {
      isSelectVisile.value = false;
      isSelectVisile1.value = false;
      isSelectVisile2.value = false;
      isSelectVisile3.value = true;
      isSelectVisile4.value = false;
      isSelectVisile5.value = false;
      isGridVisile.value = false;
      isGrid2Visile.value = true;
      isGrid3Visile.value = false;
      initSearchParams();
    }
  } else if (schBizDv === 'BS') {
    if (searchParams.value.schPdctTp.length > 0) {
      searchParams.value.schPdctTp = '';
    }

    if (schDv === '서비스 실적' || schDv === '매출' || schDv === '접수' || schDv === '예약') {
      searchParams.value.schDv = '서비스 실적';
      isSelectVisile.value = false;
      isSelectVisile1.value = false;
      isSelectVisile2.value = false;
      isSelectVisile3.value = false;
      isSelectVisile4.value = true;
      isSelectVisile5.value = false;
      isGridVisile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = true;
      initSearchParams();
    } else if (schDv === '수수료 실적 집계 대상') {
      isSelectVisile.value = false;
      isSelectVisile1.value = false;
      isSelectVisile2.value = false;
      isSelectVisile3.value = false;
      isSelectVisile4.value = false;
      isSelectVisile5.value = true;
      isGridVisile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = true;
      initSearchParams();
    }
  }
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMMDD'),
    ogTp: 'M',
    dv: 'CR',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMMDD'),
    ogTp: 'M',
    dv: 'CO',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}
/*
 *  Event - BS실적집계 버튼 클릭
 */
async function openBfsvcPerfAgrgPopup() {
  const { result: isChanged } = await modal({
    component: 'WwfeaOgNetOrderBsPerfAgrgRegP',
  });

  if (isChanged) {
    await notify(t('MSG_ALT_CREATED'));
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: t('MSG_TXT_MANAGER') + t('MSG_TXT_FEE_IZ'),
    timePostfix: true,
  });
}

async function fetchData() {
  const { schDv } = searchParams.value;
  const { schBizDv } = searchParams.value;
  let uri = '';
  if (schBizDv === '판매' && (schDv === '접수' || schDv === '예약' || schDv === '매출')) {
    uri = 's';
  } else if (schBizDv === '판매' && schDv === '수수료 실적 집계 대상') {
    uri = '-sell-fees';
  } else if (schBizDv === 'BS') {
    uri = '-before-services';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/mnger${uri}`, { params: cachedParams });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
    { fieldName: 'col41' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEL_TYPE'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_PDCT_TP'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_PRC_TP'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CHDVC_TP'), width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CST_DV'), width: '83.5' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col13', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_USWY'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col17', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col19', header: t('MSG_TXT_DP_PERF'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_DSC'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_PD_ACC_RSLT'), width: '142', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col27', header: `${t('MSG_TXT_HOME_CARE')}3${t('MSG_TXT_YEAR')}`, width: '141.2', styleName: 'text-' },
    { fieldName: 'col28', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col29', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col30', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-' },
    { fieldName: 'col32', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col33', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'col36', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-' },
    { fieldName: 'col37', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-' },
    { fieldName: 'col40', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '113' },
    { fieldName: 'col41', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
function initGrd2Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RCPDT'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_SL_DT'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CANC_DT'), width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_PDCT_TP'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_CODE'), width: '83.5' },
    { fieldName: 'col12', header: t('MSG_TXT_PD_GRP'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col13', header: t('MSG_TXT_PRDT_NM'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_PD_ACC_CNT'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col15', header: `BS${t('MSG_TXT_CYCL')}`, width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_CHDVC_TP'), width: '83.5', styleName: 'text-' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

function initGrd3Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
  ];

  const columns = [

    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_CODE'), width: '83.5' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_NM'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col9', header: `BS${t('MSG_TXT_PDGRP')}`, width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_BAS_FEE'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_VST') + t('MSG_TXT_FEE'), width: '83.5' },
    { fieldName: 'col12', header: t('MSG_TXT_WORK_TYPE'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col13', header: t('MSG_TXT_VST') + t('MSG_TXT_RGLVL'), width: '83.5' },
    { fieldName: 'col14', header: t('MSG_TXT_FER'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_SLS_CAT'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_HSHD') + t('MSG_TXT_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col17', header: t('MSG_TXT_HSHD_N'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_USWY') + t('MSG_TXT_DIV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col19', header: t('MSG_TXT_EXP') + t('MSG_TXT_DT'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_VST') + t('MSG_TXT_DT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_CNCL_YN'), width: '83.5', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
