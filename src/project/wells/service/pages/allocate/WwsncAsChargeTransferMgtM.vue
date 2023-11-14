<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncAsChargeTransferMgtM - a/s 담당자 이관
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- a/s 담당자 이관 (http://localhost:3000/#/service/wwsnc-as-charge-transfer-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 소속 -->
        <kw-search-item
          :label="$t('MSG_TXT_BLG')"
        >
          <kw-select
            v-model="searchVal.svCnrOgId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            @update:model-value="onUpdateSvcCode1"
          />
        </kw-search-item>
        <!-- 담당자 성명 -->
        <kw-search-item
          :label="$t('MSG_TXT_EMPL_NM')"
        >
          <kw-select
            v-model="searchVal.ichrPrtnrNo"
            first-option="all"
            :options="engineers1"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
        <!-- 배정일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchVal.assignDateFrom"
            v-model:to="searchVal.assignDateTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 방문확정일 -->
        <kw-search-item
          :label="$t('MSG_TXT_VST_CNFM_D')"
          :colspan="2"
        >
          <kw-date-picker
            v-model="searchVal.vstCnfmdt"
            class="w250"
          />
          <kw-field
            v-model="searchVal.vstCnfmdtYn"
            class="ml8"
          >
            <!-- 방문확정일자로만조회 -->
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_INQR_BY_VST_CNFM_DT')"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <!-- 작업구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WK_CLS')"
        >
          <kw-select
            v-model="searchVal.svBizHclsfCd"
            first-option="all"
            :options="codes.SV_BIZ_HCLSF_CD.filter((v) => v.codeId === '1' || v.codeId === '3')"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>

        <!-- <kw-btn
          icon="print"
          secondary
          dense
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 이관이력조회 -->
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_TF_HIST_INQR')"
          @click="onClickTransfetHistoryInquiry"
        />
        <!-- 담당자입력 -->
        <kw-input
          ref="tfPrtnrKnmRef"
          v-model="updateParams.afchFnm"
          dense
          class="w120"
          readonly
          rules="required"
          :label="$t('MSG_TXT_BLG')"
          :placeholder="$t('MSG_TXT_PSIC_IN')"
        />
        <kw-btn
          dense
          secondary
          icon="search"
          @click="onClickIconPrtnrNoSearchPopup"
        />
        <!-- 담당자일괄변경 버튼 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_PSIC_BLK_CH')"
          @click="onClickBulkUpdate"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 담당자이관 버튼 -->
        <kw-btn
          v-permission:update
          primary
          dense
          :label="$t('MSG_BTN_PSIC_TF')"
          @click="onClickPsicTransfer"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, replace, isEmpty } from 'lodash-es';
import { RowState } from 'realgrid';

const { t } = useI18n();
const { getConfig, getUserInfo } = useMeta();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const {
  modal,
  notify,
} = useGlobal();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const sessionUserInfo = getUserInfo();
const tfPrtnrKnmRef = ref();
const engineers1 = ref([]);
/* 공통코드 가져오기 */
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const sessionVal = svcCode.filter((v) => v.ogId === sessionUserInfo.ogId)[0];
const initCenter = (!isEmpty(sessionVal) ? sessionVal.ogId : '');
/* 조회조건 */
const searchVal = ref({
  svCnrOgId: initCenter,
  ichrPrtnrNo: '',
  assignDateFrom: `${now.format('YYYYMM')}01`,
  assignDateTo: now.format('YYYYMMDD'),
  vstCnfmdt: now.format('YYYYMMDD'),
  vstCnfmdtYn: 'N',
  svBizHclsfCd: '',
});

const searchParams = ref({
  svCnrOgId: '',
  ichrPrtnrNo: '',
  assignDateFrom: '',
  assignDateTo: '',
  vstCnfmdt: '',
  svBizHclsfCd: '',
});

