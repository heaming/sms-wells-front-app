<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaIndividualWareQomAsnMgtM - 개인창고물량배정(W-SV-U-0190M01)
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.07.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 관리자가 물류센터로부터 개인창고로 물량을 일괄배정하는 화면 (http://localhost:3000/#/service/wwsna-individual-ware-qom-asn-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.apyYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            @change="onChangeApyYm"
          />
        </kw-search-item>
        <!-- //기준년월 -->
        <!-- 배정년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            :label="$t('MSG_TXT_ASN_YM')"
            rules="required"
            @change="onChangeAsnOjYm"
          />
        </kw-search-item>
        <!-- //배정년월 -->
        <!-- 회차 -->
        <kw-search-item
          :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
          required
        >
          <kw-input
            v-model="searchParams.cnt"
            :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
            rules="required|numeric|min_value:1|max_value:999999999999"
          />
        </kw-search-item>
        <!-- //회차 -->
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.ostrWareNo"
            :options="optionsOstrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            rules="required"
          />
        </kw-search-item>
        <!-- //출고창고 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            first-option="all"
            :options="codes.ITM_KND_CD"
          />
        </kw-search-item>
        <!-- //품목종류 -->
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- //품목코드 -->
        <!-- 입고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="filterCodes.wareDvCd"
            :label="$t('MSG_TXT_WARE_DV')"
            class="w150"
            rules="required"
          />
          <kw-select
            v-model="searchParams.strWareNo"
            :options="optionsStrWareNo"
            :label="$t('MSG_TXT_STR_WARE')"
            option-value="wareNo"
            option-label="wareNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- //입고창고 -->
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>

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
        <kw-btn
          v-permission:update
          dense
          secondary
          :label="$t('MSG_TXT_WARE_RNW')"
          @click="onClickWareRenewal"
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_TXT_ASGN_EXLD_ITM_RGST')"
          @click="openAssignExcludeItemP"
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_RECREATION')"
          dense
          primary
          :disable="isSearch"
          @click="onClickRecreation"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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

import { codeUtil, defineGrid, useDataService, getComponentType, useMeta, useGlobal, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, confirm, alert, modal } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'WARE_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;
const searchParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  asnOjYm: dayjs().format('YYYYMM'),
  cnt: '1',
  ostrWareNo: '100002',
  itmKndCd: '',
  itmPdCd: '',
  wareDvCd: '3',
  wareDtlDvCd: '31',
  strWareNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const filterCodes = ref({
  wareDvCd: [],
});

// 창고구분 필터링
function wareDvCdFilter() {
  filterCodes.value.wareDvCd = codes.WARE_DV_CD.filter((v) => ['3'].includes(v.codeId));
}

const optionsOstrWareNo = ref();
// 출고창고 조회
const onChangeOstrWareHouse = async () => {
  searchParams.value.ostrWareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/qom-asn/out-of-storage-wares',
    { params: {
      apyYm: searchParams.value.apyYm,
    } },
  );
  optionsOstrWareNo.value = result.data;
  if (!isEmpty(result.data)) {
    searchParams.value.ostrWareNo = result.data[0].wareNo;
  }
};

const optionsStrWareNo = ref();
// 입고창고 조회
const onChangeStrWareHouse = async () => {
  searchParams.value.strWareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/qom-asn/storage-wares',
    { params: {
      apyYm: searchParams.value.apyYm,
      asnOjYm: searchParams.value.asnOjYm,
      wareDvCd: searchParams.value.wareDvCd,
      wareDtlDvCd: searchParams.value.wareDtlDvCd,
    } },
  );
  optionsStrWareNo.value = result.data;
};

// 기준년월, 배정년월이 변경되었을 때 창고번호 재조회
async function onChangeApyYm() {
  const { apyYm, asnOjYm } = searchParams.value;
  if (isEmpty(apyYm)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    searchParams.value.ostrWareNo = '';
    optionsOstrWareNo.value = [];
    return;
  }
  // 출고창고 조회
  await onChangeOstrWareHouse();

  if (isEmpty(asnOjYm)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];
    return;
  }

  // 입고창고 조회
  await onChangeStrWareHouse();
}

