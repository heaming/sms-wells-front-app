<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0046M01] WwsncFixationVisitManagementMgtM - 고정방문 관리
3. 작성자 : juno.cha
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고정방문 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="'기준년월'"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            rules="required"
            type="month"
            :label="'기준년월'"
          />
        </kw-search-item>
        <kw-search-item :label="'관리구분'">
          <kw-select
            v-model="searchParams.fxnPrtnrDvCd"
            :options="codes.MNGR_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="'판매유형'">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="'방문담당자'">
          <kw-input
            v-model.trim="searchParams.fxnPrtnrNo"
            icon="search"
            clearable
            @click-icon="onFxnPrtnrNoSearchPopup"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
          v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          use-og-level="2"
          :use-partner="false"
          auth-yn="N"
          :dgr2-levl-og-always-search="false"
        />
        <kw-search-item :label="$t('계약번호')">
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup
          >
            <template #append>
              <kw-icon
                name="search"
                @click="onClickSearchContract"
              />
            </template>
          </zctz-contract-detail-number>
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
            @change="getFixationRegistrationPages"
          />
        </template>
        <kw-btn
          v-if="false"
          icon="print"
          dense
          secondary
          :label="'인쇄'"
        />
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="'엑셀 다운로드'"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          primary
          :label="'고정방문등록'"
          @click="onClickFixationRegistration"
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
        @change="getFixationRegistrationPages"
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
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { notify, modal/* , alert */ } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const router = useRouter();

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  fxnPrtnrDvCd: '',
  sellTpCd: '',
  fxnPrtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr1LevlOg: '',
  dgr2LevlOg: '',
  cntrNo: '',
  cntrSn: '',
  cntrDtlNo: '',
});

/*
 *  공통코드 조회
 *  (조회 후 후처리 - customCodes)
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD', // 판매유형
  'MNGR_DV_CD', // 관리구분
);

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
 *  Search - 고정방문 관리 조회
 */
let cachedParams;
async function getFixationRegistrationPages() {
  const res = await dataService.get('/sms/wells/service/fixation-visit/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: fixationVisits, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(fixationVisits);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await getFixationRegistrationPages();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/fixation-visit/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Event - 고정방문등록 버튼 클릭
 */
async function onClickFixationRegistration() {
  const { result: isChanged } = await modal({
    component: 'WwsncFixationVisitRegistrationRegP',
  });

  if (isChanged) {
    await notify(t('MSG_ALT_REGISTERED'));
    await getFixationRegistrationPages();
  }
}

/*
 *  Event - 방문담당자 검색 버튼 클릭
 */
async function onFxnPrtnrNoSearchPopup() {
  const mngrDvCd = searchParams.value.fxnPrtnrDvCd ?? '';
  const searchText = searchParams.value.fxnPrtnrNo;

  const { result: isChanged, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd,
      searchText,
    },
  });

  if (isChanged) {
    searchParams.value.fxnPrtnrNo = payload[0].prtnrNo;
  }
}

/*
 * 계약번호 조회
 */
async function onClickSearchContract() {
  const { result, payload } = await modal({
    component: 'WwsnyCustomerBaseInformationP',
  });

  if (result) {
    searchParams.value.cntrNo = payload.cntrNo ?? '';
    searchParams.value.cntrSn = payload.cntrSn ?? '';
    searchParams.value.cntrDtlNo = `${payload.cntrNo ?? ''}-${payload.cntrSn ?? ''}`;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'chSn' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'fxnPrtnrDvCd' },
    { fieldName: 'fxnPrtnrNo' },
    { fieldName: 'fxnPrtnrKnm' },
    { fieldName: 'apyStrtYm' },
    { fieldName: 'chRsonCn' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'pdctPdNm' },
    { fieldName: 'ogNm' },
    { fieldName: 'cltnDt' },
    { fieldName: 'prtnrKnm' },
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: '계약번호',
      width: '170',
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
      fieldName: 'rdadr',
      header: '주소',
      width: '350',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        const rnadr = grid.getValue(index.itemIndex, 'rnadr') ?? '';
        const rdadr = value ?? '';
        const div = (!isEmpty(rnadr) && !isEmpty(rdadr)) ? ' ' : '';

        return `${rnadr}${div}${rdadr}`;
      },
    },
    {
      fieldName: 'cralIdvTno',
      header: '휴대전화',
      width: '150',
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
      fieldName: 'idvTno',
      header: '자택전화',
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const locaraTno = grid.getValue(index.itemIndex, 'locaraTno') ?? '';
        const exnoEncr = grid.getValue(index.itemIndex, 'exnoEncr') ?? '';
        const idvTno = value ?? '';
        const div = (!isEmpty(locaraTno) && !isEmpty(exnoEncr)) ? '-' : '';
        const div2 = (!isEmpty(exnoEncr) && !isEmpty(idvTno)) ? '-' : '';

        return `${locaraTno}${div}${exnoEncr}${div2}${idvTno}`;
      },
    },
    { fieldName: 'pdctPdNm', header: '상품명', width: '250', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: '판매유형', width: '100', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'fxnPrtnrDvCd', header: '관리구분', width: '100', styleName: 'text-center', options: codes.MNGR_DV_CD },
    { fieldName: 'ogNm', header: '담당센터', width: '120', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrKnm', header: '방문담당자', width: '100', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: '퇴사일자', width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prtnrKnm', header: '기존담당자', width: '100', styleName: 'text-center' },
    { fieldName: 'apyStrtYm', header: '적용일자', width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'chRsonCn', header: '변경사유', width: '300', styleName: 'text-left' },
    { fieldName: 'fnlMdfcDtm', header: '지정일자', width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrNm', header: '등록자', width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  // view.editOptions.editable = true; // Grid Editable On

  view.onCellItemClicked = (grid, clickData) => {
    if (clickData.column === 'cntrNo') {
      const param = { cntrNo: grid.getDataSource().getValue(clickData.dataRow, 'cntrNo'), cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'cntrNo', // 계약번호
    {
      header: '고객정보', // colspan title
      direction: 'horizontal', // merge type
      items: ['rcgvpKnm', 'newAdrZip', 'rdadr', 'cralIdvTno', 'idvTno'],
    },
    {
      header: '상품정보',
      direction: 'horizontal',
      items: ['pdctPdNm', 'sellTpCd'],
    },
    {
      header: '변경 담당 정보',
      direction: 'horizontal',
      items: ['fxnPrtnrDvCd', 'ogNm', 'fxnPrtnrNo', 'fxnPrtnrKnm', 'cltnDt', 'prtnrKnm', 'apyStrtYm'],
    },
    'chRsonCn',
    'fnlMdfcDtm',
    'fnlMdfcUsrNm',
  ]);
});

</script>
