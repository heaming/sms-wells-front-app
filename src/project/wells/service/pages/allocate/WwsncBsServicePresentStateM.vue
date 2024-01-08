<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : [K-W-SV-U-0290M01] WwsncBsServicePresentStateM - B/S 서비스 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.22
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈' , '메뉴구조 업데이트 필요' , 'B/S 서비스 현황']"
      />
    </template>
    <kw-search
      :cols="5"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item :label="t('MSG_TXT_MGT_YNM')">
          <kw-date-picker
            v-model="searchParams.mgtYnm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.mgtDept"
          v-model:dgr2-levl-og-id="searchParams.rgnlGrp"
          v-model:dgr3-levl-og-id="searchParams.branch"
          v-model:prtnr-no="searchParams.prtnrNo"
          v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
          v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
          v-model:dgr3-levl-og="searchParams.dgr3LevlOg"
          v-model:partner="searchParams.partner"
          use-og-level="3"
          use-partner
          :dgr1-levl-og-readonly="mgtDeptDisabled"
          :dgr2-levl-og-readonly="rgnlGrpDisabled"
          :dgr3-levl-og-readonly="branchDisabled"
          :partner-readonly="partnerDisabled"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr3-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
        />
      </kw-search-row>
      <!-- 20231219 김호영 M 수정 요청사항..직급 성명 사번 삭제 -->
      <!-- <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_CRLV')">직급
          <kw-select
            v-model="searchParams.pstnDvCd"
            :options="codes.PSTN_DV_CD"
            first-option="all"
            first-option-value="ALL"
            placeholder="전체"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_EPNO')">사번
          <kw-input
            v-model="searchParams.prtnrNo"
            :maxlength="50"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_EMPL_NM')">성명
          <kw-input
            v-model="searchParams.prtnrNm"
            :maxlength="50"
          />
        </kw-search-item>
      </kw-search-row> -->
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_CASES') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdInfoRef"
        :visible-rows="1"
        class="mb30"
        @init="initInfoGrid"
      />
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchListData"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_CASES') }}</span>
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          :disable="!pageInfo.totalCount"
          @click="onClickPrintEl"
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdListRef"
        name="grdListRef"
        :visible-rows="10"
        @init="initListGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchListData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import { printElement } from '~common/utils/common';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const { alert } = useGlobal();
const { currentRoute } = useRouter();

const router = useRouter();
const dataService = useDataService();

const store = useStore();
const userInfo = store.getters['meta/getUserInfo'];
console.log('userInfo >>>>>>', userInfo);
/** ====================================================
 * 권한 관련
 * 1. 웰스 매니저 + 관리자(플래너는 테스트를 위해서 넣음)
 * 2. 지역단장인 경우
** ==================================================== */
const wmAuth = ref((userInfo.rsbNm === '매니저' || userInfo.rsbNm === '플래너') && userInfo.tenantCd === 'W' && userInfo.ogTpCd !== 'HR1');
console.log('wmAuth.value >>>', wmAuth.value);

// const { getters } = useStore();
// const userInfo = getters['meta/getUserInfo'];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PSTN_DV_CD', // 직급구분코드
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let cachedParams;
const searchParams = ref({
  mgtYnm: dayjs().format('YYYYMM'), // 관리년월
  mgtDept: '',
  rgnlGrp: '',
  branch: '',
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr3LevlOg: {},
  partner: {},
  pstnDvCd: '', // 직급
  prtnrNo: wmAuth ? userInfo.employeeIDNumber : '', // 사번
  prtnrNm: '', // 성명
  baseDateFrom: '',
  baseDateTo: '',
  currentYM: dayjs().format('YYYYMM'),
});
console.log('!!!onMounted searchParams.value.prtnrNo >>>>>', searchParams.value.prtnrNo);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const grdInfoRef = ref(getComponentType('KwGrid'));
const grdListRef = ref(getComponentType('KwGrid'));

/** =========================================
 * initInfoGrid 영역 조회
**========================================= */
async function fetchInfoData() {
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/info', { params: cachedParams });
  console.log('fetchInfoData res.data >>>', res.data);

  const view = grdInfoRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
}