// 배정년월 변경 시
async function onChangeAsnOjYm() {
  const { asnOjYm } = searchParams.value;
  if (isEmpty(asnOjYm)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];
    return;
  }

  // 입고창고 조회
  await onChangeStrWareHouse();
}

await Promise.all([
  wareDvCdFilter(),
  onChangeOstrWareHouse(),
  onChangeStrWareHouse(),
]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/qom-asn/individual-wares/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: qomAsn, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(qomAsn);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

const isSearch = ref(true);
// 조회버튼 클릭
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  const { ostrWareNo } = cachedParams;
  isSearch.value = false;

  // 물량배정 데이터 건수 체크
  let res = await dataService.get('/sms/wells/service/qom-asn/exist-check', { params: { ...cachedParams } });
  const existYn = res.data;

  // 출고창고가 파주일 경우만 데이터를 생성
  if (existYn === 'N' && ostrWareNo === '100002') {
    const { asnOjYm, cnt } = cachedParams;
    // {0} 물량배정 데이터를 생성하시겠습니까?
    const msg = `${asnOjYm.substring(0, 4)}-${asnOjYm.substring(4, 6)} ${cnt}`;
    if (!await confirm(`${msg}${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_TXT_INDV_WARE')}${t('MSG_ALT_QOM_ASN_DTA_CRT')}`)) {
      return;
    }

    // 데이터 생성
    res = await dataService.post('/sms/wells/service/qom-asn/individual-wares', cachedParams, { timeout: 300000 });
    const { processCount } = res.data;
    if (processCount === 0) {
      // 생성할 데이터가 존재하지 않습니다.
      await alert(t('MSG_ALT_CRT_NO_DATA'));
      return;
    }
    // 생성되었습니다.
    notify(t('MSG_ALT_CREATE'));
  }

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/qom-asn/individual-wares/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 창고갱신
async function onClickWareRenewal() {
  const { asnOjYm, apyYm } = searchParams.value;

  if (isEmpty(apyYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_BASE_YM')}${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }
  if (isEmpty(asnOjYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_ASN_YM')}${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  const res = await dataService.put('/sms/wells/service/qom-asn/ware-renewal', searchParams.value);
  const { processCount } = res.data;
  if (processCount > 0) {
    // 창고 갱신이 완료되었습니다.
    notify(t('MSG_ALT_WARE_RNW_FSH'));
    return;
  }
  // 이미 처리되었습니다.
  notify(t('MSG_ALT_ALRDY_PROCS_FSH'));
}

// 배정제외품목 등록 팝업
async function openAssignExcludeItemP() {
  await modal({
    component: 'WwsnaAssignExcludeItemRegP',
    componentProps: {},
  });
}

// 재생성
async function onClickRecreation() {
  const { asnOjYm, cnt, ostrWareNo } = cachedParams;

  if (isEmpty(asnOjYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_ASN_YM')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (isEmpty(cnt)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (isEmpty(ostrWareNo)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_OSTR_WARE')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  // {0} 물량배정 데이터를 재생성하시겠습니까?
  const msg = `${asnOjYm.substring(0, 4)}-${asnOjYm.substring(4, 6)} ${cnt}`;
  if (!await confirm(`${msg}${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_TXT_INDV_WARE')}${t('MSG_ALT_QOM_ASN_DTA_RECRT')}`)) {
    return;
  }

  let res = await dataService.delete('/sms/wells/service/qom-asn', { data: cachedParams });
  const { processCount } = res.data;
  if (processCount === 0) {
    // 생성할 데이터가 존재하지 않습니다.
    await alert(t('MSG_ALT_CRT_NO_DATA'));
    return;
  }
  // 데이터 생성
  res = await dataService.post('/sms/wells/service/qom-asn/individual-wares', cachedParams, { timeout: 300000 });
  // 생성되었습니다.
  notify(t('MSG_ALT_CREATE'));

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 품목이름
    // 입고창고
    { fieldName: 'wareNo' }, // 창고번호
    { fieldName: 'prtnrNo' }, // 번호
    { fieldName: 'prtnrNm' }, // 담당자
    { fieldName: 'wareNm' }, // 창고명
    { fieldName: 'centerQty', dataType: 'number' }, // 센터창고 수
    // 배정수량
    { fieldName: 'geQty', dataType: 'number' }, // 일반
    { fieldName: 'crpQty', dataType: 'number' }, // 법인
    { fieldName: 'totalQty', dataType: 'number' }, // 총 배정
    // 수량정보
    { fieldName: 'apyQty', dataType: 'number' }, // 가중치 적용
    { fieldName: 'ostrQty', dataType: 'number' }, // 누적출고
    { fieldName: 'bsQty', dataType: 'number' }, // BS완료
    { fieldName: 'stocQty', dataType: 'number' }, // 현재재고
    { fieldName: 'thwkQty', dataType: 'number' }, // 금주예정
    { fieldName: 'borrQty', dataType: 'number' }, // 차주예정
    { fieldName: 'cnfmQty', dataType: 'number' }, // 확정수량
    { fieldName: 'boxQty', dataType: 'number' }, // 박스수량
    // 창고빌딩정보
    { fieldName: 'bldCd' }, // 코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'telNo' }, // 전화번호
    { fieldName: 'adrZip' }, // 우편번호
    { fieldName: 'rnadr' }, // 주소1
    { fieldName: 'rdadr' }, // 주소2
  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NAME'), width: '200', styleName: 'text-left' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_PIC'), width: '86', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_WARE_QTY'), width: '140', styleName: 'text-right' },
    { fieldName: 'geQty', header: t('MSG_TXT_GE'), width: '86', styleName: 'text-right' },
    { fieldName: 'crpQty', header: t('MSG_TXT_CRP'), width: '86', styleName: 'text-right' },
    { fieldName: 'totalQty', header: t('MSG_TXT_TOTAL_ASGN'), width: '86', styleName: 'text-right' },
    { fieldName: 'apyQty', header: t('MSG_TXT_WTCF_APPLY'), width: '120', styleName: 'text-right' },
    { fieldName: 'ostrQty', header: `${t('MSG_TXT_ACML')}${t('MSG_TXT_OSTR')}`, width: '120', styleName: 'text-right' },
    { fieldName: 'bsQty', header: t('MSG_TXT_BS_FSH'), width: '120', styleName: 'text-right' },
    { fieldName: 'stocQty', header: `${t('MSG_TXT_CURRENT')}${t('MSG_TXT_STOC')}`, width: '120', styleName: 'text-right' },
    { fieldName: 'thwkQty', header: t('MSG_TXT_THWK_EXP'), width: '120', styleName: 'text-right' },
    { fieldName: 'borrQty', header: t('MSG_TXT_BORR_EXP'), width: '120', styleName: 'text-right' },
    { fieldName: 'cnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '120', styleName: 'text-right' },
    { fieldName: 'boxQty', header: t('MSG_TXT_BOX_KOR_QTY'), width: '120', styleName: 'text-right' },
    { fieldName: 'bldCd', header: t('MSG_TXT_CODE'), width: '66', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '130', styleName: 'text-left' },
    { fieldName: 'telNo', header: t('MSG_TXT_TEL_NO'), width: '86', styleName: 'text-center' },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '76', styleName: 'text-center' },
    { fieldName: 'rnadr', header: t('MSG_TXT_ADR_1'), width: '130', styleName: 'text-left' },
    { fieldName: 'rdadr', header: t('MSG_TXT_ADR_2'), width: '130', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'sapCd', 'itmPdCd', 'itmPdNm',
    {
      header: t('MSG_TXT_STR_WARE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['wareNo', 'prtnrNo', 'prtnrNm', 'wareNm'],
    },
    'centerQty',
    {
      header: t('MSG_TXT_ASGN_QTY'),
      direction: 'horizontal',
      items: ['geQty', 'crpQty', 'totalQty'],
    },
    'apyQty', 'ostrQty', 'bsQty', 'stocQty', 'thwkQty', 'borrQty', 'cnfmQty', 'boxQty',
    {
      header: `${t('MSG_TXT_WARE')}${t('MSG_TXT_BUILDING')}${t('MSG_TXT_INF')}`,
      direction: 'horizontal',
      items: ['bldCd', 'bldNm', 'telNo', 'adrZip', 'rnadr', 'rdadr'],
    },
  ]);

  view.setFixedOptions({
    colCount: 3,
  });
});

</script>
<style scoped>
</style>
