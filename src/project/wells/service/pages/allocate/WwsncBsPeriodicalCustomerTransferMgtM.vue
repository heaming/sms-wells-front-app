<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [W-SV-U-0291M01] WwsncBsPeriodicalCustomerTransferMgtM - 정기B/S 고객이관 관리
 3. 작성자 : YeongJoong Kim
 4. 작성일 : 2023.05.17
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 고객접촉 이력을 조회한다.
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
          :label="$t('MSG_TXT_ASN_YM')"
          required
        >
          <!--배정년월-->
          <kw-date-picker
            v-model="searchParams.assignYm"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_ASN_YM')"
            readonly
          /><!--배정년월-->
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_BLG')"
          required
        >
          <!--소속-->
          <kw-select
            v-model="searchParams.organizationId"
            :options="organizationOptions"
            option-value="ogId"
            option-label="ogCdNm"
            :label="$t('MSG_TXT_BLG')"
            rules="required"
            @change="onChangeOrganizationId"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EMPL_NM')"
        >
          <!--성명-->
          <kw-select
            v-model="searchParams.partnerNo"
            :options="partnerOptions"
            option-value="prtnrNo"
            option-label="prtnrNoNm"
            first-option
            first-option-value="ALL"
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <!--사번-->
          <kw-input
            v-model="searchParams.partnerNoInput"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TF_STAT')"
        >
          <!--이관상태-->
          <kw-select
            v-model="searchParams.transferStatusCode"
            :options="transferStatusCodes"
            first-option
            first-option-value="ALL"
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EMD_NM')"
        >
          <!--읍면동-->
          <kw-input
            v-model="searchParams.emdName"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
        >
          <!--우편번호-->
          <kw-input
            v-model="searchParams.addressZip"
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
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_TF_HIST_INQR')"
          @click="onClickTfHistory"
        /><!--이관이력 조회-->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_TXT_CST_CTT_HIS')"
          @click="onClickClientContactHistory"
        /><!--고객 컨택이력-->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-input
          ref="tfPrtnrKnmRef"
          v-model="updatePartnerObj.tfPrtnrKnm"
          readonly
          class="w110"
          icon="search_24"
          rules="required"
          :label="$t('MSG_TXT_BLG')"
          :placeholder="$t('MSG_TXT_BLG_SLCT')"
          @click-icon="onClickIconPrtnrNoSearchPopup"
        />
        <!-- <kw-select
          ref="refTfOgId"
          v-model="updatePartnerObj.tfOgId"
          :options="organizationOptions"
          option-value="ogId"
          option-label="ogCdNm"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_BLG_SLCT')"
          rules="required"
          :label="$t('MSG_TXT_BLG')"
          dense
          class="w110"
          @change="onChangeTfOgId"
        />
        <kw-select
          ref="refTfPrtnrNo"
          v-model="updatePartnerObj.tfPrtnrNo"
          :options="partnerOptionsForUpdatePartnerObj"
          option-value="prtnrNo"
          option-label="prtnrNoNm"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_EMPL_NM_SLCT')"
          rules="required"
          :label="$t('MSG_TXT_EMPL_NM')"
          dense
          class="w110"
        /> -->
        <kw-select
          ref="tfAkRsonCdRef"
          v-model="updatePartnerObj.tfAkRsonCd"
          :options="codes.TF_AK_RSON_CD"
          first-option
          first-option-value=""
          :first-option-label="$t('MSG_TXT_TF_RSON_SLCT')"
          rules="required"
          :label="$t('MSG_TXT_TF_RSON')"
          dense
          class="w120"
        /><!--이관사유 선택, 이관사유-->
        <kw-btn
          dense
          secondary
          :label="$t('담당자 일괄변경')"
          @click="onClickBulkUpdate"
        /><!--담당자 일괄변경-->

        <kw-separator
          spaced
          vertical
          inset
        />

        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_PSIC_TF')"
          @click="onClickTf"
        /><!--담당자 이관-->
        <kw-btn
          v-if="isShowTfConfirmBtm"
          dense
          primary
          :label="$t('MSG_TXT_TF_CNFM')"
          @click="onClickTfConfirm"
        /><!--이관 확정-->
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
import { useDataService, useMeta, getComponentType, codeUtil, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { RowState } from 'realgrid';

const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { notify, modal, alert } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'TF_AK_RSON_CD',
);

