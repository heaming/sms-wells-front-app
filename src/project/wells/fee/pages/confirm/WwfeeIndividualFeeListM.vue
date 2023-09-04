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
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="$t('MSG_TXT_OG_TP')"
            :options="slxOgTpCd"
            @change="onChangeOgTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-if="isSelectVisile"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="slxRsb1TpCd"
          />
          <kw-option-group
            v-if="isSelectVisile2"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="slxRsb2TpCd"
          />
          <kw-option-group
            v-if="isSelectVisile3"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="slxRsb3TpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1Id"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2Id"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3Id"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
        >
          <kw-option-group
            v-model="searchParams.feeDsbYn"
            type="radio"
            :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
            :options="codes.YN_CD"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-btn
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          icon="report"
          dense
          @click="openFeeReportPopup"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_INQR_PTRM_SE')"
          dense
          @click="onClickFeeDsbSpcsh"
        />
      </kw-action-top>
      <kw-grid
        v-if="isSelectVisile"
        ref="grdMainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
        ref="grdMainRef"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile3"
        ref="grdMainRef"
        name="grd3Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useMeta, getComponentType, defineGrid, modal, codeUtil, notify, gridUtil } from 'kw-lib';
import { openReportPopup } from '~common/utils/cmPopupUtil';

import dayjs from 'dayjs';

import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const isSelectVisile = ref(true);
const isSelectVisile2 = ref(false);
const isSelectVisile3 = ref(false);
const { currentRoute } = useRouter();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'YN_CD',
  'QLF_DV_CD',
  'BNK_CD',
);

const slxOgTpCd = codes.OG_TP_CD.filter((e) => ['W02', 'W01', 'W03'].includes(e.codeId));
const slxRsb1TpCd = codes.RSB_DV_CD.filter((e) => ['W0204', 'W0205'].includes(e.codeId));
const slxRsb2TpCd = codes.RSB_DV_CD.filter((e) => ['W0104', 'W0105'].includes(e.codeId));
const slxRsb3TpCd = codes.RSB_DV_CD.filter((e) => ['W0301', 'W0302'].includes(e.codeId));

const totalCount = ref(0);
const searchParams = ref({
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  ogTpCd: 'W02',
  rsbDvCd: 'W0205',
  ogLevl1Id: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  prtnrNo: '',
  prtnrKnm: '',
  feeDsbYn: '',
  prPerfYm: '',
  prOgTpCd: '',
  userHirFomCd: '',
  userEmpID: sessionUserInfo.employeeIDNumber,
  userRsbCd: '',
  userSpptRsbDvCd: '',
  userPstnDvCd: '',
});

const info = ref({
  hirFomCd: '',
  bznsSpptRsbDvCd: '',
  rsbDvCd: '',
  pstnDvCd: '',
});

const saveParams = ref({
  baseYm: searchParams.value.perfYm,
  ogTpCd: searchParams.value.ogTpCd,
  rsbDvCd: searchParams.value.rsbDvCd,
  ddlnDvId: '',
  ddlnId: '',
  templateCode: 'TMP_FEA_FEE_INQR_PTRM_E01',
  feeMessagePk: '',
});

const ozParam = ref({
  ozrId: '',
  odiId: '',
});

let cachedParams;

const router = useRouter();

/*
 *  Event - 수수료 조회
 */

