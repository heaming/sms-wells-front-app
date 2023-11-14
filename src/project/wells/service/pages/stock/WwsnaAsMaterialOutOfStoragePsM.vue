<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAsMaterialOutOfStoragePsM(K-W-SV-U-0120M01) - AS자재 출고현황
3. 작성자 : jungheejin
4. 작성일 : 2023-10-25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS자재 출고현황 (http://localhost:3000/#/service/wwsna-as-material-out-storage-ps)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      :default-visible-rows="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.serviceType"
            :options="customCodes.serviceTypes"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.ogCd"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            first-option="all"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
        <!-- 유/무상구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_REFRI_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.refriType"
            :options="codes.REFRI_DV_CD"
            first-option="all"
            first-option-value="0"
          />
        </kw-search-item>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.itmPdCdFrom"
            maxlength="10"
            clearable
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmPdCdTo"
            maxlength="10"
            clearable
          />
        </kw-search-item>
        <!-- 설치기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_IST_BASE')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.installBase"
            :options="customCodes.installBases"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_days:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="codes.SV_BIZ_DCLSF_CD"
            first-option="all"
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
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_LBL_PRNT')"
          @click="onClickOZ"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { alert } = useGlobal();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/as-material-out-of-storage-ps';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'REFRI_DV_CD',
  'PD_GRP_CD',
  'ITM_KND_CD',
  'SV_BIZ_DCLSF_CD',
);

const customCodes = {
  serviceTypes: [
    { codeId: '1', codeName: t('MSG_TXT_INSTALLATION') }, /* 설치 */
    { codeId: '2', codeName: t('MSG_TXT_BEFORE_SERVICE') }, /* B/S */
    { codeId: '3', codeName: t('MSG_TXT_AFTER_SERVICE') }, /* A/S */
    { codeId: '4', codeName: `${t('MSG_TXT_AFTER_SERVICE')} + ${t('MSG_TXT_INSTALLATION')}` }, /* A/S+설치 */
    { codeId: '5', codeName: `${t('MSG_TXT_AFTER_SERVICE')} + ${t('MSG_TXT_BEFORE_SERVICE')}` }, /* A/S+B/S */
    { codeId: '6', codeName: `${t('MSG_TXT_BEFORE_SERVICE')} + ${t('MSG_TXT_INSTALLATION')}` }, /* B/S+설치 */
  ],
  installBases: [
    { codeId: '1', codeName: t('MSG_TXT_1YEAR_WHITHIN') },
  ],
};
const searchParams = ref({
  // testDt: now.format('YYYYMMDD'),
  // startDt: '20230701',
  // endDt: '20230701',
  startDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  serviceType: '',
  prtnrNo: '',
  refriType: '0',
  pdGrpCd: '',
  ogCd: '',
  installBase: '',
  itmKndCd: '',
  svBizDclsfCd: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
});

let cachedParams;

// 서비스센터
const serviceCenters = ref((await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data);

// 엔지니어
const engineers = ref((await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } })).data);

