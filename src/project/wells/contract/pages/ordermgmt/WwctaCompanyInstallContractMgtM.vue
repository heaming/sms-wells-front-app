<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCompanyInstallContractMgtM - 회사설치 주문 관리(생성, 현황조회) 화면
3. 작성자 : gs.ritvik.m / younuk.choi
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 주문 관리(생성, 현황조회) 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--접수일-->
        <kw-search-item
          :label="$t('MSG_TXT_RCP_D')"
          required
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrCnfmDtFrom"
            v-model:to="searchParams.cntrCnfmDtTo"
            :label="$t('MSG_TXT_RCP_D')"
            rules="date_range_required"
          />
        </kw-search-item>
        <!--설치일-->
        <kw-search-item
          :label="$t('MSG_TXT_INST_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.insDtFrom"
            v-model:to="searchParams.insDtTo"
            :label="$t('MSG_TXT_INST_DT')"
            :rules="(searchParams.insDtFrom || searchParams.insDtTo)? 'date_range_required':''"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!--계약상세번호-->
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <!--상품분류-->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <!-- 상품분류 선택 -->
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.pdHclsfId"
            v-model:product2-level="searchParams.pdMclsfId"
            product1-first-option="all"
            :product1-first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            product2-first-option="all"
            :product2-first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            search-lvl="2"
          />
        </kw-search-item>
        <!--상품코드-->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.basePdCd"
            icon="search"
            maxlength="10"
            regex="alpha_num"
            @click-icon="onClickSearchPd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!--상품명-->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
            maxlength="100"
          />
        </kw-search-item>
        <!--설치자명-->
        <kw-search-item :label="$t('MSG_TXT_IST_NM')">
          <kw-input
            v-model="searchParams.rcgvpKnm"
            maxlength="100"
          />
        </kw-search-item>
        <!--설치구분-->
        <kw-search-item :label="$t('MSG_TXT_INST_CLS')">
          <kw-select
            v-model="searchParams.coIstDvCd"
            :options="codes.CO_IST_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!--설치용도-->
        <kw-search-item :label="$t('MSG_TXT_INST_PURP')">
          <kw-select
            v-model="searchParams.coIstUswyCd"
            :options="codes.CO_IST_USWY_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!--휴대전화번호-->
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model:tel-no0="searchParams.cralLocaraTno"
            v-model:tel-no1="searchParams.mexnoEncr"
            v-model:tel-no2="searchParams.cralIdvTno"
            mask="telephone"
          />
        </kw-search-item>
        <!--출력구분-->
        <kw-search-item :label="$t('MSG_TXT_PRNT_DV')">
          <kw-option-group
            v-model="searchParams.outputDiv"
            type="radio"
            :options="[{codeId:'Y', codeName:'반품제외'}]"
            first-option="all"
          />
        </kw-search-item>
        <!--조직구분 TODO : 코드확인-->
        <kw-search-item :label="$t('MSG_TXT_OG_DV')">
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :options="codes.OG_TP_CD"
            first-option="all"
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
          <span class="ml6">{{ t('MSG_TXT_UNIT_MCNT') }}</span>
        </template>

        <kw-btn
          v-permission:create
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          icon="upload_on"
          dense
          secondary
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount===0"
          @click="onClickExcelDownload"
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_BTN_RGST')"
          @click="onClickRegist"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, notify, useDataService, useGlobal, useMeta } from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { confirm, modal } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdMainRef.value?.getData());
const grdView = computed(() => grdMainRef.value?.getView());

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'CO_IST_DV_CD', // 설치구분
  'CO_IST_USWY_CD', // 설치용도
  'OG_TP_CD', // 조직유형코드
  'IST_PLC_TP_CD', // 설치장소
);

const searchParams = ref({
  cntrCnfmDtFrom: dayjs().add(-3, 'month').startOf('month').format('YYYYMMDD'),
  cntrCnfmDtTo: dayjs().format('YYYYMMDD'),
  insDtFrom: '',
  insDtTo: '',
  cntrNo: '',
  cntrSn: '',
  pdHclsfId: '',
  pdMclsfId: '',
  basePdCd: '',
  pdNm: '',
  rcgvpKnm: '',
  coIstDvCd: '',
  coIstUswyCd: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  outputDiv: '',
  sellOgTpCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 상품코드 검색아이콘 클릭
async function onClickSearchPd() {
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: searchParams.value.basePdCd,
      selectType: pdConst.PD_SEARCH_SINGLE,
    },
  });

  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/company-install/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  grdData.value.setRows(details);
  grdView.value.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRegist() {
  const { result } = await modal({ component: 'WwctaCompanyInstallContractRegP' });
  if (result) {
    await fetchData();
  }
}

