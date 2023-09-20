<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeyNewChannelBaseMgtM - 신채널수수료기준관리
3. 작성자 : MJ
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 신채널수수료기준관리 W-CO-U-0167M01
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
        <!-- 적용시작일 -->
        <kw-search-item
          :label="$t('MSG_TXT_APY_STRT_DAY')"
        >
          <kw-date-picker
            v-model="searchParams.apyStrtdt"
            :label="$t('MSG_TXT_APY_STRT_DAY')"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
            @update:model-value="onUpdatePdCd()"
          />
          <kw-input
            v-model="searchParams.pdNm"
            placeholder=""
            readonly
          />
        </kw-search-item>
        <!-- 판매유형 -->
        <kw-search-item
          :label="$t('TXT_MSG_SELL_TP_CD')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- BS주기 -->
        <kw-search-item
          :label="$t('MSG_TXT_BS_CYC')"
        >
          <kw-select
            v-model="searchParams.svPrd"
            :options="codes.MNGT_PRD_ACD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 할인제도 -->
        <kw-search-item
          :label="$t('MSG_TXT_DSC_SYST')"
        >
          <kw-select
            v-model="searchParams.pmotCd"
            :options="codes.PMOT_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 채널구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CHNL_DV')"
        >
          <kw-select
            v-model="searchParams.feecDvCd"
            :options="codes.FEE_BASE_MNGT_CHNL_ACD"
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
import dayjs from 'dayjs';

const now = dayjs();
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
  'YN_CD',
  'SELL_TP_CD',
  'USWY_TP_CD',
  'SELL_DSC_DV_CD',
  'SELL_DSCR_CD',
  'PMOT_CD',
  'SPP_DV_CD',
  'HCR_DV_CD',
  'MNGT_PRD_ACD', // BS주기
  'RENTAL_COMBI_DV_CD', // 결합구분
  'FEE_BASE_MNGT_CHNL_ACD', // 채널구분 FEEC_DV_CD
  'RENTAL_CRP_DSCR_CD', // SELL_DSCR_CD SELL_TP_CD 2, SELL_DSC_DV_CD 5
  'RENTAL_MCHD_DSC_APY_DTL_CD', // SELL_DSCR_CD SELL_TP_CD 2, SELL_DSC_DV_CD 7
  'RENTAL_CRP_DSC_APY_DTL_CD', // SELL_DSCR_CD SELL_TP_CD 2, SELL_DSC_DV_CD 8
  'MSH_PRC_BASE_DSC_TP_ACD', // SELL_DSCR_CD SELL_TP_CD 4
  'SPAY_DSC_DV_CD', // SELL_DSC_DV_CD 일시불
  'RENTAL_DSC_DV_CD', // SELL_DSC_DV_CD 렌탈
  'MSH_DSC_DV_CD', // SELL_DSC_DV_CD  홈케어일시불(멤버십)
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  apyStrtdt: now.format('YYYYMMDD'),
  pdCd: '',
  pdNm: '',
  sellTpCd: '',
  svPrd: '',
  pmotCd: '',
  feecDvCd: '',

});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });
  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

async function onUpdatePdCd() {
  searchParams.value.pdNm = '';
}

// 데이터 조회
async function fetchPage() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/new-chanel-base/pages', { params: { ...cachedParams, ...pageInfo.value } });
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
    await dataService.post('/sms/wells/fee/new-chanel-base', allRows);
    notify(t('MSG_ALT_DELETED'));
    await fetchPage();
  }
}

