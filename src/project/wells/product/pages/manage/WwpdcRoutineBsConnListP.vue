<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsConnListP - 서비스 등록/변경 - 정기B/S투입 필터/부품 연결
                 (W-PD-U-0043P01)
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 목록 조회 및 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="3xl">
    <kw-form :cols="2">
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
        grid-action
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
      @init="initGridMain"
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
import { cloneDeep, isEmpty, split, merge } from 'lodash-es';
// import pdConst from '~sms-common/product/constants/pdConst';
import { getAlreadyItems, getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
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
  searchType: pdConst.PD_SEARCH_NAME,
  searchValue: null,
});
const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_MATERIAL_CD') },
]);
const codes = await codeUtil.getMultiCodes('SV_BIZ_DCLSF_CD', 'MM_CD', 'VST_DV_CD');
codes.MM_CD = codes.MM_CD.map((item) => { item.codeId = Number(item.codeId); return item; });

async function onClickLifeFiltMgt() {
  const view = grdMainRef.value.getView();
  if (!view.getCheckedRows().length) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_BTN_LIFE_FILT_MGT')]));
    return;
  }
  if (view.getCheckedRows().length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
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

async function getCheckAndNotExistRows(view, rows) {
  const alreadyItems = getAlreadyItems(view, rows, 'partPdCd');
  if (rows.length === alreadyItems.length) {
    notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
    return [];
  }
  if (alreadyItems.length > 0) {
    if (alreadyItems.length === 1) {
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [alreadyItems[0].partPdCd]));
    } else {
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [t('MSG_TXT_EXID_CNT', [alreadyItems[0].partPdCd, alreadyItems.length - 1])]));
    }
    const alreadyPdCds = alreadyItems.reduce((rtns, item) => { rtns.push(item.partPdCd); return rtns; }, []);
    return rows.reduce((rtns, item) => {
      if (!alreadyPdCds.includes(item.partPdCd)) {
        rtns.push(item);
      }
      return rtns;
    }, []);
  }
  return rows;
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
      const okRows = await getCheckAndNotExistRows(view, rows);
      if (okRows && okRows.length) {
        await data.insertRows(0, okRows);
        await gridUtil.focusCellInput(view, 0);
      }
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
      row.svPdCd = svPdCd;
      row.pdctPdCd = pdctPdCd;
      row.partPdCd = row.pdCd;
      row.partPdNm = row.pdNm;
      row.filtChngLvCd = 1;
      const okRows = await getCheckAndNotExistRows(view, [row]);
      if (okRows && okRows.length) {
        await gridUtil.insertRowAndFocus(view, 0, okRows[0]);
      }
    }
  }
  grdRowCount.value = getGridRowCount(view);
}