const transferStatusCodes = ref([
  { codeId: '00', codeName: '배정' },
  { codeId: '10', codeName: '확정대기' },
]);

const tfPrtnrKnmRef = ref();
const tfAkRsonCdRef = ref();

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  assignYm: now.format('YYYYMM'),
  organizationId: '',
  partnerNo: 'ALL',
  partnerNoInput: '',
  transferStatusCode: 'ALL',
  emdName: '',
  addressZip: '',
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { data: { list, pageInfo: pagingResult } } = await dataService.get('/sms/wells/service/before-service-period-customer/paging', { params: { ...cachedParams, ...pageInfo.value } });

  pageInfo.value = pagingResult;

  list.forEach((row) => { // 전화번호, 휴대전화번호 조합
    const { locaraTno, exnoEncr, idvTno } = row;
    row.tno = locaraTno ? `${locaraTno}-${exnoEncr}-${idvTno}` : ''; // 전화번호

    const { cralLocaraTno, mexnoEncr, cralIdvTno, cntrNo, cntrSn } = row;
    row.cntr = `${cntrNo}-${cntrSn}`;
    row.mobileTno = cralLocaraTno ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : ''; // 휴대전화번호
  });

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.clearCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const organizationOptions = ref([]);

async function fetchOrganizationOptions() {
  const { ogId, ogTpCd } = getters['meta/getUserInfo'];
  let dgr1LevlOgId;
  let dgr2LevlOgId;
  if (ogTpCd === 'W02') {
    const { data } = await dataService.get(`/sms/wells/service/manage-customer-rglvl/organization-info/${ogId}`);
    if (!data.dgr1LevlOgId) {
      await alert(t('MSG_ALT_NOT_FOUND_OG_INF')); // 조직정보를 찾을 수 없습니다.
      return;
    }
    dgr1LevlOgId = data.dgr1LevlOgId;
    dgr2LevlOgId = data.dgr2LevlOgId;
  } else if (['W03', 'W06'].includes(ogTpCd)) {
    searchParams.value.organizationId = ogId;
  }

  // W02 : 접속자의 지역단 정보의 하위 지점만 출력
  // W03, W06 : 접속자의 센터 1개
  const { data } = await dataService.get('/sms/wells/service/before-service-period-customer/organizations', { params: { ogTpCd, ogId, dgr1LevlOgId, dgr2LevlOgId } });

  organizationOptions.value = data;
}

const { baseRleCd } = getters['meta/getUserInfo'];
const isShowTfConfirmBtm = ref(baseRleCd === '9999');

const partnerOptions = ref([]);

async function onChangeOrganizationId() {
  searchParams.value.partnerNo = 'ALL';

  if (searchParams.organizationId === 'ALL') {
    partnerOptions.value = [];
  } else {
    const ogId = searchParams.value.organizationId;
    const { data } = await dataService.get(`/sms/wells/service/before-service-period-customer/organizations/${ogId}/partners`);
    partnerOptions.value = data;
  }
}

const updatePartnerObj = ref({
  tfAkRsonCd: '', // 이관사유
  tfOgId: '', // 소속
  tfOgTpCd: '',
  tfOgNm: '',
  tfPrtnrNo: '', // 성명
  tfPrtnrKnm: '',
});

async function onClickBulkUpdate() {
  if (!await tfPrtnrKnmRef.value.validate() || !await tfAkRsonCdRef.value.validate()) {
    return;
  }

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const data = view.getDataSource();

  const { tfOgTpCd, tfOgId, tfPrtnrNo, tfAkRsonCd, tfOgNm, tfPrtnrKnm } = updatePartnerObj.value;

  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      tfAkRsonCd,
      tfOgNm,
      tfOgTpCd,
      tfOgId,
      tfPrtnrKnm,
      tfPrtnrNo,
    });
  });
  data.endUpdate();
}