// 그리드행추가
async function onClickRowAdd() {
  const view = grdRef.value.getView();
  const defaultRow = {
    feeFxamYn: 'N',
    apyStrtdt: searchParams.value.apyStrtdt,
    apyEnddt: '99991231',
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
  await dataService.post('/sms/wells/fee/new-chanel-base', allRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchPage();
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/new-chanel-base', { params: cachedParams });
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  // { fieldName: 'hcrDvCd', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '150', styleName: 'text-center' },
  // { fieldName: 'hcrDvCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '150', styleName: 'text-center', editable: true },
  const columns = [
    { fieldName: 'mtrSn', header: t('MSG_TXT_SERIAL_NUMBER'), visible: false },
    {
      fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '150',
      styleName: 'text-center rg-button-icon--search boxed-icon',
      button: 'action',
      rules: 'required',
      buttonVisibleCallback(g, index) {
        return g.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '150', styleName: 'text-center', rules: 'required', editable: true, options: codes.SELL_TP_CD, editor: { type: 'list' } },
    { fieldName: 'uswyTpCd', header: t('MSG_TXT_USWY_DV'), width: '150', styleName: 'text-center', rules: 'required', editable: true, options: codes.USWY_TP_CD, editor: { type: 'list' } },
    { fieldName: 'hcrDvCd1', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '100', styleName: 'text-center', editable: true, editor: { maxLength: 2, textCase: 'upper' } }, /* 상품구분1 */
    { fieldName: 'hcrDvCd2', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '100', styleName: 'text-center', editable: true, editor: { maxLength: 2, textCase: 'upper' } }, /* 상품구분2 */
    {
      fieldName: 'sellDscDvCd',
      header: t('MSG_TXT_PD_DC_CLASS'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      styleCallback(grid, dataCell) {
        const { sellTpCd } = gridUtil.getRowValue(grid, dataCell.index.dataRow);
        const ret = {};
        if (sellTpCd === '1') {
          ret.editor = {
            type: 'dropdown',
            values: codes.SPAY_DSC_DV_CD.map((v) => v.codeId),
            labels: codes.SPAY_DSC_DV_CD.map((v) => v.codeName),
          };
        } else if (sellTpCd === '2') {
          ret.editor = {
            type: 'dropdown',
            values: codes.RENTAL_DSC_DV_CD.map((v) => v.codeId),
            labels: codes.RENTAL_DSC_DV_CD.map((v) => v.codeName),
          };
        } else if (['3', '4'].includes(sellTpCd)) {
          ret.editor = {
            type: 'dropdown',
            values: codes.MSH_DSC_DV_CD.map((v) => v.codeId),
            labels: codes.MSH_DSC_DV_CD.map((v) => v.codeName),
          };
        } else {
          ret.editor = {
            type: 'dropdown',
            values: [],
            labels: [],
          };
        }
        return ret;
      },
      displayCallback(grid, index, value) {
        let retValue = value;
        const { sellTpCd } = grid.getValues(index.itemIndex);
        if (sellTpCd === '1') {
          retValue = codes.SPAY_DSC_DV_CD.find((v) => v.codeId === value)?.codeName;
        } else if (sellTpCd === '2') {
          retValue = codes.RENTAL_DSC_DV_CD.find((v) => v.codeId === value)?.codeName;
        } else if (['3', '4'].includes(sellTpCd)) {
          retValue = codes.MSH_DSC_DV_CD.find((v) => v.codeId === value)?.codeName;
        }
        return retValue;
      },
    },
    {
      fieldName: 'sellDscrCd',
      header: t('MSG_TXT_DISC_CODE'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      styleCallback(grid, dataCell) {
        const { sellTpCd, sellDscDvCd } = gridUtil.getRowValue(grid, dataCell.index.dataRow);
        const ret = {};
        if (sellTpCd === '2' && sellDscDvCd === '5') {
          ret.editor = {
            type: 'dropdown',
            values: codes.RENTAL_CRP_DSCR_CD.map((v) => v.codeId),
            labels: codes.RENTAL_CRP_DSCR_CD.map((v) => v.codeName),
          };
        } else if (sellTpCd === '2' && sellDscDvCd === '7') {
          ret.editor = {
            type: 'dropdown',
            values: codes.RENTAL_MCHD_DSC_APY_DTL_CD.map((v) => v.codeId),
            labels: codes.RENTAL_MCHD_DSC_APY_DTL_CD.map((v) => v.codeName),
          };
        } else if (sellTpCd === '2' && ['1', '8'].includes(sellDscDvCd)) {
          ret.editor = {
            type: 'dropdown',
            values: codes.RENTAL_CRP_DSC_APY_DTL_CD.map((v) => v.codeId),
            labels: codes.RENTAL_CRP_DSC_APY_DTL_CD.map((v) => v.codeName),
          };
        } else if (sellTpCd === '4' && sellDscDvCd === '4') {
          ret.editor = {
            type: 'dropdown',
            values: codes.MSH_PRC_BASE_DSC_TP_ACD.map((v) => v.codeId),
            labels: codes.MSH_PRC_BASE_DSC_TP_ACD.map((v) => v.codeName),
          };
        } else {
          ret.editor = {
            type: 'dropdown',
            values: [],
            labels: [],
          };
        }
        return ret;
      },
      displayCallback(grid, index, value) {
        let retValue = value;
        const { sellTpCd, sellDscDvCd } = grid.getValues(index.itemIndex);
        if (sellTpCd === '2' && sellDscDvCd === '5') {
          retValue = codes.RENTAL_CRP_DSCR_CD.find((v) => v.codeId === value)?.codeName;
        }
        if (sellTpCd === '2' && sellDscDvCd === '7') {
          retValue = codes.RENTAL_MCHD_DSC_APY_DTL_CD.find((v) => v.codeId === value)?.codeName;
        }
        if (sellTpCd === '2' && ['1', '8'].includes(sellDscDvCd)) {
          retValue = codes.RENTAL_CRP_DSC_APY_DTL_CD.find((v) => v.codeId === value)?.codeName;
        }
        if (sellTpCd === '4' && sellDscDvCd === '4') {
          retValue = codes.MSH_PRC_BASE_DSC_TP_ACD.find((v) => v.codeId === value)?.codeName;
        }
        return retValue;
      },
    },
    { fieldName: 'feecDvCd', header: t('MSG_TXT_CHNL_DV'), width: '150', styleName: 'text-center', rules: 'required', editable: true, options: codes.FEE_BASE_MNGT_CHNL_ACD, editor: { type: 'list' } },
    { fieldName: 'pmotCd', header: t('MSG_TXT_DSC_SYST'), width: '150', styleName: 'text-center', editable: true, options: codes.PMOT_CD, editor: { type: 'list' }, firstOption: 'select', firstOptionValue: '', firstOptionLabel: ' ' },
    { fieldName: 'sppDvCd', header: t('MSG_TXT_FULT_DV'), width: '150', styleName: 'text-center', rules: 'required', editable: true, options: codes.RENTAL_COMBI_DV_CD, editor: { type: 'list' } },
    { fieldName: 'svPrd', header: t('MSG_TXT_BS_CYC'), width: '150', styleName: 'text-center', rules: 'required', editable: true, options: codes.MNGT_PRD_ACD, editor: { type: 'list' } },
    { fieldName: 'hgrPdCd', header: t('MSG_TXT_PKG_PD_NO'), width: '150', styleName: 'text-center', editable: true, editor: { maxLength: 10, textCase: 'upper' } },
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '150', styleName: 'text-center', editable: true, options: codes.YN_CD, editor: { type: 'list' } },
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY'), width: '150', styleName: 'text-center', rules: 'required', editable: true, editor: { type: 'btdate', datetimeFormat: 'date' }, datetimeFormat: 'date' },
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY'), width: '150', styleName: 'text-center', editable: true, editor: { type: 'btdate', datetimeFormat: 'date' }, datetimeFormat: 'date' },
    { fieldName: 'sellFee', header: t('MSG_TXT_BASE_PRC'), width: '150', styleName: 'text-right', dataType: 'number', editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 }, editable: true },
    { fieldName: 'totStplMcn', header: t('MSG_TXT_STPL_MCNT'), width: '150', styleName: 'text-right', dataType: 'number', editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 }, editable: true },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGST_PSIC'), width: '150', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DATE'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_PSIC'), width: '150', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (gridUtil.isCreatedRow(grid, index.dataRow) && ['pdCd', 'sellTpCd', 'uswyTpCd', 'hcrDvCd1', 'hcrDvCd2', 'sellDscDvCd', 'sellDscrCd', 'feecDvCd', 'pmotCd', 'sppDvCd', 'svPrd', 'hgrPdCd', 'feeFxamYn', 'apyStrtdt', 'apyEnddt', 'sellFee', 'totStplMcn'].includes(index.column)) {
      return true;
    }
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['hcrDvCd1', 'hcrDvCd2', 'sellDscDvCd', 'sellDscrCd', 'pmotCd', 'hgrPdCd', 'feeFxamYn', 'apyEnddt', 'sellFee', 'totStplMcn'].includes(index.column)) {
      return true;
    }
    return false;
  };
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    // 상품코드 팝업호출
    if (column === 'pdCd') {
      const { result, payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: {
          searchType: pdConst.PD_SEARCH_CODE,
          searchValue: '',
          selectType: pdConst.PD_SEARCH_SINGLE,
        },
      });
      if (result) {
        g.setValue(itemIndex, 'pdCd', payload?.[0].pdCd);
        g.setValue(itemIndex, 'pdNm', payload?.[0].pdNm);
      }
    }
  };
  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const filedName = grid.getDataSource().getOrgFieldName(field);
    if (filedName === 'sellTpCd') {
      grid.setValue(itemIndex, 'sellDscDvCd', '');
      grid.setValue(itemIndex, 'sellDscrCd', '');
    }
    if (filedName === 'sellDscDvCd') {
      grid.setValue(itemIndex, 'sellDscrCd', '');
    }
  };
  // 시작월 종료월 체크
  view.onValidate = async (g, index) => {
    const { apyStrtdt, apyEnddt } = gridUtil.getRowValue(view, index.dataRow);
    if (!isEmpty(apyStrtdt) && !isEmpty(apyEnddt)) {
      if (apyStrtdt > apyEnddt) {
        gridUtil.focusCellInput(view, index.dataRow, 'apyStrtdt');
        return t('MSG_ALT_ABLE_START_DT_PREC_FINS_DT');
      }
    }
  };
});

</script>