const totalCount = ref(0);
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
async function onClickOZ() {
  if (searchParams.value.ogCd === '') {
    await alert(t('MSG_ALT_SV_CNR_SELCT'));
    return;
  }
  const ozParam = ref({
    ozrPath: '/kyowon_as/asSaleLabel.ozr',
    odiPath: '',
    args:
      {
        VST_SDT: searchParams.value.startDt,
        VST_EDT: searchParams.value.endDt,
        DEPT_ID: searchParams.value.ogCd,
        CHAG_GB: searchParams.value.refriType,
      },
    height: 1300,
    width: 1400,
  });
  openReportPopup(
    ozParam.value.ozrPath,
    ozParam.value.odiPath,
    JSON.stringify(ozParam.value.args),
    { width: ozParam.value.width, height: ozParam.value.height },
  );
  console.log(ozParam.value.args);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' }, /* SAP코드 */
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' }, /* 품목코드 */
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '250', styleName: 'text-left' }, /* 품목명 */
    { fieldName: 'fnlBcNo', header: t('MSG_TXT_BARCODE'), width: '120', styleName: 'text-center' }, /* 바코드 */
    { fieldName: 'vstFshDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, /* 처리일자 */
    { fieldName: 'pdGdCd', header: t('MSG_TXT_GD'), width: '80', styleName: 'text-center' }, /* 등급 */
    { fieldName: 'useQty', header: `${t('MSG_TXT_QTY')}(EA)`, width: '80', styleName: 'text-right', dataType: 'number' }, /* 수량 */
    { fieldName: 'refriDvNm', header: `${t('MSG_TXT_RECAP_OR_FREE')}+${t('MSG_TXT_DIV')}`, width: '140', styleName: 'text-center' }, /* 유무상 구분 */
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-icon--search',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, /* 고객명 */
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-center' }, /* 고객유형 */
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, /* 계약일자 */
    { fieldName: 'locaraTno', visible: false }, // [전화번호1]
    { fieldName: 'exnoEncr', visible: false }, // [전화번호2]
    {
      fieldName: 'idvTno', // [전화번호3]
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, /* 우편번호 */
    {
      fieldName: 'rnadr',
      header: t('MSG_TXT_INST_ADDR'),
      width: '200',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { rnadr, rdadr } = grid.getValues(index.itemIndex);
        if (!isEmpty(rnadr)) {
          return `${rnadr}, ${rdadr}`;
        }
      },
    },
    { fieldName: 'rdadr', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '140', styleName: 'text-left' }, /* 상품명 */
    { fieldName: 'modelNm', header: t('MSG_TXT_MDL_NM'), width: '140', styleName: 'text-center' }, /* 모델명 */
    { fieldName: 'bcNo', header: t('MSG_TXT_MNFT_NO'), width: '180', styleName: 'text-center' }, /* 제조번호 */
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_RCP_IZ'), width: '300', styleName: 'text-left' }, /* 접수내역 */
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' }, /* 설치일자 */
    { fieldName: 'svBizHclsfNm', header: t('MSG_TXT_SV_TP'), width: '140', styleName: 'text-center' }, /* 서비스유형  */
    { fieldName: 'egerCnrNm', header: t('MSG_TXT_ICHR_CNR'), width: '140', styleName: 'text-center' }, /* 담당센터 */
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_ICHR_EGER'), width: '120', styleName: 'text-center' }, /* 담당엔지니어 */
    { fieldName: 'vstCnfmDt', header: t('MSG_TXT_VST_CNFM_D'), width: '140', styleName: 'text-center', datetimeFormat: 'date' }, /* 방문확정일 */
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '140', styleName: 'text-center' }, /* 작업상태 */
    { fieldName: 'asLctNm', header: t('MSG_TXT_LCT'), width: '140', styleName: 'text-center' }, /* 위치 */
    { fieldName: 'asphnNm', header: t('MSG_TXT_PHN'), width: '140', styleName: 'text-left' }, /* 현상 */
    { fieldName: 'asCausNm', header: t('MSG_TXT_CAUS'), width: '140', styleName: 'text-left' }, /* 원인 */
    { fieldName: 'svProcsCn', header: t('MSG_TXT_DTL_IZ'), width: '300', styleName: 'text-left' }, /* 상세내역 */
  ];
  const columnLayout = [
    'sapMatCd',
    'itmPdCd',
    'itmPdNm',
    'fnlBcNo',
    'vstFshDt',
    'pdGdCd',
    'useQty',
    'refriDvNm',
    'cntrNo',
    'rcgvpKnm',
    'sellTpNm',
    'cntrRcpFshDtm',
    'idvTno',
    'newAdrZip',
    'rnadr',
    'pdNm',
    'modelNm',
    'bcNo',
    'cnslMoCn',
    'istDt',
    'svBizHclsfNm',
    'egerCnrNm',
    'prtnrKnm',
    'vstCnfmDt',
    'wkPrgsStatNm',
    {
      header: t('MSG_TXT_RS_IN'),
      items: ['asLctNm', 'asphnNm', 'asCausNm', 'svProcsCn'],
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFixedOptions({ colCount: 3, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, index) => {
    if (index.column === 'cntrNo') {
      const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
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
