<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [W-SV-U-0040M01] WwsncManagementCustomerRglvlMgtM - 관리고객 급지관리
 3. 작성자 : YeongJoong Kim
 4. 작성일 : 2023.05.30
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 변경된 관리고객 급지 및 배정담당자 정보를 변경한다.
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
        >
          <!--관리년월-->
          <kw-date-picker
            v-model="searchParams.manageYm"
            readonly
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_CST_DV')">
          <!--고객구분-->
          <kw-select
            v-model="searchParams.rcgvpDiv"
            :options="tempOptions"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
          :colspan="2"
        >
          <!--우편번호-->
          <!-- <kw-select
            v-model="searchParams.selectDiv"
            :options="[{ codeId: 'ALL', codeName: t('전체') },
                       { codeId: 'NONE', codeName: t('담당자 없음') }]"
          /> -->
          <kw-input
            v-model="searchParams.addressZipFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.addressZipTo"
          />
          <kw-field
            :model-value="[]"
          >
            <kw-checkbox
              v-model="searchParams.exceptWellsManagerYn"
              :label="$t('MSG_TXT_EXCPT_WELS_MNGR')"
              val="Y"
            /><!--웰스매니저 미관리 제외-->
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          ref="ogSearchRef"
          v-model:dgr1-levl-og-id="searchParams.executiveGroup"
          v-model:dgr2-levl-og-id="searchParams.localGroup"
          v-model:dgr3-levl-og-id="searchParams.branchOffice"
          v-model:prtnr-no="searchParams.partnerNo"
          use-og-level="3"
          use-partner
          dgr3-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
          dgr1-levl-og-readonly
          dgr2-levl-og-readonly
        />
      </kw-search-row>
      <!-- <kw-search-row>
        <kw-search-item label="우편번호">
          <kw-input
            v-model="searchParams.addressZipFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.addressZipTo"
          />
        </kw-search-item>
      </kw-search-row> -->
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
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        /><!--저장-->
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /><!--인쇄-->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        /><!--엑셀다운로드-->
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-select
          ref="mngtPrtnrOgTpCdRef"
          v-model="mngStd.mngtPrtnrOgTpCd"
          :options="prtnrOgTpOptions"
          dense
          first-option
          first-option-value=""
          option-value="ogId"
          option-label="ogCdNm"
          :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_BRANCH')"
        /><!--지점 선택, 지점-->
        <kw-select
          ref="mngtPrtnrNoRef"
          v-model="mngStd.mngtPrtnrNo"
          :options="mngStdPrtnrNoOptions"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_SLCT_MANAGER')"
          option-value="prtnrNo"
          option-label="prtnrNoNm"
          dense
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_MANAGER')"
        /><!--매니저 선택, 매니저-->
        <kw-select
          ref="mngStdMngerRglvlDvCdRef"
          v-model="mngStd.mngStdMngerRglvlDvCd"
          :options="codes.RGLVL_DV_CD"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_SLCT_MNGER_RGLVL_DV')"
          dense
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_MNGER_RGLVL_DV')"
        /><!--관리기준급지 선택, 관리기준급지-->
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_MNG_ACC_BK_APPLY')"
          @click="onClickBulkUpdateMngStd"
        /><!--관리계정 일괄변경-->
        <kw-select
          ref="asnPsicPrtnrOgTpCdRef"
          v-model="curMnthAlctn.asnPsicPrtnrOgTpCd"
          :options="prtnrOgTpOptions"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
          option-value="ogId"
          option-label="ogCdNm"
          dense
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_BRANCH')"
        /><!--지점 선택, 지점-->
        <kw-select
          ref="asnPsicPrtnrNoRef"
          v-model="curMnthAlctn.asnPsicPrtnrNo"
          :options="curMnthAlctnPrtnrNoOptions"
          dense
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_SLCT_MANAGER')"
          option-value="prtnrNo"
          option-label="prtnrNoNm"
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_MANAGER')"
        /><!--매니저 선택, 매니저-->
        <kw-select
          ref="curMnthAlctnMngerRglvlDvCdRef"
          v-model="curMnthAlctn.curMnthAlctnMngerRglvlDvCd"
          :options="codes.RGLVL_DV_CD"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_SLCT_MNGER_RGLVL_DV')"
          dense
          class="w110"
          rules="required"
          :label="$t('MSG_TXT_MNGER_RGLVL_DV')"
        /><!--관리기준급지 선택, 관리기준급지-->
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_CRT_TRGT_BK_APPLY')"
          @click="onClickBulkUpdateCurMnthAlctn"
        /><!--당월배정 일괄변경-->
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
import { useMeta, gridUtil, useDataService, getComponentType, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();
const { alert, notify } = useGlobal();

const codes = await codeUtil.getMultiCodes(
  'RGLVL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const { getters } = useStore();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const tempOptions = ref([
  { codeId: 'ALL', codeName: t('MSG_TXT_ALL') },
  { codeId: '01', codeName: t('MSG_TXT_NEW') }, // 신규
  { codeId: '02', codeName: t('MSG_TXT_WORK_PENDING') }, // 작업대기
  { codeId: '03', codeName: t('MSG_TXT_WK_FSH') }, // 작업완료
  { codeId: '00', codeName: t('MSG_TXT_EXP') }]); // 예정

