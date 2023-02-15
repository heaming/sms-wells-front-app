<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartListM - 교재/자재 목록 (W-PD-U-0040M01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 목록 조회 및 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 상품구분 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_GUBUN')">
          <kw-select
            v-model="searchParams.pdTpCd"
            :options="codes.PD_TP_CD"
            :readonly="true"
          />
        </kw-search-item>
        <!-- AS부품명 -->
        <kw-search-item :label="$t('MSG_TIT_AS_PART_NM')">
          <kw-input
            v-model.trim="searchParams.pdNm"
          />
        </kw-search-item>
        <!-- AS부품코드 -->
        <kw-search-item :label="$t('MSG_TIT_AS_PART_CD')">
          <kw-input
            v-model.trim="searchParams.pdCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- AS부품 분류 -->
        <kw-search-item
          :label="$t('MSG_TIT_AS_PART_CLASSIFICATION')"
          :colspan="2"
        >
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            first-option="all"
            first-option-value="ALL"
            search-lvl="2"
          />
        </kw-search-item>
        <!-- 자재코드 -->
        <kw-search-item :label="$t('MSG_TXT_MATI_CD')">
          <kw-input
            v-model.trim="searchParams.sapMatCd"
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
          v-permission:create
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_SUMMARY_SRCH')"
          @click="onClickSummarySearch"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_AS_PART_REG')"
          @click="onClickAdd"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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
import { useDataService, useMeta, gridUtil, codeUtil, useGlobal, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const { notify, modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const route = useRoute();
const router = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';
const codes = await codeUtil.getMultiCodes('PD_TP_CD', 'PD_TEMP_SAVE_CD', 'COD_YN', 'COD_PAGE_SIZE_OPTIONS');
const page = ref({
  reg: '/product/wwpdc-as-part-list/wwpdc-as-part-mgt', // 교재/자재 등록 UI
  detail: '/product/wwpdc-as-part-list/wwpdc-as-part-dtl', // 교재/자재 상세보기 UI
});

let cachedParams;
const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_MATERIAL,
  pdNm: '',
  pdCd: '',
  prdtCateHigh: '',
  prdtCateMid: '',
  sapMatCd: '',
});

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: material, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(material);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelUpload() {
  notify('기능 확인 중... TBD');
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: t('MSG_TIT_AS_PART_MGT'),
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickAdd() {
  // await router.push({ path: page.value.reg });
  await router.push({ path: page.value.reg });
}

async function onClickSummarySearch() {
  const view = grdMainRef.value.getView();

  if (view.getCheckedRows().length === 0) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_BTN_SUMMARY_SRCH')]));
  } else if (view.getCheckedRows().length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
  } else {
    const checkedRow = gridUtil.getCheckedRowValues(view);

    await modal({
      component: 'WwpdcAsPartSummaryDtlP',
      componentProps: { pdCd: checkedRow[0].pdCd },
    });
  }
}

async function openMaterialPopup(pdCd, tempSaveYn) {
  const targetUrl = tempSaveYn === 'Y' ? page.value.reg : page.value.detail;
  await router.push({ path: targetUrl, query: { pdCd, tempSaveYn } });
}

watch(() => route.query, async (query) => {
  console.log('query', query);
  if (query.isSearch) onClickSearch();
  // if (query.closeTargetUi ?? false) await router.close(query.closeTargetUi);
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '90', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD }, /* 상태 */
    { fieldName: 'pdTpCd', header: t('MSG_TXT_DIV'), width: '90', styleName: 'text-center', options: codes.PD_TP_CD }, /* 구분 */
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176' }, /* 분류 */
    { fieldName: 'pdNm', header: t('MSG_TIT_AS_PART_NM'), width: '195' }, /* 교재/자재명 */
    { fieldName: 'pdCd', header: t('MSG_TIT_AS_PART_CD'), width: '100', styleName: 'rg-button-link', renderer: { type: 'button' }, preventCellItemFocus: true }, /* 제품코드 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '195' }, /* 자재코드 */
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '195' }, /* 약어 */
    // 사용자 관련 공통 컬럼
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, /* 등록일 */
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, /* 등록자 */
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, /* 최종수정일 */
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, /* 최종수정자 */
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.checkBar.showAll = false;
  view.checkBar.exclusive = false;
  view.displayOptions.selectionStyle = 'singleRow';

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'pdCd') {
      // [reg & detail] Link
      const pdCd = g.getValue(itemIndex, 'pdCd');
      const tempSaveYn = g.getValue(itemIndex, 'tempSaveYn');
      openMaterialPopup(pdCd, tempSaveYn);
    } else if (['fstRgstUsrNm', 'fnlMdfcUsrNm'].includes(column)) {
      // NameTag Link
      const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, itemIndex);
      const userId = column === 'fstRgstUsrNm' ? fstRgstUsrId : fnlMdfcUsrId;
      await modal({ component: 'ZwcmzUserDtlP', componentProps: { userId } });
    }
  };
});

</script>
<style scoped></style>
