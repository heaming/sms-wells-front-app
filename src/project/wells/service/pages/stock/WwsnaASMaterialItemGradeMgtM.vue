<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaASMaterialItemGradeMgtM(W-SV-U-0115M01) - AS자재 품목등급관리
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.06.16
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - AS자재 품목등급관리 (http://localhost:3000/#/service/wwsna-as-material-item-grade-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_WARE_NO')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            rules="required"
            :disable="true"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
            @change="onChangeWareDtlDvCd"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_ITM_MNGT_GD')">
          <kw-select
            v-model="searchParams.itmMngtGdCd"
            :options="['S', 'A', 'B', 'C', 'D', 'S+A+B', 'C+D']"
            :label="$t('MSG_TXT_ITM_MNGT_GD')"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_YN')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            :label="$t('MSG_TXT_USE_YN')"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_DV')">
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            :label="$t('MSG_TXT_ITM_DV')"
            rules="required"
            :disable="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            :options="codes.MAT_UTLZ_DV_CD"
            :label="$t('MSG_TXT_MAT_DV')"
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
            @change="fetchData"
          />
        </template>
        <kw-btn
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
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
        :visible-rows="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const { notify, alert } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));

const optionsWareNo = ref();

const optionsCrtItmMngtGdCd = [];
optionsCrtItmMngtGdCd.push({ codeId: 'S', codeName: 'S' });
optionsCrtItmMngtGdCd.push({ codeId: 'A', codeName: 'A' });
optionsCrtItmMngtGdCd.push({ codeId: 'B', codeName: 'B' });
optionsCrtItmMngtGdCd.push({ codeId: 'C', codeName: 'C' });
optionsCrtItmMngtGdCd.push({ codeId: 'D', codeName: 'D' });

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  wareDvCd: '2',
  wareDtlDvCd: '',
  wareNo: '',
  itmKndCd: '6',
  useYn: 'Y',
  itmMngtGdCd: '',
  itmPdCd: '',
  matUtlzDvCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const filterCodes = ref({
  wareDtlDvCd: [],
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'USE_YN',
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
);

filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));

// 창고번호 조회
const onChangeWareHouse = async () => {
  // 창고번호 클리어
  searchParams.value.wareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/as-material-item-grades/ware-houses',
    { params: {
      baseYm: searchParams.value.baseYm,
      wareDvCd: searchParams.value.wareDvCd,
      wareDtlDvCd: searchParams.value.wareDtlDvCd,
    } },
  );
  if (result.data.length > 0) {
    optionsWareNo.value = result.data.map((x) => ({
      codeId: x.wareNo,
      codeName: x.wareNm,
    }));
  } else {
    optionsWareNo.value = [];
  }
};

await Promise.all([
  onChangeWareHouse(),
]);

// 기준년월이 변경되었을 때 창고번호 재조회
function onChangeBaseYm() {
  onChangeWareHouse();
}

// 창고세부구분이 변경되었을 때 창고번호 재조회
function onChangeWareDtlDvCd() {
  onChangeWareHouse();
}

// 초기화
function searchConditionReset() {
  searchParams.value.baseYm = dayjs().format('YYYYMM');
  searchParams.value.wareDvCd = '2';
  searchParams.value.wareDtlDvCd = '';
  searchParams.value.wareNo = '';
  searchParams.value.itmKndCd = '6';
  searchParams.value.useYn = 'Y';
  searchParams.value.itmMngtGdCd = '';
  searchParams.value.itmPdCd = '';
  searchParams.value.matUtlzDvCd = '';
}

function onClickReset() {
  searchConditionReset();
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-material-item-grades/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itmGd, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const { baseYm } = searchParams.value;

  if (itmGd.length === 0) {
    await alert(t('MSG_ALT_CRSP_MM_NO_DATA_MTR_CRT'));

    const validRes = await dataService.get('/sms/wells/service/as-material-item-grades/duplication-check', { params: { ...cachedParams } });
    const { data: validYn } = validRes;

    // 데이터가 생성되지 않았을 경우만 생성
    if (validYn === 'N') {
      const createRes = await dataService.post('/sms/wells/service/as-material-item-grades/item-grades', {
        baseYm: searchParams.value.baseYm,
        itmKndCd: searchParams.value.itmKndCd,
      });
      const { processCount } = createRes.data;
      if (processCount > 0) {
        // {0} 월 데이터가 신규 생성되었습니다.
        notify(baseYm.substr(0, 4) - baseYm.substr(4, 2) + t('MSG_ALT_CREATED_NEW_DATA'));
        await fetchData();
      }
      return;
    }
    await alert(baseYm.substr(0, 4) - baseYm.substr(4, 2) + t('MSG_TXT_EXIST_NEW_DATA'));
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itmGd);
  view.resetCurrent();
}

async function onClickSearch() {
  const currentMonth = dayjs().format('YYYYMM');
  const searchBaseYm = `${searchParams.value.baseYm}`;

  if (searchBaseYm > currentMonth) {
    // 기준년월 > 현재년월일 경우 메시지 처리, 현재 월까지만 조회 가능합니다
    await alert(t('MSG_ALT_INQR_CRTL_MM_PSB'));
  } else {
    pageInfo.value.pageIndex = 1;
    const itmMngtGdCd = `${searchParams.value.itmMngtGdCd}`;
    searchParams.value.itmMngtGdCd = itmMngtGdCd.replace(/\+/gi, '');
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);
  modifedData.forEach((item) => {
    item.mngtYm = `${searchParams.value.baseYm}`;
  });

  const res = await dataService.post('/sms/wells/service/as-material-item-grades', modifedData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-material-item-grades/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'asMaterialItemGradeList',
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const fields = [
    { fieldName: 'sapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'jbfMms3OstrQty' },
    { fieldName: 'mlmnOstrQty' },
    { fieldName: 'dAvOstrQty' },
    { fieldName: 'itmMngtGdCd' },
    { fieldName: 'ctrItmMngtGdCd' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'jbfMms3OstrQty', header: t('MSG_TXT_JBF_MMS3_OSTR_SUM'), width: '100', styleName: 'text-right' },
    { fieldName: 'mlmnOstrQty', header: t('MSG_TXT_MM_AV'), width: '100', styleName: 'text-right' },
    { fieldName: 'dAvOstrQty', header: t('MSG_TXT_D_AV'), width: '100', styleName: 'text-right' },
    { fieldName: 'itmMngtGdCd', header: t('MSG_TXT_ITM_MNGT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ctrItmMngtGdCd',
      header: t('MSG_TXT_CTR_MNGT_GD'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      options: optionsCrtItmMngtGdCd,
      editor: { type: 'dropdown' },
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_CTR_RSON'),
      width: '348',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true,
        maxLength: 1000 } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 조정관리등급, 조정사유만 변경가능
    if (['ctrItmMngtGdCd', 'rmkCn'].includes(index.column)) {
      return true;
    }
    return false;
  };
}

</script>
<style scoped>
</style>
