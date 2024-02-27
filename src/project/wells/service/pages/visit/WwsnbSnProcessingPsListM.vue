<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbSnProcessingPsListM(K-W-SV-U-0078M01) - S/N 처리 현황
3. 작성자 : heymi.cho
4. 작성일 : 2023.08.08
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- S/N 처리 현황 (http://localhost:3000/#/service/wwsnb-sn-processing-ps-list)
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
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            type="date"
            :label="$t('MSG_TXT_ASN_YM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="onChangePdGrpCd"
          />
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
            v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
            v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
            v-model:dgr3-levl-og="searchParams.dgr3LevlOg"
            v-model:partner="searchParams.partner"
            use-og-level="3"
            use-partner
            dgr1-levl-og-required
            dgr2-levl-og-required
            dgr1-levl-og-first-option="select"
            dgr2-levl-og-first-option="select"
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
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ $t('MSG_TXT_ALL_PS') }}</h3>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdTotalRef"
        name="grdTotal"
        :visible-rows="1"
        @init="initTotalGrid"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>
            {{ $t('MSG_TXT_RPBL') }}
          </h3>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="1"
        @init="initSubGrid"
      />
      <kw-action-top class="mt30">
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchMainData"
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
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initMainGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchMainData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, codeUtil, useDataService, getComponentType, defineGrid, gridUtil, modal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const { alert } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const now = dayjs();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdTotalRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'LOCARA_MNGT_DV_CD',
);

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  mngrDvCd: '1',
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr3LevlOg: {},
  partner: {},
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  ogId: '',
  prtnrNo: '',
  pdGrpCd: '',
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

async function fetchSubData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/ratio', { params: { ...cachedParams } });
  // const { list: state } = res.data;

  console.log(res);

  const totalView = grdTotalRef.value.getView();
  totalView.getDataSource().setRows(res.data);
  totalView.resetCurrent();

  const subView = grdSubRef.value.getView();
  subView.getDataSource().setRows(res.data);
  subView.resetCurrent();
}

async function fetchMainData() {
  await fetchSubData();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/customers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchMainData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/customers/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initMainGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'reYn', header: t('MSG_TXT_RPBL'), width: '90', styleName: 'text-center' },
    { fieldName: 'bcInMthdCd', header: t('MSG_TXT_WK_STS'), width: '110', styleName: 'text-center' },
    { fieldName: 'bcPblDvCd', header: t('MSG_TIT_UNIFY_QR_TARGET'), width: '130', styleName: 'text-center' },
    { fieldName: 'pblTms', header: t('MSG_TXT_PBL_CNT'), width: '110', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_PBL_CNT'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_PBL_CNT'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cstNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '160',
      renderer: { type: 'button', hideWhenEmpty: false },
      styleName: 'text-center rg-button-link',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'locaraTno', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'exnoEncr', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'idvTno', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'contact',
      header: t('MSG_TXT_CONTACT'),
      width: '170',
      styleName: 'text-center',
      displayCallback(grid, index) {
      // eslint-disable-next-line max-len
        const { locaraTno: no1, exnoEncr: no2, idvTno: no3 } = grid.getValues(index.itemIndex);
        return !isEmpty(no1) && !isEmpty(no2) && !isEmpty(no3) ? `${no1}-${no2}-${no3}` : '';
      },
    },
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'mexnoEncr', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cralIdvTno', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'phoneNum',
      header: t('MSG_TXT_MOBILE_PHONE_NUM'),
      width: '170',
      styleName: 'text-center',
      displayCallback(grid, index) {
      // eslint-disable-next-line max-len
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return !isEmpty(no1) && !isEmpty(no2) && !isEmpty(no3) ? `${no1}-${no2}-${no3}` : '';
      } },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_IST_ZIP'), width: '136' },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '280' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_OSTR_WK') + t('MSG_TXT_CNTN'), width: '170', styleName: 'text-center' },
    { fieldName: 'showDetail',
      header: t('MSG_TXT_SHOW_DETAIL'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_TXT_SHOW_DETAIL'),
    },
    { fieldName: 'lstmmVstCnfmdt', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_VST_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstCnfmdt', header: t('MSG_TXT_VST_EXP_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: t('MSG_TXT_PROM_DT'), width: '140', styleName: 'text-center' },
    { fieldName: 'vstExpHh', header: t('MSG_TXT_PROM_HH'), width: '106', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '140', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_CNT_PER'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'vstPrgsStatCd', header: t('MSG_TXT_PRGS_STATUS'), width: '110', styleName: 'text-center' },
    { fieldName: 'svProcsCn', header: t('MSG_TXT_PROCS_IZ'), width: '280', styleName: 'text-center' },
    { fieldName: 'cstSign',
      header: t('MSG_BTN_CST_SIGN'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_BTN_CST_SIGN'),
    },
    { fieldName: 'cancYn', header: t('MSG_TXT_CNCL_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'hdwrInRsonCd', header: t('MSG_TXT_HDWR_RSON'), width: '140', styleName: 'text-center' },
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_PBL_CNT'), width: '110', styleName: 'text-center', visible: false },
    { fieldName: 'cstSignCn', header: t('MSG_TXT_PBL_CNT'), width: '110', styleName: 'text-center', visible: false },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    // TODO: 고객서명 이미지 uid -> 현재 vs106 값 이행 안된듯
    const { cntrNo, cntrSn, cstSvAsnNo } = gridUtil.getRowValue(grid, dataRow);

    if (column === 'cstNo') {
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    } else if (column === 'showDetail') {
      await modal({ //  url : /pu-products
        component: 'WwsnbSnProcessingPsDetailP',
        componentProps: { svAsnNo: cstSvAsnNo },
      });
    } else if (column === 'cstSign') {
      console.log(cstSvAsnNo);
      const res = await dataService.get(`/sms/wells/service/sn-processing-ps/cstSignCn?cstSvAsnNo=${cstSvAsnNo}`);
      console.log(res);

      const { cstSignCn } = res.data;
      console.log(cstSignCn);

      if (!cstSignCn || cstSignCn === '') {
        alert('서명 데이터 없음');
        return;
      }

      await modal({
        component: 'WwsnzSignPreviewP',
        componentProps: { sign: cstSignCn }, // fileUid만 주면 됨
      });
    }
  };
});

const initTotalGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'bsCntrTotal', header: t('MSG_TXT_ALL'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'procsTotal', header: t('MSG_TXT_PROC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'scanTotal', header: t('MSG_TXT_SCN'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'handTotal', header: t('MSG_TXT_HANDWRITE'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'reReqTotal', header: t('MSG_TXT_APLC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'yetProcs', header: t('MSG_TXT_NO_PROC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratProcsTotal', header: `${t('MSG_TXT_PROCS_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratStickTotal', header: `${t('MSG_TXT_STICK_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratScanTotal', header: `${t('MSG_TXT_SCAN_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initSubGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'curMmRe', header: t('MSG_TXT_ALL'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReProcs', header: t('MSG_TXT_PROC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReScan', header: t('MSG_TXT_SCN'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReHand', header: t('MSG_TXT_HANDWRITE'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReReq', header: t('MSG_TXT_APLC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReYetProcs', header: t('MSG_TXT_NO_PROC'), width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratReProcs', header: `${t('MSG_TXT_PROCS_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratReStick', header: `${t('MSG_TXT_STICK_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratReScan', header: `${t('MSG_TXT_SCAN_RT')}(%)`, width: '170', styleName: 'text-center', dataType: 'number', numberFormat: '#,###.##%' },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

</script>
