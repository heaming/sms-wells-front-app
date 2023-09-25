<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaSinglePaymentContractorListM - wells 주문상세조회/관리(일시불-개인정보)
3. 작성자 : JSY
4. 작성일 : 2023.03.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0129M10] - wells 주문상세조회/관리(일시불-개인정보)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
        required
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.searchGbn"
          :options="searchGbns"
          rules="required"
        />
        <kw-date-picker
          v-if="searchParams.searchGbn===1"
          v-model="searchParams.bryyMmdd"
          :label="$t('MSG_TXT_BIRTH_DATE')"
          :placeholder="t('900101')"
          rules="required|max:8|numeric"
          type="date"
        />
        <kw-input
          v-if="searchParams.searchGbn===2"
          v-model="searchParams.bzrno"
          :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
          :placeholder="t('MSG_TXT_INP')"
          rules="required|max:10|numeric"
          :type="number"
          :regex="/^[0-9]*$/i"
          mask="###-##-#####"
        />
        <kw-input
          v-if="searchParams.searchGbn===3"
          v-model="searchParams.bzrno"
          :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
          :placeholder="t('MSG_TXT_INP')"
          rules="required|max:10|numeric"
          :type="number"
          :regex="/^[0-9]*$/i"
          mask="###-##-#####"
        />
        <kw-select
          v-if="searchParams.searchGbn===1"
          v-model="searchParams.sexGbn"
          :label="$t('MSG_TXT_GENDER')"
          :options="codes.SEX_CD"
          style="width: 50px;"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTOR_NM')"
      >
        <kw-input
          v-model="searchParams.cstKnm"
          clearable
          :placeholder="t('MSG_TXT_INP_AND_SELT')"
          :maxlength="50"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model:telNo0="searchParams.cralLocaraTno"
          v-model:telNo1="searchParams.mexnoEncr"
          v-model:telNo2="searchParams.cralIdvTno"
          :placeholder="t('MSG_TXT_INP')"
          mask="telephone"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cntrCstNo"
          icon="search"
          clearable
          :maxlength="10"
          regex="num"
          @click-icon="onClickSearchCntrCstNo"
        />
      </kw-search-item>
      <!-- 취소제외 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNCL_DV')"
      >
        <kw-field
          v-model="searchParams.cntrCanYn"
        >
          <template #default="{ field }">
            <kw-checkbox
              v-bind="field"
              :label="$t('MSG_TXT_EXCLD_CANC')"
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
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :disable="pageInfo.totalCount === 0"
        :label="t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSnglPmntContractorList"
      name="grdSnglPmntContractorList"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGridSnglPmntContractorList"
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
import { codeUtil, useDataService, gridUtil, stringUtil, getComponentType, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdSnglPmntContractorList = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'SEX_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const searchGbns = ref([
  { codeId: 1, codeName: t('MSG_TXT_BIRTH_DATE') },
  { codeId: 2, codeName: t('MSG_TXT_ENTRP_NO') },
  { codeId: 3, codeName: t('MSG_TXT_CBNO') },
]);

const searchParams = ref({
  searchGbn: 1, // 조회구분 생년월일 / 사업자법인등록번호
  bryyMmdd: '', // 생년월일
  bzrno: '', // 사업자법인등록번호
  sexGbn: 'M', // 성별구분
  cstKnm: '', // 계약자명
  cralLocaraTno: '', // 휴대전화번호1
  mexnoEncr: '', // 휴대전화번호2
  cralIdvTno: '', // 휴대전화번호3
  cntrCstNo: '', // 고객번호
  cntrCanYn: 'N', // 취소제외
});

let cachedParams;

