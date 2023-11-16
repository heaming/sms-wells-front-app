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
            :options="ogTpCd"
            @change="onChangeOgTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-if="isSelectMrsbDvCdVisile"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="mRsbDvCd"
          />
          <kw-option-group
            v-if="isSelectPrsbDvCdVisile"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="pRsbDvCd"
          />
          <kw-option-group
            v-if="isSelectHrsbDvCdVisile"
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="hRsbDvCd"
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
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3"
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
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          icon="report"
          dense
          @click="openFeeReportPopup"
        />
        <kw-btn
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_FEE_INQR_PTRM_SE')"
          dense
          @click="onClickFeeDsbSpcsh"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, modal, codeUtil, notify, gridUtil } from 'kw-lib';
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
const isSelectMrsbDvCdVisile = ref(true);
const isSelectPrsbDvCdVisile = ref(false);
const isSelectHrsbDvCdVisile = ref(false);
const { currentRoute } = useRouter();
const router = useRouter();

const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'YN_CD',
  'QLF_DV_CD',
  'PQLF_DV_CD',
  'BNK_CD',
);

const ogTpCd = codes.OG_TP_CD.filter((e) => ['W02', 'W01', 'W03'].includes(e.codeId));
const mRsbDvCd = codes.RSB_DV_CD.filter((e) => ['W0204', 'W0205'].includes(e.codeId));
const pRsbDvCd = codes.RSB_DV_CD.filter((e) => ['W0104', 'W0105'].includes(e.codeId));
const hRsbDvCd = codes.RSB_DV_CD.filter((e) => ['W0301', 'W0302'].includes(e.codeId));

const totalCount = ref(0);

const searchParams = ref({
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  ogTpCd: 'W02',
  rsbDvCd: 'W0205',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  prtnrNo: '',
  feeDsbYn: '',
});

const saveParams = ref({
  baseYm: searchParams.value.perfYm,
  ogTpCd: searchParams.value.ogTpCd,
  rsbDvCd: searchParams.value.rsbDvCd,
  ddlnDvId: '',
  ddlnId: '',
  templateCode: '',
  feeMessagePk: '',
});

const ozParam = ref({
  ozrId: '',
  odiId: '',
});

let cachedParams;

function getGridColumns() {
  const columns = [];

  if (searchParams.value.ogTpCd === 'W01' || searchParams.value.ogTpCd === 'W02') {
    columns.push(
      { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '108', styleName: 'text-center' }, // 총괄단
      { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BUSINESS_DIVISION'), width: '108', styleName: 'text-center' }, // 사업단
      { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '108', styleName: 'text-center' }, // 지점
    );
  } else if (searchParams.value.ogTpCd === 'W03') {
    columns.push(
      { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '108', styleName: 'text-center' }, // 지역단
      { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '108', styleName: 'text-center' }, // 지점
    );
  }

  columns.push(
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '108', styleName: 'text-center' }, // 번호
    { fieldName: 'rsbDvCd',
      header: t('MSG_TXT_RSB'), // 직책
      width: '100',
      styleName: 'text-center',
      options: codes.RSB_DV_CD,
    },
  );

  if (searchParams.value.ogTpCd === 'W01') {
    columns.push(
      { fieldName: 'qlfDvCd',
        header: t('MSG_TXT_QLF'), // 자격
        width: '100',
        styleName: 'text-center',
        options: codes.PQLF_DV_CD,
      },
    );
  } else if (searchParams.value.ogTpCd === 'W02') {
    columns.push(
      { fieldName: 'qlfDvCd',
        header: t('MSG_TXT_QLF'), // 자격
        width: '100',
        styleName: 'text-center',
        options: codes.QLF_DV_CD,
      },
    );
  }

  columns.push(
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK'), width: '150', styleName: 'text-center' }, // 은행
    { fieldName: 'acnoEncr', header: t('MSG_TXT_AC_NO'), width: '180', styleName: 'text-center' }, // 계좌번호
    { fieldName: 'intbsAmt', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_AGG'), width: '137', styleName: 'text-right', dataType: 'number' }, // 과표 계
    { fieldName: 'ddctam', header: t('MSG_TXT_DDTN') + t('MSG_TXT_AGG'), width: '137', styleName: 'text-right', dataType: 'number' }, // 공제 계
    { fieldName: 'dsbOjAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '191', styleName: 'text-right', dataType: 'number' }, // 실지급액
    { fieldName: 'awdIntbsAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_AGG'), width: '137', styleName: 'text-right', dataType: 'number' }, // 시상 과표 계
    { fieldName: 'awdErnWhtx', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN') + t('MSG_TXT_AGG'), width: '137', styleName: 'text-right', dataType: 'number' }, // 시상 공제 계
    { fieldName: 'awdDsbOjAmt', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '191', styleName: 'text-right', dataType: 'number' }, // 시상 실지급액
  );

  return columns;
}

/*
 *  Event - 수수료 조회
 */
async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/individual-fees/feeLists', { params: cachedParams });
  const dataList = response.data;

  totalCount.value = dataList.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(dataList);
}

/*
 *  Event - 엑셀 다운로드
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/individual-fees/feeLists', { params: cachedParams });
  const exportLayout = view.getColumnNames();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    exportLayout,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
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
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

/*
 *  Event - 그리드 사번 더블 클릭시 개인상세조회 페이지 이동
*/
async function movePage(prtnrNo) {
  let url = '';

  if (cachedParams.ogTpCd === 'W01') {
    url = '/fee/wwfee-individual-fee-planner-list';
  } else if (cachedParams.ogTpCd === 'W02') {
    url = '/fee/wwfee-individual-fee-manager-list';
  } else if (cachedParams.ogTpCd === 'W03') {
    url = '/fee/wwfee-individual-fee-home-master-list';
  }

  router.push({
    path: url,
    query: { perfYm: cachedParams.perfYm, prtnrNo },
  });
}

/*
 *  Event - 조직유형 선택에 따른 그리드 변경
 */
async function onChangeOgTp() {
  const data = grdMainRef.value.getData();
  const view = grdMainRef.value.getView();

  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow, column }) => {
    if (column === 'prtnrNo') {
      movePage(g.getValue(dataRow, 'prtnrNo'));
    }
  };

  if (searchParams.value.ogTpCd === 'W01') {
    isSelectMrsbDvCdVisile.value = false;
    isSelectPrsbDvCdVisile.value = true;
    isSelectHrsbDvCdVisile.value = false;
    searchParams.value.rsbDvCd = 'W0105';
  } else if (searchParams.value.ogTpCd === 'W02') {
    isSelectMrsbDvCdVisile.value = true;
    isSelectPrsbDvCdVisile.value = false;
    isSelectHrsbDvCdVisile.value = false;
    searchParams.value.rsbDvCd = 'W0205';
  } else if (searchParams.value.ogTpCd === 'W03') {
    isSelectMrsbDvCdVisile.value = false;
    isSelectPrsbDvCdVisile.value = false;
    isSelectHrsbDvCdVisile.value = true;
    searchParams.value.rsbDvCd = 'W0302';
  }
}

