<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcLifeCustomFilterListP - 서비스 등록/변경 - 생활맞춤형 제품관리
                 (W-PD-U-0043P03)
3. 작성자 : jintae.choi
4. 작성일 : 2022.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 생활맞춤형 제품 관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="3xl">
    <kw-form>
      <kw-form-row>
        <!-- 서비스명 -->
        <kw-form-item :label="$t('MSG_TXT_SVC_NAME')">
          <kw-input
            v-model="serviceName"
            readonly
          />
        </kw-form-item>
        <!-- 제품명 -->
        <kw-form-item :label="$t('MSG_TXT_GOODS_NM')">
          <kw-input
            v-model="productName"
            readonly
          />
        </kw-form-item>
        <!-- 필터명 -->
        <kw-form-item :label="$t('MSG_TXT_FLTR_NM')">
          <kw-input
            v-model="filterName"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="grdRowCount"
        />
      </template>
      <!-- 삭제 -->
      <kw-btn
        grid-action
        dense
        secondary
        :disable="grdRowCount === 0"
        :label="$t('MSG_BTN_DEL')"
        @click="onClickRemoveRows"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- 행추가 -->
      <kw-btn
        grid-action
        dense
        secondary
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- 저장 -->
      <kw-btn
        grid-action
        dense
        secondary
        :label="$t('MSG_BTN_SAVE')"
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
        secondary
        dense
        :disable="grdRowCount === 0"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, useGlobal, useDataService, getComponentType, defineGrid } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames, getAlreadyItems, getGridRowCount } from '~sms-common/product/utils/pdUtil';

const props = defineProps({
  svPdCd: { type: String, required: true }, // 서비스코드
  pdctPdCd: { type: String, required: true }, // 제품코드
  partPdCd: { type: String, required: true }, // 부품코드
  svPdNm: { type: String, default: '' }, // 서비스명
  pdctPdNm: { type: String, default: '' }, // 제품명
  partPdNm: { type: String, default: '' }, // 부품명
});

const { alert, notify, modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const serviceName = ref();
const productName = ref();
const filterName = ref();

const codes = await codeUtil.getMultiCodes('MM_CD', 'VST_DV_CD');

// 행 추가
async function onClickAdd() {
  const { svPdCd, pdctPdCd, partPdCd } = props;
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, { svPdCd, pdctPdCd, partPdCd }, false);
  grdRowCount.value = getGridRowCount(view);
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  // const { svPdNm, pdctPdNm, partPdNm, svPdCd, pdctPdCd, partPdCd } = props;
  const { svPdNm, pdctPdNm, partPdNm } = props;
  const view = grdMainRef.value.getView();
  // const res = await dataService.get('/sms/wells/product/bs-works/life-filters',
  // { params: { svPdCd, pdctPdCd, partPdCd } });
  await gridUtil.exportView(view, {
    fileName: `${svPdNm}_${pdctPdNm}_${partPdNm}_`,
    timePostfix: true,
  });
}

// 데이터 불러오기
async function fetchData() {
  const { svPdCd, pdctPdCd, partPdCd } = props;
  if (isEmpty(svPdCd) || isEmpty(pdctPdCd) || isEmpty(partPdCd)) {
    return;
  }
  const res = await dataService.get('/sms/wells/product/bs-works/life-filters', { params: { svPdCd, pdctPdCd, partPdCd } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  gridUtil.init(view);
  grdRowCount.value = getGridRowCount(view);
}

// 행 삭제
async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/bs-works/life-filters', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
  grdRowCount.value = getGridRowCount(view);
}

// 중복체크
async function checkDuplication() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  const alreadyItems = getAlreadyItems(view, changedRows, 'vstDvCd', 'prdMmVal', 'chPdctPdCd');
  if (alreadyItems.length > 0) {
    // {방문구분/월구분/계절필터명}이(가) 중복됩니다.
    let dupItem = alreadyItems[0].vstDvCd;
    if (alreadyItems[0].vstDvCd) {
      dupItem += `/${getCodeNames(codes, alreadyItems[0].vstDvCd, 'VST_DV_CD')}`;
    }
    if (alreadyItems[0].prdMmVal) {
      dupItem += `/${getCodeNames(codes, alreadyItems[0].prdMmVal, 'MM_CD')}`;
    }
    if (alreadyItems[0].chPdctPdNm) {
      dupItem += `/${alreadyItems[0].chPdctPdNm}`;
    }
    notify(t('MSG_ALT_DUP_NCELL', [dupItem]));
    return true;
  }

  const createdRows = gridUtil.getCreatedRowValues(view);
  if (createdRows.length === 0) {
    return false;
  }

  const { data: dupData } = await dataService.post('/sms/wells/product/bs-works/life-filters/duplication-check', createdRows);
  if (dupData.data) {
    const dupCodes = dupData.data.split(',', -1);
    const { vstDvCd, prdMmVal, chPdctPdNm } = createdRows
      .find((item) => item.vstDvCd === dupCodes[0]
        && item.prdMmVal === dupCodes[1]
        && item.chPdctPdCd === dupCodes[2]);
    let dupItem = '';
    if (vstDvCd) {
      dupItem += `/${getCodeNames(codes, vstDvCd, 'VST_DV_CD')}`;
    }
    if (prdMmVal) {
      dupItem += `/${getCodeNames(codes, prdMmVal, 'MM_CD')}`;
    }
    if (chPdctPdNm) {
      dupItem += `/${chPdctPdNm}`;
    }
    // {제품명/기기종류/기기유형/가격구분} 은(는) 이미 DB에 등록되어 있습니다.
    await alert(t('MSG_ALT_EXIST_IN_DB', [dupItem]));
    return true;
  }
  return false;
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) return;
  if (!(await gridUtil.validate(view, { isChangedOnly: false }))) return;
  if (await checkDuplication()) { return; } // 중복 검사

  const { svPdCd, pdctPdCd, partPdCd } = props;
  const subList = { svPdCd, pdctPdCd, partPdCd, bases: gridUtil.getAllRowValues(view) };
  console.log('WwpdcLifeCustomFilterListP - onClickSave - subList : ', subList);
  await dataService.put('/sms/wells/product/bs-works/life-filters', subList);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// Props 데이터 설정
