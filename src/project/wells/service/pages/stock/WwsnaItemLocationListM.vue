<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaItemLocationListM(W-SV-U-0137M01) - 품목위치 관리
3. 작성자 : songTaeSung
4. 작성일 : 2023.07.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************

****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_WARE')"
        >
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionStockList"
            first-option="all"
          />
          <kw-field
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.stckStdGb"
                :label="$t('MSG_TXT_STD_NO_APY')"
                @update:model-value="onCheckedStckNoStdGb"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKnd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
        >
          <kw-input />
          <span>~</span>
          <kw-input />
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
        <!-- 저장 -->
        <kw-btn
          grid-action
          :label="$t('MSG_TXT_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 창고유형코드 -->
        <kw-select
          v-model="baseInfo.wareTpCd"
          dense
          class="w150"
          :options="codes.WARE_TP_CD"
        />
        <!-- 위치앵글 -->
        <kw-select
          v-model="baseInfo.lctAngleCd"
          dense
          class="w150"
          :options="codes.LCT_ANGLE_CD"
        />
        <!--위치 층수 -->
        <kw-select
          v-model="baseInfo.lctCofCd"
          dense
          class="w150"
          :options="codes.LCT_COF_CD"
        />
        <!-- 위치 층 번호 -->
        <kw-select
          v-model="baseInfo.lctFlorNoCd"
          dense
          class="w150"
          :options="codes.LCT_FLOR_NO_CD"
        />
        <!-- 위치 자재 그룹 -->
        <kw-select
          v-model="baseInfo.lctMatGrpCd"
          dense
          class="w150"
          :options="codes.LCT_MAT_GRP_CD"
        />
        <!-- 품목위치 일괄변경 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_ITM_LCT_BLK_CH')"
          @click="onClickGridBulkChange"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
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
import { defineGrid, codeUtil, useMeta, useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD', // 품목구분코드
  'WARE_TP_CD', // 창고유형코드
  'LCT_ANGLE_CD', // 위치앵글
  'LCT_COF_CD', // 위치 층수
  'LCT_FLOR_NO_CD', // 위치 층 번호
  'LCT_MAT_GRP_CD', // 위치 자재 그룹
);

const searchParams = ref({
  wareNo: '',
  itmKnd: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
  stckStdGb: 'Y',

});

const baseInfo = ref({
  wareTpCd: '',
  lctAngleCd: '',
  lctCofCd: '',
  lctFlorNoCd: '',
  lctMatGrpCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const allWareNoRes = await dataService.get('/sms/wells/service/item-locations/stock');
const optionStockList = allWareNoRes.data;
searchParams.value.wareNo = optionStockList[0].codeId;

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/service/item-locations/locations/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.setRows(pages);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/item-locations/locations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

async function onClickGridBulkChange() {
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  const { wareTpCd, lctAngleCd, lctCofCd, lctFlorNoCd, lctMatGrpCd } = baseInfo.value;
  for (let i = 0; i < checkedRows.length; i += 1) {
    if (!isEmpty(wareTpCd)) {
      data.setValue(checkedRows[i].dataRow, 'wareTpCd', wareTpCd);
    }
    if (!isEmpty(lctAngleCd)) {
      data.setValue(checkedRows[i].dataRow, 'itmLctAngleVal', lctAngleCd);
    }
    if (!isEmpty(lctCofCd)) {
      data.setValue(checkedRows[i].dataRow, 'itmLctCofVal', lctCofCd);
    }
    if (!isEmpty(lctFlorNoCd)) {
      data.setValue(checkedRows[i].dataRow, 'itmLctFlorNoVal', lctFlorNoCd);
    }
    if (!isEmpty(lctMatGrpCd)) {
      data.setValue(checkedRows[i].dataRow, 'itmLctMatGrpCd', lctMatGrpCd);
    }
  }
  notify(t('MSG_ALT_ATC_BLK_CH_FSH'));
}

async function onClickSave() {
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  await dataService.put('/sms/wells/service/item-locations/locations', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 표준미적용 버튼 클릭시
async function onCheckedStckNoStdGb() {
  const { wareNo, stckStdGb } = searchParams.value;
  const res = await dataService.put('/sms/wells/service/item-locations/standard/locations', { stckStdGb, wareNo });
  const count = res.data;
  if (count > 0) {
    notify(t('MSG_ALT_CHG_DATA'));
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'pdAbbrNm' }, // 품목명
    { fieldName: 'pitmStocAGdQty' }, // 재고
    { fieldName: 'wareTpCd' },
    { fieldName: 'itmLctAngleVal' },
    { fieldName: 'itmLctCofVal' },
    { fieldName: 'itmLctFlorNoVal' },
    { fieldName: 'itmLctMatGrpCd' },
    { fieldName: 'locationCd' },
    { fieldName: 'itmLctNm' },
    { fieldName: 'wareNo' },
    { fieldName: 'itemKndCd' },
    { fieldName: 'stdWareUseYn' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '320', styleName: 'text-left' },
    { fieldName: 'pitmStocAGdQty', header: t('MSG_TXT_STOC'), width: '80', styleName: 'text-center' },
    { fieldName: 'wareTpCd',
      header: t('MSG_TXT_WARE'),
      width: '80',
      styleName: 'text-center',
      options: codes.WARE_TP_CD,
      editor: { type: 'list' },
      editable: true,
    },
    { fieldName: 'itmLctAngleVal',
      header: t('MSG_TXT_ANGLE'),
      width: '80',
      styleName: 'text-center',
      options: codes.LCT_ANGLE_CD,
      editor: { type: 'list' },
      editable: true },
    { fieldName: 'itmLctCofVal',
      header: t('MSG_TXT_FLOR_CNT'),
      width: '80',
      styleName: 'text-center',
      options: codes.LCT_COF_CD,
      editor: { type: 'list' },
      editable: true },
    { fieldName: 'itmLctFlorNoVal',
      header: t('MSG_TXT_FLOR_NO'),
      width: '96',
      styleName: 'text-center',
      options: codes.LCT_FLOR_NO_CD,
      editor: { type: 'list' },
      editable: true },
    { fieldName: 'itmLctMatGrpCd',
      header: t('MSG_TXT_SAP_GRP'),
      width: '118',
      styleName: 'text-center',
      options: codes.LCT_MAT_GRP_CD,
      editor: { type: 'list' },
      editable: true,
    },
    { fieldName: 'locationCd', header: t('MSG_TXT_LCT_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itmLctNm', header: t('MSG_TXT_LCT_NM'), width: '240', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
});

</script>

<style scoped>
</style>