/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openFeeReportPopup() {
  const view = grdMainRef.value.getView();
  const checkRows = gridUtil.getCheckedRowValues(view);

  if (checkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }

  if (searchParams.value.ogTpCd === 'W01') {
    ozParam.value.ozrId = '/ksswells/cmms/V6.0/cmmsSpecP2022.ozr';
    ozParam.value.odiId = '/ksswells/cmms/V6.0/cmmsSpecP2022.odi';
  } else if (searchParams.value.ogTpCd === 'W02') {
    ozParam.value.ozrId = '/ksswells/cmms/V5.2/cmmsSpec2023.ozr';
    ozParam.value.odiId = '/ksswells/cmms/V5.2/cmmsSpec2023.odi';
  } else if (searchParams.value.ogTpCd === 'W03') {
    ozParam.value.ozrId = '/ksswells/hmCmms/V3.0/cmmsSpec2022.ozr';
    ozParam.value.odiId = '/ksswells/hmCmms/V3.0/cmmsSpec2022.odi';
  }

  let checkedPrtnrNos = checkRows[0].prtnrNo;
  let checkedPstnDvCds = checkRows[0].PstnDvCd;

  for (let i = 1; i < checkRows.length; i += 1) {
    checkedPrtnrNos += `,${checkRows[i].prtnrNo}`;
    checkedPstnDvCds += `,${checkRows[i].PstnDvCd}`;
  }

  const bfPerfYm = dayjs(searchParams.value.perfYm).add(-1, 'month').format('YYYYMM');

  openReportPopup(
    ozParam.value.ozrId,
    ozParam.value.odiId,
    JSON.stringify(
      {
        AKSDYM: searchParams.value.perfYm,
        AKSDTY: searchParams.value.perfYm.substring(0, 4),
        AKSDTM: searchParams.value.perfYm.substring(4, 6),
        AKDDTY: bfPerfYm.substring(0, 4),
        AKDDTM: bfPerfYm.substring(4, 6),
        AKDRNK: checkedPstnDvCds,
        AKDCDE: checkedPrtnrNos,
      },
    ),
  );
}

/*
 *  Event - 수수료 조회기간 기간설정 버튼 클릭
 */
async function onClickFeeDsbSpcsh() {
  let ddlnDvId = '';
  let ddlnId = '';
  if (searchParams.value.ogTpCd === 'W01') { /* P조직 */
    if (searchParams.value.rsbDvCd === 'W0104') {
      ddlnDvId = 'DLD_W01_FEE_DSB_SPCSH1';
      ddlnId = 'DLN_00081';
    } else if (searchParams.value.rsbDvCd === 'W0105') {
      ddlnDvId = 'DLD_W01_FEE_DSB_SPCSH2';
      ddlnId = 'DLN_00082';
    }
    saveParams.value.templateCode = 'FEE_DSB_SPCSH_W01';
  } else if (searchParams.value.ogTpCd === 'W02') { /* M조직 */
    if (searchParams.value.rsbDvCd === 'W0204') {
      ddlnDvId = 'DLD_W02_FEE_DSB_SPCSH1';
      ddlnId = 'DLN_00083';
    } else if (searchParams.value.rsbDvCd === 'W0205') {
      ddlnDvId = 'DLD_W02_FEE_DSB_SPCSH2';
      ddlnId = 'DLN_00084';
    }
    saveParams.value.templateCode = 'FEE_DSB_SPCSH_W02';
  } else if (searchParams.value.ogTpCd === 'W03') { /* 홈마스터 */
    if (searchParams.value.rsbDvCd === 'W0301') {
      ddlnDvId = 'DLD_W03_FEE_DSB_SPCSH1';
      ddlnId = 'DLN_00085';
    } else if (searchParams.value.rsbDvCd === 'W0302') {
      ddlnDvId = 'DLD_W03_FEE_DSB_SPCSH2';
      ddlnId = 'DLN_00086';
    }
    saveParams.value.templateCode = 'FEE_DSB_SPCSH_W03';
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

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