const updateParams = ref({
  afchBlgCd: '',
  afchOgTpCd: '',
  afchEmpno: '',
  afchFnm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_HCLSF_CD',
  'TF_AK_RSON_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;

// 엑셀다운로드 버튼 클릭
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/as-transfers/excel-download', { params: cachedParams });

  const exportLayout = [
    'cntrNo',
    'rcgvpKnm',
    'sellTpNm',
    'sapMatCd',
    'basePdCd',
    'pdAbbrNm',
    'wkDvNm',
    'ctpvNm',
    'ctctyNm',
    'amtdNm',
    'ctpvCtctyNm',
    'cnslMoCn',
    'newAdrZip',
    'adr',
    'alncDvNm',
    'dtmChCausNm',
    'dtmChRsonNm',
    'dtmChRsonDtlCn',
    'tno',
    'mpno',
    'wkPrgsDvNm',
    'vstCnfmDtm',
    'asnDtm',
    'rcst',
    {
      header: t('MSG_TXT_PSIC_BF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfchBlgNm', 'bfchEmpno', 'bfchFnm'],
    },
    {
      header: t('MSG_TXT_PSIC_AF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['afchBlgCd', 'afchEmpno', 'afchFnm'],
    },
    {
      header: t('MSG_TXT_TF_REQ_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['tfDt', 'tfRsonNm', 'tfBlgNm', 'tfFnm'],
    },
  ];

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    exportLayout,
  });
}
// 이관이력조회 버튼 클릭
function onClickTransfetHistoryInquiry() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }
  if (chkRows.length > 1) {
    notify(t('MSG_ALT_MDFC_SEL')); // 하나의 항목을 선택하십시오
    return;
  }
  modal({
    component: 'WwsncTransferHistoryListP',
    componentProps: { cstSvAsnNo: chkRows[0].cstSvAsnNo },
  });
}
// 엔지니어 조회
async function fetchEngineers(params) {
  return await dataService.get('/sms/wells/service/organizations/engineer', params);
}
const engineers = (await fetchEngineers({ params: { dgr1LevlOgId: '', authYn: 'N' } })).data;

async function setEngineers1() {
  if (searchVal.value.svCnrOgId === '') {
    engineers1.value = [];
    return;
  }
  const res = await fetchEngineers({ params: { dgr1LevlOgId: searchVal.value.svCnrOgId, authYn: 'N' } });
  engineers1.value = res.data;
}