async function onClickTfHistory() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  } if (checkedRows.length > 1) {
    notify(t('MSG_ALT_SEL_SNGL_IF_OPN_POPUP'));
    return;
  }

  const { cstSvAsnNo } = checkedRows[0];

  await modal({
    component: 'WwsncTransferHistoryListP',
    componentProps: {
      cstSvAsnNo,
    },
  });
}

async function onClickClientContactHistory() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  } if (checkedRows.length > 1) {
    notify(t('MSG_ALT_SEL_SNGL_IF_OPN_POPUP'));
    return;
  }

  const { cstSvAsnNo } = checkedRows[0];

  await modal({
    component: 'WwsncContactHistoryListP',
    componentProps: {
      cstSvAsnNo,
    },
  });
}

async function onClickTf() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (checkedRows.some(({ rowState }) => rowState !== RowState.UPDATED)) {
    notify(t('MSG_ALT_NOT_EXST_TF_REQ_PSIC')); // 이관요청담당자가 없는 행이 존재합니다.
    return;
  }

  const data = checkedRows.map((row) => ({
    baseYm: row.asnOjYm,
    cstSvAsnNo: row.cstSvAsnNo,

    tfStatCd: row.tfStatCd,
    tfAkRsonCd: row.tfAkRsonCd,
    tfAkPrtnrOgTpCd: row.tfOgTpCd,
    tfAkPrtnrOgId: row.tfOgId,
    tfAkPrtnrNo: row.tfPrtnrNo,

    bfchIchrBrchOgId: row.bfchIchrBrchOgId,
    bfchMngrDvCd: row.bfchMngrDvCd,
    bfchIchrPrtnrOgTpCd: row.bfchIchrPrtnrOgTpCd,
    bfchIchrPrtnrNo: row.bfchIchrPrtnrNo,

    afchIchrBrchOgId: row.afchIchrBrchOgId,
    afchMngrDvCd: row.afchMngrDvCd,
    afchIchrPrtnrOgTpCd: row.afchIchrPrtnrOgTpCd,
    afchIchrPrtnrNo: row.afchIchrPrtnrNo,

    mngerRglvlDvCd: row.mngerRglvlDvCd,
  }));

  await dataService.post('/sms/wells/service/before-service-period-customer/transfer', data);
  notify(t('MSG_ALT_SVE_DATA'));

  await fetchData();
}