const searchParams = ref({
  manageYm: now.format('YYYYMM'),
  rcgvpDiv: 'ALL',
  // selectDiv: 'ALL',
  exceptWellsManagerYn: 'Y',
  addressZipFrom: '',
  addressZipTo: '',
  executiveGroup: '',
  localGroup: '',
  localGroupCd: '',
  branchOffice: 'ALL',
  branchOfficeCd: '',
  partnerNo: 'ALL',
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const { data: { list, pageInfo: pagingResult } } = await dataService.get('/sms/wells/service/manage-customer-rglvl/paging', { params: { ...cachedParams, ...pageInfo.value } });

  pageInfo.value = pagingResult;

  list.forEach((row) => {
    row.cntr = `${row.cntrNo}-${row.cntrSn}`;
  });

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.clearCurrent();
}

const prtnrOgTpOptions = ref([]);

async function onClickSearch() {
  if (!searchParams.value.executiveGroup) {
    await alert(t('MSG_ALT_NOT_FOUND_OG_INF')); // 조직정보를 찾을 수 없습니다.
    return;
  }
  if (searchParams.value.branchOffice === 'ALL' || !searchParams.value.branchOffice) {
    searchParams.value.branchOfficeCd = 'ALL';
  } else {
    const { ogCd } = prtnrOgTpOptions.value.find((option) => searchParams.value.branchOffice === option.ogId);
    searchParams.value.branchOfficeCd = ogCd;
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const executiveGroup = ref('');
const localGroup = ref('');
const localGroupCd = ref('');

const ogSearchRef = ref();

async function fetchDgr2LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/regional-group', params);
}

async function getOrganizationInfo() {
  const userInfo = getters['meta/getUserInfo'];
  const ogId = userInfo.ogId === 'test' ? 'OGO200800000185' : userInfo.ogId;
  const { data: { dgr1LevlOgId, dgr2LevlOgId } } = await dataService.get(`/sms/wells/service/manage-customer-rglvl/organization-info/${ogId}`);
  if (!dgr1LevlOgId) {
    await alert(t('MSG_ALT_NOT_FOUND_OG_INF')); // 조직정보를 찾을 수 없습니다.
    return;
  }

  executiveGroup.value = dgr1LevlOgId;
  localGroup.value = dgr2LevlOgId;

  searchParams.value.executiveGroup = dgr1LevlOgId;
  searchParams.value.localGroup = dgr2LevlOgId;

  const res = await fetchDgr2LevlOgs({ params: { ogId: dgr1LevlOgId } });
  const { ogCd } = res.data.find((option) => dgr2LevlOgId === option.ogId);

  localGroupCd.value = ogCd;
  searchParams.value.localGroupCd = ogCd;
}

watch(() => searchParams.value.localGroup, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      searchParams.value.localGroup = localGroup.value;
    });
  }
});

async function fetchDgr3LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/branch', params);
}

async function fetchPartners(params) {
  return await dataService.get('/sms/wells/service/organizations/manager', params);
}

const mngStd = ref({
  mngtPrtnrOgTpCd: '',
  mngtPrtnrNo: '',
  mngStdMngerRglvlDvCd: '',
});

const mngStdPrtnrNoOptions = ref([]);

