<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [K-W-SV-U-0073M01] WwsnbPersonInChargeRegularVisitAgrgM - 담당자별 정기방문 처리 집계표
3. 작성자 : jungheejin
4. 작성일 : 2023.07.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 담당자별 정기방문 처리 집계표(http://localhost:3000/#/service/wwsnb-person-in-charge-regular-visit-agrg)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')"
            :options="codes.LOCARA_MNGT_DV_CD"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ASN_YM')">
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            :label="$t('MSG_TXT_ASN_YM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRCSDT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="t('MSG_TXT_PRCSDT')"
            rules="date_range_required"
            class="w300"
          />
          <template v-if="isManagerSelected">
            <kw-checkbox
              v-model="searchParams.exceptWellsManagerYn"
              :label="$t('MSG_TXT_EXCPT_WELS_MNGR')"
              :true-value="'Y'"
              :false-value="'N'"
              class="h40 ml30"
              @update:model-value="onChangeCheckbox"
            />
          </template>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 총괄단, 지역단, 지점 ,매니저 -->
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="3"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            partner-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            partner-label="prtnrNoNm"
          />
        </template>
        <template v-else>
          <!-- 서비스센터, 엔지니어-->
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.ogId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="1"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            partner-first-option="all"
            partner-label="prtnrNoNm"
          />
        </template>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BLD_NM')">
          <kw-select
            v-model="searchParams.bldCd"
            first-option="all"
            first-option-value=""
            :options="buildingCodes"
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

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/person-in-charge-visit-agrg';
const codes = await codeUtil.getMultiCodes(
  'LOCARA_MNGT_DV_CD',
);

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  asnOjYm: now.format('YYYYMM'),
  mngrDvCd: '1',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  ogId: '',
  svcCntrCd: '',
  prtnrNo: '', // 파트너번호(매니저/엔지니어 파트너번호)
  bldCd: '', // 빌딩
  exceptWellsManagerYn: 'N',
});

let cachedParams;
const totalCount = ref(0);
const initTotalCount = ref(0);
const buildingCodes = ref();

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
  searchParams.value.bldCd = '';
  searchParams.value.exceptWellsManagerYn = 'N';
}

const filters = [{ name: 'rsbDvCdFilter', criteria: "value = 'W0105'" }]; // W0105 :웰스매니저 직책

