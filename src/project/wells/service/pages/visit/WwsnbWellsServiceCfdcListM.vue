<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0081M01] WwsnbWellsServiceCfdcListM - 웰스 서비스 확인서
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 서비스 확인서 발송 기능
- 웰스 서비스 확인서 발송을 위한 주문내역 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_CHO')"
        >
          <!--고객선택-->
          <kw-select
            v-model="searchParams.searchType"
            :options="searchTypes"
            class="w120"
            @change="onChangeSearchType"
          />
          <zctz-contract-detail-number
            v-if="searchParams.searchType === '1'"
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup
          />
          <kw-input
            v-if="searchParams.searchType === '2'"
            v-model="searchParams.cstNo"
            :label="$t('고객번호')"
            :placeholder="$t('고객번호 입력')"
            :maxlength="20"
            rules="numeric"
          />
          <kw-input
            v-if="searchParams.searchType === '3'"
            v-model="searchParams.cstNm"
            :label="$t('계약자명')"
            :placeholder="$t('계약자명 입력')"
            :maxlength="100"
          />
          <kw-input
            v-if="searchParams.searchType === '4' || searchParams.searchType === '5'"
            v-model="searchParams.pno"
            v-model:tel-no0="searchParams.pno1"
            v-model:tel-no1="searchParams.pno2"
            v-model:tel-no2="searchParams.pno3"
            :placeholder="$t('MSG_TXT_FORMAT_HP')"
            :label="$t('MSG_TXT_MPNO')"
            mask="telephone"
            rules="telephone"
          />
          <kw-input
            v-if="searchParams.searchType === '6'"
            v-model="searchParams.bzrno"
            :label="$t('사업자등록번호')"
            :placeholder="$t('사업자등록번호 입력')"
            :maxlength="20"
            rules="numeric"
          />
          <kw-input
            v-if="searchParams.searchType === '7'"
            v-model="searchParams.sellPrtnrNo"
            :label="$t('판매자사번')"
            :placeholder="$t('판매자사번 입력')"
            upper-case
            :maxlength="10"
            rules="alpha_num"
          />
          <template
            v-if="searchParams.searchType === '8'"
          >
            <kw-input
              v-model="searchParams.fromOgCd"
              :label="$t('조직코드')"
              upper-case
              :maxlength="8"
              rules="alpha_num"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.toOgCd"
              :label="$t('조직코드')"
              upper-case
              :maxlength="8"
              rules="alpha_num"
            />
          </template>
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRD')"
          required
        >
          <!--기간-->
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_required|date_range_months:3"
            :name="$t('MSG_TXT_PRD')"
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
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_SERVICE_CONFIRM_SEND')"
          primary
          dense
          @click="onClickSendServiceCfdc"
        /><!--서비스확인서 발송-->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
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
import { alert, codeUtil, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchTypes = ref([
  { codeId: '1', codeName: '계약상세번호' }, // 계약상세번호
  { codeId: '2', codeName: '고객번호' }, // 고객번호
  { codeId: '3', codeName: '계약자명' }, // 계약자명
  { codeId: '4', codeName: '계약자휴대전화번호' }, // 계약자휴대전화번호
  { codeId: '5', codeName: '계약자전화번호' }, // 계약자전화번호
  { codeId: '6', codeName: '계약자사업자등록번호' }, // 계약자사업자등록번호
  { codeId: '7', codeName: '판매자사번' }, // 판매자사번
  { codeId: '8', codeName: '조직코드' }, // 조직코드
]);

const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  fromDate: now.subtract(30, 'day').format('YYYYMMDD'),
  toDate: now.format('YYYYMMDD'),
  searchType: '1',
  cntrNo: '',
  cntrSn: '',
  cstNo: '',
  cstNm: '',
  pno: '',
  pno1: '',
  pno2: '',
  pno3: '',
  bzrno: '',
  sellPrtnrNo: '',
  fromOgCd: '',
  toOgCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/wells-service-cfdc/paging', { params: {
    ...cachedParams,
    ...pageInfo.value,
  } });
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list.map((x) => ({ ...x, cstNm2: x.cstNm })));
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onChangeSearchType() {
  searchParams.value.cntrNo = '';
  searchParams.value.cntrSn = '';
  searchParams.value.cstNo = '';
  searchParams.value.cstNm = '';
  searchParams.value.pno = '';
  searchParams.value.pno1 = '';
  searchParams.value.pno2 = '';
  searchParams.value.pno3 = '';
  searchParams.value.bzrno = '';
  searchParams.value.sellPrtnrNo = '';
  searchParams.value.fromOgCd = '';
  searchParams.value.toOgCd = '';
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { data } = await dataService.get('/sms/wells/service/wells-service-cfdc/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}

async function onClickSendServiceCfdc() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    await alert(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  const { cntrNo, cntrSn, psicPrtnrNm, cstNm2, cstMpno1, cstMpno2, cstMpno3, cstEmadr, cstSvAsnNo } = checkedRows[0];
  await modal({
    component: 'WwsnbWellsServiceCfdcListP',
    componentProps: {
      cntrNo,
      cntrSn,
      prtnrKnm: psicPrtnrNm,
      nm: cstNm2,
      emadr: cstEmadr,
      mpno1: (isEmpty(cstMpno1) || isEmpty(cstMpno2) || isEmpty(cstMpno3)) ? '' : cstMpno1,
      mpno2: (isEmpty(cstMpno1) || isEmpty(cstMpno2) || isEmpty(cstMpno3)) ? '' : cstMpno2,
      mpno3: (isEmpty(cstMpno1) || isEmpty(cstMpno2) || isEmpty(cstMpno3)) ? '' : cstMpno3,
      cstSvAsnNo,
    },
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'sellPrtnrOgTpCd' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'sellPrtnrNm' },
    { fieldName: 'sellPrtnrOgCd' },
    { fieldName: 'cstNo' },
    { fieldName: 'cstNm' },
    { fieldName: 'cstMpno1' },
    { fieldName: 'cstMpno2' },
    { fieldName: 'cstMpno3' },
    { fieldName: 'cstPno1' },
    { fieldName: 'cstPno2' },
    { fieldName: 'cstPno3' },
    { fieldName: 'cstEmadr' },
    { fieldName: 'bzrno' },
    { fieldName: 'rcgvpNm' },
    { fieldName: 'adrId' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'wkExcnDt' },
    { fieldName: 'clsfCdSrnPrntCn' },
    { fieldName: 'psicPrtnrOgTpCd' },
    { fieldName: 'psicPrtnrNo' },
    { fieldName: 'psicPrtnrNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'cstNm2' },
  ];

  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center', editable: false }, // 고객번호
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      editable: false,
      displayCallback(grid, index, value) {
        const cntrNo = value;
        const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
        return `${cntrNo}-${cntrSn}`;
      },
    }, // 계약상세번호
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '100', styleName: 'text-center', editable: false }, // 판매자사번
    { fieldName: 'sellPrtnrOgCd', header: t('MSG_TXT_SELLER_BLG'), width: '100', styleName: 'text-center', editable: false }, // 판매자소속
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-left', editable: false }, // 상품명
    { fieldName: 'cstNm', header: t('MSG_TXT_CNTOR_NM'), width: '100', styleName: 'text-left', editable: false }, // 계약자명
    { fieldName: 'cstMpno1',
      header: t('MSG_TXT_CNTRT_CPHON_NO'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        const mpno1 = value;
        const mpno2 = grid.getValue(index.itemIndex, 'cstMpno2');
        const mpno3 = grid.getValue(index.itemIndex, 'cstMpno3');
        const rtn = [];
        if (!isEmpty(mpno1)) rtn.push(mpno1);
        if (!isEmpty(mpno2) || !isEmpty(mpno3)) {
          rtn.push(isEmpty(mpno2) ? 'XXXX' : mpno2);
          rtn.push(isEmpty(mpno3) ? 'XXXX' : mpno3);
        }
        return rtn.join('-');
      },
    }, // 계약자휴대전화번호
    { fieldName: 'cstPno1',
      header: t('MSG_TXT_CNTRT_TNO'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        const pno1 = value;
        const pno2 = grid.getValue(index.itemIndex, 'cstPno2');
        const pno3 = grid.getValue(index.itemIndex, 'cstPno3');
        const rtn = [];
        if (!isEmpty(pno1)) rtn.push(pno1);
        if (!isEmpty(pno2) || !isEmpty(pno3)) {
          rtn.push(isEmpty(pno2) ? 'XXXX' : pno2);
          rtn.push(isEmpty(pno3) ? 'XXXX' : pno3);
        }
        return rtn.join('-');
      },
    }, // 계약자전화번호
    { fieldName: 'bzrno', header: t('MSG_TXT_CNTRT_ENTRP_NO'), width: '120', styleName: 'text-center', editable: false }, // 계약자사업자번호
    { fieldName: 'rcgvpNm', header: t('MSG_TXT_IST_NM'), width: '100', styleName: 'text-left', editable: false }, // 설치자명
    { fieldName: 'rnadr',
      header: t('MSG_TXT_ISTLC_ADDR'),
      width: '350',
      styleName: 'text-left',
      editable: false,
      displayCallback(grid, index, value) {
        const rnadr = value;
        const rdadr = grid.getValue(index.itemIndex, 'rdadr');
        const rtn = [];
        if (!isEmpty(rnadr)) rtn.push(rnadr);
        if (!isEmpty(rdadr)) rtn.push(rdadr);
        return rtn.join(' ');
      },
    }, // 설치처 주소
    { fieldName: 'wkExcnDt', header: t('MSG_TXT_MNGT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 관리일자
    { fieldName: 'clsfCdSrnPrntCn', header: t('MSG_TXT_MNGT_IZ'), width: '200', styleName: 'text-left', editable: false }, // 관리내역
    { fieldName: 'psicPrtnrNm', header: t('MSG_TXT_PIC'), width: '70', styleName: 'text-left' }, // 담당자
    { fieldName: 'cstNm2', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' }, // 성명
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.checkBar.exclusive = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellItemClicked = (grid, clickData) => {
    if (clickData.column === 'cntrNo') {
      const param = { cntrNo: grid.getDataSource().getValue(clickData.dataRow, 'cntrNo'), cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
      router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };
}

</script>
<style lang="scss" scoped>
</style>