async function onClickTfConfirm() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  console.log(checkedRows);

  const isExistEmptyData = checkedRows.some((row) => !(row.tfAkRsonCd && row.tfOgTpCd && row.tfPrtnrNo));
  if (isExistEmptyData) {
    notify(t('MSG_ALT_NOT_EXST_TF_REQ_PSIC')); // 이관요청담당자가 없는 행이 존재합니다.
    return;
  }

  const data = checkedRows.map((row) => ({
    baseYm: row.asnOjYm,
    cstSvAsnNo: row.cstSvAsnNo,

    tfStatCd: row.tfStatCd,
    tfAkRsonCd: row.tfAkRsonCd,
    tfAkPrtnrOgTpCd: row.tfOgTpCd,
    tfAkPrtnrOgId: row.tfOgId,
    tfAkPrtnrNo: row.tfPrtnrNo,

    bfchIchrBrchOgId: row.bfchIchrBrchOgId,
    bfchMngrDvCd: row.bfchMngrDvCd,
    bfchIchrPrtnrOgTpCd: row.bfchIchrPrtnrOgTpCd,
    bfchIchrPrtnrNo: row.bfchIchrPrtnrNo,

    afchIchrBrchOgId: row.afchIchrBrchOgId,
    afchMngrDvCd: row.afchMngrDvCd,
    afchIchrPrtnrOgTpCd: row.afchIchrPrtnrOgTpCd,
    afchIchrPrtnrNo: row.afchIchrPrtnrNo,

    mngerRglvlDvCd: row.mngerRglvlDvCd,
  }));

  await dataService.post('/sms/wells/service/before-service-period-customer/transfer-confirm', data);
  notify(t('MSG_ALT_SVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { data } = await dataService.get('/sms/wells/service/before-service-period-customer/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}

async function onClickIconPrtnrNoSearchPopup() {
  const { result, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd: '',
      searchText: '',
    },
  });

  if (result) {
    updatePartnerObj.value.tfOgTpCd = payload[0].ogTpCd;
    updatePartnerObj.value.tfOgId = payload[0].ogId;
    updatePartnerObj.value.tfOgNm = payload[0].ogNm;
    updatePartnerObj.value.tfPrtnrNo = payload[0].prtnrNo;
    updatePartnerObj.value.tfPrtnrKnm = payload[0].prtnrKnm;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    // 원 데이터
    { fieldName: 'asnOjYm' },
    { fieldName: 'tfStatCd' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'assign' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'svpdNmAbbr1' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'mPkg' },
    { fieldName: 'mCntrNo' },
    { fieldName: 'mRcgvpKnm' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'emdNm' },
    { fieldName: 'istNmnN' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'vstCnfmdt' },
    { fieldName: 'vstCnfmHh' },
    { fieldName: 'tfAkRmkCn' },

    { fieldName: 'bfchIchrOgNm' },
    { fieldName: 'bfchIchrPrtnrNo' },
    { fieldName: 'bfchIchrPrtnrKnm' },
    { fieldName: 'bfchIchrBrchOgId' },
    { fieldName: 'bfchMngrDvCd' },
    { fieldName: 'bfchIchrPrtnrOgTpCd' },

    { fieldName: 'afchIchrOgNm' },
    { fieldName: 'afchIchrPrtnrNo' },
    { fieldName: 'afchIchrPrtnrKnm' },
    { fieldName: 'afchIchrBrchOgId' },
    { fieldName: 'afchMngrDvCd' },
    { fieldName: 'afchIchrPrtnrOgTpCd' },

    { fieldName: 'tfRqdt' }, // 담당자 변경
    { fieldName: 'tfAkRsonCd' }, // 담당자 변경
    { fieldName: 'tfOgNm' }, // 담당자 변경
    { fieldName: 'tfOgTpCd' }, // 담당자 변경
    { fieldName: 'tfOgId' }, // 담당자 변경
    { fieldName: 'tfPrtnrKnm' }, // 담당자 변경
    { fieldName: 'tfPrtnrNo' }, // 담당자 변경

    // { fieldName: 'tfFnCnfmdt' },
    // { fieldName: 'tfFnOgNm' },
    // { fieldName: 'tfFnPrtnrKnm' },
    { fieldName: 'mngerRglvlDvCd' },

    { fieldName: 'cstSvAsnNo' },

    // 조작된 데이터
    { fieldName: 'cntr' }, // 계약번호
    { fieldName: 'tno' }, // 전화번호
    { fieldName: 'mobileTno' }, // 휴대전화번호
  ];

  const columns = [
    { fieldName: 'tfStatCd', header: t('MSG_TXT_TF_STAT'), width: '100', styleName: 'text-center', options: transferStatusCodes.value }, // 이관상태
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_NO'), width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'assign', header: t('MSG_TXT_CPSN_FXN'), width: '100', styleName: 'text-center' }, // 강제/고정
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' }, // 품목코드
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' }, // 업무유형
    { fieldName: 'mPkg', header: t('모종패키지'), width: '150' }, // 모종패키지
    { fieldName: 'mCntrNo', header: t('모종고객번호'), width: '150' }, // 모종고객번호
    { fieldName: 'mRcgvpKnm', header: t('모종고객명'), width: '100' }, // 모종고객명
    { fieldName: 'ctpvNm', header: t('MSG_TXT_CTPV_NM'), width: '104' }, // 시도명
    { fieldName: 'ctctyNm', header: t('MSG_TXT_CTCTY_NM'), width: '104' }, // 시군구명
    { fieldName: 'emdNm', header: t('MSG_TXT_AMTD_NM'), width: '104' }, // 행정동명
    { fieldName: 'istNmnN', header: t('MSG_TXT_INST_OVER'), width: '104', styleName: 'text-right', dataType: 'number' }, // 설치차월수
    { fieldName: 'tno', header: t('MSG_TXT_TEL_NO'), width: '120', styleName: 'text-center' }, // 전화번호
    { fieldName: 'mobileTno', header: t('MSG_TXT_MPNO'), width: '120', styleName: 'text-center' }, // 휴대전화번호
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, // 우편번호
    { fieldName: 'rnadr', header: t('MSG_TXT_ADDR'), width: '350' }, // 주소
    { fieldName: 'vstCnfmdt', header: t('MSG_TXT_VST_DT'), width: '104', datetimeFormat: 'yyyy-MM-dd', styleName: 'text-center' }, // 방문일자
    { fieldName: 'vstCnfmHh',
      header: t('MSG_TXT_VST_TM'),
      width: '104',
      styleName: 'text-center',
      datetimeFormat: 'HH:mm:ss',
      editor: {
        mask: {
          editMask: '999999',
        },
      } }, // 방문시간
    { fieldName: 'tfAkRmkCn', header: t('MSG_TXT_MEMO'), width: '104' }, // 메모

    // 이관전담당자
    { fieldName: 'bfchIchrOgNm', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' }, // 소속
    { fieldName: 'bfchIchrPrtnrNo', header: t('MSG_TXT_EPNO'), width: '104', styleName: 'text-center' }, // 사번
    { fieldName: 'bfchIchrPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '104', styleName: 'text-center' }, // 성명

    // 이관후담당자
    { fieldName: 'afchIchrOgNm', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' }, // 소속
    { fieldName: 'afchIchrPrtnrNo', header: t('MSG_TXT_EPNO'), width: '104', styleName: 'text-center' }, // 사번
    { fieldName: 'afchIchrPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '104', styleName: 'text-center' }, // 성명

    // 이관요청정보
    { fieldName: 'tfRqdt', header: t('MSG_TXT_TF_DT'), width: '104', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 이관일자
    { fieldName: 'tfAkRsonCd',
      header: t('MSG_TXT_TF_RSON'),
      width: '104',
      styleName: 'text-left',
      options: codes.TF_AK_RSON_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 이관사유
    { fieldName: 'tfOgNm', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' }, // 소속
    { fieldName: 'tfPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '104', styleName: 'text-center' }, // 성명

    // 이관확정정보
    // { fieldName: 'tfFnCnfmdt', header: t('MSG_TXT_TF_DT')
    // , width: '104', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 이관일자
    // { fieldName: 'tfFnOgNm', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' }, // 소속
    // { fieldName: 'tfFnPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '104', styleName: 'text-center' }, // 성명
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  // view.checkBar.exclusive = true;
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    'tfStatCd',
    'cntr',
    'rcgvpKnm',
    'assign',
    'svpdSapCd',
    'pdctPdCd',
    'svpdNmAbbr1',
    'svBizDclsfCd',
    // '모종패키지',
    // '모종고객번호',
    // '모종고객명',
    'ctpvNm',
    'ctctyNm',
    'emdNm',
    'istNmnN',
    'tno',
    'mobileTno',
    'newAdrZip',
    'rnadr',
    'vstCnfmdt',
    'vstCnfmHh',
    'tfAkRmkCn',
    {
      header: t('MSG_TXT_TF_BF_PSIC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfchIchrOgNm', 'bfchIchrPrtnrNo', 'bfchIchrPrtnrKnm'],
    }, // 이관전담당자
    {
      header: t('MSG_TXT_TF_AF_PSIC'),
      direction: 'horizontal',
      items: ['afchIchrOgNm', 'afchIchrPrtnrNo', 'afchIchrPrtnrKnm'],
    }, // 이관후담당자
    {
      header: t('MSG_TXT_TF_REQ_INF'),
      direction: 'horizontal',
      items: ['tfRqdt', 'tfAkRsonCd', 'tfOgNm', 'tfPrtnrKnm'],
    }, // 이관요청정보
    // {
    //   header: t('MSG_TXT_TF_CNFM_INF'),
    //   direction: 'horizontal',
    //   items: ['tfFnCnfmdt', 'tfFnOgNm', 'tfFnPrtnrKnm'],
    // }, // 이관확정정보
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
  await fetchOrganizationOptions();
});
</script>
