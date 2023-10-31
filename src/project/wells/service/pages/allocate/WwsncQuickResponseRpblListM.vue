<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0076M01] WwsncQuickResponseRpblListM - 고객 QR코드 재발행 내역 조회
3. 작성자 : juno.cha
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 QR코드 재발행 내역 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header />
    <kw-search
      v-permission:read
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row
        v-if="searchCase1"
      >
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('관리구분')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.LOCARA_MNGT_DV_CD"
            first-option="all"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('상품그룹')">
          <kw-select
            v-model="searchParams.pdPrpVal20"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('계약상세번호')">
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="searchCase1"
      >
        <kw-search-item :label="$t('사번')">
          <kw-input
            v-model="searchParams.prtnrNo"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row
        v-if="searchCase2"
      >
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('관리구분')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.LOCARA_MNGT_DV_CD"
            first-option="all"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('상품그룹')">
          <kw-select
            v-model="searchParams.pdPrpVal20"
            :options="codes.PD_GRP_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('계약상세번호')">
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row
        v-if="searchCase2"
      >
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.mngtDptmtCd"
          v-model:dgr2-levl-og-id="searchParams.rgnlGrpCd"
          v-model:dgr3-levl-og-id="searchParams.branchCd"
          v-model:prtnr-no="searchParams.mngrCd"
          v-model:partner="mngrPartnerObj"
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
      </kw-search-row>
      <kw-search-row
        v-if="searchCase2"
      >
        <kw-search-item :label="$t('사번')">
          <kw-input
            v-model="searchParams.prtnrNo"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row
        v-if="searchCase3"
      >
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('관리구분')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.LOCARA_MNGT_DV_CD"
            first-option="all"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>

        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.svcCntrCd"
          v-model:prtnr-no="searchParams.engineerCd"
          v-model:partner="engPartnerObj"
          use-og-level="1"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          partner-first-option="all"
          partner-label="prtnrNoNm"
        />
      </kw-search-row>
      <kw-search-row
        v-if="searchCase3"
      >
        <kw-search-item :label="$t('상품그룹')">
          <kw-select
            v-model="searchParams.pdPrpVal20"
            :options="codes.PD_GRP_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('계약상세번호')">
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <kw-search-item :label="$t('사번')">
          <kw-input
            v-model="searchParams.prtnrNo"
            maxlength="100"
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
            @change="getQuickResponseRpblPages"
          />
        </template>
        <kw-btn
          v-if="false"
          v-permission:delete
          :label="$t('삭제')"
          grid-action
        />
        <kw-separator
          v-if="false"
          v-permission:delete
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="false"
          v-permission:update
          :label="$t('저장')"
          grid-action
        />
        <kw-separator
          v-if="false"
          v-permission:update
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="false"
          v-permission:print
          icon="print"
          dense
          secondary
          :label="$t('인쇄')"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          :label="$t('엑셀다운로드')"
          secondary
          dense
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-permission:download
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="$t('S/N 재발행')"
          primary
          dense
          @click="onClickQrRpbl"
        />
      </kw-action-top>
      <kw-grid
        ref="gridMainRef"
        name="gridMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="getQuickResponseRpblPages"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const { getConfig } = useMeta();
