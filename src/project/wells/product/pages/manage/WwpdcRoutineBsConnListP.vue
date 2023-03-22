<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsConnListP - 서비스 등록/변경 - 정기B/S투입 필터/부품 연결
                 (W-PD-U-0043P01)
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 목록 조회 및 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="3xl">
    <kw-form>
      <kw-form-row>
        <!-- 서비스명 -->
        <kw-form-item
          :label="$t('MSG_TXT_SVC_NAME')"
        >
          <kw-input
            v-model="serviceName"
            readonly
          />
        </kw-form-item>
        <!-- 제품명 -->
        <kw-form-item
          :label="$t('MSG_TXT_GOODS_NM')"
        >
          <kw-input
            v-model="productName"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top class="mt20">
      <template #left>
        <!-- 필터/부품 -->
        <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_FLT_AND_PART') }}</span>
        <kw-select
          v-model="searchParams.searchType"
          dense
          class="ml12 w98"
          :options="materialSelectItems"
        />
        <kw-input
          v-model="searchParams.searchValue"
          dense
          clearable
          icon="search"
          class="ml8 w204"
          @click-icon="onClickMaterialSchPopup"
        />
      </template>
      <kw-btn
        dense
        secondary
        :disable="grdRowCount === 0"
        :label="$t('MSG_BTN_DEL')"
        @click="onClickRemoveRows"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 정기BS투입 필터/부품 불러오기 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_BTN_LOAD_ROUTINE_BS_FLT_PART')"
        @click="onClickLoadRoutineBsFltPart"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 생활맞춤형필터 관리 -->
      <kw-btn
        primary
        dense
        :disable="grdRowCount === 0"
        :label="$t('MSG_BTN_LIFE_FILT_MGT')"
        @click="onClickLifeFiltMgt"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      @init="initGrid"
    />

    <!-- 정기 B/S투입정보 생성 -->
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_REG_ROUTINE_BS_INFO')"
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
import { cloneDeep, isEmpty } from 'lodash-es';
// import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

const props = defineProps({
  svPdCd: { type: String, required: true },
  pdctPdCd: { type: String, required: true },
  svPdNm: { type: String, default: '' },
  pdctPdNm: { type: String, default: '' },
});

const { modal, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const serviceName = ref();
const productName = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const searchParams = ref({
  searchType: null,
  searchValue: null,
});
const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);
const codes = await codeUtil.getMultiCodes('BFSVC_WK_DV_CD', 'MM_CD', 'SV_PRD_UNIT_CD', 'VST_DV_CD');

async function onClickLoadRoutineBsFltPart() {
  const { svPdCd, pdctPdCd } = props;
  const view = grdMainRef.value.getView();
  const rtn = await modal({
    component: 'WwpdcRoutineBsLoadListP',
    componentProps: {},
  });
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item, svPdCd, pdctPdCd }));
      await data.insertRows(0, rows);
      await gridUtil.focusCellInput(view, 0);
    }
  }
  grdRowCount.value = getGridRowCount(view);
}

async function onClickLifeFiltMgt() {
  const view = grdMainRef.value.getView();
  if (!view.getCheckedRows().length) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (view.getCheckedRows().length !== 1) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_BTN_SUMMARY_SRCH')]));
    return;
  }
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const { partPdCd, partPdNm } = checkedRows[0];
  if (partPdCd) {
    const { svPdCd, pdctPdCd } = props;
    await modal({
      component: 'WwpdcLifeCustomFilterListP',
      componentProps: { svPdCd,
        pdctPdCd,
        partPdCd,
        svPdNm: serviceName.value,
        pdctPdNm: productName.value,
        partPdNm,
      },
    });
  }
}

async function onClickMaterialSchPopup() {
  const { svPdCd, pdctPdCd } = props;
  const view = grdMainRef.value.getView();
  const rtn = await modal({
    component: 'ZwpdcMaterialListP',
    componentProps: searchParams.value,
  });
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = cloneDeep(rtn.payload.map((item) => ({
        ...item, svPdCd, pdctPdCd, partPdCd: item.pdCd, partPdNm: item.pdNm, filtChngLvCd: 1 })));
      data.insertRows(0, rows);
    }
  }
  grdRowCount.value = getGridRowCount(view);
}