watch(() => mngStd.value.mngtPrtnrOgTpCd, async () => {
  mngStd.value.mngtPrtnrNo = '';
  const { data } = await fetchPartners({ params: {
    dgr1LevlOgId: executiveGroup.value,
    dgr2LevlOgId: localGroup.value,
    dgr3LevlOgId: mngStd.value.mngtPrtnrOgTpCd,
  } });
  mngStdPrtnrNoOptions.value = data;
});

const mngtPrtnrOgTpCdRef = ref();
const mngtPrtnrNoRef = ref();
const mngStdMngerRglvlDvCdRef = ref();

async function onClickBulkUpdateMngStd() {
  if (!await mngtPrtnrOgTpCdRef.value.validate()
  || !await mngtPrtnrNoRef.value.validate()
  || !await mngStdMngerRglvlDvCdRef.value.validate()) {
    return;
  }

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  const { mngtPrtnrOgTpCd, mngtPrtnrNo, mngStdMngerRglvlDvCd } = mngStd.value;
  const { ogCd } = prtnrOgTpOptions.value.find((option) => mngtPrtnrOgTpCd === option.ogId);
  const { prtnrNoNm } = mngStdPrtnrNoOptions.value.find((option) => mngtPrtnrNo === option.prtnrNo);

  const data = view.getDataSource();
  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      mngStdDgr2LevlOgCd: localGroupCd.value,
      mngStdDgr3LevlOgCd: ogCd,
      mngStdPrtnrKnm: prtnrNoNm,
      mngtPrtnrOgTpCd: ogCd,
      mngtPrtnrNo,
      mngStdMngerRglvlDvCd,
    });
  });
  data.endUpdate();
}

const curMnthAlctn = ref({
  asnPsicPrtnrOgTpCd: '',
  asnPsicPrtnrNo: '',
  cnfmPsicPrtnrOgTpCd: '',
  cnfmPsicPrtnrNo: '',
  curMnthAlctnMngerRglvlDvCd: '',
});

const curMnthAlctnPrtnrNoOptions = ref([]);

watch(() => curMnthAlctn.value.asnPsicPrtnrOgTpCd, async () => {
  mngStd.value.asnPsicPrtnrNo = '';
  const { data } = await fetchPartners({ params: {
    dgr1LevlOgId: executiveGroup.value,
    dgr2LevlOgId: localGroup.value,
    dgr3LevlOgId: curMnthAlctn.value.asnPsicPrtnrOgTpCd,
  } });
  curMnthAlctnPrtnrNoOptions.value = data;
});

const asnPsicPrtnrOgTpCdRef = ref();
const asnPsicPrtnrNoRef = ref();
const curMnthAlctnMngerRglvlDvCdRef = ref();

