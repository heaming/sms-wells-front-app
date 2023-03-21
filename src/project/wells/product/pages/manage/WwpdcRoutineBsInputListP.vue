<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsListP - 서비스 - 정기B/S투입정보 (W-PD-U-0043P04)
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
    <kw-form
      :cols="2"
      class="mb40"
    >
      <kw-form-row>
        <!-- 서비스명 -->
        <kw-form-item
          :label="$t('MSG_TXT_SVC_NAME')"
        >
          <kw-input />
        </kw-form-item>
        <!-- 제품명 -->
        <kw-form-item
          :label="$t('MSG_TXT_GOODS_NM')"
        >
          <kw-input />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

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
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, defineGrid } from 'kw-lib';
// import { cloneDeep } from 'lodash-es';

const props = defineProps({
  svPdCd: { type: String, required: true },
  pdctPdCd: { type: String, required: true },
});

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS');

async function fetchData() {
  const { svPdCd, pdctPdCd } = props;
  const res = await dataService.get('/sms/wells/product/bs-works/standards/paging', { params: { svPdCd, pdctPdCd } });
  const { list: tasks, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(tasks);
  view.resetCurrent();
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 단계
    { fieldName: 'col1', header: t('MSG_TXT_STEP'), width: '77', styleName: 'text-center' },
    // 작업구분
    { fieldName: 'col2', header: t('MSG_TXT_WK_CLS'), width: '167', styleName: 'text-center' },
    // 필터/부품명
    { fieldName: 'col3', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '352', styleName: 'text-left' },
    // 방문구분
    { fieldName: 'col4', header: t('TXT_MSG_SV_PRD_UNIT_CD'), width: '140', styleName: 'text-center' },
    // 방문구분
    { fieldName: 'col5', header: t('MSG_TXT_VISIT_TYPE'), width: '140', styleName: 'text-center' },
    // 시작월
    { fieldName: 'col6', header: t('MSG_TXT_STRT_MM'), width: '140', styleName: 'text-center' },
    // 실행횟수
    { fieldName: 'col7', header: t('MSG_TXT_EXEC_COUNT'), width: '140', styleName: 'text-center' },
    // 투입수량
    { fieldName: 'col8', header: t('MSG_TXT_INPUT_COUNT'), width: '140', styleName: 'text-center' },
    // 생활맞춤형필터 여부
    { fieldName: 'col9', header: t('MSG_TXT_LIFE_FILT_YN'), width: '163', styleName: 'text-center' },
    // 등록일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '120', styleName: 'text-center' },
    // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '120', styleName: 'text-center' },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '120', styleName: 'text-center' },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '120', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
});
</script>
<style scoped></style>