async function onUpdateSvcCode1() {
  searchVal.value.ichrPrtnrNo = '';
  setEngineers1();
}
// 그리드 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-transfers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: asInfos, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(asInfos);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회버튼 클릭
async function onClickSearch() {
  if (searchVal.value.vstCnfmdtYn === 'Y') { // 방문확정일자로만 조회 체크박스 체크시
    if (!searchVal.value.vstCnfmdt) {
      notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_VST_CNFM_D')])); // 방문확정일 은(는) 필수값 입니다.
      return;
    }
    searchParams.value = {
      svCnrOgId: searchVal.value.svCnrOgId,
      ichrPrtnrNo: searchVal.value.ichrPrtnrNo,
      assignDateFrom: '',
      assignDateTo: '',
      vstCnfmdt: searchVal.value.vstCnfmdt,
      svBizHclsfCd: searchVal.value.svBizHclsfCd,
    };
  } else {
    if (!searchVal.value.assignDateFrom || !searchVal.value.assignDateTo) {
      notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_ASN_DT')])); // 배정일자 은(는) 필수값 입니다.
      return;
    }
    searchParams.value = {
      svCnrOgId: searchVal.value.svCnrOgId,
      ichrPrtnrNo: searchVal.value.ichrPrtnrNo,
      assignDateFrom: searchVal.value.assignDateFrom,
      assignDateTo: searchVal.value.assignDateTo,
      vstCnfmdt: '',
      svBizHclsfCd: searchVal.value.svBizHclsfCd,
    };
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 담당자이관버튼 클릭
async function onClickPsicTransfer() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }
  if (chkRows.some(({ rowState }) => rowState !== RowState.UPDATED)
  || chkRows.some(({ afchBlgCd, afchFnm }) => !afchBlgCd || !afchFnm)) {
    notify(t('MSG_ALT_NOT_EXST_TF_REQ_PSIC')); // 이관요청담당자가 없는 행이 존재합니다.
    return;
  }

  await dataService.post('/sms/wells/service/as-transfers', chkRows);
  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await fetchData();
}
// 이관 후 담당자 정보 세팅
function setAfchEmpno(grid, row, field) {
  const itemIndex = grid.getItemIndex(row);

  const { afchFnm, afchBlgCd } = grid.getValues(itemIndex);

  const changedFieldName = grid.getDataSource().getOrgFieldName(field);

  if (changedFieldName === 'afchFnm') {
    // 이름 바뀌면, 그 앞 필드 번호 부분 매핑. optionValue 가져와서 넣어줌?
    grid.setValue(itemIndex, 'afchEmpno', afchFnm);
  }
  if (changedFieldName === 'afchBlgCd') { // 이관 소속 변경 시
    const center = svcCode.filter((v) => v.ogId === afchBlgCd);
    grid.setValue(itemIndex, 'afchOgTpCd', center[0].ogTpCd);
    grid.setValue(itemIndex, 'afchFnm', '');
    grid.setValue(itemIndex, 'afchEmpno', '');
  }
}
// 담당자 입력(돋보기) 버튼 클릭 시
async function onClickIconPrtnrNoSearchPopup() {
  const { result, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd: '',
      searchText: '',
      authYn: 'N',
    },
  });
  if (result) {
    updateParams.value.afchBlgCd = payload[0].ogId;
    updateParams.value.afchOgTpCd = payload[0].ogTpCd;
    updateParams.value.afchEmpno = payload[0].prtnrNo;
    updateParams.value.afchFnm = payload[0].prtnrKnm;
  }
}
// 담당자 일괄변경 버튼 클릭
async function onClickBulkUpdate() {
  if (!await tfPrtnrKnmRef.value.validate()) {
    return;
  }

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }

  if (!await gridUtil.validate(checkedRows.value)) { return; }
  const data = view.getDataSource();

  const { afchBlgCd, afchOgTpCd, afchEmpno, afchFnm } = updateParams.value;

  data.beginUpdate();
  checkedRows.forEach((rowValue) => {
    data.updateRow(rowValue.dataRow, {
      afchBlgCd,
      afchOgTpCd,
      afchEmpno,
      afchFnm,
    });
  });
  data.endUpdate();
}

