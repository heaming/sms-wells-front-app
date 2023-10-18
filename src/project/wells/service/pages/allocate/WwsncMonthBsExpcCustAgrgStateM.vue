<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncMonthBsExpcCustAgrgStateM - 월 B/S 예상고객 집계현황(K-W-SV-U-0080M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-09-18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매니저 BS 서비스 현황 http://localhost:3000/#/service/wsnc-month-bs-expc-cust-agrg-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            rules="required"
            :options="codes.MNGR_DV_CD"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="2"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            partner-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            partner-label="prtnrNoNm"
            auth-yn="N"
          />
        </template>
        <template v-if="isEngineerSelected">
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.ogId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="1"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            partner-first-option="all"
            partner-label="prtnrNoNm"
            auth-yn="N"
          />
        </template>
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
const baseUrl = '/sms/wells/service/month-bs-expc-cust-agrg-state';

const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD',
);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  mngrDvCd: '1',
  ogId: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  prtnrNo: '',
});

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
const isEngineerSelected = computed(() => searchParams.value.mngrDvCd === '2');

/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
}

let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prtnrNo' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'pstnDvNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'mngrCustCnt', dataType: 'number' },
    { fieldName: 'wrfr', dataType: 'number' }, // 정수기
    { fieldName: 'miniWrfr', dataType: 'number' }, // 미니정수기
    { fieldName: 'bdtIndv', dataType: 'number' }, // 비대-개인
    { fieldName: 'bdtCrp', dataType: 'number' }, // 비대-법인
    { fieldName: 'arcl', dataType: 'number' }, // 공기청정기
    { fieldName: 'wtrSftnr', dataType: 'number' }, // 연수기
    { fieldName: 'cffMchn', dataType: 'number' }, // 커피머신
    { fieldName: 'msgcr', dataType: 'number' }, // 안마의자
    { fieldName: 'wellsFarmWide', dataType: 'number' }, // WIDE
    { fieldName: 'wellsFarmSlim', dataType: 'number' }, // SLIM
    { fieldName: 'wellsFarm', dataType: 'number' }, // 계
    { fieldName: 'dryr', dataType: 'number' }, // 건조기
    { fieldName: 'arcon', dataType: 'number' }, // 에어컨
    { fieldName: 'ardrssr', dataType: 'number' }, // 에어드레서
    { fieldName: 'wash', dataType: 'number' }, // 세탁기
    { fieldName: 'sding', dataType: 'number' }, // 모종
    { fieldName: 'fieldSum', dataType: 'number' }, // 소계
  ];

  const columns = [
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '90', styleName: 'text-center' }, // 사번
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' }, // 성명
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: '100', styleName: 'text-center' }, // 직급
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'mngrCustCnt', header: t('MSG_TXT_MNGT_CST_CNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 관리고객수
    { fieldName: 'wrfr', header: t('MSG_TXT_WRFR'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 정수기
    { fieldName: 'miniWrfr', header: t('MSG_TXT_MINI_WRFR'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 미니정수기
    { fieldName: 'bdtIndv', header: t('MSG_TXT_BDT_INDV'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 비대-개인
    { fieldName: 'bdtCrp', header: t('MSG_TXT_BDT_CRP'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 비대-법인
    { fieldName: 'arcl', header: t('MSG_TXT_ARCLE'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 공기청정기
    { fieldName: 'wtrSftnr', header: t('MSG_TXT_WTST'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 연수기
    { fieldName: 'cffMchn', header: t('MSG_TXT_CFF_MCHN'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 커피머신
    { fieldName: 'msgcr', header: t('MSG_TXT_MSGCR'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 안마의자
    { fieldName: 'wellsFarmWide', header: t('WIDE'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // WIDE
    { fieldName: 'wellsFarmSlim', header: t('SLIM'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // SLIM
    { fieldName: 'wellsFarm', header: t('MSG_TXT_AGG'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 계
    { fieldName: 'dryr', header: t('MSG_TXT_DRYER'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 건조기
    { fieldName: 'arcon', header: t('MSG_TXT_ARCN'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 에어컨
    { fieldName: 'ardrssr', header: t('MSG_TXT_ARDRSSR'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 에어드레서
    { fieldName: 'wash', header: t('MSG_TXT_WASHER'), width: '60', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 세탁기
    { fieldName: 'sding', header: t('MSG_TXT_SDING'), width: '50', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 모종
    { fieldName: 'fieldSum', header: t('MSG_TXT_SBSUM'), width: '80', styleName: 'text-right', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 소계
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'prtnrNo',
    {
      header: t('MSG_TXT_EPNO_FNM'), // 사번 및 성명
      direction: 'horizontal', // merge type
      items: ['ogNm', 'prtnrKnm', 'pstnDvNm'],
    },
    'bldNm',
    'mngrCustCnt',
    {
      header: t('MSG_TXT_VST_ACC'), // 방문계정
      direction: 'horizontal', // merge type
      items: [
        'wrfr',
        'miniWrfr',
        'bdtIndv',
        'bdtCrp',
        'arcl',
        'wtrSftnr',
        'cffMchn',
        'msgcr',
        {
          header: t('MSG_TXT_WELSF'), // 웰스팜
          direction: 'horizontal', // merge type
          items: ['wellsFarmWide', 'wellsFarmSlim', 'wellsFarm'],
        },
        'dryr',
        'arcon',
        'ardrssr',
        'wash',
        'sding',
        'fieldSum',
      ],
    },
  ]);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('prtnrKnm').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
  view.setFixedOptions({ colCount: 3, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
