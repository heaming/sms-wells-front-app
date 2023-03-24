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
      <!-- 필터/부품 -->
      <kw-btn
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
      <kw-btn
        dense
        secondary
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
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
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave()"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, useGlobal, useDataService, getComponentType, defineGrid } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';

const props = defineProps({
  svPdCd: { type: String, required: true },
  pdctPdCd: { type: String, required: true },
  partPdCd: { type: String, required: true },
  svPdNm: { type: String, default: '' },
  pdctPdNm: { type: String, default: '' },
  partPdNm: { type: String, default: '' },
});

const { notify, modal } = useGlobal();
const { t } = useI18n();
const router = useRouter();
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

async function onClickAdd() {
  const { svPdCd, pdctPdCd, partPdCd } = props;
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, { svPdCd, pdctPdCd, partPdCd });
  grdRowCount.value = getGridRowCount(view);
}

async function onClickExcelDownload() {
  const { svPdCd, pdctPdCd, partPdCd } = props;
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/bs-works/life-filters', { params: { svPdCd, pdctPdCd, partPdCd } });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchData() {
  const { svPdCd, pdctPdCd, partPdCd } = props;
  if (isEmpty(svPdCd) || isEmpty(pdctPdCd) || isEmpty(partPdCd)) {
    return;
  }
  const res = await dataService.get('/sms/wells/product/bs-works/life-filters', { params: { svPdCd, pdctPdCd, partPdCd } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(cloneDeep(res.data));
  view.resetCurrent();
  grdRowCount.value = getGridRowCount(view);
}

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
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) {
    return;
  }
  if (!(await gridUtil.validate(view, { isChangedOnly: false }))) {
    return;
  }

  const { svPdCd, pdctPdCd, partPdCd } = props;
  const subList = { svPdCd, pdctPdCd, partPdCd, bases: gridUtil.getAllRowValues(view) };
  // console.log('WwpdcLifeCustomFilterListP - onClickSave - subList : ', subList);
  await dataService.put('/sms/wells/product/bs-works/life-filters', subList);
  notify(t('MSG_ALT_SAVE_DATA'));
  gridUtil.reset(view);
  await fetchData();
}

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
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'list' },
      options: codes.VST_DV_CD },
    // 월구분
    { fieldName: 'prdMmVal',
      header: t('MSG_TXT_MON_GUBUN'),
      width: '70',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'list' },
      options: codes.MM_CD },
    // 계절필터코드
    { fieldName: 'chPdctPdCd',
      header: t('MSG_TXT_SE_FILTER_CD'),
      width: '120',
      rules: 'required',
      styleName: 'text-left rg-button-icon--search',
      editor: { maxLength: 10 },
      button: 'action',
    },
    // 계절필터명
    { fieldName: 'chPdctPdNm',
      header: t('MSG_TXT_SE_FILTER_NM'),
      width: '120',
      rules: 'required',
      styleName: 'text-left rg-button-icon--search',
      editor: { maxLength: 256 },
      button: 'action',
    },
    // 필터공용코드
    { fieldName: 'filtCmuCdv', header: t('MSG_TXT_FLTER_PUB_CD'), width: '140', styleName: 'text-center', editor: { maxLength: 10 } },
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
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'chPdctPdCd' || column === 'chPdctPdNm') {
      const searchParams = column === 'chPdctPdCd' ? {
        searchType: pdConst.PD_SEARCH_CODE,
        searchValue: grid.getValue(itemIndex, 'chPdctPdCd'),
      } : {
        searchType: pdConst.PD_SEARCH_NAME,
        searchValue: grid.getValue(itemIndex, 'chPdctPdNm'),
      };
      searchParams.selectType = pdConst.PD_SEARCH_SINGLE;

      const { payload } = await modal({
        component: 'ZwpdcMaterialListP',
        componentProps: searchParams,
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(itemIndex, 'chPdctPdCd', row.pdCd);
        data.setValue(itemIndex, 'chPdctPdNm', row.pdNm);
      }
    }
  };
});
</script>
<style scoped></style>
