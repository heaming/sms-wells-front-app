<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsInputListP - 서비스 - 정기B/S투입정보 (W-PD-U-0043P04)
3. 작성자 : jintae.choi
4. 작성일 : 2022.03.31
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
import { codeUtil, gridUtil, useDataService, getComponentType, defineGrid } from 'kw-lib';
import { isEmpty } from 'lodash-es';
// import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';

const props = defineProps({
  svPdCd: { type: String, required: true },
  pdctPdCd: { type: String, required: true },
  svPdNm: { type: String, default: '' },
  pdctPdNm: { type: String, default: '' },
});

const { t } = useI18n();
const dataService = useDataService();
const serviceName = ref();
const productName = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const codes = await codeUtil.getMultiCodes('BFSVC_WK_DV_CD', 'MM_CD', 'SV_PRD_UNIT_CD', 'VST_DV_CD');
codes.MM_CD.map((item) => { item.codeId = Number(item.codeId); return item; });

async function fetchData() {
  const { svPdCd, pdctPdCd } = props;
  if (isEmpty(svPdCd) || isEmpty(pdctPdCd)) {
    return;
  }
  const res = await dataService.get('/sms/wells/product/bs-works/tasks', { params: { svPdCd, pdctPdCd } });
  console.log(res.data);
  const view = grdMainRef.value?.getView();
  view.getDataSource().setRows(res.data ?? []);
  grdRowCount.value = getGridRowCount(view);
  gridUtil.init(view);
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
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 작업구분
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WK_CLS'), width: '80', styleName: 'text-center', options: codes.BFSVC_WK_DV_CD },
    // 단계
    { fieldName: 'filtChngLvCd', header: t('MSG_TXT_STEP'), width: '60', styleName: 'text-center', rules: 'required', dataType: 'number' },
    // 필터/부품명
    { fieldName: 'partPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '180', editable: false },
    // 부품사용수량
    { fieldName: 'partUseQty', header: t('MSG_TXT_WK_QTY'), width: '80', styleName: 'text-right', dataType: 'number' },
    // 방문구분
    { fieldName: 'vstDvCd', header: t('MSG_TXT_VISIT_TYPE'), width: '80', styleName: 'text-center', options: codes.VST_DV_CD },
    // 방문월 (방문차월주기값?)
    { fieldName: 'vstNmnPrdVal', header: t('MSG_TXT_VISIT_MON'), width: '80', styleName: 'text-right', dataType: 'number' },
    // 설치월
    { fieldName: 'istMm', header: t('MSG_TXT_SETUP_MON'), width: '60', styleName: 'text-center', options: codes.MM_CD },
    // 작업연도
    { fieldName: 'strtWkYVal', header: t('MSG_TXT_JOB_YEAR'), width: '60', styleName: 'text-center', dataType: 'number' },
    // 작업월
    { fieldName: 'wkMm', header: t('MSG_TXT_JOB_MON'), width: '60', styleName: 'text-center', dataType: 'number' },
    // 총약정개월
    { fieldName: 'totStplMcn', header: t('MSG_TXT_TOT_COMMIT_MM'), width: '80', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'partPdCd' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
});
</script>
<style scoped></style>
