<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncFixationRegistrationMngtMgtM - 고정방문 관리
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
        <kw-search-item :label="'기준년월'">
          <kw-date-picker type="month" />
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
        <kw-search-item :label="'총괄단'">
          <kw-select
            :options="['전체','2','3']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="'지역단'">
          <kw-select
            :options="['전체','2','3']"
          />
        </kw-search-item>
        <kw-search-item :label="'방문담당자'">
          <kw-input
            v-model.trim="searchParams.fxnPrtnrNo"
            icon="search"
            clearable
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
            @change="getFixationRegistrationPages"
          />
        </template>
        <kw-btn
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
        :visible-rows="10"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useGlobal, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { notify, modal/* , alert */ } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

/*
 *  Search Parameter
 */
const searchParams = ref({
  fxnPrtnrDvCd: '',
  sellTpCd: '',
  fxnPrtnrNo: '',
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
  view.resetCurrent();
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
    { fieldName: 'cralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'idvTno' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'fxnPrtnrDvCd' },
    { fieldName: 'fxnPrtnrNo' },
    { fieldName: 'apyStrtYm' },
    { fieldName: 'chRsonCn' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: '계약번호', width: '150', styleName: 'text-center' },
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
        const cralIdvTno = value ?? '';
        const div = (!isEmpty(cralLocaraTno) && !isEmpty(cralIdvTno)) ? '-' : '';

        return `${cralLocaraTno}${div}${cralIdvTno}`;
      },
    },
    {
      fieldName: 'idvTno',
      header: '자택전화',
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const locaraTno = grid.getValue(index.itemIndex, 'locaraTno') ?? '';
        const idvTno = value ?? '';
        const div = (!isEmpty(locaraTno) && !isEmpty(idvTno)) ? '-' : '';

        return `${locaraTno}${div}${idvTno}`;
      },
    },
    { fieldName: 'col4', header: '상품명', width: '250', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: '판매유형', width: '100', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrDvCd', header: '관리구분', width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: '담당센터', width: '100', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: '방문담당자', width: '100', styleName: 'text-center' },
    { fieldName: 'col7', header: '퇴사일자', width: '100', styleName: 'text-center' },
    { fieldName: 'col8', header: '기존담당자', width: '100', styleName: 'text-center' },
    { fieldName: 'apyStrtYm', header: '적용일자', width: '100', styleName: 'text-center' },
    { fieldName: 'chRsonCn', header: '변경사유', width: '300', styleName: 'text-left' },
    { fieldName: 'fnlMdfcDtm', header: '지정일자', width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: '등록자', width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  // view.editOptions.editable = true; // Grid Editable On

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
      items: ['col4', 'sellTpCd'],
    },
    {
      header: '변경 담당 정보',
      direction: 'horizontal',
      items: ['fxnPrtnrDvCd', 'col5', 'fxnPrtnrNo', 'col6', 'col7', 'col8', 'apyStrtYm'],
    },
    'chRsonCn',
    'fnlMdfcDtm',
    'fnlMdfcUsrId',
  ]);

  data.setRows([
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
    { cntrNo: '2018-0169267', rcgvpKnm: '신의상실', newAdrZip: '03134', rdadr: '서울 종로구 서순라길 151 신의상실 (권농동, 142-1)', cralIdvTno: '2020-12-17', idvTno: '2020-12-17', col4: '정수기(WL652NWA)냉정', sellTpCd: '렌탈', fxnPrtnrDvCd: '매니저' },
  ]);
});

</script>