async function initProps() {
  const { svPdNm, pdctPdNm, partPdNm } = props;
  serviceName.value = svPdNm;
  productName.value = pdctPdNm;
  filterName.value = partPdNm;
}

await initProps();

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    // 방문구분
    { fieldName: 'vstDvCd',
      header: t('MSG_TXT_VISIT_TYPE'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'list' },
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      options: codes.VST_DV_CD },
    // 월구분
    { fieldName: 'prdMmVal',
      header: t('MSG_TXT_MON_GUBUN'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '70',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'list' },
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      options: codes.MM_CD },
    // 계절필터코드
    { fieldName: 'chPdctPdCd',
      header: t('MSG_TXT_SE_FILTER_CD'),
      width: '120',
      rules: 'required',
      editor: { maxLength: 10 },
      button: 'action',
      styleName: 'text-center rg-button-icon--search',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true }
          : { editable: false, styleName: 'text-center rg-button-hide' };
      },
    },
    // 계절필터명
    { fieldName: 'chPdctPdNm',
      header: t('MSG_TXT_SE_FILTER_NM'),
      width: '120',
      rules: 'required',
      editor: { maxLength: 256 },
      button: 'action',
      styleName: 'text-left rg-button-icon--search',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true }
          : { editable: false, styleName: 'text-left rg-button-hide' };
      },
    },
    // 필터공용코드
    { fieldName: 'filtCmuCdv', header: t('MSG_TXT_FLTER_PUB_CD'), width: '140', editor: { maxLength: 10 } },
    // 공용명
    { fieldName: 'filtCmuNm', header: t('MSG_TXT_PUB_NM'), width: '80', editable: true, editor: { maxLength: 500 } },
    // 공용설명
    { fieldName: 'filtCmuEpl', header: t('MSG_TXT_PUB_DESC'), width: '140', editable: true, editor: { maxLength: 2000 } },
    // 등록일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '80', styleName: 'text-center'/* , renderer: { type: 'button' }, preventCellItemFocus: true */, editable: false },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center'/* , renderer: { type: 'button' }, preventCellItemFocus: true */, editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'svPdCd' });
  fields.push({ fieldName: 'pdctPdCd' });
  fields.push({ fieldName: 'dtlSn' });
  fields.push({ fieldName: 'partPdCd' });

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellButtonClicked = async (grid, { column, dataRow }) => {
    if (column === 'chPdctPdCd' || column === 'chPdctPdNm') {
      const searchParams = column === 'chPdctPdCd' ? {
        searchType: pdConst.PD_SEARCH_CODE,
        searchValue: grid.getValue(dataRow, 'chPdctPdCd'),
      } : {
        searchType: pdConst.PD_SEARCH_NAME,
        searchValue: grid.getValue(dataRow, 'chPdctPdNm'),
      };
      searchParams.selectType = pdConst.PD_SEARCH_SINGLE;

      const { payload } = await modal({
        component: 'ZwpdcMaterialListP',
        componentProps: searchParams,
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(dataRow, 'chPdctPdCd', row.pdCd);
        data.setValue(dataRow, 'chPdctPdNm', row.pdNm);
      }
    }
  };
});
</script>
<style>
.rg-button-hide .rg-button-action {
  display: none !important;
}
</style>