async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();
  await gridUtil.confirmDeleteCheckedRows(view);
  grdRowCount.value = getGridRowCount(view);
}

async function fetchData() {
  const { svPdCd, pdctPdCd } = props;
  if (isEmpty(svPdCd) || isEmpty(pdctPdCd)) {
    return;
  }
  const res = await dataService.get('/sms/wells/product/bs-works/standards', { params: { svPdCd, pdctPdCd } });
  console.log(res.data);
  const view = grdMainRef.value?.getView();
  view.getDataSource().setRows(res.data ?? []);
  grdRowCount.value = getGridRowCount(view);
  gridUtil.init(view);
}

async function onClickSave() {
  const { svPdCd, pdctPdCd } = props;
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) {
    return;
  }
  if (!(await gridUtil.validate(view, { isChangedOnly: false }))) {
    return;
  }

  const subList = { svPdCd, pdctPdCd, bases: gridUtil.getAllRowValues(view) };
  console.log('WwpdcRoutineBsConnListP - onClickSave - subList : ', subList);
  await dataService.put('/sms/wells/product/bs-works', subList);

  notify(t('MSG_ALT_SAVE_DATA'));
  gridUtil.reset(grdMainRef.value.getView());
  await fetchData();
}

async function initProps() {
  const { svPdNm, pdctPdNm } = props;
  serviceName.value = svPdNm;
  productName.value = pdctPdNm;
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
    // 작업구분
    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_WK_CLS'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.BFSVC_WK_DV_CD },
    // 단계
    { fieldName: 'filtChngLvCd',
      header: t('MSG_TXT_STEP'),
      width: '60',
      styleName: 'text-center',
      editable: true,
      rules: 'required',
      editor: { type: 'number' },
      dataType: 'number',
    },
    // 필터/부품명
    { fieldName: 'partPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '180', editable: false },
    // 부품사용수량
    { fieldName: 'partUseQty',
      header: t('MSG_TXT_WK_QTY'),
      width: '80',
      styleName: 'text-right',
      editable: true,
      editor: { type: 'number', editFormat: '#,##0' },
      dataType: 'number' },
    // 방문구분
    { fieldName: 'vstDvCd',
      header: t('MSG_TXT_VISIT_TYPE'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.VST_DV_CD },
    // 서비스주기
    { fieldName: 'svPrdMmN',
      header: t('TXT_MSG_SV_PRD_UNIT_CD'),
      width: '90',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.SV_PRD_UNIT_CD },
    // 시작월
    { fieldName: 'svStrtmmN',
      header: t('MSG_TXT_STRT_MM'),
      width: '60',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.MM_CD },
    // 반복횟수
    { fieldName: 'svTms',
      header: t('MSG_TXT_REPEAT_COUNT'),
      width: '60',
      styleName: 'text-right',
      editable: true,
      editor: { type: 'number', editFormat: '#,##0', maxLength: 2 },
      dataType: 'number' },
    // 총약정개월
    { fieldName: 'totStplMcn',
      header: t('MSG_TXT_TOT_COMMIT_MM'),
      width: '60',
      styleName: 'text-right',
      editable: true,
      editor: { type: 'number', editFormat: '999', maxLength: 2 },
      dataType: 'number' },
    // 제외월
    { fieldName: 'excdMmVal',
      header: t('MSG_TXT_EXCEPT_MONS'),
      width: '80',
      styleName: 'text-right',
      editable: true,
      editor: { type: 'number' },
      dataType: 'number' },
    // 설치월
    { fieldName: 'istMm',
      header: t('MSG_TXT_SETUP_MON'),
      width: '60',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.MM_CD },
    // 작업연도
    { fieldName: 'strtWkYVal',
      header: t('MSG_TXT_JOB_YEAR'),
      width: '60',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'number', maxLength: 4 },
      dataType: 'number' },
    // 작업월
    { fieldName: 'wkMm',
      header: t('MSG_TXT_JOB_MON'),
      width: '60',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.MM_CD },
  ];
  const fields = cloneDeep(columns
    .map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
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
});
</script>
<style scoped></style>