async function onClickExcelUpload() {
  /*
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      columns: gridDataModel.dataModelObject,
      // templateDocId: 'FOM_INSTALLATION_ADDRESS_CHANGE_BATCH_UPLOAD',
      headerRows: 2,
      validationBtn: false,
      addBtn: true,
      deleteBtn: true,
      downloadBtn: true,
      // serverSideValidation: validate,
      // serverSideValidateOption: { sideEffect: true },
    },
  });
  if (result) {
    const { list } = payload;
    pageInfo.value.totalCount = list.length || 0;
    grdData.value.setRows(list);
  }
  */

  const apiUrl = '/sms/wells/contract/contracts/company-install/excel-upload';
  const templateId = 'FOM_CTA_0001';

  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });

  if (result) {
    const { processCount, errorInfo } = payload;
    if (processCount > 0) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    } else {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/company-install/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// mtrStatCd : 1. 신규/ 2.수정/ 3. 삭제
async function callInstallPopup(cntrNo, cntrSn, sellDate, mtrStatCd) {
  // 설치오더 시작
  const res = await modal({
    component: 'WwsncTimeTableForContractP',
    componentProps: {
      baseYm: dayjs().format('YYYYMM'), // 달력 초기 월
      chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
      svDvCd: '1', // 1:설치, 2:BS, 3:AS, 4:홈케어
      sellDate, // 판매일자
      svBizDclsfCd: '1110',
      mtrStatCd,
      cntrNo,
      cntrSn,
    },
  });
  console.log(res);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  useGridDataModel(view, {
    cntrNoSn: { label: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      classes: 'text-center',
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]' }, // [계약상세번호]
    cstKnm: { label: t('MSG_TXT_CNTOR_NM'), width: '150', classes: 'text-center' }, // [계약자명]
    cntrCfmn: { label: t('MSG_TXT_DTRM'),
      width: '80',
      classes: 'text-center',
      displaying: {
        value: t('MSG_TXT_DTRM'),
        renderer: { type: 'button' },
      } }, // [확정]
    assignCan: { label: t('MSG_TXT_CNCL_ASGMT'),
      width: '100',
      classes: 'text-center',
      displaying: {
        value: t('MSG_TXT_CNCL_ASGMT'),
        renderer: { type: 'button' },
      } }, // [배정취소]
    istReRegn: { label: t('MSG_TXT_INSTALLATION') + t('MSG_TXT_RE_REG'),
      width: '120',
      classes: 'text-center',
      displaying: {
        value: t('MSG_TXT_INSTALLATION') + t('MSG_TXT_RE_REG'),
        renderer: { type: 'button' },
      } }, // [설치 재접수]
    bryyMmdd: { label: t('MSG_TXT_BIRTH_DATE'), width: '130', classes: 'text-center' }, // [주민등록번호]
    bzrno: { label: t('MSG_TXT_CRNO'), width: '130', classes: 'text-center' }, // [사업자번호]
    cntrCstNo: { label: t('MSG_TXT_CST_NO'), width: '130', classes: 'text-center' }, // [고객번호]
    rcgvpKnm: { label: t('MSG_TXT_IST_NM'), width: '150', classes: 'text-center' }, // [설치자명]
    cntrCnfmDt: { label: t('MSG_TXT_RCP_D'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [접수일]
    sellTpNm: { label: t('MSG_TXT_SEL_TYPE'), width: '100', classes: 'text-center' }, // [판매유형]
    coCd: { label: t('MSG_TXT_MNG_COMP'), width: '100', classes: 'text-center' }, // [관리회사]
    ogCd: { label: t('MSG_TXT_MGMT_DEPT'), width: '100', classes: 'text-center' }, // [관리부서]
    coIstMngtDvNm: { label: t('MSG_TXT_MNGT_DV'), width: '120', classes: 'text-center' }, // [관리구분]
    basePdCd: { label: t('MSG_TXT_INST_PROD_CD'), width: '130', classes: 'text-center' }, // [설치상품코드]
    pdNm: { label: t('MSG_TXT_INST_PROD_NM'), width: '300' }, // [설치상품명]
    pkgPdCd: { label: t('MSG_TXT_SEED_PKG_CD'), width: '130', classes: 'text-center' }, // [모종패키지코드]
    pkgPdNm: { label: t('MSG_TXT_PKG_NM'), width: '300', classes: 'text-center' }, // [패키지명]
    bsPrd: { label: t('MSG_TXT_BS_CYC'),
      width: '100',
      classes: 'text-right',
      valueExpression: 'values["svPrd"]' }, // [BS주기]
    svTpNm: { label: t('MSG_TXT_USWY_DV'), width: '110', classes: 'text-center' }, // [용도구분]
    pdGdCd: { label: t('MSG_TXT_PROD_GRD'), width: '110', classes: 'text-center' }, // [제품등급]
    coIstDvCd: { label: t('MSG_TXT_INST_CLS'), width: '110', classes: 'text-center', options: codes.CO_IST_DV_CD }, // [설치구분]
    coIstUswyCd: { label: t('MSG_TXT_INST_PURP'), width: '110', classes: 'text-center', options: codes.CO_IST_USWY_CD }, // [설치용도]
    istPlcTpCd: { label: t('MSG_TXT_INST_PLAC'), width: '110', classes: 'text-center', options: codes.IST_PLC_TP_CD }, // [설치장소]
    svPrd: { label: t('MSG_TXT_VST_PRD'), width: '110', classes: 'text-right' }, // [방문주기]
    frisuBfsvcPtrmN: { label: t('TXT_MSG_FRISU_PTRM'), width: '110', classes: 'text-right' }, // [무상기간]
    frisuAsPtrmN: { label: t('MSG_TXT_AS_PERIOD'), width: '110', classes: 'text-right' }, // [A/S기간]
    sppDuedt: { label: t('MSG_TXT_DUEDT'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [예정일]
    istDt: { label: t('MSG_TXT_INST_DT'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [설치일]
    rtnDt: { label: t('MSG_TXT_RET_DT'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [반품일]
    istAkArtcMoCn: { label: t('MSG_TXT_REFER_ARTC'), width: '350' }, // [참고사항]
    cttRsCd: { label: t('MSG_TXT_CTT_CD'), width: '110', classes: 'text-center' }, // [컨택코드]
    cttPsicId: { label: t('MSG_TXT_CTT_ICHR'), width: '120', classes: 'text-center' }, // [컨택담당]
    sconCn: { label: t('MSG_TXT_SPEC_CNTR_CNTN'), width: '300' }, // [특약내용]
    mtrDv: { label: t('MSG_TXT_MTR_DV'), width: '110', classes: 'text-center', valueExpression: 'values["sellTpNm"]' }, // [자료구분]
    sellTpDtlNm: { label: t('MSG_TXT_DATA_TP'), width: '130', classes: 'text-center' }, // [자료유형]
    cntrNo216: { displaying: false },
    cntrSn216: { displaying: false },
    cntrNoSn216: { label: t('MSG_TXT_SEED_DET_CD'),
      width: '150',
      classes: 'text-center',
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const cntrNo216 = values[fields.indexOf('cntrNo216')];
        const cntrSn216 = values[fields.indexOf('cntrSn216')];
        if (!cntrNo216) { return ''; }
        return `${cntrNo216}-${cntrSn216}`;
      } }, // [모종상세코드]
    reguDelYn: { label: t('MSG_TXT_IS_REG_DEL'), width: '110', classes: 'text-center' }, // [정기배송여부]
    memExpGbn: { label: t('MSG_TXT_CLS_MEM_CST'), width: '110', classes: 'text-center' }, // [멤버십비용구분]
    fstRgstDt: { label: t('MSG_TXT_IN_D'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [입력일]
    fstRgstTm: { label: t('MSG_TXT_IN_HH'), width: '100', datetimeFormat: 'hh:mm:ss' }, // [입력시간]
    fstRgstUsrId: { label: t('MSG_TXT_PIC_INP'), width: '120', classes: 'text-center' }, // [입력담당사번]
    fstRgstUsrNm: { label: t('MSG_TXT_IN_ICHR_NM'), width: '120', classes: 'text-center' }, // [입력담당명]
    fnlMdfcDt: { label: t('MSG_TXT_MDFC_DT'), width: '120', datetimeFormat: 'yyyy-MM-dd' }, // [수정일]
    fnlMdfcTm: { label: t('MSG_TXT_FERT_TM'), width: '100', datetimeFormat: 'hh:mm:ss' }, // [수정시간]
    fnlMdfcUsrId: { label: t('MSG_TXT_MDFC_ICHR_EPNO'), width: '120', classes: 'text-center' }, // [수정담당사번]
    fnlMdfcUsrNm: { label: t('MSG_TXT_PIC_REV_NM'), width: '120', classes: 'text-center' }, // [수정담당자명]
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    svPdTpCd: { displaying: false },
    coIstMngtDvCd: { displaying: false },
    copnDvCd: { displaying: false },
    mpno: { displaying: false },
    zip: { displaying: false },
    basAdr: { displaying: false },
    dtlAdr: { displaying: false },
    installMpno: { displaying: false },
    installCralLocaraTno: { displaying: false },
    installMexnoEncr: { displaying: false },
    installCralIdvTn: { displaying: false },
    installZip: { displaying: false },
    installBasAdr: { displaying: false },
    installDtlAdr: { displaying: false },
    fnlAmt: { displaying: false },
    ojPdCd: { displaying: false },
    cntrDtlStatCd: { displaying: false },

    // wpDvNm: { label: `WP${t('MSG_TXT_DIV')}`, width: '100' }, // [WP구분]
    // filterExp: { label: t('MSG_TXT_FILTER_CST'), width: '110' }, // [필터비용]
    // dscRate: { label: `${t('MSG_TXT_DSC_RT')}(%)`, width: '110', classes: 'text-right' }, // [할인율(%)]
    // cpsDt: { label: t('MSG_TXT_COMP_D'), width: '120',}, // [보상일]
  });

  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 1 });

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_ODER_INF'),
      direction: 'horizontal',
      items: ['cntrNoSn', 'cstKnm', 'cntrCfmn', 'assignCan', 'istReRegn'],
    }, 'bryyMmdd', 'bzrno', 'cntrCstNo', 'rcgvpKnm', 'cntrCnfmDt', 'sellTpNm', 'coCd', 'ogCd', 'coIstMngtDvNm',
    'basePdCd', 'pdNm', 'pkgPdCd', 'pkgPdNm', 'bsPrd', 'svTpNm', 'pdGdCd', 'coIstDvCd', 'coIstUswyCd', 'istPlcTpCd',
    'svPrd', 'frisuBfsvcPtrmN', 'frisuAsPtrmN', 'sppDuedt', 'istDt', 'rtnDt', 'istAkArtcMoCn',
    'cttRsCd', 'cttPsicId', 'sconCn', 'mtrDv', 'sellTpDtlNm', 'cntrNoSn216', 'reguDelYn', 'memExpGbn',
    'fstRgstDt', 'fstRgstTm', 'fstRgstUsrId', 'fstRgstUsrNm', 'fnlMdfcDt', 'fnlMdfcTm', 'fnlMdfcUsrId', 'fnlMdfcUsrNm',
    'cntrNo', 'cntrSn', 'cntrNo216', 'cntrSn216', 'fnlAmt',
  ]);

  // click button
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const { cntrNo, cntrSn, cntrCnfmDt } = gridUtil.getRowValue(g, dataRow);

    if (column === 'cntrCfmn') {
      if (!await confirm('회사설치를 확정하시겠습니까?\n\'확인\'을 하시면 설치기사 타임테이블이 호출 됩니다.')) return;

      callInstallPopup(cntrNo, cntrSn, cntrCnfmDt, '1');
    } else if (column === 'assignCan') {
      if (!await confirm('설치기사 배정취소를 하시겠습니까?')) return;

      callInstallPopup(cntrNo, cntrSn, cntrCnfmDt, '3');
    } else if (column === 'istReRegn') {
      callInstallPopup(cntrNo, cntrSn, cntrCnfmDt, '2');
    }
  };

  // dbclick row
  view.onCellDblClicked = async (g, { dataRow }) => {
    const { result } = await modal({
      component: 'WwctaCompanyInstallContractDtlModP',
      componentProps: { ...gridUtil.getRowValue(g, dataRow) },
    });

    if (result) {
      await fetchData();
    }
  };
});
</script>
