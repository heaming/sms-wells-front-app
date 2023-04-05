<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaMembershipContractorListM - 주문상세조회/관리(멤버십-개인정보 조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인정보기준으로 멤버십 주문상세내역을 조회한다.
****************************************************************************************************
--->
<template>
  <kw-search @search="onClickSearch">
    <kw-search-row>
      <!-- 생년월일/사업자/법인등록번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
        required
      >
        <kw-select
          v-model="searchParams.bryyMmddEntrpNoCbno"
          rules="required"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_BIRTH_DATE') },
                     { codeId: '2', codeName: t('MSG_TXT_ENTRP_NO') },
                     { codeId: '3', codeName: t('MSG_TXT_CBNO') }]"
          @change="onChangeBryyMmddEntrpNoCbnoryyMmdd"
        />
        <kw-input
          v-if="isSearchBryyMmddVisible"
          v-model="searchParams.bryyMmdd"
          placeholder="20100101"
          rules="required|max:8|numeric"
          :type="number"
          :regex="/^[0-9]*$/i"
          :maxlength="8"
        />
        <kw-select
          v-if="isSearchSexDvCdVisible"
          v-model="searchParams.sexDvCd"
          :options="codes.SEX_DV_CD"
          rules="required"
        />
        <kw-input
          v-if="isSearchBzrnoVisible"
          v-model="searchParams.bzrno"
          placeholder="4968602009"
          rules="required|max:10|numeric"
          :type="number"
          :regex="/^[0-9]*$/i"
          :maxlength="10"
        />
      </kw-search-item>
      <!-- 계약자명 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTOR_NM')"
      >
        <kw-input
          v-model="searchParams.cstKnm"
          icon="search"
          clearable
          :label="$t('MSG_TXT_CNTR_NM')"
          :maxlength="50"
          @keydown="onKeyDownSelectCntrNm"
          @click-icon="onClickSelectCntrNm"
          @clear="onClearSelectCntrNm"
        />
      </kw-search-item>
      <!-- 휴대전화번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model="searchParams.cntrCralTno"
          :type="number"
          :maxlength="11"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 고객번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cntrCstNo"
          :label="$t('MSG_TXT_CST_NO')"
          icon="search"
          clearable
          :on-click-icon="onClickSearchCntrCst"
          rules="required|max:10|numeric"
          :maxlength="10"
        />
      </kw-search-item>
      <!-- 탈퇴제외 -->
      <kw-search-item :label="$t('MSG_TXT_WTDR_EXLD')">
        <kw-field
          :model-value="[]"
        >
          <template #default="{ field }">
            <kw-checkbox
              v-model="checkType"
              v-bind="field"
              val=""
            />
          </template>
        </kw-field>
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
        <span class="ml8">(단위:원, 개월:건)</span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMembershipContractorList"
      name="grdMembershipContractorList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridMembershipContractorList"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
// const { getConfig } = useMeta();
const { currentRoute } = useRouter();

