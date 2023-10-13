<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsInputListP - 서비스 - 정기B/S투입정보 상세/수정
                (W-PD-U-0043P05)
3. 작성자 : jintae.choi
4. 작성일 : 2022.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 정기B/S투입정보 상세/수정 프로그램
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
        spaced
        vertical
        inset
      />
      <!-- 저장 -->
      <kw-btn
        grid-action
        secondary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      @init="initGrdMain"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, useDataService, useGlobal, getComponentType, defineGrid } from 'kw-lib';
import { isEmpty } from 'lodash-es';
// import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';

const props = defineProps({
  svPdCd: { type: String, required: true }, // 서비스 상품 코드
  pdctPdCd: { type: String, required: true }, // 제품코드
  svPdNm: { type: String, default: '' }, // 서비스명
  pdctPdNm: { type: String, default: '' }, // 제품명
});

const { notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const serviceName = ref();
const productName = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const codes = await codeUtil.getMultiCodes('SV_BIZ_DCLSF_CD', 'MM_CD', 'SV_PRD_UNIT_CD', 'VST_DV_CD');
codes.MM_CD.map((item) => { item.codeId = Number(item.codeId); return item; });

// 데이터 불러오기
async function fetchData() {
  const { svPdCd, pdctPdCd } = props;
  if (isEmpty(svPdCd) || isEmpty(pdctPdCd)) {
    return;
  }
  const res = await dataService.get('/sms/wells/product/bs-works/tasks', { params: { svPdCd, pdctPdCd } });
  // console.log(res.data);
  const view = grdMainRef.value?.getView();
  view.getDataSource().setRows(res.data ?? []);
  grdRowCount.value = getGridRowCount(view);
  gridUtil.init(view);
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) {
    return;
  }
  if (!(await gridUtil.validate(view, { isChangedOnly: false }))) {
    return;
  }

  const subList = { details: gridUtil.getChangedRowValues(view) };
  console.log('WwpdcLifeCustomFilterListP - onClickSave - subList : ', subList);
  await dataService.put('/sms/wells/product/bs-works/details', subList);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// 행 삭제
async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/bs-works/details', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
  grdRowCount.value = getGridRowCount(view);
}

// Props 데이터 설정
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
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 작업구분
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WK_CLS'), width: '80', styleName: 'text-center', options: codes.SV_BIZ_DCLSF_CD, editable: false },
    // 단계
    { fieldName: 'filtChngLvCd', header: t('MSG_TXT_STEP'), width: '60', styleName: 'text-center', dataType: 'number', editable: false },
    // 필터/부품명
    { fieldName: 'partPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '180', editable: false },
    // 부품사용수량
    { fieldName: 'partUseQty',
      header: t('MSG_TXT_WK_QTY'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 방문구분
    { fieldName: 'vstDvCd',
      header: t('MSG_TXT_VISIT_TYPE'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',
      options: codes.VST_DV_CD },
    // 방문월
    { fieldName: 'vstNmnN',
      header: t('MSG_TXT_VISIT_MON'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '999', maxLength: 3, positiveOnly: true },
      dataType: 'number' },
    // 설치월
    { fieldName: 'istMm',
      header: t('MSG_TXT_SETUP_MON'),
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
      editor: { type: 'number', editFormat: '9', maxLength: 1, positiveOnly: true },
      dataType: 'number' },
    // 작업월
    { fieldName: 'wkMm',
      header: t('MSG_TXT_JOB_MON'),
      width: '60',
      styleName: 'text-center',
      firstOption: 'empty',
      firstOptionValue: '',
      firstOptionLabel: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      options: codes.MM_CD },
    // 총약정개월
    { fieldName: 'totStplMcn',
      header: t('MSG_TXT_TOT_COMMIT_MM'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '999', maxLength: 3, positiveOnly: true },
      dataType: 'number' },
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
});
</script>
<style scoped></style>
