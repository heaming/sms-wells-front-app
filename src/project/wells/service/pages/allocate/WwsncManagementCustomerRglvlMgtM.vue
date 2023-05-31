<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : WwsncManagementCustomerRglvlMgtM - 관리고객 급지관리
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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          label="관리년월"
        >
          <kw-date-picker
            v-model="searchParams.manageYm"
            readonly
            type="month"
          />
        </kw-search-item>

        <kw-search-item label="고객구분">
          <kw-select
            v-model="searchParams.rcgvpDiv"
            :options="tempOptions"
          />
        </kw-search-item>
        <kw-search-item
          label="우편번호"
          :colspan="2"
        >
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
              label="웰스매니저 미관리 제외"
              val="Y"
            />
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
          label="저장"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="print"
          dense
          secondary
          label="인쇄"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
          @click="onClickExcelDownload"
        />
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
          :first-option-label="$t('지점 선택')"
          class="w110"
          rules="required"
          :label="$t('지점')"
        />
        <kw-select
          ref="mngtPrtnrNoRef"
          v-model="mngStd.mngtPrtnrNo"
          :options="mngStdPrtnrNoOptions"
          first-option
          first-option-value=""
          :first-option-label="$t('매니저 선택')"
          option-value="prtnrNo"
          option-label="prtnrNoNm"
          dense
          class="w110"
          rules="required"
          :label="$t('매니저')"
        />
        <kw-select
          ref="mngStdMngerRglvlDvCdRef"
          v-model="mngStd.mngStdMngerRglvlDvCd"
          :options="codes.RGLVL_DV_CD"
          dense
          class="w110"
          rules="required"
          :label="$t('관리기준급지')"
        />
        <kw-btn
          secondary
          dense
          label="관리계정 일괄변경"
          @click="onClickBulkUpdateMngStd"
        />
        <kw-select
          ref="asnPsicPrtnrOgTpCdRef"
          v-model="curMnthAlctn.asnPsicPrtnrOgTpCd"
          :options="prtnrOgTpOptions"
          first-option
          first-option-value=""
          :first-option-label="$t('지점 선택')"
          option-value="ogId"
          option-label="ogCdNm"
          dense
          class="w110"
          rules="required"
          :label="$t('지점')"
        />
        <kw-select
          ref="asnPsicPrtnrNoRef"
          v-model="curMnthAlctn.asnPsicPrtnrNo"
          :options="curMnthAlctnPrtnrNoOptions"
          dense
          first-option
          first-option-value=""
          :first-option-label="$t('매니저 선택')"
          option-value="prtnrNo"
          option-label="prtnrNoNm"
          class="w110"
          rules="required"
          :label="$t('매니저')"
        />
        <kw-select
          ref="curMnthAlctnMngerRglvlDvCdRef"
          v-model="curMnthAlctn.curMnthAlctnMngerRglvlDvCd"
          :options="codes.RGLVL_DV_CD"
          dense
          class="w110"
          rules="required"
          :label="$t('관리기준급지')"
        />
        <kw-btn
          secondary
          dense
          label="당월배정 일괄변경"
          @click="onClickBulkUpdateCurMnthAlctn"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const tempOptions = ref([{ codeId: 'ALL', codeName: t('전체') },
  { codeId: '01', codeName: t('신규') },
  { codeId: '02', codeName: t('작업대기') },
  { codeId: '03', codeName: t('작업완료') },
  { codeId: '00', codeName: t('예정') }]);

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

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.clearCurrent();
}

const prtnrOgTpOptions = ref([]);