async function fetchData(uri) {
  const { perfYm, ogTpCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get(`/sms/wells/fee/individual-fees/${uri}`, { params: cachedParams, timeout: 300000 });
  const fees = response.data;
  searchParams.value.prPerfYm = perfYm;
  searchParams.value.prOgTpCd = ogTpCd;
  totalCount.value = fees.length;
  if (uri === 'feeLists') {
    if (ogTpCd === 'W03') {
      const homeMasterView = grdMainRef.value.getView();
      homeMasterView.getDataSource().setRows(fees);
    } else {
      const managerView = grdMainRef.value.getView();
      managerView.getDataSource().setRows(fees);
    }
  } else if (uri === 'userInfo') {
    info.value = fees;
  }
}

/*
 *  Event - 엑셀 다운로드
 */
async function onClickExcelDownload() {
  const { hirFomCd, bznsSpptRsbDvCd, rsbDvCd, pstnDvCd } = info.value;
  searchParams.value.hirFomCd = hirFomCd;
  searchParams.value.userRsbCd = rsbDvCd;
  searchParams.value.userSpptRsbDvCd = bznsSpptRsbDvCd;
  searchParams.value.userPstnDvCd = pstnDvCd;
  cachedParams = cloneDeep(searchParams.value);

  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/individual-fees/feeLists', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickSearch() {
  const { hirFomCd, bznsSpptRsbDvCd, rsbDvCd, pstnDvCd } = info.value;
  searchParams.value.hirFomCd = hirFomCd;
  searchParams.value.userRsbCd = rsbDvCd;
  searchParams.value.userSpptRsbDvCd = bznsSpptRsbDvCd;
  searchParams.value.userPstnDvCd = pstnDvCd;
  const uri = 'feeLists';
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
      ogTpCd: searchParams.value.ogTpCd,
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
 *  Event - 그리드 사번 더블 클릭시 개인상세조회 페이지 이동
*/
async function movePage(no) {
  let url = '';

  if (searchParams.value.prOgTpCd === 'W02') {
    url = '/fee/wwfee-individual-fee-manager-list';
  } else if (searchParams.value.prOgTpCd === 'W01') {
    url = '/fee/wwfee-individual-fee-planner-list';
  } else if (searchParams.value.prOgTpCd === 'W03') {
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
  const { ogTpCd } = searchParams.value;
  if (ogTpCd === 'W02') {
    isSelectVisile.value = true;
    isSelectVisile2.value = false;
    isSelectVisile3.value = false;
    searchParams.value.rsbDvCd = 'W0205';
  } else if (ogTpCd === 'W01') {
    isSelectVisile.value = false;
    isSelectVisile2.value = true;
    isSelectVisile3.value = false;
    searchParams.value.rsbDvCd = 'W0105';
  } else if (ogTpCd === 'W03') {
    isSelectVisile.value = false;
    isSelectVisile2.value = false;
    isSelectVisile3.value = true;
    searchParams.value.rsbDvCd = 'W0302';
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('userInfo');
}

/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openFeeReportPopup() {
  const { perfYm, ogTpCd } = searchParams.value;
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length !== 1) {
    notify(t('MSG_ALT_ONE_PROCS_PSB'));
    return;
  }
  if (ogTpCd === 'W01') {
    ozParam.value.ozrId = '/ksswells/cmms/V6.0/cmmsSpecP2022.ozr';
    ozParam.value.odiId = '/ksswells/cmms/V6.0/cmmsSpecP2022.odi';
  } else if (ogTpCd === 'W02') {
    ozParam.value.ozrId = '/ksswells/cmms/V5.2/cmmsSpec2023.ozr';
    ozParam.value.odiId = '/ksswells/cmms/V5.2/cmmsSpec2023.odi';
  } else if (ogTpCd === 'W03') {
    ozParam.value.ozrId = '/ksswells/hmCmms/V3.0/cmmsSpec2022.ozr';
    ozParam.value.odiId = '/ksswells/hmCmms/V3.0/cmmsSpec2022.odi';
  }

  const targetRow = checkedRows[0];
  const slcPrtnrNo = targetRow.prtnrNo;
  const slcPstnDvCd = targetRow.pstnDvCd;
  if (slcPrtnrNo !== '' && slcPstnDvCd !== undefined) {
    const bfPerfYm = dayjs(perfYm).add(-1, 'month').format('YYYYMM');
    openReportPopup(
      ozParam.value.ozrId,
      ozParam.value.odiId,
      JSON.stringify(
        {
          AKSDYM: perfYm,
          AKSDTY: perfYm.substring(0, 4),
          AKSDTM: perfYm.substring(4, 6),
          AKDDTY: bfPerfYm.substring(0, 4),
          AKDDTM: bfPerfYm.substring(4, 6),
          AKDRNK: slcPstnDvCd,
          AKDCDE: slcPrtnrNo,
        },
      ),
    );
  } else {
    alert(t('MSG_ALT_LIST_CHO'));
  }
}

/*
 *  Event - 수수료 조회기간 기간설정 버튼 클릭
 */
async function onClickFeeDsbSpcsh() {
  const { ogTpCd, rsbDvCd } = searchParams.value;
  const ddlnDvId = 'DLD_FEE_DSB_SPCSH';
  let ddlnId = '';
  if (ogTpCd === 'W01') { /* P조직 */
    if (rsbDvCd === 'W0104') {
      ddlnId = 'DLN_00012';
    } else if (rsbDvCd === 'W0105') {
      ddlnId = 'DLN_00013';
    }
  } else if (ogTpCd === 'W02') { /* M조직 */
    if (rsbDvCd === 'W0204') {
      ddlnId = 'DLN_00014';
    } else if (rsbDvCd === 'W0205') {
      ddlnId = 'DLN_00015';
    }
  } else if (ogTpCd === 'W03') { /* 홈마스터 */
    if (rsbDvCd === 'W0301') {
      ddlnId = 'DLN_00016';
    } else if (rsbDvCd === 'W0302') {
      ddlnId = 'DLN_00017';
    }
  }
  const { result } = await modal({
    component: 'ZwcmsDeadlineMgtP',
    componentProps: {
      ddlnDvId,
      ddlnId,
    },
  });

  if (result) {
    // 알림톡 데이터 저장
    saveParams.value.feeMessagePk = `${ddlnDvId}-${ddlnId}-${saveParams.value.baseYm}-${saveParams.value.ogTpCd}-${saveParams.value.rsbDvCd}`;
    saveParams.value.ddlnDvId = ddlnDvId;
    saveParams.value.ddlnId = ddlnId;
    await dataService.post('/sms/common/fee/fee-specification/messages', saveParams.value);

    notify(t('MSG_ALT_FEE_BIZTALK_SET'));
  }
}
onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('userInfo');
});

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
    { fieldName: 'rsbDvCd' },
    { fieldName: 'qlfDvCd' },
    { fieldName: 'fnitCd' },
    { fieldName: 'acNo' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
    { fieldName: 'awbIntbsSum', dataType: 'number' },
    { fieldName: 'awbDdtnSum', dataType: 'number' },
    { fieldName: 'awbAclDsbAmt', dataType: 'number' },
    { fieldName: 'pstnDvCd' },
  ];

  const columns = [
    { fieldName: 'mngtDiv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'renlGrp', header: t('MSG_TXT_BUSINESS_DIVISION'), width: '98' },
    { fieldName: 'branch', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '71', options: codes.RSB_DV_CD },
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_QLF'), width: '110', options: codes.QLF_DV_CD },
    { fieldName: 'fnitCd', header: t('MSG_TXT_BNK'), width: '80', options: codes.BNK_CD },
    { fieldName: 'acNo', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbIntbsSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbDdtnSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbAclDsbAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right', visible: false },
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
    { fieldName: 'rsbDvCd' },
    { fieldName: 'qlfDvCd' },
    { fieldName: 'fnitCd' },
    { fieldName: 'acNo' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
    { fieldName: 'awbIntbsSum', dataType: 'number' },
    { fieldName: 'awbDdtnSum', dataType: 'number' },
    { fieldName: 'awbAclDsbAmt', dataType: 'number' },
    { fieldName: 'pstnDvCd' },
  ];

  const columns = [
    { fieldName: 'renlGrp', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'branch', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '71', options: codes.RSB_DV_CD },
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_QLF'), width: '110', options: codes.QLF_DV_CD },
    { fieldName: 'fnitCd', header: t('MSG_TXT_BNK'), width: '80', options: codes.BNK_CD },
    { fieldName: 'acNo', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbIntbsSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbDdtnSum', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'awbAclDsbAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right', visible: false },
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
