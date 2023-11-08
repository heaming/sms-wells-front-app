<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerMgtM - 수석플래너 신청관리
3. 작성자 : 김동석
4. 작성일 : 2023-07-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 신청관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- 조직레벨 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          class="equal_division--3"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :last-og-id="searchParams.ogId"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 번호/성명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_NUM_EMPL_NM')"
        >
          <zwog-partner-search v-model:prtnr-no="searchParams.prtnrNo" />
        </kw-search-item>
        <!-- M조직정보 -->
        <kw-search-item
          :label="$t('MSG_TXT_M_OG_INF')"
        >
          <kw-checkbox
            v-model="searchParams.mOgYn"
            :label="$t('MSG_TXT_INC')"
            :true-value="Y"
            :false-value="N"
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
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 자격생성 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_PLAR_REG')"
          secondary
          dense
          :disable="isShow"
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, useMeta, useDataService, getComponentType, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';

const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const { modal, notify, confirm, alert } = useGlobal();
const { currentRoute } = useRouter();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes('EGER_WRK_STAT_CD', 'OG_TP_CD', 'COD_PAGE_SIZE_OPTIONS');
const grdMainRef = ref(getComponentType('KwGrid'));
const thisYear = dayjs().format('YYYY');
const thisMonth = dayjs().format('MM');
// const lastMonth = dayjs().add(-1, 'M').format('MM');
// const lastYm = dayjs().add(-1, 'M').format('YYYYMM');
const thisYm = dayjs().format('YYYYMM');
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  mngtYm: thisYm, // 관리년월
  mOgYn: 'Y', // M조직정보
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd, // 조직유형코드
  ogId: undefined, // 조직ID
  prtnrNo: undefined, // 번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const isShow = ref(true); // 자격생성 버튼 제어

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: planners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(planners.map((v) => ({ ...v, mngtYm: searchParams.value.mngtYm })));
  view.resetCurrent();

  // M조직정보 체크
  if (searchParams.value.mOgYn === 'Y') {
    view.columnByName('strtdt').visible = true;
    view.columnByName('fnlEnddt').visible = true;
    view.columnByName('cvDt').visible = true;
    view.columnByName('enddt').visible = true;
    view.columnByName('mQlfDvNm').visible = true;
    view.columnByName('mTotCnt').visible = true;
  } else {
    view.columnByName('strtdt').visible = false;
    view.columnByName('fnlEnddt').visible = false;
    view.columnByName('cvDt').visible = false;
    view.columnByName('enddt').visible = false;
    view.columnByName('mQlfDvNm').visible = false;
    view.columnByName('mTotCnt').visible = false;
  }

  // if (searchParams.value.mngtYm === thisYm) {
  //   isShow.value = false;
  // } else {
  //   isShow.value = true;
  // }

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/excel-download`, { params: { ...searchParams.value } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 자격생성
async function onClickSave() {
  // D-1월 순주문마감된 경우 진행 (CNT > 0 이면 순주문마감된 경우)
  /* const orderCnt = await dataService.get(`${SMS_WELLS_URI}/partner/order-cnt`,
  { params: { ...searchParams.value } }); */

  // if (orderCnt.data <= 0) {
  //   await alert(t('MSG_TXT_ORDER_AF_DEAD', [thisYear, lastMonth]));
  //   return;
  // }

  // D월 신청내역이 생성되지 않은 경우에 진행 (CNT = 0 이면 생성이 진행되지 않은 경우)
  const createdCnt = await dataService.get(`${SMS_WELLS_URI}/partner/created-cnt`, { params: { ...searchParams.value } });

  if (createdCnt.data > 0) {
    await alert(t('MSG_TXT_ALD_QUA_CREATED', [thisYear, thisMonth])); // {0}년 {1}월 자격이 이미 생성되었습니다.
    return;
  }

  if (!await confirm(t('MSG_TXT_QUA_CREATED', [thisYear, thisMonth]))) { return; } // {0}년 {1}월 자격생성을 진행하시겠습니까?

  await dataService.post(`${SMS_WELLS_URI}/partner`, { ...searchParams.value });

  await onClickSearch();
}

// 자격생성버튼 제어
watch(() => searchParams.value.mngtYm, async (newVal) => {
  if (newVal === thisYm) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}, { immediate: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' }, // 지역단
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center' }, // 소속코드
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '120', styleName: 'text-center' }, // 사번
    { fieldName: 'qlfDvNm', header: t('MSG_TXT_THM_QLF'), width: '100', styleName: 'text-center' }, // 당월자격
    { fieldName: 'detail',
      header: t('MSG_BTN_PLAR_MGT'), // 자격조정
      width: '106',
      styleName: 'rg-button-default text-center',
      styleCallback(grid, dataCell) {
        const btnYn = grid.getValue(dataCell.item.dataRow, 'btnYn');
        const mngtYm = grid.getValue(dataCell.item.dataRow, 'mngtYm');
        return { renderer: { type: 'button', hideWhenEmpty: mngtYm === dayjs().format('YYYYMM') ? btnYn !== 'Y' : false } };
      },
      displayCallback() {
        return t('MSG_BTN_PLAR_MGT');
      },
    },
    { fieldName: 'rcmdrPrtnrNm', header: t('MSG_TXT_ENGM_FNM'), width: '150', styleName: 'text-center' }, // 채용자성명
    { fieldName: 'rcmdrPrtnrNo', header: t('MSG_TXT_ENGM_NO'), width: '150', styleName: 'text-center' }, // 채용자번호
    { fieldName: 'cntrDt', header: t('MSG_TXT_BIZ_RGST_MM'), width: '150', styleName: 'text-center', datetimeFormat: 'date' }, // 업무등록월
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 최종해약월
    { fieldName: 'rcntrDt', header: t('MSG_TXT_REREG_MN'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 재등록월
    { fieldName: 'edu14', header: t('MSG_TXT_SRTUP_CPC_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 스타트업수료월
    { fieldName: 'twoSum', header: t('MSG_TXT_JBF_MMS2_ACU_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 직전2개월 누적실적
    { fieldName: 'curSum', header: t('MSG_TXT_THM_PERF'), width: '120', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 당월실적
    { fieldName: 'mTotSum', header: t('MSG_TXT_M_OG_CVT_PERF'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // M조직환산실적
    { fieldName: 'curBs', header: t('MSG_TXT_MNGT_PD'), width: '120', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 관리상품
    { fieldName: 'totSum', header: t('MSG_TXT_ACU_PERF'), width: '120', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 누적실적
    { fieldName: 'prfmtDt', header: t('MSG_TXT_TOPMR_UPGR_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 수석승급월
    { fieldName: 'dmtnDt', header: t('MSG_TXT_DMTN_DAY'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 강등날짜
    { fieldName: 'dmtnCurBs', header: t('MSG_TXT_DMTN_AFT_MNGT_PD'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 강등 후 관리상품
    { fieldName: 'dmtnTotSum', header: t('MSG_TXT_DMTN_AFT_ACU_PERF'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 강등 후 누적실적
    { fieldName: 'strtdt', header: t('MSG_TXT_BIZ_RGST_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 업무등록월
    { fieldName: 'fnlEnddt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 최종해약월
    { fieldName: 'cvDt', header: t('MSG_TXT_REREG_MN'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 재등록월
    { fieldName: 'enddt', header: t('MSG_TXT_CLTN_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 해약월
    { fieldName: 'mQlfDvNm', header: t('MSG_TXT_CLTN_MM_QLF'), width: '120', styleName: 'text-center' }, // 해약월자격
    { fieldName: 'mTotCnt', header: t('MSG_TXT_ACU_ACKMT_CT'), width: '120', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 누적인정건수
    { fieldName: 'btnYn', visible: false }, // 자격생성여부 (자격조정 버튼의 유무 결정)
    { fieldName: 'mngtYm', visible: false }, // 관리년월
    { fieldName: 'ogTpCd', visible: false }, // 조직유형코드
  ];
  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 7 });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'dgr1LevlOgNm',
    'dgr2LevlOgNm',
    'ogCd',
    'prtnrKnm',
    'prtnrNo',
    'qlfDvNm',
    'detail',
    {
      header: t('MSG_TXT_P_ORG'), // P조직
      direction: 'horizontal',
      items: ['rcmdrPrtnrNm', 'rcmdrPrtnrNo', 'cntrDt', 'fnlCltnDt', 'rcntrDt', 'edu14', 'twoSum',
        'curSum', 'mTotSum', 'curBs', 'totSum', 'prfmtDt', 'dmtnDt', 'dmtnCurBs', 'dmtnTotSum'],
    },
    {
      header: t('MSG_TIT_M_ORG'), // M조직
      direction: 'horizontal',
      items: ['strtdt', 'fnlEnddt', 'cvDt', 'enddt', 'mQlfDvNm', 'mTotCnt'],
    },

  ]);

  // M조직 컬럼
  view.columnByName('strtdt').visible = false;
  view.columnByName('fnlEnddt').visible = false;
  view.columnByName('cvDt').visible = false;
  view.columnByName('enddt').visible = false;
  view.columnByName('mQlfDvNm').visible = false;
  view.columnByName('mTotCnt').visible = false;

  view.columnByName('detail').disable = true;

  // 그리드 클릭 이벤트
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const { mngtYm, ogTpCd: cellOgTpCd, prtnrNo } = gridUtil.getRowValue(g, dataRow);

    // 상세보기
    // const baseYm = searchBaseYm;
    if (column === 'detail') {
      const { result: isChanged } = await modal({
        component: 'WwogcTopPlannerMgtP',
        componentProps: { mngtYm, ogTpCd: cellOgTpCd, prtnrNo },
      });

      if (isChanged) {
        notify(t('MSG_ALT_SAVE_DATA'));
        await onClickSearch();
      }
    }
  };
});

</script>

<style scoped>
</style>
