<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdySalesTypeVariableListM - 판매유형별 변수관리
                ( W-PD-U-0020M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.05.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 판매유형별 변수관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 판매유형 -->
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 변수명 -->
        <kw-search-item :label="$t('MSG_TXT_VARB_NM')">
          <kw-input
            v-model="searchParams.rgltnVarbNm"
            maxlength="100"
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
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          primary
          dense
          secondary
          :label="$t('MSG_BTN_DEL')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickRemoveRows"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 추가 -->
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 엑셀다운로드 -->
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
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames, getAlreadyItems } from '~sms-common/product/utils/pdUtil';

const { alert, notify } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const currentSearchYn = ref();
const variableCodes = ref([]);

let cachedParams;
const searchParams = ref({
  sellTpCd: '',
  rgltnVarbNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('SELL_TP_CD', 'CHO_FXN_DV_CD', 'COD_PAGE_SIZE_OPTIONS');

// 데이터 불러오기
async function fetchData() {
  const res = await dataService.get('/sms/wells/product/variables/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

// 행 삭제
async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const checkedRowCount = view.getCheckedRows().length;
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount -= checkedRowCount - deletedRows.length;
  if (deletedRows.length) {
    await dataService.delete('/sms/wells/product/variables', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

// 행 추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, { });
  pageInfo.value.totalCount += 1;
}

// 중복 검사
async function checkDuplication() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  const alreadyItems = getAlreadyItems(view, changedRows, 'sellTpCd', 'choFxnDvCd', 'rgltnVarbNm');
  if (alreadyItems.length > 0) {
    // {판매유형/변수구분/변수명}이(가) 중복됩니다.
    let dupItem = getCodeNames(codes, alreadyItems[0].sellTpCd, 'SELL_TP_CD');
    if (alreadyItems[0].choFxnDvCd) {
      dupItem += `/${getCodeNames(codes, alreadyItems[0].choFxnDvCd, 'CHO_FXN_DV_CD')}`;
    }
    if (alreadyItems[0].rgltnVarbId) {
      dupItem += `/${getCodeNames(variableCodes.value, alreadyItems[0].rgltnVarbId)}`;
    }
    // {0}이(가) 중복됩니다.
    notify(t('MSG_ALT_DUP_NCELL', [dupItem]));
    return true;
  }

  const createdRows = gridUtil.getCreatedRowValues(view);
  if (createdRows.length === 0) {
    return false;
  }

  const { data: dupData } = await dataService.post('/sms/wells/product/variables/duplication-check', createdRows);
  if (dupData.data) {
    const dupCodes = dupData.data.split(',', -1);
    const { sellTpCd, choFxnDvCd, rgltnVarbId } = createdRows
      .find((item) => item.sellTpCd === dupCodes[0]
        && item.choFxnDvCd === dupCodes[1]
        && item.rgltnVarbId === dupCodes[2]);
    // {판매유형/변수구분/변수명}이(가) 중복됩니다.
    let dupItem = getCodeNames(codes, sellTpCd, 'SELL_TP_CD');
    if (choFxnDvCd) {
      dupItem += `/${getCodeNames(codes, choFxnDvCd, 'CHO_FXN_DV_CD')}`;
    }
    if (rgltnVarbId) {
      dupItem += `/${getCodeNames(variableCodes.value, rgltnVarbId)}`;
    }
    // 은(는) 이미 DB에 등록되어 있습니다.
    await alert(t('MSG_ALT_EXIST_IN_DB', [dupItem]));
    return true;
  }
  return false;
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (await checkDuplication()) { return; } // 중복 검사
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/product/variables', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/variables', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 상품메타 데이터 불러오기
async function fetchVariables() {
  if (isEmpty(variableCodes.value.length)) {
    const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
    console.log(res);
    if (isEmpty(res.data)) {
      return;
    }
    // console.log('WwpdySalesTypeVariableListM - fetchVariables - res : ', res);
    variableCodes.value = res.data?.map(({ pdPrpMetaId, uiLblCdv }) => ({
      codeId: pdPrpMetaId, codeName: uiLblCdv ? t(uiLblCdv) : uiLblCdv })) ?? [];
    const view = grdMainRef.value?.getView();
    if (view && variableCodes.value.length) {
      const rgltnVarbId = view.columnByName('rgltnVarbId');
      rgltnVarbId.labels = variableCodes.value.map((item) => (item.codeId));
      rgltnVarbId.values = variableCodes.value.map((item) => (item.codeId));
    }
  }
}

await fetchVariables();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 판매유형
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '94',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD,
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
    },
    // 변수구분
    { fieldName: 'choFxnDvCd',
      header: t('MSG_TXT_VAL_GUBUN'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.CHO_FXN_DV_CD,
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
    },
    // 변수명
    { fieldName: 'rgltnVarbNm',
      header: t('MSG_TXT_VARB_NM'),
      width: '162',
      editor: { type: 'list' },
      rules: 'required',
      options: variableCodes.value,
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
    },
    // 변수ID
    { fieldName: 'rgltnVarbId',
      header: t('MSG_TXT_VAL_ID'),
      width: '126',
      styleName: 'text-center',
      rules: 'required',
      editable: false,
    },
    // 노출순서
    { fieldName: 'sortOdr',
      header: t('MSG_TXT_EXPSR_ODR'),
      width: '79',
      editor: { type: 'number', editFormat: '99', maxLength: 2, positiveOnly: true },
      dataType: 'number' },
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
  fields.push({ fieldName: 'varbSn' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const changedFieldName = grid.getColumn(fieldIndex).fieldName;
    if (changedFieldName === 'rgltnVarbNm') {
      view.setValue(itemIndex, 'rgltnVarbId', grid.getValue(itemIndex, 'rgltnVarbNm'));
    }
  };
});
</script>
<style scoped></style>