/** =========================================
 * initListGrid 영역 조회
**========================================= */
async function fetchListData() {
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdListRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.setRows(list);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  if (isEmpty(searchParams.value.mgtDept)) {
    await alert(t('총괄단 선택된 값이 없습니다.'));
    return;
  }
  searchParams.value.baseDateFrom = dayjs(searchParams.value.mgtYnm).startOf('month').format('YYYYMMDD');
  searchParams.value.baseDateTo = dayjs(searchParams.value.mgtYnm).endOf('month').format('YYYYMMDD');
  cachedParams = cloneDeep(searchParams.value);
  console.log('cachedParams >>>', cachedParams);

  await fetchInfoData();
  await fetchListData();
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdListRef.value.getView();
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const mgtDeptDisabled = ref(true);
const rgnlGrpDisabled = ref(true);
const branchDisabled = ref(true);
const partnerDisabled = ref(false);
onMounted(async () => {
  if (isEmpty(searchParams.value.mgtDept)) {
    mgtDeptDisabled.value = false;
  }
  if (isEmpty(searchParams.value.rgnlGrp)) {
    rgnlGrpDisabled.value = false;
  }
  if (isEmpty(searchParams.value.branch)) {
    branchDisabled.value = false;
  }
  // TODO...웰스 매니저인지 권한 확인 필요
  /** =============================
   * B/S 서비스현황 권한체크 START
  ** ============================= */
  // DEF_4653 웰스매니저인 경우 본인만 조회 가능하도록...
  console.log('wmAuth.value >>>', wmAuth.value);
  if (wmAuth.value) {
    mgtDeptDisabled.value = true;
    rgnlGrpDisabled.value = true;
    branchDisabled.value = true;
    partnerDisabled.value = true;
  }

  // 1. 지역단장인 경우 총괄단, 지역단만 disable
  console.log('onMounted searchParams.value.prtnrNo >>>>>', searchParams.value.prtnrNo);
  if (userInfo.rsbCd === 'W0203') {
    searchParams.value.prtnrNo = '';
  }

  console.log('onMounted searchParams.value.prtnrNo 222 >>>>>', searchParams.value.prtnrNo);
  console.log('onMounted mgtDeptDisabled.value 222 >>>>>', mgtDeptDisabled.value);
  console.log('onMounted rgnlGrpDisabled.value 222 >>>>>', rgnlGrpDisabled.value);
  console.log('onMounted branchDisabled.value 222 >>>>>', branchDisabled.value);
  console.log('onMounted partnerDisabled.value 222 >>>>>', partnerDisabled.value);
  /** =============================
   * B/S 서비스현황 권한체크 END
  ** ============================= */
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initInfoGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'mngtAcc', header: t('MSG_TXT_MNGT_ACC'), width: '385', styleName: 'text-right' }, // 관리계정
    { fieldName: 'vstAcc', header: t('MSG_TXT_VST_ACC'), width: '385', styleName: 'text-right' }, // 방문계정
    { fieldName: 'fshAcc', header: t('MSG_TXT_FSH_ACC'), width: '385', styleName: 'text-right' }, // 완료계정
    { fieldName: 'svcProc', header: `${t('MSG_TXT_SVC_PROC')}(%)`, width: '385', styleName: 'text-right' }, // 서비스처리율
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initListGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'asnOjYm', header: t('MSG_TXT_MGT_YNM'), width: '100', styleName: 'text-center' }, // 관리년월
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' }, // 소속
    { fieldName: 'bldNm', header: t('MSG_TXT_CFMNR_BLD'), width: '200' }, // 상주빌딩
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' }, // 성명
    { fieldName: 'pstnDvCdNm', header: t('MSG_TXT_CRLV'), width: '100' }, // 직급
    { fieldName: 'mngtAcc', header: t('MSG_TXT_MGT'), width: '100', styleName: 'text-right' }, // 관리
    { fieldName: 'vstAcc', header: t('MSG_TXT_VST'), width: '100', styleName: 'text-right' }, // 방문
    { fieldName: 'fshAcc', header: t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-right' }, // 완료
    { fieldName: 'svcProc', header: `${t('MSG_TXT_PROCS_RT')}(%)`, width: '100', styleName: 'text-center' }, // 처리율(%)
    { // B/S 관리일정
      fieldName: 'mngtSchd',
      header: t('B/S 일정관리'),
      width: '80',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('B/S 일정관리'),
    },
    { fieldName: 'ogId', visible: false },
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // 그리드 필드 클릭시
  view.onCellItemClicked = async (grid, clickData) => {
    // 계약번호 클릭시
    // if (clickData.column === 'pdctPdCd') {
    // eslint-disable-next-line max-len
    // const param = { cntrNo: grid.getDataSource().getValue(clickData.dataRow, 'cntrNo'), cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
    // router.push({ path: '/service/wwsnb-bs-manager-schedule-date', state: { stateParam: param } });
    // router.push({ path: '/service/wwsnb-bs-manager-schedule-date' });
    // } else if (clickData.column === 'mngtSchd') {
    if (clickData.column === 'mngtSchd') {
      const prtnrNo = grid.getValue(clickData.itemIndex, 'prtnrNo');
      const prtnrKnm = grid.getValue(clickData.itemIndex, 'prtnrKnm');
      const ogId = grid.getValue(clickData.itemIndex, 'ogId');
      const asnOjYm = grid.getValue(clickData.itemIndex, 'asnOjYm');

      const fromDate = searchParams.value.currentYM !== asnOjYm ? dayjs(asnOjYm).startOf('month').format('YYYYMMDD')
        : dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD');
      const toDate = searchParams.value.currentYM !== asnOjYm ? dayjs(asnOjYm).endOf('month').format('YYYYMMDD')
        : dayjs().subtract(0, 'month').endOf('month').format('YYYYMMDD');

      router.push({
        path: '/service/wwsnb-bs-manager-schedule-date', // B/S 관리일정 조회
        query: {
          prtnrNo,
          prtnrKnm,
          ogId,
          fromDate,
          toDate,
        },
      });
    }
  };
});

</script>