async function onClickLoadRoutineBsFltPart() {
  const { svPdCd, pdctPdCd } = props;
  const view = grdMainRef.value.getView();
  const { result, payload } = await modal({
    component: 'WwpdcRoutineBsLoadListP',
    componentProps: {},
  });
  if (result) {
    if (Array.isArray(payload) && payload.length > 0) {
      const data = view.getDataSource();
      const rows = payload.map((item) => merge(item, { svPdCd, pdctPdCd, dtlSn: null }));
      const okRows = await getCheckAndNotExistRows(view, rows);
      if (okRows && okRows.length) {
        await data.insertRows(0, okRows);
        await gridUtil.focusCellInput(view, 0);
      }
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
  // console.log('WwpdcRoutineBsConnListP - fetchData - res : ', res.data);
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

  const bases = gridUtil.getAllRowValues(view);
  const details = [];
  if (bases.length) {
    bases.forEach((base) => {
      // 서비스 주기
      const servicePeriod = Number(base.svPrdMmN);
      // 시작월
      const startMonth = Number(base.svStrtmmN);
      // 반복횟수
      const repeatCount = Number(base.svTms);
      // 제외월
      const exceptMonths = split(base.excdMmVal, ',').reduce((rtns, mon) => { if (Number(mon)) rtns.push(Number(mon)); return rtns; }, []);
      // 설치월
      const installMonth = Number(base.istMm);
      // 작업연도
      const workYear = Number(base.strtWkYVal);
      // 총약정개월
      const totStplMcn = Number(base.totStplMcn);
      if (startMonth) {
        // 시작월이 있는 경우
        for (let i = 1; i <= (repeatCount + exceptMonths.length); i += 1) {
          // 시작월과 설치월중 하나는 0의 값을 가진다.
          const vstNmnN = (servicePeriod * (i - 1)) + (startMonth + installMonth);
          // 방문월이 > 총약정월 넘으면 중단
          if (vstNmnN > totStplMcn) {
            break;
          }
          if (!exceptMonths.includes(vstNmnN)) {
            // 제외월이면 건너 뜀
            details.push({
              // 방문월 : 서비스주기(*반복차수) + 시작월
              ...base, vstNmnN,
            });
          }
        }
        // 제외월이 없음
      } else {
        // 시작월이 없는 경우
        for (let i = 1; i <= repeatCount; i += 1) {
          const dtl = cloneDeep(base);
          // 상세 작업연도 = Base에 시작연도 + ( 반복차수 * 주기연도 )
          dtl.strtWkYVal = workYear + ((i - 1) * Math.floor(servicePeriod / 12));
          details.push(dtl);
        }
      }
    });
  }

  const subList = { svPdCd, pdctPdCd, bases, details };
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
const initGridMain = defineGrid((data, view) => {
  const columns = [
    // 작업구분
    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_WK_CLS'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '80',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'list' },
      options: codes.SV_BIZ_DCLSF_CD },
    // 단계
    { fieldName: 'filtChngLvCd',
      header: t('MSG_TXT_STEP'),
      width: '60',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'number' },
      dataType: 'number',
    },
    // 필터/부품명
    { fieldName: 'partPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '180', editable: false },
    // 방문구분
    { fieldName: 'vstDvCd',
      header: t('MSG_TXT_VISIT_TYPE'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.VST_DV_CD },
    // 작업수량
    { fieldName: 'partUseQty',
      header: t('MSG_TXT_WK_QTY'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12 },
      dataType: 'number' },
    // 서비스주기
    { fieldName: 'svPrdMmN',
      header: t('MSG_TXT_SVC_BETWEEN'),
      width: '90',
      styleName: 'text-center',
      rules: 'required',
      editor: { type: 'number', editFormat: '999', maxLength: 3 },
      dataType: 'number' },
    // 시작월
    { fieldName: 'svStrtmmN',
      header: t('MSG_TXT_STRT_MM'),
      width: '60',
      styleName: 'text-center',
      editor: { type: 'number', editFormat: '999', maxLength: 3 },
    },
    // 반복횟수
    { fieldName: 'svTms',
      header: t('MSG_TXT_REPEAT_COUNT'),
      width: '60',
      styleName: 'text-right',
      rules: 'required',
      editor: { type: 'number', editFormat: '999', maxLength: 3 },
      dataType: 'number' },
    // 총약정개월
    { fieldName: 'totStplMcn',
      header: t('MSG_TXT_TOT_COMMIT_MM'),
      width: '60',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '99', maxLength: 4 },
      dataType: 'number' },
    // 제외월
    { fieldName: 'excdMmVal',
      header: t('MSG_TXT_EXCEPT_MONS'),
      editor: { maxLength: 100, inputCharacters: '0-9,' },
      width: '80' },
    // 설치월
    { fieldName: 'istMm',
      header: t('MSG_TXT_SETUP_MON'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '60',
      styleName: 'text-center',
      firstOption: 'empty',
      firstOptionValue: '',
      firstOptionLabel: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      options: codes.MM_CD },
    // 작업연도
    { fieldName: 'strtWkYVal',
      header: t('MSG_TXT_JOB_YEAR'),
      width: '60',
      styleName: 'text-center',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number' },
    // 작업월
    { fieldName: 'wkMm',
      header: t('MSG_TXT_JOB_MON'),
      placeHolder: t('MSG_TXT_SELT'),
      width: '60',
      styleName: 'text-center',
      firstOption: 'empty',
      firstOptionValue: '',
      firstOptionLabel: t('MSG_TXT_SELT'),
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
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const changedFieldName = grid.getColumn(fieldIndex).fieldName;
    if (['svPrdMmN', 'svStrtmmN', 'svTms', 'excdMmVal', 'istMm', 'wkMm'].includes(changedFieldName)) {
      const servicePeriod = Number(grid.getValue(itemIndex, 'svPrdMmN'));
      const startMonth = Number(grid.getValue(itemIndex, 'svStrtmmN'));
      const repeatCount = Number(grid.getValue(itemIndex, 'svTms'));
      // 제외월
      const exceptMonth = grid.getValue(itemIndex, 'excdMmVal');
      const exceptMonths = split(exceptMonth, ',').reduce((rtns, mon) => { if (Number(mon)) rtns.push(Number(mon)); return rtns; }, []);
      // 설치월
      const installMonth = Number(grid.getValue(itemIndex, 'istMm'));
      // 작업월
      const workMonth = Number(grid.getValue(itemIndex, 'wkMm'));
      if (changedFieldName === 'svStrtmmN' && startMonth) {
        console.log(`servicePeriod: ${servicePeriod} startMonth: ${startMonth} repeatCount: ${repeatCount} exceptMonths: ${exceptMonths.length}`);
        grid.setValue(itemIndex, 'istMm', null);
        grid.setValue(itemIndex, 'strtWkYVal', null);
        grid.setValue(itemIndex, 'wkMm', null);
        // const countTotalValue = (startMonth * (repeatCount + exceptMonths.length)) + servicePeriod;
        // grid.setValue(itemIndex, 'totStplMcn', countTotalValue);
      } else if (['istMm', 'wkMm'].includes(changedFieldName) && (installMonth || workMonth)) {
        console.log(`installMonth: ${installMonth} workMonth: ${workMonth} repeatCount: ${repeatCount} exceptMonths: ${exceptMonths.length}`);
        grid.setValue(itemIndex, 'svStrtmmN', null);
        grid.setValue(itemIndex, 'excdMmVal', null);
        // const countTotalValue = (installMonth * (repeatCount + exceptMonths.length)) + servicePeriod;
        // grid.setValue(itemIndex, 'totStplMcn', countTotalValue);
        // // 작업연도
        // if (installMonth <= workMonth) {
        //   grid.setValue(itemIndex, 'strtWkYVal', 0);
        // } else {
        //   grid.setValue(itemIndex, 'strtWkYVal', 1);
        // }
      }
      view.resetCurrent();
    }
  };
});
</script>
<style scoped></style>