async function onClickSearch() {
  if (searchParams.value.branchOffice === 'ALL' || !searchParams.value.branchOffice) {
    searchParams.value.branchOfficeCd = 'ALL';
  } else {
    console.log(searchParams.value.branchOffice);
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
  const { ogId } = userInfo;
  const { data: { dgr1LevlOgId, dgr2LevlOgId } } = await dataService.get(`/sms/wells/service/manage-customer-rglvl/organization-info/${ogId}`);

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
  const data = view.getDataSource();

  const { mngtPrtnrOgTpCd, mngtPrtnrNo, mngStdMngerRglvlDvCd } = mngStd.value;

  const { ogCd } = prtnrOgTpOptions.value.find((option) => mngtPrtnrOgTpCd === option.ogId);

  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      mngStdDgr2LevlOgCd: localGroupCd.value,
      mngStdDgr3LevlOgCd: ogCd,
      mngStdPrtnrKnm: mngtPrtnrNo,
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

  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      curMnthAlctnDgr2LevlOgCd: localGroupCd.value,
      curMnthAlctnDgr3LevlOgCd: ogCd,
      curMnthAlctnPrtnrKnm: asnPsicPrtnrNo,
      asnPsicPrtnrOgTpCd: ogCd,
      asnPsicPrtnrNo,
      cnfmPsicPrtnrOgTpCd: ogCd,
      cnfmPsicPrtnrNo,
      curMnthAlctnMngerRglvlDvCd,
    });
  });
  data.endUpdate();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const updatedRows = gridUtil.getUpdatedRowValues(view);
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
    curMnthAlctnMngerRglvlDvCd }));

  console.log(updatedRows);
  console.log(data);

  await dataService.put('/sms/wells/service/manage-customer-rglvl/partner-info', data);
  await fetchData();
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
    { fieldName: 'curMnthAlctnMngerRglvlDvCd' }, // 당월배정 - 관리기준급지

    { fieldName: 'cstSvAsnNo' },

    // UPDATE DATA
    { fieldName: 'mngtPrtnrOgTpCd' }, // [관리기준] 조직유형코드
    { fieldName: 'mngtPrtnrNo' }, // [관리기준] 파트너번호
    // { fieldName: 'mngStdMngerRglvlDvCd' }, // [관리기준] 급지구분코드

    { fieldName: 'asnPsicPrtnrOgTpCd' }, // [당월배정] 조직유형코드
    { fieldName: 'asnPsicPrtnrNo' }, // [당월배정] 파트너번호
    { fieldName: 'cnfmPsicPrtnrOgTpCd' }, // [당월배정] 조직유형코드
    { fieldName: 'cnfmPsicPrtnrNo' }, // [당월배정] 파트너번호
    // { fieldName: 'curMnthAlctnMngerRglvlDvCd' }, // [당월배정] 급지구분코드
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('계약번호'), width: '130', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('고객명'), width: '100', styleName: 'text-center' },
    { fieldName: 'svpdSapCd', header: t('SAP코드'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdctPdCd', header: t('품목코드'), width: '110', styleName: 'text-center' },
    { fieldName: 'svpdNmAbbr1', header: t('상품명'), width: '100', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('설치일자'), width: '100', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('우편번호'), width: '70', styleName: 'text-center' },
    { fieldName: 'adr', header: t('주소'), width: '400' },
    { fieldName: 'adrEmd', header: t('주소(읍면동)'), width: '200' },
    { fieldName: 'rcgvpDiv',
      header: t('고객구분'),
      width: '100',
      styleName: 'text-center',
      options: tempOptions.value,
      editor: {
        type: 'dropdown',
      } },
    { fieldName: 'fix', header: t('고정'), width: '50', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: t('차기방문월'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngStdDgr2LevlOgCd', header: t('지역단'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정)
    { fieldName: 'mngStdDgr3LevlOgCd', header: t('지점'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정)
    { fieldName: 'mngStdPrtnrKnm', header: t('매니저'), width: '100', styleName: 'text-center' }, // 관리기준(관리계정)
    { fieldName: 'mngStdMngerRglvlDvCd',
      header: t('관리기준급지'),
      width: '100',
      styleName: 'text-center',
      options: codes.RGLVL_DV_CD,
      editor: {
        type: 'dropdown',
      } }, // 관리기준(관리계정)
    { fieldName: 'curMnthAlctnDgr2LevlOgCd', header: t('지역단'), width: '100', styleName: 'text-center' }, // 당월배정
    { fieldName: 'curMnthAlctnDgr3LevlOgCd', header: t('지점'), width: '100', styleName: 'text-center' }, // 당월배정
    { fieldName: 'curMnthAlctnPrtnrKnm', header: t('매니저'), width: '100', styleName: 'text-center' }, // 당월배정
    { fieldName: 'curMnthAlctnMngerRglvlDvCd',
      header: t('관리기준급지'),
      width: '100',
      styleName: 'text-center',
      options: codes.RGLVL_DV_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 당월배정
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    'cntrNo',
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
      header: t('관리기준(관리계정)'), // colspan title
      direction: 'horizontal', // merge type
      items: ['mngStdDgr2LevlOgCd', 'mngStdDgr3LevlOgCd', 'mngStdPrtnrKnm', 'mngStdMngerRglvlDvCd'],
    }, // 이관전담당자
    {
      header: t('당월배정'),
      direction: 'horizontal',
      items: ['curMnthAlctnDgr2LevlOgCd', 'curMnthAlctnDgr3LevlOgCd', 'curMnthAlctnPrtnrKnm', 'curMnthAlctnMngerRglvlDvCd'],
    }, // 이관후담당자
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
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