/*  웰스매니저 미관리 제외  체크박스  */
async function onChangeCheckbox() {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('rsbDvCd', false);

  // 체크박스 체크시에만 (RSB_DV_CD = 'W0105') 필터링
  if (searchParams.value.exceptWellsManagerYn === 'Y') {
    view.activateColumnFilters('rsbDvCd', 'rsbDvCdFilter', true);
    totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
  } else {
    totalCount.value = initTotalCount.value; // 필터 해제시 초기 데이터 건수 노출
  }
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();

  // 필터
  view.activateAllColumnFilters('rsbDvCd', false); // 필터 해제 처리
  initTotalCount.value = totalCount.value; // 초기 데이터 건수
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
// 빌딩 목록 조회
async function fetchBuildings() {
  const res = await dataService.get(`${baseUrl}/buildings`);
  const codeData = res.data;

  buildingCodes.value = codeData.map((v) => ({ codeId: v.bldCd, codeName: v.bldNm }));
}
onMounted(async () => {
  await fetchBuildings();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'mngtPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pstnDvCdNm' },
    { fieldName: 'bldMngtPrtnrNo' },
    { fieldName: 'bldMngtPrtnrKnm' },
    { fieldName: 'bldNm' },
    { fieldName: 'rsbDvCd' }, /* 필터시 사용 */
    { fieldName: 'mngtCstCnt', dataType: 'number' },
    { fieldName: 'notMngtExcdCstCnt', dataType: 'number' },
    { fieldName: 'asnOjSumCnt', dataType: 'number' },
    { fieldName: 'vstStpCstCnt', dataType: 'number' },
    { fieldName: 'vstCanCstCnt', dataType: 'number' },
    { fieldName: 'vstCstCnt', dataType: 'number' },
    { fieldName: 'vstAccChngCstCnt', dataType: 'number' },
    { fieldName: 'vstAccChkCstCnt', dataType: 'number' },
    { fieldName: 'vstAccSumCnt', dataType: 'number' },
    { fieldName: 'vstFshAccChngCstCnt', dataType: 'number' },
    { fieldName: 'vstFshAccChkCstCnt', dataType: 'number' },
    { fieldName: 'vstFshAccSumCnt', dataType: 'number' },
    { fieldName: 'vstFshAccRt', dataType: 'number' },
    { fieldName: 'svCntcFshCstCnt', dataType: 'number' },
    { fieldName: 'svCntcVstImpCstCnt', dataType: 'number' },
    { fieldName: 'svCntcStnbCstCnt', dataType: 'number' },
    { fieldName: 'svCntcSumCnt', dataType: 'number' },
    { fieldName: 'svCntcRt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '180', styleName: 'text-center' },
    { fieldName: 'mngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCdNm', header: t('MSG_TXT_CRLV'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldMngtPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'mngtCstCnt',
      header: t('MSG_TXT_MNGT_CST_CNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'notMngtExcdCstCnt',
      header: t('MSG_TXT_NO_MNGT_EXCD_CST_CNT'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'asnOjSumCnt',
      header: { text: t('MSG_TXT_ASGN'), styleName: 'text-weight-bold' },
      width: '100',
      styleName: 'text-right text-blue',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    },
    { fieldName: 'vstStpCstCnt',
      header: t('MSG_TXT_STP'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstCanCstCnt',
      header: t('MSG_TXT_CANCEL'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstCstCnt',
      header: t('MSG_TXT_VST'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstAccChngCstCnt',
      header: t('MSG_TXT_CHANGE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstAccChkCstCnt',
      header: t('MSG_TXT_RGLR_CHK'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstAccSumCnt',
      header: { text: t('MSG_TXT_SBSUM'), styleName: 'text-weight-bold' },
      width: '100',
      styleName: 'text-right text-blue',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    },
    { fieldName: 'vstFshAccChngCstCnt',
      header: t('MSG_TXT_CHANGE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstFshAccChkCstCnt',
      header: t('MSG_TXT_RGLR_CHK'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'vstFshAccSumCnt',
      header: { text: t('MSG_TXT_SBSUM'), styleName: 'text-weight-bold' },
      width: '100',
      styleName: 'text-right text-blue',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    },
    { fieldName: 'vstFshAccRt',
      header: t('MSG_TXT_VST_RAT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right ',
        valueCallback(grid) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          // ROUND( ( (방문완료 교체+ 방문완료 점검) / (방문계정 교체 + 방문계정 점검) ) * 100,2)
          const vstFshAccChngCstSum = grid.getSummary('vstFshAccChngCstCnt', 'sum'); // 방문완료 교체 합계
          const vstFshAccChkCstSum = grid.getSummary('vstFshAccChkCstCnt', 'sum'); // 방문완료 점검 합계
          const vstAccChngCstSum = grid.getSummary('vstAccChngCstCnt', 'sum'); // 방문계정 교체 합계
          const vstAccChkCstSum = grid.getSummary('vstAccChkCstCnt', 'sum'); // 방문계정 점검 합계
          const totalSum = ((vstFshAccChngCstSum + vstFshAccChkCstSum) / (vstAccChngCstSum + vstAccChkCstSum)) * 100;
          const vstFshAccRt = (Math.round(totalSum * 100) / 100); // ROUND 소수점 2자리 반올림 처리
          return Number.isNaN(vstFshAccRt) ? 0 : vstFshAccRt;
        },
      },
    },
    { fieldName: 'svCntcFshCstCnt',
      header: t('MSG_TXT_CTT_FSH'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'svCntcVstImpCstCnt',
      header: t('MSG_TXT_VST_IMP'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'svCntcStnbCstCnt',
      header: t('MSG_TXT_NOT_CTT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'svCntcSumCnt',
      header: { text: t('MSG_TXT_AGG'), styleName: 'text-weight-bold' },
      width: '100',
      styleName: 'text-right text-blue',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    },
    { fieldName: 'svCntcRt',
      header: t('MSG_TXT_CTT_RAT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          // ROUND( ( (서비스 컨택 완료) / (방문계정 교체 + 방문계정 점검) )* 100,2)
          const svCntcFshCstSum = grid.getSummary('svCntcFshCstCnt', 'sum'); // 서비스 컨택 완료 합계
          const vstAccChngCstSum = grid.getSummary('vstAccChngCstCnt', 'sum'); // 방문계정 교체 합계
          const vstAccChkCstSum = grid.getSummary('vstAccChkCstCnt', 'sum'); // 방문계정 점검 합계
          const totalSum = ((svCntcFshCstSum) / (vstAccChngCstSum + vstAccChkCstSum)) * 100;
          const svCntcRt = (Math.round(totalSum * 100) / 100); // ROUND 소수점 2자리 반올림 처리
          return Number.isNaN(svCntcRt) ? 0 : svCntcRt;
        },
      },
    },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 2, resizable: true });
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('mngtPrtnrNo').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.setColumnFilters('rsbDvCd', filters); // 필터 적용
  view.setColumnLayout([
    'ogNm',
    {
      header: t('MSG_TXT_EPNO_FNM'), // 사번 및 성명
      direction: 'horizontal',
      items: ['mngtPrtnrNo', 'prtnrKnm', 'pstnDvCdNm'],
    },
    {
      header: t('MSG_TXT_MAT_HODT_INF'), // 빌딩별 자재실장 정보
      direction: 'horizontal',
      items: ['bldMngtPrtnrNo', 'bldMngtPrtnrKnm'],
    },
    'bldNm',
    'mngtCstCnt',
    'notMngtExcdCstCnt',
    {
      header: t('MSG_TXT_BS_ASN_OJ_INF'), // BS배정대상 정보
      direction: 'horizontal',
      items: ['asnOjSumCnt', 'vstStpCstCnt', 'vstCanCstCnt', 'vstCstCnt'],
    },
    {
      header: t('MSG_TXT_VST_ACC'), // 방문계정
      direction: 'horizontal',
      items: ['vstAccChngCstCnt', 'vstAccChkCstCnt', 'vstAccSumCnt'],
    },
    {
      header: t('MSG_TXT_FSH_ACC'), // 완료계정
      direction: 'horizontal',
      items: ['vstFshAccChngCstCnt', 'vstFshAccChkCstCnt', 'vstFshAccSumCnt', 'vstFshAccRt'],
    },
    {
      header: t('MSG_TXT_CNTC_IZ'), // 컨택내역
      direction: 'horizontal',
      items: ['svCntcFshCstCnt', 'svCntcVstImpCstCnt', 'svCntcStnbCstCnt', 'svCntcSumCnt', 'svCntcRt'],
    },
  ]);
});
</script>