async function fetchData() {
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/paging', { ...cachedParams, ...pageInfo.value });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdSnglPmntContractorList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(pages);

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdSnglPmntContractorList.value.getView();
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/excel-download', searchParams.value);
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearchCntrCstNo() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: { cstType: '1', cstNo: searchParams.value.cntrCstNo },
  });

  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridSnglPmntContractorList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'cstKnmEncr' }, // 계약자명(암호화)
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'copnDvNm' }, // 고객구분
    { fieldName: 'bzrno' }, // 계약자 사업자등록번호
    { fieldName: 'bryyMmdd' }, // 계약자 생년월일
    { fieldName: 'sexDvCd' }, // 계약자 성별구분코드
    { fieldName: 'rnmno' }, // 주민/사업자번호
    { fieldName: 'rnmnoDvCd' }, // 실명번호구분코드
    { fieldName: 'rnmnoEncr' }, // 실명번호암호화
    { fieldName: 'basePdCd' }, // 기준상품코드
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'sellDscDvCd' }, // 할인구분
    { fieldName: 'sellDscDvNm' }, // 할인구분명
    { fieldName: 'sellDscTpCd' }, // 할인유형
    { fieldName: 'sellDscTpNm' }, // 할인유형명
    { fieldName: 'cntrRcpFshDtm' }, // 접수일
    { fieldName: 'sppDuedt' }, // 예정일
    { fieldName: 'slDt' }, // 매출일
    { fieldName: 'cntrCanDt' }, // 취소일
    { fieldName: 'cpsDt' }, // 보상일
    { fieldName: 'slPasgDt' }, // 매출경과일
    { fieldName: 'slCnfmYn' }, // 매출확정여부
    { fieldName: 'cntrCanRsonCd' }, // 취소유형
    { fieldName: 'canRsonNm' }, // 취소유형명
    { fieldName: 'cntrChDtlRsonCd' }, // 계약변경코드
    { fieldName: 'cntrChDtlRsonNm' }, // 계약변경명
    { fieldName: 'frisuYn' }, // 무료체험여부
    { fieldName: 'freExpnCnfmDtm' }, // 무료체험확정일시
    { fieldName: 'cttRsCd' }, // 컨택코드
    { fieldName: 'cttRsNm' }, // 컨택코드명
    { fieldName: 'iostDtlCd' }, // 출고구분
    { fieldName: 'sppIvcCrtDtm' }, // 사은품택배송장출력일
    { fieldName: 'booSellYn' }, // 예약판매여부
    { fieldName: 'cntrTpCd' }, // 계약유형코드
    { fieldName: 'cntrTpNm' }, // 판매유형(계약유형코드명)
    { fieldName: 'sellPrtnrNm' }, // 판매파트너명
    { fieldName: 'sellPrtnrNmEncr' }, // 판매파트너명(암호화)
    { fieldName: 'fstRgstUsrId' }, // 업무담당자
    { fieldName: 'fstRgstDeptId' }, // 조직코드
    { fieldName: 'rveCd' }, // 수납코드
    { fieldName: 'uswyDv' }, // 용도구분
    { fieldName: 'svPrd' }, // 관리주기
    { fieldName: 'frisuAsPtrmN' }, // 무상AS기간
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상멤버십개월
    { fieldName: 'recapMshYn' }, // 무상멤버십개월
    { fieldName: 'alncmpNm' }, // 제휴코드명
    { fieldName: 'sellEvCd' }, // 판매행사코드
    { fieldName: 'sellEvNm' }, // 행사코드명
    { fieldName: 'fnlAmt', dataType: 'number' }, // 총판매금
    { fieldName: 'sellAmt', dataType: 'number' }, // 공급가
    { fieldName: 'vat', dataType: 'number' }, // 부가세
    { fieldName: 'cntrAmt', dataType: 'number' }, // 확정청약금
    { fieldName: 'istmIntAmt', dataType: 'number' }, // 할부이자금액
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료
    { fieldName: 'crpUc' }, // 법인미수
    { fieldName: 'totDscAmt', dataType: 'number' }, // 총할인금
    { fieldName: 'feeAckmtCt' }, // 인정건수
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 총인정금
    { fieldName: 'feeAckmtTotAmt', dataType: 'number' }, // 총기준수수료
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'pdSaleFee', dataType: 'number' }, // 판매수수료
    { fieldName: 'cashBlam', dataType: 'number' }, // 현금잔액
    { fieldName: 'istmMcn' }, // 할부개월수
    { fieldName: 'mmIstmAmt', dataType: 'number' }, // 월할부금
    { fieldName: 'istmPcamAmt', dataType: 'number' }, // 총할부금액
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'cralTno' }, // 계약자 휴대전화번호
    { fieldName: 'cralLocaraTno' }, // 계약자 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 계약자 휴대전화국번호암호화(암호화)
    { fieldName: 'cralIdvTno' }, // 계약자 휴대개별전화번호
    { fieldName: 'newAdrZip' }, // 우편번호
    { fieldName: 'rnadr' }, // 계약자 기준주소
    { fieldName: 'rdadr' }, // 계약자 상세주소
    { fieldName: 'rdadrEncr' }, // 계약자 상세주소(암호화)
    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'rcgvpKnmEncr' }, // 설치자명(암호화)
    { fieldName: 'istlcCralLocaraTno' }, // 설치자 휴대지역전화번호
    { fieldName: 'istlcMexnoEncr' }, // 설치자 휴대전화국번호암호화(암호화)
    { fieldName: 'istlcCralIdvTno' }, // 설치자 휴대개별전화번호
    { fieldName: 'istlcCralTno' }, // 설치자 휴대전화번호
    { fieldName: 'istlcAdrZip' }, // 설치자우편번호
    { fieldName: 'istlcAdr' }, // 설치자 기준주소
    { fieldName: 'istlcDadr' }, // 설치자 상세주소
    { fieldName: 'istlcDadrEncr' }, // 설치자 상세주소(암호화)
    { fieldName: 'cntrRelDtlNm' }, // 결합구분
    { fieldName: 'alncmpCntrDrmVal' }, // 제휴사계약식별값
    { fieldName: 'alncmpCd' }, // 제휴코드
    { fieldName: 'alncPrtnrDrmVal' }, // 제휴판매자코드
    { fieldName: 'spcOrdDv' }, // 특별주문구분
    { fieldName: 'sppOrdIvcNo' }, // 송장정보
    { fieldName: 'basePdInfo' }, // 상품명
    { fieldName: 'basePdCd2' }, // 상품코드
    { fieldName: 'pdQty' }, // 상품수량
    { fieldName: 'connPdView' }, // 연계상품 조회
    { fieldName: 'fgptPdNm1' }, // 사은품1
    { fieldName: 'fgptPdNm2' }, // 사은품2
    { fieldName: 'fgptPdNm3' }, // 사은품3
    { fieldName: 'fgptPdNm4' }, // 사은품4
    { fieldName: 'bfsvcBzsDvCd' }, // BS업체구분코드
    { fieldName: 'bfsvcBzsDvNm' }, // BS업체구분코드명
    { fieldName: 'splyBzsDvCd' }, // 조달업체구분코드
    { fieldName: 'splyBzsDvNm' }, // 조달업체구분코드명
    { fieldName: 'cntrCanDtm' }, // 계약취소일시
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'text-center rg-button-link', renderer: { type: 'button' } }, // 계약상세번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '180', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' }, // 계약자명
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '138', styleName: 'text-center' }, // 고객구분
    { fieldName: 'rnmno',
      header: `${t('MSG_TXT_RRNO')}/${t('MSG_TXT_ENTRP_NO')}`,
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 사업자번호 3-2-5 형식으로 표시
        if (!isEmpty(value) && value.length === 10) {
          return `${value.substr(0, 3)}-${value.substr(3, 2)}-${value.substr(5, 5)}`;
        }
        if (!isEmpty(value) && value.length === 8) {
          return stringUtil.getDateFormat(value);
        }
      },
    }, // 주민등록번호/사업자번호
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' }, // 상품코드
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' }, // 상품명
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '138', styleName: 'text-center' }, // 할인구분
    { fieldName: 'sellDscDvNm', header: `${t('MSG_TXT_PD_DC_CLASS')}${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' }, //  할인구분명
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DISC_CODE'), width: '138', styleName: 'text-center' }, // 할인유형
    { fieldName: 'sellDscTpNm', header: `${t('MSG_TXT_DISC_CODE')}${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' }, // 할인유형명
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'cpsDt', header: t('MSG_TXT_COMP_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 보상일
    { fieldName: 'slPasgDt', header: t('MSG_TXT_SL_PASG_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 매출경과일
    { fieldName: 'slCnfmYn', header: t('MSG_TIT_SL_CNFM'), width: '136', styleName: 'text-center' }, // 매출확정 현황
    { fieldName: 'cntrTpCd', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' }, // 취소유형
    { fieldName: 'cntrTpNm', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}${t('MSG_TXT_NM')}`, width: '270', styleName: 'text-center' }, // 취소유형명
    { fieldName: 'cntrChDtlRsonCd', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')} ${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' }, // 계약변경유형
    { fieldName: 'cntrChDtlRsonNm', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')}${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' }, // 계약변경명
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRE_EXPN_YN'), width: '136', styleName: 'text-center' }, // 무료체험여부
    { fieldName: 'freExpnCnfmDtm', header: `${t('MSG_TXT_PD_DC_CLASS')} ${t('MSG_TXT_DTRM_DATE')}`, width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 할인구분확정일
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '136', styleName: 'text-center' }, // 컨택코드
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CD_NM'), width: '136', styleName: 'text-center' }, // 컨택코드명
    { fieldName: 'iostDtlCd', header: t('MSG_TXT_OSTR_DV'), width: '136', styleName: 'text-center' }, // 출고구분
    { fieldName: 'sppIvcCrtDtm', header: `${t('MSG_TXT_FGPT')}${t('MSG_TXT_IVC_NO')}${t('MSG_TXT_PRNT_DT')}`, width: '183' }, // 사은품송장번호출력일자
    { fieldName: 'booSellYn', header: t('TXT_MSG_BOO_SELL_YN'), width: '136', styleName: 'text-center' }, // 예약판매여부
    { fieldName: 'cntrTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '136', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellPrtnrNmEncr', header: t('MSG_TXT_PTNR_NAME'), width: '136', styleName: 'text-center' }, // 파트너명
    { fieldName: 'fstRgstUsrId', header: `${t('MSG_TXT_TASK')}${t('MSG_TXT_PIC')}`, width: '136', styleName: 'text-center' }, // 업무담당자
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_OG_CD'), width: '136', styleName: 'text-center' }, // 조직코드
    { fieldName: 'rveCd', header: t('MSG_TXT_RVE_CD'), width: '136', styleName: 'text-center' }, // 수납코드
    { fieldName: 'uswyDv', header: t('MSG_TXT_USWY_DV'), width: '136', styleName: 'text-center' }, // 용도구분
    { fieldName: 'svPrd', header: t('MSG_TXT_MNGT_PRD'), width: '136', styleName: 'text-right' }, // 관리주기
    { fieldName: 'frisuAsPtrmN', header: `${t('MSG_TXT_FRISU_AS')}${t('MSG_TXT_PRD')}`, width: '136', styleName: 'text-right' }, // 무상A/S기간
    { fieldName: 'frisuBfsvcPtrmN', header: t('TXT_MSG_FRISU_MSH_PTRM'), width: '136', styleName: 'text-right' }, // 무상멤버십개월
    { fieldName: 'recapMshYn', header: `${t('MSG_TXT_IMMDT')}${t('MSG_TXT_RECAP_MSH')}${t('MSG_TXT_YN')}`, width: '155', styleName: 'text-right' }, // 즉시유상멤버십여부
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNC_CD_NM'), width: '136', styleName: 'text-center' }, // 제휴코드명
    { fieldName: 'sellEvNm', header: `${t('MSG_TXT_EV_CD')}${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' }, // 행사코드명
    { fieldName: 'fnlAmt', header: `${t('MSG_TXT_COM_TOT')}${t('MSG_TXT_SALE_PRICE')}`, width: '136', styleName: 'text-right' }, // 총판매금액
    { fieldName: 'sellAmt', header: t('MSG_TXT_SUPP_PRC'), width: '136', styleName: 'text-right' }, // 공급가격
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '136', styleName: 'text-right' }, // 부가세
    { fieldName: 'cntrAmt', header: `${t('MSG_TXT_DTRM')}${t('MSG_TXT_SBSCM')}`, width: '136', styleName: 'text-right' }, // 확정청약금
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE'), width: '138', styleName: 'text-right' }, // 수수료
    { fieldName: 'crpUc', header: t('MSG_TXT_CRP_UC'), width: '138', styleName: 'text-right' }, // 법인미수
    { fieldName: 'totDscAmt', header: t('MSG_TXT_TOT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 총할인금액
    { fieldName: 'feeAckmtCt', header: t('TXT_MSG_ACKMT_CT'), width: '138', styleName: 'text-right' }, // 인정건수
    { fieldName: 'ackmtPerfAmt', header: `${t('MSG_TXT_COM_TOT')}${t('MSG_TXT_RECOG_AMT')}`, width: '138', styleName: 'text-right' }, // 총인정금액
    { fieldName: 'feeAckmtTotAmt', header: `${t('MSG_TXT_COM_TOT')}${t('MSG_TXT_PD_STD_FEE')}`, width: '138', styleName: 'text-right' }, // 총기준수수료
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '138', styleName: 'text-center' }, // 수수료정액여부
    { fieldName: 'pdSaleFee', header: t('MSG_TXT_PD_SALE_FEE'), width: '138', styleName: 'text-right' }, // 판매수수료
    { fieldName: 'cashBlam', header: `${t('MSG_TXT_CASH')}${t('MSG_TXT_BLAM')}`, width: '138', styleName: 'text-right' }, // 현금잔액
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCN'), width: '138', styleName: 'text-right' }, // 할부개월수
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_INTAM'), width: '138', styleName: 'text-right' }, // 월할부금
    { fieldName: 'istmPcamAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_ISTM_AMT')}`, width: '138', styleName: 'text-right' }, // 총할부금액
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '138', styleName: 'text-center' }, // 고객번호
    {
      fieldName: 'cralTno',
      header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}`,
      width: '160',
      styleName: 'text-center',
    }, // 계약자 휴대전화번호
    { fieldName: 'newAdrZip', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-center' }, // 계약자 우편번호
    { fieldName: 'rnadr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_STD_ADDR')}`, width: '312', styleName: 'text-center' }, // 계약자 기준주소
    { fieldName: 'rdadrEncr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284', styleName: 'text-left' }, // 계약자 상세주소
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '144', styleName: 'text-center' }, // 설치자명
    {
      fieldName: 'istlcCralTno',
      header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}`,
      width: '160',
      styleName: 'text-center',
    }, // 설치자 휴대전화번호
    { fieldName: 'istlcAdrZip', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-center' }, // 설치자 우편번호
    { fieldName: 'istlcAdr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_STD_ADDR')}`, width: '312' }, // 설치자 기준주소
    { fieldName: 'istlcDadrEncr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284' }, // 설치자 상세주소
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_COMBI_DV'), width: '138', styleName: 'text-center' }, // 결합구분
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '138', styleName: 'text-center' }, // 제휴코드
    { fieldName: 'alncPrtnrDrmVal', header: `${t('MSG_TXT_ALNC')}${t('MSG_TXT_SELL_NO')}`, width: '138', styleName: 'text-center' }, // 제휴판매자코드
    { fieldName: 'spcOrdDv', header: t('MSG_TXT_SPC_ORD_DV'), width: '157', styleName: 'text-center' }, // 특별주문구분
    { fieldName: 'sppOrdIvcNo', header: t('MSG_TXT_IVC_NO'), width: '157', styleName: 'text-center' }, // 송장번호
    { fieldName: 'basePdInfo', header: t('MSG_TXT_PRDT_NM'), width: '197' }, // 상품명
    { fieldName: 'basePdCd2', header: t('MSG_TXT_PRDT_CODE'), width: '197' }, // 상품코드
    { fieldName: 'pdQty', header: t('MSG_TXT_PRODUCT_QTY'), width: '197', styleName: 'text-right' }, // 상품 수량
    { fieldName: 'connPdView', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') }, // 연계상품 조회
    { fieldName: 'fgptPdNm1', header: t('MSG_TXT_FGPT_NM_1'), width: '197' }, // 사은품명1
    { fieldName: 'fgptPdNm2', header: t('MSG_TXT_FGPT_NM_2'), width: '197' }, // 사은품명2
    { fieldName: 'fgptPdNm3', header: t('MSG_TXT_FGPT_NM_3'), width: '197' }, // 사은품명3
    { fieldName: 'fgptPdNm4', header: t('MSG_TXT_FGPT_NM_4'), width: '197' }, // 사은품명4
    { fieldName: 'bfsvcBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_BS')}${t('MSG_TXT_DIV')}`, width: '197' }, // 업체BS구분
    { fieldName: 'splyBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_DIV')}`, width: '197' }, // 업체구분
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    // TODO: 현재 출고요청등록 팝업화면 개발진행 후 변경 예정
    const cntrNo = g.getValue(dataRow, 'cntrNo');
    const cntrSn = g.getValue(dataRow, 'cntrSn');
    const { sellTpCd } = g.getValues(dataRow);
    const { cntrCstNo } = g.getValues(dataRow);
    const { copnDvCd } = g.getValues(dataRow);

    if (column === 'cntrDtlNo') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: { cntrNo, cntrSn, sellTpCd, cntrCstNo, copnDvCd },
        draggable: true,
        window: true,
        windowFeatures: { width: 1300, height: 1080 },
      });
    } else if (column === 'orderInfView') {
      await modal({
        component: 'WwctaSinglePaymentOrderDetailListP',
        componentProps: { cntrNo, cntrSn },
      });
    } else if (column === 'relPdSearch') {
      await modal({
        component: 'WwctaLinkProductListP',
        componentProps: { cntrNo, cntrSn },
      });
    }
  };
});
</script>
<style scoped>
</style>
