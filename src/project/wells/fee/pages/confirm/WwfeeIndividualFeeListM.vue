<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeListM - 수수료 조회
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTp"
            :label="$t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            @change="onChangeOgTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            rules="required"
            :options="rsbTpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3"
            :og-tp-cd="searchParams.ogTp"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
          required
        >
          <kw-option-group
            v-model="searchParams.feeDsbYn"
            type="radio"
            :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
            :options="codes.COD_GV_USE"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="openReportPopup"
        />
      </kw-action-top>
      <kw-grid
        v-if="isSelectVisile"
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="3"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="3"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, modal, codeUtil } from 'kw-lib';

import dayjs from 'dayjs';

import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const isSelectVisile = ref(true);
const isSelectVisile2 = ref(false);
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'COD_GV_USE',
);

const ogTpCd = codes.OG_TP_CD.filter((e) => ['W02', 'W01', 'W03'].includes(e.codeId));
const rsbTpCd = codes.RSB_DV_CD.filter((e) => ['W0204', 'W0205'].includes(e.codeId));
const rsbTpCd1 = codes.RSB_DV_CD.filter((e) => ['W0204', 'W0205'].includes(e.codeId));
const rsbTpCd2 = codes.RSB_DV_CD.filter((e) => ['W0104', 'W0105'].includes(e.codeId));
const rsbTpCd3 = codes.RSB_DV_CD.filter((e) => ['W0301', 'W0302'].includes(e.codeId));

const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  ogTp: 'W02',
  rsbTp: 'W0204',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  prtnrNo: '',
  prtnrKnm: '',
  feeDsbYn: '',
  prPerfYm: '',
  prOgTp: '',
});

let cachedParams;

const router = useRouter();

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/${uri}`, { params: cachedParams });
  const fees = response.data;
  searchParams.value.prPerfYm = searchParams.value.perfYm;
  searchParams.value.prOgTp = searchParams.value.ogTp;
  totalCount.value = fees.length;
  cachedParams = cloneDeep(searchParams.value);
  if (isSelectVisile.value) {
    const managerView = grd1MainRef.value.getView();
    managerView.getDataSource().setRows(fees);
  } else if (isSelectVisile2.value) {
    const homeMasterView = grd2MainRef.value.getView();
    homeMasterView.getDataSource().setRows(fees);
  }
}

async function onClickSearch() {
  let uri = '';
  cachedParams = cloneDeep(searchParams.value);
  if (isSelectVisile.value) {
    uri = 'manager-planers';
  } else if (isSelectVisile2.value) {
    uri = 'home-masters';
  }
  await fetchData(uri);
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogTp,
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

/*
 *  Event - 그리드 사번 클릭시 개인상세조회 페이지 이동
*/
async function movePage(no) {
  let url = '';

  if (searchParams.value.prOgTp === 'M추진단') {
    url = '/fee/wwfee-individual-fee-manager-list';
  } else if (searchParams.value.prOgTp === 'P추진단') {
    url = '/fee/wwfee-individual-fee-planner-list';
  } else if (searchParams.value.prOgTp === '홈마스터') {
    url = '/fee/wwfee-individual-fee-home-master-list';
  }

  router.push({
    path: url,
    query: {
      perfYm: searchParams.value.prPerfYm,
      prtnrNo: no },
  });
}

/*
 *  Event - 조직유형 선택에 따른 그리드 변경
 */
async function onChangeOgTp() {
  const { ogTp } = searchParams.value;

  if (ogTp === 'W02') {
    isSelectVisile.value = true;
    isSelectVisile2.value = false;
    rsbTpCd.value = rsbTpCd1;
    searchParams.value.rsbTp = 'W0204';
  } else if (ogTp === 'W01') {
    isSelectVisile.value = true;
    isSelectVisile2.value = false;
    rsbTpCd.value = rsbTpCd2;
    searchParams.value.rsbTp = 'W0104';
  } else if (ogTp === 'W03') {
    isSelectVisile.value = false;
    isSelectVisile2.value = true;
    rsbTpCd.value = rsbTpCd3;
    searchParams.value.rsbTp = 'W0301';
  }
}
/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openReportPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.prtnrNo,
  };

  await modal({
    component: 'openReportPopup',
    componentProps: param,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtDiv' },
    { fieldName: 'renlGrp' },
    { fieldName: 'branch' },
    { fieldName: 'emplNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'rsb' },
    { fieldName: 'qlf' },
    { fieldName: 'bnk' },
    { fieldName: 'acNo' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
    { fieldName: 'awbIntbsSum', dataType: 'number' },
    { fieldName: 'awbDdtnSum', dataType: 'number' },
    { fieldName: 'awbAclDsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'mngtDiv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'renlGrp', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'branch', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'rsb', header: t('MSG_TXT_RSB'), width: '71' },
    { fieldName: 'qlf', header: t('MSG_TXT_QLF'), width: '110' },

    { fieldName: 'bnk', header: t('MSG_TXT_BNK'), width: '80' },
    { fieldName: 'acNo', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbIntbsSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbDdtnSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbAclDsbAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow, column }) => {
    if (column === 'prtnrNo') {
      movePage(g.getValue(dataRow, 'prtnrNo'));
    }
  };
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'renlGrp' },
    { fieldName: 'branch' },
    { fieldName: 'emplNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'rsb' },
    { fieldName: 'qlf' },
    { fieldName: 'bnk' },
    { fieldName: 'acNo' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
    { fieldName: 'awbIntbsSum', dataType: 'number' },
    { fieldName: 'awbDdtnSum', dataType: 'number' },
    { fieldName: 'awbAclDsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'renlGrp', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'branch', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'rsb', header: t('MSG_TXT_RSB'), width: '71' },
    { fieldName: 'qlf', header: t('MSG_TXT_QLF'), width: '110' },

    { fieldName: 'bnk', header: t('MSG_TXT_BNK'), width: '80' },
    { fieldName: 'acNo', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbIntbsSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbDdtnSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbAclDsbAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow, column }) => {
    if (column === 'prtnrNo') {
      movePage(g.getValue(dataRow, 'prtnrNo'));
    }
  };
});
</script>