onMounted(async () => {
  setEngineers1();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
/* lookupTree 세팅 */
  const lookupTreeMainCodes = { id: 'lookupTreeMainCodes', levels: 1, keys: [], values: [] };
  const lookupTreeSubCodes = { id: 'lookupTreeSubCodes', levels: 2, tags: [], keys: [], values: [] };

  svcCode.forEach((codeObj) => {
    lookupTreeMainCodes.keys.push(codeObj.ogId);
    lookupTreeMainCodes.values.push(codeObj.ogNm);
  });
  engineers.forEach((codeObj) => {
    lookupTreeSubCodes.tags.push(codeObj.prtnrNo);
    lookupTreeSubCodes.keys.push([codeObj.ogId, codeObj.prtnrNo]);
    lookupTreeSubCodes.values.push(codeObj.prtnrNm);
  });
  view.addLookupSource(lookupTreeSubCodes);

  const fields = [
    { fieldName: 'cstSvAsnNo' }, // 설치배정번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약상세번호
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'sellTpNm' }, // 판매유형
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'basePdCd' }, // 품목코드
    { fieldName: 'pdAbbrNm' }, // 상품명
    { fieldName: 'pdGrpCd' }, // 상품그룹코드
    { fieldName: 'wkDvNm' }, // 작업구분
    { fieldName: 'ctpvNm' }, // 시도명
    { fieldName: 'ctctyNm' }, // 시군구명
    { fieldName: 'amtdNm' }, // 행정동명
    { fieldName: 'ctpvCtctyNm' }, // 시도군구명
    { fieldName: 'cnslMoCn' }, // 접수내역
    { fieldName: 'newAdrZip' }, // 우편번호
    { fieldName: 'adr' }, // 주소
    { fieldName: 'alncDvNm' }, // 제휴
    { fieldName: 'dtmChCausNm' }, // 변경원인
    { fieldName: 'dtmChRsonNm' }, // 변경사유
    { fieldName: 'dtmChRsonDtlCn' }, // 변경사유상세
    { fieldName: 'tno' }, // 전화번호
    { fieldName: 'mpno' }, // 휴대전화번호
    { fieldName: 'wkPrgsDvNm' }, // 진행구분
    { fieldName: 'vstCnfmDtm' }, // 방문확정일자
    { fieldName: 'asnDtm' }, // 배정일자
    { fieldName: 'rcst' }, // 접수자
    { fieldName: 'bfchBlgCd' }, // 소속조직ID(이관전)
    { fieldName: 'bfchBlgOgTpCd' }, // 소속조직유형코드(이관전)
    { fieldName: 'bfchBlgNm' }, // 소속조직명(이관전)
    { fieldName: 'bfchEmpno' }, // 사번(이관전)
    { fieldName: 'bfchFnm' }, // 성명(이관전)
    { fieldName: 'afchBlgCd' }, // 소속조직ID(이관후)
    { fieldName: 'afchOgTpCd' }, // 소속조직유형코드(이관후)
    { fieldName: 'afchEmpno' }, // 사번(이관후)
    { fieldName: 'afchFnm' }, // 성명(이관후)
    { fieldName: 'tfDt' }, // 이관일자
    { fieldName: 'tfRsonNm' }, // 이관사유
    { fieldName: 'tfBlgNm' }, // 소속(이관요청정보)
    { fieldName: 'tfFnm' }, // 성명(이관요청정보)
  ];

  const columns = [
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (grid, index) => {
        const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
        const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
        return `${cntrNo}-${cntrSn}`;
      },
    },
    {
      fieldName: 'rcgvpKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
    },
    {
      fieldName: 'sellTpNm',
      header: t('TXT_MSG_SELL_TP_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'sapMatCd',
      header: `SAP${t('MSG_TXT_CODE')}`,
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'basePdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdAbbrNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '100',
    },
    {
      fieldName: 'wkDvNm',
      header: t('MSG_TXT_WK_CLS'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'ctpvNm',
      header: t('MSG_TXT_CTPV_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'ctctyNm',
      header: t('MSG_TXT_CTCTY_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'amtdNm',
      header: t('MSG_TXT_AMTD_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'ctpvCtctyNm',
      header: t('MSG_TXT_CTPV_CTCTY_NM'),
      width: '250',
      displayCallback: (grid, index) => {
        const ctpvNm = grid.getValue(index.itemIndex, 'ctpvNm');
        const ctctyNm = grid.getValue(index.itemIndex, 'ctctyNm');
        const amtdNm = grid.getValue(index.itemIndex, 'amtdNm');
        const tot = `${replace(ctpvNm, null, ' ')} ${replace(ctctyNm, null, ' ')} ${replace(amtdNm, null, ' ')}`;

        return tot;
      },
    },
    {
      fieldName: 'cnslMoCn',
      header: t('MSG_TXT_RCP_IZ'),
      width: '250',
    },
    {
      fieldName: 'newAdrZip',
      header: t('MSG_TXT_ZIP'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'adr',
      header: t('MSG_TXT_ADDR'),
      width: '250',
    },
    {
      fieldName: 'alncDvNm',
      header: t('MSG_TXT_ALNC'),
      width: '100',
    },
    {
      fieldName: 'dtmChCausNm',
      header: t('MSG_TXT_CH_CAUS'),
      width: '100',
    },
    {
      fieldName: 'dtmChRsonNm',
      header: t('MSG_TXT_CHG_RSN'),
      width: '100',
    },
    {
      fieldName: 'dtmChRsonDtlCn',
      header: t('MSG_TXT_CHG_RSN', [t('MSG_TXT_DTL')]),
      width: '200',
    },
    {
      fieldName: 'tno',
      header: t('MSG_TXT_CONTACT'),
      width: '150',
    },
    {
      fieldName: 'mpno',
      header: t('MSG_TXT_MPNO'),
      width: '150',
    },
    {
      fieldName: 'wkPrgsDvNm',
      header: t('MSG_TXT_PRGS_DV'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstCnfmDtm',
      header: t('MSG_TXT_VST_CNFM_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'datetime',
    },
    {
      fieldName: 'asnDtm',
      header: t('MSG_TXT_ASN_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'datetime',
    },
    {
      fieldName: 'rcst',
      header: t('MSG_TXT_RCST'),
      width: '100',
    },
    {
      fieldName: 'bfchBlgNm',
      header: t('MSG_TXT_BLG'),
      width: '150',
    },
    {
      fieldName: 'bfchEmpno',
      header: t('MSG_TXT_EPNO'),
      width: '100',
      styleName: 'text-center ',
    },
    {
      fieldName: 'bfchFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
    },
    {
      fieldName: 'afchBlgCd',
      header: t('MSG_TXT_BLG'),
      width: '150',
      lookupDisplay: true,
      values: lookupTreeMainCodes.keys,
      labels: lookupTreeMainCodes.values,
      editor: { type: 'dropdown' },
      editable: true,
      rules: 'required',
    },
    {
      fieldName: 'afchEmpno',
      header: t('MSG_TXT_EPNO'),
      width: '100',
      styleName: 'text-center ',
    },
    {
      fieldName: 'afchFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
      lookupDisplay: true,
      lookupSourceId: 'lookupTreeSubCodes',
      lookupKeyFields: ['afchBlgCd', 'afchFnm'],
      editor: { type: 'dropdown' },
      editable: true,
      rules: 'required',
      // styleCallback: (grid, dataCell) => {
      //   const afchBlgCd = gridUtil.getCellValue(grid, dataCell.index.itemIndex, 'afchBlgCd');
      //   const { ogId } = svcCode.filter((v) => v.ogNm === afchBlgCd)[0];
      //   const afchFnm = wrkEng.filter((v) => v.ogId === ogId);

      // eslint-disable-next-line max-len
      //   return { editor: { type: 'list', labels: afchFnm.map((v) => v.codeName), values: afchFnm.map((v) => v.codeId) }, editable: true };
      // },
    },
    {
      fieldName: 'tfDt',
      header: t('MSG_TXT_TF_DT'),
      width: '150',
      styleName: 'text-center ',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'tfRsonNm',
      header: t('MSG_TXT_TF_RSON'),
      width: '150',
    },
    {
      fieldName: 'tfBlgNm',
      header: t('MSG_TXT_BLG'),
      width: '150',
    },
    {
      fieldName: 'tfFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
    },
  ];

  const columnLayout = [
    'cntrNo',
    'rcgvpKnm',
    'sellTpNm',
    'sapMatCd',
    'basePdCd',
    'pdAbbrNm',
    'wkDvNm',
    'ctpvNm',
    'ctctyNm',
    'amtdNm',
    'ctpvCtctyNm',
    'cnslMoCn',
    'newAdrZip',
    'adr',
    'alncDvNm',
    'dtmChCausNm',
    'dtmChRsonNm',
    'dtmChRsonDtlCn',
    'tno',
    'mpno',
    'wkPrgsDvNm',
    'vstCnfmDtm',
    'asnDtm',
    'rcst',
    {
      header: t('MSG_TXT_PSIC_BF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfchBlgNm', 'bfchEmpno', 'bfchFnm'],
    },
    {
      header: t('MSG_TXT_PSIC_AF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['afchBlgCd', 'afchEmpno', 'afchFnm'],
    },
    {
      header: t('MSG_TXT_TF_REQ_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['tfDt', 'tfRsonNm', 'tfBlgNm', 'tfFnm'],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  data.onValueChanged = (provider, row, field) => {
    setAfchEmpno(view, row, field);
  };

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    grid.checkItem(itemIndex, true);
    setAfchEmpno(grid, row, field);
  };

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
