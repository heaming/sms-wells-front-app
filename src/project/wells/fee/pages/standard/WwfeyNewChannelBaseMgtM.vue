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
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 적용시작일 -->
        <kw-search-item
          :label="$t('MSG_TXT_APY_STRT_DAY')"
          required
        >
          <kw-date-picker
            v-model="searchParams.apyStrtDay"
            :label="$t('MSG_TXT_APY_STRT_DAY')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.prdtCode"
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
            v-model="searchParams.bsCyc"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 할인제도 -->
        <kw-search-item
          :label="$t('MSG_TXT_DSC_SYST')"
        >
          <kw-input
            v-model="searchParams.dscSyst"
          />
        </kw-search-item>
        <!-- 채널구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CHNL_DV')"
        >
          <kw-select
            v-model="searchParams.chnlDv"
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
          :label="$t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickRowAdd"
        />
        <kw-btn
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
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
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

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
  'SELL_TP_CD',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  apyStrtDay: '',
  prdtCode: '',
  prdtName: '',
  sellTpCd: '',
  bsCyc: '',
  dscSyst: '',
  chnlDv: '',

});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.prdtCode,
    selectType: '',
  };
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });
  if (returnPdInfo.result) {
    searchParams.value.prdtCode = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.prdtName = returnPdInfo.payload?.[0].pdNm;
  }
}

async function onUpdatePdCd() {
  searchParams.value.prdtName = '';
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
  await gridUtil.confirmDeleteCheckedRows(view);
}

// 그리드행추가
async function onClickRowAdd() {
  const view = grdRef.value.getView();
  const defaultRow = {
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
  const btOpt = {
    startView: 1,
    minViewMode: 1,
    language: 'ko',
    todayHighlight: true,
  };
  const columns = [
    { fieldName: 'col01', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col02', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'col03', header: t('MSG_TXT_SEL_TYPE'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col04', header: t('MSG_TXT_USWY_DV'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col05', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '150', styleName: 'text-center' },
    { fieldName: 'col06', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '150', styleName: 'text-center' },
    { fieldName: 'col07', header: t('MSG_TXT_PD_DC_CLASS'), width: '150', styleName: 'text-center' },
    { fieldName: 'col08', header: t('MSG_TXT_DISC_CODE'), width: '150', styleName: 'text-center' },
    { fieldName: 'col09', header: t('MSG_TXT_CHNL_DV'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col10', header: t('MSG_TXT_DSC_SYST'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col11', header: t('MSG_TXT_FULT_DV'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col12', header: t('MSG_TXT_BS_CYC'), width: '150', styleName: 'text-center', rules: 'required' },
    { fieldName: 'col13', header: t('MSG_TXT_PKG_PD_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_FXAM_YN'), width: '150', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_APY_STRT_DAY'), width: '150', styleName: 'text-center', rules: 'required', editable: true, editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col16', header: t('MSG_TXT_APY_END_DAY'), width: '150', styleName: 'text-center', editable: true, editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col17', header: t('MSG_TXT_BASE_PRC'), width: '150', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'col18', header: t('MSG_TXT_STPL_MCNT'), width: '150', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_FST_RGST_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'col20', header: t('MSG_TXT_RGST_PSIC'), width: '150', styleName: 'text-center' },
    { fieldName: 'col21', header: t('등록단말'), width: '150', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_MDFC_DATE'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'col23', header: t('수MSG_TXT_MDFC_PSIC정담당자'), width: '150', styleName: 'text-center' },
    { fieldName: 'col24', header: t('수정단말'), width: '150', styleName: 'text-center' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (gridUtil.isCreatedRow(grid, index.dataRow) && ['col01'].includes(index.column)) {
      return true;
    }
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['col01'].includes(index.column)) {
      return true;
    }
    return false;
  };
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    // 상품코드 팝업호출
    if (column === 'col01') {
      const { result, payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: {
          searchType: pdConst.PD_SEARCH_CODE,
          searchValue: '',
          selectType: '',
        },
      });
      if (result) {
        g.setValue(itemIndex, 'col01', payload?.[0].pdCd);
        g.setValue(itemIndex, 'col02', payload?.[0].pdNm);
      }
    }
  };
});

</script>