let cachedParams;
const searchParams = ref({
  bryyMmddEntrpNoCbno: '1', // 생년월일/사업자/법인등록번호
  bryyMmdd: '', // 생년월일
  sexDvCd: '', // 성별구분
  bzrno: '', // 사업자번호/법인번호
  cstKnm: '', // 계약자명
  cntrCralTno: '', // 휴대전화번호
  cntrCstNo: '', // 계약고객번호
  cntrPdEnddtYn: '', // 탈퇴제외
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SEX_DV_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMembershipContractorList = ref(getComponentType('KwGrid'));
const isSearchBryyMmddVisible = ref(true); // 조회조건(생년월일)
const isSearchSexDvCdVisible = ref(true); // 조회조건(성별)
const isSearchBzrnoVisible = ref(false); // 조회조건(사업자/법인등록번호)
const checkType = ref([undefined]); // 탈퇴제외

async function fetchData() {
  // console.log(`checkType : ${checkType.value[0]}`);
  searchParams.value.cntrPdEnddtYn = checkType.value[0] === undefined ? 'N' : 'Y';

  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  // console.log(res.data);

  const view = grdMembershipContractorList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMembershipContractorList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onChangeBryyMmddEntrpNoCbnoryyMmdd() {
  // console.log(`bryyMmdd : ${searchParams.value.bryyMmdd}`);
  if (searchParams.value.bryyMmddEntrpNoCbno === '1') { // 생년월일
    isSearchBryyMmddVisible.value = true;
    isSearchSexDvCdVisible.value = true;
    isSearchBzrnoVisible.value = false;
  } else if (['2', '3'].includes(searchParams.value.bryyMmddEntrpNoCbno)) { // 사업자번호/법인번호
    isSearchBryyMmddVisible.value = false;
    isSearchSexDvCdVisible.value = false;
    isSearchBzrnoVisible.value = true;
  }
}

// 계약명 팝업조회
async function onClickSelectCntrNm() {
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
    // componentProps: { cntrCstNo: searchParams.value.cntrCstNo, cntrCstKnm: searchParams.value.cntrCstKnm },
  });

  if (result) {
    searchParams.value.cntrNo = payload.cntrNo;
    searchParams.value.cntrSn = payload.cntrSn;
  }
}

// 고객번호 팝업조회
async function onClickSearchCntrCst() {
  const res = await modal({ component: 'ZwcsaCustomerListP' });
  if (res.result && res.payload) {
    // searchParams.cntrCstKnm(res.payload.name);
    // searchParams.cntrCstNo(res.payload.cstNo);
    searchParams.value.cntrCstNo = res.payload.cstNo;
  }
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMembershipContractorList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'ojSellTpNm' }, // 계약구분
    { fieldName: 'mshDvNm' }, // 멤버십구분
    { fieldName: 'pdClsfNm' }, // 상품분류
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'stplPtrm' }, // 약정개월
    { fieldName: 'cntrRcpFshDt' }, // 접수일
    { fieldName: 'cntrCnfmDt' }, // 확정일
    { fieldName: 'cntrTempSaveDt' }, // 가입일
    { fieldName: 'cntrPdEnddt' }, // 탈퇴일
    { fieldName: 'canDt' }, // 취소일
    { fieldName: 'fstRgstDt' }, // 등록일
    { fieldName: 'fstRgstTm' }, // 등록시간
    { fieldName: 'fstRgstUsrId' }, // 업무담당사번
    { fieldName: 'fstRgstPrgId' }, // 등록프로그램
    { fieldName: 'fnlMdfcDt' }, // 변경일
    { fieldName: 'fnlMdfcTm' }, // 변경시간
    { fieldName: 'fnlMdfcUsrId' }, // 변경자사번
    { fieldName: 'fnlMdfcPrgId' }, // 변경프로그램
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '138', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' }, // 계약자명
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-center' }, // 설치자명
    { fieldName: 'ojSellTpNm', header: t('MSG_TXT_CNTR_DV'), width: '138' }, // 계약구분
    { fieldName: 'mshDvNm', header: t('MSG_TXT_MSH_DV'), width: '138' }, // 멤버십구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '138' }, // 상품분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' }, // 상품명
    { fieldName: 'stplPtrm', header: t('MSG_TXT_STPL_MCNT'), width: '138', styleName: 'text-right' }, // 약정개월
    { fieldName: 'cntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_DTRM_DATE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일
    { fieldName: 'cntrTempSaveDt', header: t('MSG_TXT_SUBS_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 가입일
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_WTDR_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 탈퇴일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_RGST_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_RGST_HH'), width: '136', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 등록시간
    { fieldName: 'fstRgstUsrId', header: `${t('MSG_TXT_BIZ_ICHR')}${t('MSG_TXT_EPNO')}`, width: '136', styleName: 'text-center' }, // 업무담당사번
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG'), width: '136', styleName: 'text-center' }, // 등록프로그램
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_CH_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 변경일
    { fieldName: 'fnlMdfcTm', header: t('MSG_TXT_CHG_HH'), width: '136', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 변경시간
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFR_EPNO'), width: '136', styleName: 'text-center' }, // 변경자사번
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FST_RGST_PRG'), width: '136', styleName: 'text-center' }, // 변경프로그램
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrNo = gridUtil.getCellValue(g, dataRow, 'cntrNo');
    const paramCntrSn = gridUtil.getCellValue(g, dataRow, 'cntrSn');

    if (['cntrNo'].includes(column)) { // 계약상세(윈도우팝업)
      await modal({ component: 'WwctaOrderDetailP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
    }
  };
});
</script>
<style scoped>
</style>
