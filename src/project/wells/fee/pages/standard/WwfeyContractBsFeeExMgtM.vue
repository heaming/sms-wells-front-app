<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeyContractBsFeeExMgtM - 계약별 BS 수수료 예외 기준정보
3. 작성자 : MJ
4. 작성일 : 2023.07.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약별 BS 수수료 예외 기준정보 W-CO-U-0165M01
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      :cols="3"
      :modified-targets="['grdRef']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :select-only-validation="false"
          />
        </kw-search-item>
        <!-- 제품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
            @update:model-value="onUpdatePdCd()"
          />
          <kw-input
            v-model="searchParams.basePdNm"
            placeholder=""
            readonly
          />
        </kw-search-item>
        <!-- 방문개월 -->
        <kw-search-item
          :label="$t('MSG_TXT_VISIT_MN')"
        >
          <kw-input
            v-model="searchParams.vstMcn"
            type="text"
            mask="#####"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 적용기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.apyStrtYm"
            v-model:to="searchParams.apyEndYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BS_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.svFeePdDvCd"
            :options="codes.SV_FEE_PD_DV_CD"
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
            @change="fetchPage"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          v-permission:delete
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickRowDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickRowAdd"
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        name="grdRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrd"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, useDataService, useMeta, getComponentType, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'FEE_PDCT_TP_CD',
  'SV_FEE_DV_CD',
  'SV_FEE_PD_DV_CD',
  'HCR_DV_CD',
  'COD_YN',
  'YN_CD',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  basePdCd: '',
  basePdNm: '',
  vstMcn: '',
  apyStrtYm: '',
  apyEndYm: '',
  svFeePdDvCd: '',
});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });
  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.basePdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

async function onUpdatePdCd() {
  searchParams.value.basePdNm = '';
}

// 데이터 조회
async function fetchPage() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/contract-bs-fee/pages', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  grdData.value.setRows(pages);
  pageInfo.value = pagingResult;
  const view = grdRef.value.getView();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPage();
}

// 그리드행삭제
async function onClickRowDelete() {
  const view = grdRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deleteRows.length > 0) {
    const allRows = gridUtil.getDeletedRowValues(view);
    await dataService.post('/sms/wells/fee/contract-bs-fee', allRows);
    notify(t('MSG_ALT_DELETED'));
    await fetchPage();
  }
}

// 그리드행추가
async function onClickRowAdd() {
  const view = grdRef.value.getView();
  const defaultRow = {
    cntrNo: '',
    cntrSn: '',
    cntrDtlSn: '',
    cntorNm: '',
    basePdCd: '',
    basePdNm: '',
    vstMcn: 0,
    svFeePdDvCd: '00',
    baseChTcnt: '1',
    svFeeBaseAmt: 0,
    feeFxamYn: 'Y',
    apyStrtYm: '',
    apyEndYm: '999912',
    dtaDlYn: 'N',
  };
  const dataRow = view.getDataSource().insertRow(0, defaultRow);
  gridUtil.focusCellInput(view, dataRow, 'basePdCd');
}

// 저장
async function onClickSave() {
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) return;
  if (!await gridUtil.validate(view)) { return; }

  const allRows = gridUtil.getChangedRowValues(view, true);
  await dataService.post('/sms/wells/fee/contract-bs-fee', allRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchPage();
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/contract-bs-fee', { params: cachedParams });
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
  });
}

// 엑셀업로드
async function onClickExcelUpload() {
  // @todo
  const apiUrl = '/sms/wells/fee/contract-bs-fee/excel-upload';
  const templateId = 'FOM_FEY_0165';
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    const { status, errorInfo } = payload;
    if (status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchPage();
    } else if (status === 'E' && errorInfo.length > 0) {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  const btOpt = {
    startView: 1,
    minViewMode: 1,
    language: 'ko',
    todayHighlight: true,
  };
  const columns = [
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    {
      fieldName: 'cntrDtlSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center rg-button-icon--search boxed-icon',
      button: 'action',
      rules: 'required',
      buttonVisibleCallback(g, index) {
        return g.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'cntorNm', header: t('MSG_TXT_CNTOR_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' },
    { fieldName: 'vstMcn', header: t('MSG_TXT_VISIT_MN'), width: '100', styleName: 'text-right', dataType: 'number', rules: 'required', editable: true, editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } },
    { fieldName: 'svFeePdDvCd', header: t('MSG_TXT_BS_PD_GRP'), width: '180', styleName: 'text-center', options: codes.SV_FEE_PD_DV_CD, editor: { type: 'list' }, editable: true, rules: 'required' }, /* 서비스수수료상품구분코드 */
    { fieldName: 'baseChTcnt', header: t('MSG_TXT_ORDR'), width: '100', styleName: 'text-right', dataType: 'number', editable: true, rules: 'required', editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } },
    { fieldName: 'svFeeBaseAmt', header: `${t('TXT_MSG_FEE_AMT')} (${t('MSG_TXT_FXAM')}/${t('MSG_TXT_HMST')})`, width: '250', styleName: 'text-right', dataType: 'number', editable: true, editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } }, /* 서비스수수료기준금액 */
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '100', styleName: 'text-center', options: codes.YN_CD, editor: { type: 'list' }, editable: true },
    { fieldName: 'apyStrtYm', header: t('MSG_TXT_APY_STRT_YM'), width: '130', styleName: 'text-center', editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', rules: 'required', editable: true },
    { fieldName: 'apyEndYm', header: t('MSG_TXT_APY_END_YM'), width: '130', styleName: 'text-center', editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', rules: 'required', editable: true },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '130', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_USR'), width: '130', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (gridUtil.isCreatedRow(grid, index.dataRow) && ['cntrDtlSn', 'vstMcn', 'svFeePdDvCd', 'baseChTcnt', 'svFeeBaseAmt', 'feeFxamYn', 'apyStrtYm', 'apyEndYm'].includes(index.column)) {
      return true;
    }
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['svFeePdDvCd', 'svFeeBaseAmt', 'feeFxamYn', 'apyStrtYm', 'apyEndYm'].includes(index.column)) {
      return true;
    }
    return false;
  };
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    // 계약상세번호팝업 호출
    if (column === 'cntrDtlSn') {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
        componentProps: {
          cntrNo: '',
          // cntrSn: '',
        },
      });
      if (result) {
        g.setValue(itemIndex, 'cntrDtlSn', `${payload.cntrNo}-${payload.cntrSn}`);
        g.setValue(itemIndex, 'cntorNm', payload.cntrCstKnm);
        g.setValue(itemIndex, 'cntrNo', payload.cntrNo);
        g.setValue(itemIndex, 'cntrSn', payload.cntrSn);
        g.setValue(itemIndex, 'basePdCd', payload.pdCd);
        g.setValue(itemIndex, 'basePdNm', payload.pdNm);

        // 차수 max + 1
        const res = await dataService.get(`/sms/wells/fee/contract-bs-fee/next-order/${payload.cntrNo}-${payload.cntrSn}`);
        g.setValue(itemIndex, 'baseChTcnt', res.data);
      }
    }
  };
  // 시작월 종료월 체크
  view.onValidate = async (g, index) => {
    const { apyStrtYm, apyEndYm } = gridUtil.getRowValue(view, index.dataRow);
    if (!isEmpty(apyStrtYm) && !isEmpty(apyEndYm)) {
      if (apyStrtYm > apyEndYm) {
        gridUtil.focusCellInput(view, index.dataRow, 'apyStrtYm');
        return t('MSG_ALT_STRT_MM_CHK');
      }
    }
  };
});

</script>