async function onClickBulkUpdateCurMnthAlctn() {
  if (!await asnPsicPrtnrOgTpCdRef.value.validate()
  || !await asnPsicPrtnrNoRef.value.validate()
  || !await curMnthAlctnMngerRglvlDvCdRef.value.validate()) {
    return;
  }
  const { asnPsicPrtnrOgTpCd, asnPsicPrtnrNo } = curMnthAlctn.value;

  curMnthAlctn.value.cnfmPsicPrtnrNo = asnPsicPrtnrNo;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const data = view.getDataSource();

  const { cnfmPsicPrtnrNo, curMnthAlctnMngerRglvlDvCd } = curMnthAlctn.value;

  const { ogCd } = prtnrOgTpOptions.value.find((option) => asnPsicPrtnrOgTpCd === option.ogId);
  const {
    prtnrNoNm,
    brnhId,
    prtnrNo,
    ogTpCd,
  } = curMnthAlctnPrtnrNoOptions.value.find((option) => asnPsicPrtnrNo === option.prtnrNo);

  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      curMnthAlctnDgr2LevlOgCd: localGroupCd.value,
      curMnthAlctnDgr3LevlOgCd: ogCd,
      curMnthAlctnPrtnrKnm: prtnrNoNm,
      asnPsicPrtnrOgTpCd: ogCd,
      asnPsicPrtnrNo,
      cnfmPsicPrtnrOgTpCd: ogCd,
      cnfmPsicPrtnrNo,
      curMnthAlctnMngerRglvlDvCd,

      afchIchrBrchOgId: brnhId,
      afchIchrPrtnrOgTpCd: ogTpCd,
      afchIchrPrtnrNo: prtnrNo,
    });
  });
  data.endUpdate();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const updatedRows = gridUtil.getUpdatedRowValues(view);
  if (updatedRows.length === 0) {
    notify(t('MSG_ALT_NO_ITEM', [t('MSG_TXT_SAVE')])); // 저장할 목록이 없습니다.
    return;
  }

  const data = updatedRows.map(({
    cntrNo,
    cntrSn,
    mngtPrtnrOgTpCd,
    mngtPrtnrNo,
    mngStdMngerRglvlDvCd,
    cstSvAsnNo,
    asnPsicPrtnrOgTpCd,
    asnPsicPrtnrNo,
    cnfmPsicPrtnrOgTpCd,
    cnfmPsicPrtnrNo,
    curMnthAlctnMngerRglvlDvCd,

    bfchIchrBrchOgId,
    bfchIchrPrtnrOgTpCd,
    bfchIchrPrtnrNo,

    afchIchrBrchOgId,
    afchIchrPrtnrOgTpCd,
    afchIchrPrtnrNo,
  }) => ({
    cntrNo,
    cntrSn,
    mngtPrtnrOgTpCd,
    mngtPrtnrNo,
    mngStdMngerRglvlDvCd,
    cstSvAsnNo,
    asnPsicPrtnrOgTpCd,
    asnPsicPrtnrNo,
    cnfmPsicPrtnrOgTpCd,
    cnfmPsicPrtnrNo,
    curMnthAlctnMngerRglvlDvCd,

    bfchIchrBrchOgId,
    bfchIchrPrtnrOgTpCd,
    bfchIchrPrtnrNo,

    afchIchrBrchOgId,
    afchIchrPrtnrOgTpCd,
    afchIchrPrtnrNo,
  }));

  await dataService.put('/sms/wells/service/manage-customer-rglvl/partner-info', data);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { data } = await dataService.get('/sms/wells/service/manage-customer-rglvl/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'svpdSapCd' }, // SAP코드
    { fieldName: 'pdctPdCd' }, // 품목코드
    { fieldName: 'svpdNmAbbr1' }, // 상품명
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'newAdrZip' }, // 우편번호
    { fieldName: 'adr' }, // 주소
    { fieldName: 'adrEmd' }, // 주소(읍면동)
    { fieldName: 'rcgvpDiv' }, // 고객구분
    { fieldName: 'fix' }, // 고정
    { fieldName: 'vstDuedt' }, // 차기방문월
    { fieldName: 'mngStdDgr2LevlOgCd' }, // 관리기준(관리계정) - 지역단
    { fieldName: 'mngStdDgr3LevlOgCd' }, // 관리기준(관리계정) - 지점
    { fieldName: 'mngStdPrtnrKnm' }, // 관리기준(관리계정) - 매니저
    { fieldName: 'mngStdMngerRglvlDvCd' }, // 관리기준(관리계정) - 관리기준급지
    { fieldName: 'curMnthAlctnDgr2LevlOgCd' }, // 당월배정 - 지역단
    { fieldName: 'curMnthAlctnDgr3LevlOgCd' }, // 당월배정 - 지점
    { fieldName: 'curMnthAlctnPrtnrKnm' }, // 당월배정 - 매니저
    { fieldName: 'bfchIchrBrchOgId' }, // 당월배정
    { fieldName: 'bfchIchrPrtnrOgTpCd' }, // 당월배정
    { fieldName: 'bfchIchrPrtnrNo' }, // 당월배정
    { fieldName: 'curMnthAlctnMngerRglvlDvCd' }, // 당월배정 - 관리기준급지

    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'cntr' }, // 계약번호

    // UPDATE DATA
    { fieldName: 'mngtPrtnrOgTpCd' }, // [관리기준] 조직유형코드
    { fieldName: 'mngtPrtnrNo' }, // [관리기준] 파트너번호
    // { fieldName: 'mngStdMngerRglvlDvCd' }, // [관리기준] 급지구분코드

    { fieldName: 'asnPsicPrtnrOgTpCd' }, // [당월배정] 조직유형코드
    { fieldName: 'asnPsicPrtnrNo' }, // [당월배정] 파트너번호
    { fieldName: 'cnfmPsicPrtnrOgTpCd' }, // [당월배정] 조직유형코드
    { fieldName: 'cnfmPsicPrtnrNo' }, // [당월배정] 파트너번호
    // { fieldName: 'curMnthAlctnMngerRglvlDvCd' }, // [당월배정] 급지구분코드

    { fieldName: 'afchIchrBrchOgId' }, // 당월배정
    { fieldName: 'afchIchrPrtnrOgTpCd' }, // 당월배정
    { fieldName: 'afchIchrPrtnrNo' }, // 당월배정
  ];

  const columns = [
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_NO'), width: '140', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' }, // SAP 코드
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center' }, // 품목코드
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_PRDT_NM'), width: '110', styleName: 'text-center' }, // 상품명
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', datetimeFormat: 'yyyy-MM-dd', styleName: 'text-center' }, // 설치일자
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '70', styleName: 'text-center' }, // 우편번호
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '400' }, // 주소
    { fieldName: 'adrEmd', header: t('MSG_TXT_ADDR_EMD'), width: '200' }, // 주소(읍면동)
    { fieldName: 'rcgvpDiv',
      header: t('MSG_TXT_CST_DV'),
      width: '100',
      styleName: 'text-center',
      options: tempOptions.value,
      editor: {
        type: 'dropdown',
      } }, // 고객구분
    { fieldName: 'fix', header: t('MSG_TXT_FXN'), width: '50', styleName: 'text-center' }, // 고정
    { fieldName: 'vstDuedt', header: t('MSG_TXT_NX_VISIT_MON'), width: '100', styleName: 'text-center' }, // 차기방문월
    { fieldName: 'mngStdDgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정): 지역단
    { fieldName: 'mngStdDgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정): 지점
    { fieldName: 'mngStdPrtnrKnm', header: t('MSG_TXT_MANAGER'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정): 매니저
    { fieldName: 'mngStdMngerRglvlDvCd',
      header: t('MSG_TXT_MNGER_RGLVL_DV'),
      width: '100',
      styleName: 'text-center',
      options: codes.RGLVL_DV_CD,
      editor: {
        type: 'dropdown',
      } }, // 관리기준(관리계정): 관리기준급지
    { fieldName: 'curMnthAlctnDgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' }, // 당월배정: 지역단
    { fieldName: 'curMnthAlctnDgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' }, // 당월배정: 지점
    { fieldName: 'curMnthAlctnPrtnrKnm', header: t('MSG_TXT_MANAGER'), width: '100', styleName: 'text-center' }, // 당월배정: 매니저
    { fieldName: 'curMnthAlctnMngerRglvlDvCd',
      header: t('MSG_TXT_MNGER_RGLVL_DV'),
      width: '100',
      styleName: 'text-center',
      options: codes.RGLVL_DV_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 당월배정: 관리기준급지
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.fixedOptions.colCount = 5;

  view.setColumnLayout([
    'cntr',
    'rcgvpKnm',
    'svpdSapCd',
    'pdctPdCd',
    'svpdNmAbbr1',
    'istDt',
    'newAdrZip',
    'adr',
    'adrEmd',
    'rcgvpDiv',
    'fix',
    'vstDuedt',
    {
      header: t('MSG_TXT_MNGER_RGLVL'), // 관리기준(관리계정)
      direction: 'horizontal', // merge type
      items: ['mngStdDgr2LevlOgCd', 'mngStdDgr3LevlOgCd', 'mngStdPrtnrKnm', 'mngStdMngerRglvlDvCd'],
    }, // 이관전담당자
    {
      header: t('MSG_TXT_CRT_TRGT'), // 당월배정
      direction: 'horizontal',
      items: ['curMnthAlctnDgr2LevlOgCd', 'curMnthAlctnDgr3LevlOgCd', 'curMnthAlctnPrtnrKnm', 'curMnthAlctnMngerRglvlDvCd'],
    }, // 이관후담당자
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntr') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      console.log(cntrNo);
      console.log('개인별 서비스 현황 화면(W-SV-U-0072M01) 탭으로 호출');
      alert('개인별 서비스 현황 화면(W-SV-U-0072M01) 탭으로 호출');
    }
  };
}

onMounted(async () => {
  await getOrganizationInfo();
  const { data } = await fetchDgr3LevlOgs({ params: { ogId: localGroup.value } });
  prtnrOgTpOptions.value = data;
});
</script>

<style scoped>
</style>
