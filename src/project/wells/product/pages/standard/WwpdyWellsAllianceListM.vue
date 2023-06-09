<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdyWellsAllianceListM - 헬스 제휴관리
                ( W-PD-U-0023M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.05.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 헬스 제휴관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 제휴사 -->
        <kw-search-item :label="$t('MSG_TXT_ALLIANCE_COMP')">
          <kw-select
            v-model="searchParams.alncmpCd"
            :options="codes.ALNCMP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 판매유형 -->
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.pdCd"
            maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickSearchPdCdPopup()"
          />
        </kw-search-item>
        <!-- 상품분류 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
        >
          <zwpd-product-classification-select
            ref="classfySelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            search-lvl="2"
            first-option="all"
          />
        </kw-search-item>
        <!-- 적용기간 -->
        <kw-search-item :label="$t('MSG_TXT_ACEPT_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.apyStrtdt"
            v-model:to="searchParams.apyEnddt"
          />
          <!-- rules="date_range_months:1" -->
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
          v-permission:delete
          primary
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickRemoveRows"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
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
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
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
import { useDataService, useMeta, gridUtil, useGlobal, codeUtil, getComponentType, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import { getAlreadyItems, setGridDateFromTo } from '~sms-common/product/utils/pdUtil';

const { notify, modal } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const classfySelRef = ref();
const currentSearchYn = ref();

let cachedParams;
const searchParams = ref({
  alncmpCd: '',
  sellTpCd: '',
  pdNm: '',
  pdCd: '',
  prdtCateHigh: '',
  prdtCateMid: '',
  apyStrtdt: '',
  apyEnddt: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'ALNCMP_CD',
  'SELL_TP_CD',
  'STPL_PRD_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_DSC_TP_CD',
  'RENTAL_CRP_DSCR_CD',
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

async function fetchData() {
  const res = await dataService.get('/sms/wells/product/alliances/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearchPdCdPopup() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.pdCd = rtn.payload?.[0]?.pdCd;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/alliances', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    apyStrtdt: now.format('YYYYMMDD'),
    apyEnddt: '99991231',
  });
}

async function checkDuplication() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  const alreadyItems = getAlreadyItems(view, changedRows, 'pdCd', 'svPdCd', 'stplPrdCd');
  if (alreadyItems.length > 1) {
    // {상품명/서비스명/약정개월}이(가) 중복됩니다.
    const dupItem = `${alreadyItems[0].pdNm}/${alreadyItems[0].svPdNm}/${alreadyItems[0].stplPrdCd}`;
    notify(t('MSG_ALT_DUP_NCELL', [dupItem]));
    return true;
  }

  const createdRows = gridUtil.getCreatedRowValues(view);
  if (createdRows.length === 0) {
    return false;
  }

  const { data: dupData } = await dataService.post('/sms/wells/product/alliances/duplication-check', createdRows);
  if (dupData.data) {
    const dupCodes = dupData.data.split(',', -1);
    const { pdNm, svPdNm, stplPrdCd } = createdRows.find((item) => item.pdCd === dupCodes[0]
        && item.svPdCd === dupCodes[1]
        && item.stplPrdCd === dupCodes[2]);
    const dupItem = `${pdNm}/${svPdNm}/${stplPrdCd}`;
    // 은(는) 이미 DB에 등록되어 있습니다.
    notify(t('MSG_ALT_EXIST_IN_DB', [dupItem]));
    return true;
  }
  return false;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사
  if (await checkDuplication()) { return; } // 중복 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/product/alliances', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/alliances', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  console.log('Start');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 제휴사
    {
      fieldName: 'alncmpCd',
      header: t('MSG_TXT_ALLIANCE_COMP'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.ALNCMP_CD,
    },
    // 판매유형
    {
      fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD,
    },
    // 상품코드
    {
      fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '160',
      styleName: 'text-center',
      editable: false,
      rules: 'required',
    },
    // 상품명
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '207',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 100 },
      rules: 'required',
    },
    // 서비스 코드
    { fieldName: 'svPdCd',
      header: t('MSG_TXT_SVC_CODE'),
      width: '160',
      styleName: 'text-center',
      editable: false,
    },
    // 서비스명
    {
      fieldName: 'svPdNm',
      header: t('MSG_TXT_SVC_NAME'),
      width: '207',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 100 },
    },
    // 약정개월
    { fieldName: 'stplPrdCd',
      header: t('MSG_TXT_STPL_MCNT'),
      width: '110',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.STPL_PRD_CD,
    },
    // 렌탈할인구분
    { fieldName: 'rentalDscDvCd',
      header: t('TXT_MSG_RENTAL_DSC_DV_CD'),
      width: '110',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.RENTAL_DSC_DV_CD,
    },
    // 렌탈할인유형
    { fieldName: 'rentalDscTpCd',
      header: t('MSG_TXT_RENTAL_DSC_TP_CD'),
      width: '110',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.RENTAL_DSC_TP_CD,
    },
    // 렌탈법인할인율
    { fieldName: 'rentalCrpDscrCd',
      header: t('MSG_TXT_RENTAL_CRP_DSC_RT_CD'),
      width: '110',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.RENTAL_CRP_DSCR_CD,
    },
    // 적용시작일
    {
      fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '133',
      editor: { type: 'date' },
      dataType: 'date',
      rules: 'required',
      styleName: 'text-center',
    },
    // 적용종료일
    {
      fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '129',
      editor: { type: 'date' },
      dataType: 'date',
      rules: 'required',
      styleName: 'text-center',
    },
    // 판매조직
    {
      fieldName: 'ogTpCd',
      header: t('MSG_TXT_SELL_OG'),
      width: '110',
      styleName: 'text-center',
      editor: { type: 'list' },
      firstOption: 'empty',
      firstOptionValue: '',
      firstOptionLabel: '',
      placeHolder: '',
      rules: 'required',
      options: codes.OG_TP_CD,
    },
    // 등록일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center', editable: false },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '100', styleName: 'text-center', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'pdAlncmpBaseId' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'apyStrtdt', 'apyEnddt');
    if (grid.getColumn(fieldIndex).fieldName === 'pdNm' && isEmpty(grid.getValue(itemIndex, 'pdNm'))) {
      data.setValue(itemIndex, 'pdCd', null);
    }
    if (grid.getColumn(fieldIndex).fieldName === 'svPdNm' && isEmpty(grid.getValue(itemIndex, 'svPdNm'))) {
      data.setValue(itemIndex, 'svPdCd', null);
    }
  };

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'pdNm') {
      const pdNm = grid.getValue(itemIndex, 'pdNm');
      const { payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME, searchValue: pdNm },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(itemIndex, 'pdNm', row.pdNm);
        data.setValue(itemIndex, 'pdCd', row.pdCd);
      }
    }
    if (column === 'svPdNm') {
      const svPdNm = grid.getValue(itemIndex, 'svPdNm');
      const { payload } = await modal({
        component: 'ZwpdcServiceListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME, searchValue: svPdNm },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        console.log('row : ', row);
        data.setValue(itemIndex, 'svPdNm', row.pdNm);
        data.setValue(itemIndex, 'svPdCd', row.pdCd);
      }
    }
  };
});
</script>
<style scoped></style>
