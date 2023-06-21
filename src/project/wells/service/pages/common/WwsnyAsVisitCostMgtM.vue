<!--
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNY (기준정보)
 2. 프로그램 ID : PGE_SNY_00005 - 유상 AS 출장비 관리 (W-SV-U-0101M01)
 3. 작성자 : gs.piit122
 4. 작성일 : 2022.11.18
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 유상 AS 출장비 관리 (http://localhost:3000/#/service/recap-as-bstr-costs)
 ****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--상품그룹-->
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <!-- 저장 -->
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <!-- 삭제 -->
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
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
        <kw-date-range-picker
          dense
          class="w320"
          :from-placeholder="$t('MSG_TXT_APY_STRT_D_CHO')"
          :to-placeholder="$t('MSG_TXT_APY_END_D_CHO')"
        />
        <!-- TODO: 적용일자 일괄변경 -->
        <kw-btn
          :label="$t('MSG_BTN_APY_DT_BLK_CH')"
          secondary
          dense
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <!-- 자재구분 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_MAT_DV') }}
          </p>
          <kw-field
            :model-value="[]"
          >
            <template #default="{ field }">
              <!-- TODO: 현재적용자재 -->
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_CRTL_APY_MAT')"
                val="현재적용자재"
                dense
              />
            </template>
          </kw-field>
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-action-bottom />
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
import { notify, gridUtil, defineGrid, useMeta, codeUtil, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
);
const productCode = ref();
watch(() => [searchParams.value.year, searchParams.value.pdGrpCd], async () => {
  // productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGrpCd);
  const tempVal = await getPartMaster(undefined, searchParams.value.pdGrpCd);
  productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.codeName }));
}, { immediate: true });

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-visit-costs/paging', { params: {
    ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);
  modifedData.forEach((item) => {
    const oldData = gridUtil.getOrigRowValue(view, item.dataRow);
    item.oldApyStrtdt = oldData.apyStrtdt;
    item.oldApyEnddt = oldData.apyEnddt;
    item.oldRmkCn = oldData.rmkCn;
  });
  await dataService.put('/sms/wells/service/as-visit-costs', modifedData);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-visit-costs/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  gridUtil.deleteCheckedRows(view);
}

// async function changePdGrpCd() {
//   if (searchParams.value.pdGrpCd) {
//     pds.value = await getPartMaster('4', searchParams.value.pdGrpCd, 'M');
//   } else pds.value = [];
// }
// pds.value = await getPartMaster('4', null, 'M');
// console.log(pds.value);
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, /* SAP자재코드 */
    { fieldName: 'pdCd' }, /* 상품코드 */
    { fieldName: 'pdNm' }, /* 상품명 */
    { fieldName: 'izSn' }, /* 내역일련번호 */
    { fieldName: 'bstrCsAmt', dataType: 'number' }, /* 출장비용금액 */
    { fieldName: 'apyStrtdt', dataType: 'date' }, /* 유효시작일시 */
    { fieldName: 'apyEnddt', dataType: 'date' }, /* 유효종료일시 */
    { fieldName: 'rmkCn' }, /* 비고내용 */
    { fieldName: 'crtlApyMat', dataType: 'number' }, /* 현재적용자재 */
  ];
  const columns = [
    /* SAP코드 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    /* 품목코드 */
    { fieldName: 'pdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'dropdown' },
      options: codes.PD_CD,
      rules: 'required',
    },
    /* 상품명 */
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '280' },
    /* 적용시작일 */
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 적용종료일 */
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 출장비(원) */
    { fieldName: 'bstrCsAmt',
      header: t('MSG_TXT_TRCS_WON'),
      width: '150',
      styleName: 'text-right',
      editor: { type: 'number', maxLength: 10 },
      rules: 'required',
    },
    /* 비고 */
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '366',
      styleName: 'text-left',
      editor: { maxLength: 1000 },
    },
    /* 현재적용자재 */
    { fieldName: 'crtlApyMat' },
  ];

  const columnLayout = [
    'sapMatCd',
    'pdCd',
    'pdNm',
    'apyStrtdt',
    'apyEnddt',
    'bstrCsAmt',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.editOptions.editable = true;
  // view.setEditOptions({
  //   editable: true,
  //   updatable: true,
  // });

  view.onCellEditable = (grid, index) => {
    if (['bstrCsAmt', 'rmkCn'].includes(index.column)) {
      return true;
    }
    return false;
  };
});
</script>