const { alert, modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const router = useRouter();

/*
 *  Search Parameter
 */
const searchParams = ref({
  // Case1 (관리구분 - 전체)
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  mngrDvCd: '', // 관리구분
  pdPrpVal20: '', // 상품그룹
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약순번
  prtnrNo: '', // 사번
  // Case2 (관리구분 - 매니저)
  mngtDptmtCd: '', // 총괄단
  rgnlGrpCd: '', // 지역단
  branchCd: '', // 지점
  mngrCd: '', // 매니저
  // Case3 (관리구분 - 엔지니어)
  svcCntrCd: '', // 서비스센터
  engineerCd: '', // 엔지니어

  ogTpCd: '',
});

/*
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'LOCARA_MNGT_DV_CD',
  'PD_GRP_CD',
);

const mngrPartnerObj = ref({});
const engPartnerObj = ref({});

/*
 *  관리구분 조회조건에 따른 조회조건 Setting을 위한 computed
 */
const searchCase1 = computed(() => searchParams.value.mngrDvCd === ''); // 전체
const searchCase2 = computed(() => searchParams.value.mngrDvCd === '1'); // 매니저
const searchCase3 = computed(() => searchParams.value.mngrDvCd === '2'); // 엔지니어

const ozReportParam = ref({
  ozrPath: '/kyowon_as/qrlist.ozr',
  odiPath: '/kyowon_as/qrlist.odi',
  args:
    {
      RES_YR: '', // 조회년도
      RES_MON: '', // 조회월
      CNTR_NO: '', // 계약번호
      CNTR_SN: '', // 계약일련번호
      OG_ID: '', // 담당자 OG_ID
      OG_TP_CD: '', // 담당자 조직유형코드
      PRTNR_NO: '', // 담당자 파트너번호
    },
  height: 1100,
  width: 1200,
});
/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  Search - 고객 QR코드 재발행 내역 조회
 */
let cachedParams;
async function getQuickResponseRpblPages() {
  const res = await dataService.get('/sms/wells/service/quick-response-rpbls/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: resList, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(resList);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

/*
 *  Event - 관리구분 변경 Event
 *  (관리구분 값에 따라 조회조건 일부 Reset)
 */
async function onChangeMngrDvCd() {
  switch (searchParams.value.mngrDvCd) {
    case '': // 관리구분 - 전체
      searchParams.value.mngtDptmtCd = '';
      searchParams.value.rgnlGrpCd = '';
      searchParams.value.branchCd = '';
      searchParams.value.mngrCd = '';
      searchParams.value.svcCntrCd = '';
      searchParams.value.engineerCd = '';
      break;
    case '1': // 관리구분 - 매니저
      searchParams.value.svcCntrCd = '';
      searchParams.value.engineerCd = '';
      break;
    case '2': // 관리구분 - 엔지니어
      searchParams.value.mngtDptmtCd = '';
      searchParams.value.rgnlGrpCd = '';
      searchParams.value.branchCd = '';
      searchParams.value.mngrCd = '';
      break;
    default:
      break;
  }
}

/*
 * Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  if (searchCase2) {
    searchParams.value.ogTpCd = mngrPartnerObj.value?.ogTpCd;
  } else if (searchCase3) {
    searchParams.value.ogTpCd = engPartnerObj.value?.ogTpCd;
  }

  cachedParams = cloneDeep(searchParams.value);
  await getQuickResponseRpblPages();
}
/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/quick-response-rpbls/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  NVL
 */
function getNvl(str1, str2) {
  if (isEmpty(str1)) {
    return str2;
  }
  return str1;
}

/*
 * Event - QR재발행 버튼 클릭
 */
async function onClickQrRpbl() {
  if (isEmpty(cachedParams?.baseYm)) {
    alert(t('MSG_ALT_USE_DT_SRCH_AF')); // 데이터 조회 후 사용해주세요.
    return;
  }

  // 바코드 재발행 저장
  await dataService.post('/sms/wells/service/quick-response-rpbls', cachedParams);
  // await notify(t('MSG_ALT_SAVE_DATA'));

  // Initialize
  ozReportParam.value.args = {
    RES_YR: '', // 조회년도
    RES_MON: '', // 조회월
    CNTR_NO: '', // 계약번호
    CNTR_SN: '', // 계약일련번호
    OG_ID: '', // 담당자 OG_ID
    OG_TP_CD: '', // 담당자 조직유형코드
    PRTNR_NO: '', // 담당자 파트너번호
  };
  ozReportParam.value.args.RES_YR = cachedParams.baseYm.substring(0, 4);
  ozReportParam.value.args.RES_MON = cachedParams.baseYm.substring(4, 6);
  ozReportParam.value.args.CNTR_NO = cachedParams.cntrNo;
  ozReportParam.value.args.CNTR_SN = cachedParams.cntrSn;

  if (!isEmpty(cachedParams.mngrDvCd)) {
    if (cachedParams.mngrDvCd === '1') {
      ozReportParam.value.args.OG_ID = getNvl(cachedParams.branchCd, getNvl(cachedParams.rgnlGrpCd, getNvl(cachedParams.mngtDptmtCd, '')));
      ozReportParam.value.args.OG_TP_CD = getNvl(cachedParams.ogTpCd, '');
      ozReportParam.value.args.PRTNR_NO = getNvl(cachedParams.mngrCd, '');
    } else if (cachedParams.mngrDvCd === '2') {
      ozReportParam.value.args.OG_ID = getNvl(cachedParams.svcCntrCd, '');
      ozReportParam.value.args.OG_TP_CD = getNvl(cachedParams.ogTpCd, '');
      ozReportParam.value.args.PRTNR_NO = getNvl(cachedParams.engineerCd, '');
    }
  }

  openReportPopup(
    ozReportParam.value.ozrPath,
    ozReportParam.value.odiPath,
    JSON.stringify(ozReportParam.value.args),
    { width: ozReportParam.value.width, height: ozReportParam.value.height },
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngrDvCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ogId' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'vstYm' },
    { fieldName: 'bcNo' },
    { fieldName: 'dldDt' },
    // { fieldName: 'prtnrKnm' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'vstFshHh' },
    { fieldName: 'bcInMthdCd' },
    // { fieldName: 'useMpno' },
    { fieldName: 'cstSignCn' },
    { fieldName: 'dnldPrtnrKnm' },

    { fieldName: 'publishInfo' },
    { fieldName: 'svpdQrType' },
    { fieldName: 'qrCd' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cstSign' },
    { fieldName: 'bcRpblId' },
  ];

  const columns = [
    { fieldName: 'mngrDvCd', header: '구분', width: '100', styleName: 'text-center', options: codes.LOCARA_MNGT_DV_CD },
    { fieldName: 'ogNm', header: '소속', width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '사번', width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: '담당자', width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품', width: '400', styleName: 'text-left' },
    {
      fieldName: 'cntrNo',
      header: '계약상세번호',
      width: '150',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        const cntrSn = grid.getValue(index.itemIndex, 'cntrSn') ?? '';
        const cntrNo = value ?? '';
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'rcgvpKnm', header: '고객명', width: '100', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: '우편번호', width: '100', styleName: 'text-center' },
    {
      fieldName: 'rnadr',
      header: '주소',
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const rnadr = value ?? '';
        const rdadr = grid.getValue(index.itemIndex, 'rdadr') ?? '';
        const div1 = (!isEmpty(rnadr) && !isEmpty(rdadr)) ? ' ' : '';

        return `${rnadr}${div1}${rdadr}`;
      },
    },
    { fieldName: 'vstYm', header: '발행월', width: '200', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bcNo', header: '발행 바코드', width: '200', styleName: 'text-center' },
    { fieldName: 'publishInfo', header: '발행정보', width: '200', styleName: 'text-center' },
    { fieldName: 'svpdQrType', header: 'QR유형', width: '200', styleName: 'text-center' },
    { fieldName: 'qrCd', header: 'QR코드', width: '200', styleName: 'text-center' },
    {
      fieldName: 'dldDt',
      header: '다운로드 일자',
      width: '200',
      styleName: 'text-center',
      // datetimeFormat: 'yyyy-MM-dd',
      displayCallback(grid, index, value) {
        const strDate = value ?? '';
        return dayjs(strDate.substr(0, 8)).isValid() ? dayjs(strDate.substr(0, 8)).format('YYYY-MM-DD') : '';
      },
    },
    { fieldName: 'dnldPrtnrKnm', header: '다운로드 담당자', width: '200', styleName: 'text-center' },
    { fieldName: 'vstFshDt', header: '처리 일자', width: '200', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'vstFshHh', header: '처리 시간', width: '200', styleName: 'text-center', datetimeFormat: 'time' },
    { fieldName: 'bcInMthdCd', header: '스캔', width: '200', styleName: 'text-center' },
    { fieldName: 'cralIdvTno',
      header: '작업번호',
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const cralLocaraTno = grid.getValue(index.itemIndex, 'cralLocaraTno') ?? '';
        const mexnoEncr = grid.getValue(index.itemIndex, 'mexnoEncr') ?? '';
        const cralIdvTno = value ?? '';
        const div = (!isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr)) ? '-' : '';
        const div2 = (!isEmpty(mexnoEncr) && !isEmpty(cralIdvTno)) ? '-' : '';

        return `${cralLocaraTno}${div}${mexnoEncr}${div2}${cralIdvTno}`;
      },
    },
    {
      fieldName: 'cstSign',
      header: '고객서명',
      width: '200',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false, // default value, 생략 가능
      },
      displayCallback: () => '고객서명',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  // view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (grid, clickData) => {
    if (clickData.column === 'cstSign') {
      const cstSignCn = grid.getValue(clickData.itemIndex, 'cstSignCn');
      await modal({
        component: 'WwsnzSignPreviewP',
        componentProps: { sign: cstSignCn },
      });
    } else if (clickData.column === 'cntrNo') {
      const param = { cntrNo: grid.getDataSource().getValue(clickData.dataRow, 'cntrNo'), cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };

  // data.setRows([
  //   {
  //     mngrDvCd: '1',
  //     ogNm: 'A910000',
  //     prtnrNo: '1344349',
  //     prtnrKnm: '신재형',
  //     pdNm: '에어드레서 대용량 크리스탈미러 DF10R9700CG _금융리스',
  //     cntrNo: '2022-1323832',
  //     rcgvpKnm: '신한은행',
  //     newAdrZip: '12345',
  //     rnadr: '서울시',
  //     rdadr: '은평',

  //     vstYm: '202303',
  //     bcNo: '123456',

  //     fnlMdfcDtm: '20230310123456',
  //     vstFshDt: '20230310',
  //     vstFshHh: '123456',
  //     bcInMthdCd: 'aabbcc',
  //     useMpno: '01012345678',
  //   },
  //   {
  //     mngrDvCd: '1',
  //     ogNm: 'A910000',
  //     prtnrNo: '1344349',
  //     prtnrKnm: '신재형',
  //     pdNm: '에어드레서 대용량 크리스탈미러 DF10R9700CG _금융리스',
  //     cntrNo: '2022-1323832',
  //     rcgvpKnm: '신한은행',
  //     newAdrZip: '12345',
  //     rnadr: '서울시',
  //     rdadr: '은평',

  //     vstYm: '202303',
  //     bcNo: '123456',

  //     fnlMdfcDtm: '20230310123456',
  //     vstFshDt: '20230310',
  //     vstFshHh: '123456',
  //     bcInMthdCd: 'aabbcc',
  //     useMpno: '01012345678',
  //   },
  //   {
  //     mngrDvCd: '1',
  //     ogNm: 'A910000',
  //     prtnrNo: '1344349',
  //     prtnrKnm: '신재형',
  //     pdNm: '에어드레서 대용량 크리스탈미러 DF10R9700CG _금융리스',
  //     cntrNo: '2022-1323832',
  //     rcgvpKnm: '신한은행',
  //     newAdrZip: '12345',
  //     rnadr: '서울시',
  //     rdadr: '은평',

  //     vstYm: '202303',
  //     bcNo: '123456',

  //     fnlMdfcDtm: '20230310123456',
  //     vstFshDt: '20230310',
  //     vstFshHh: '123456',
  //     bcInMthdCd: 'aabbcc',
  //     useMpno: '01012345678',
  //   },
  // ]);
});
</script>
