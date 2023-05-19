<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtM - 삼성전자 상품관리
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(확정일) 화면
****************************************************************************************************
--->
<template>
  <kw-search>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_DUEDT')"
        required
      >
        <kw-date-range-picker
          rules="date_range_required|date_range_months:1"
          :label="$t('MSG_TXT_DUEDT')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_ORD_TYP')"
      >
        <kw-option-group
          type="radio"
          :label="$t('MSG_TXT_ORD_TYP')"
          :options="[$t('MSG_TXT_ALL'), $t('MSG_TXT_RENTAL'), $t('MSG_TXT_SNGL_PMNT')]"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SM_ORD_NO')"
      >
        <kw-input :label="$t('MSG_TXT_SM_ORD_NO')" />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_SERIAL_NO')"
      >
        <kw-input :label="$t('MSG_TXT_SERIAL_NO')" />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <h3>결과조회</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount.grdMain" />
      </template>
      <kw-btn
        icon="download_off"
        dense
        secondary
        :label="$t('MSG_TXT_TEMP_DOWN')"
      />
      <kw-btn
        icon="upload_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_UPLOAD')"
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount.grdMain===0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount.grdMain"
      @init="initGrdMain"
    />
    <h3>업로드 미리보기</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="pageInfo.totalCount.grdUploadPrev"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdUploadPrevRef"
      name="grdUploadPrev"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount.grdUploadPrev"
      @init="initGrdUploadPrev"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, gridUtil, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: {
    grdMain: 0,
    grdUploadPrev: 0,
  },
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));
const grdUploadPrevRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_ORD_TYP'), width: '136', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '253' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_CODE'), width: '168', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SM_ORD_NO'), width: '168', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_INST_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_CNT_CD'), width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_SERIAL_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_SM_MOD_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_EXL_UPL_DT'), width: '170', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_BAT_EXEC_DT'), width: '170', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_REG_NON_PMT'), width: '146.8', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '김고객', col3: '렌탈', col4: '비스포크냉장고코타화이트', col5: '1234', col6: '1234567890', col7: '2022-10-05', col8: '(01)성공OK', col9: '-', col10: 'QX3F5AET900171', col11: 'DV17B8720BP', col12: '2022-10-01 09:23:10', col13: '2022-10-01 12:23:10', col14: 'Y' },
  ]);
});

const initGrdUploadPrev = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_WALL_MNT_ORD_NO'), width: '148', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_ORD_NO'), width: '148', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_UNUITM'), width: '200' },
    { fieldName: 'col5', header: t('MSG_TXT_INST_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SERIAL_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RSV_DATE'), width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_STOCK_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_INST_CLS'), width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_SM_SRV_MOD_NM'), width: '166', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '-', col3: '1234567890', col4: '특이사항내용이 들어감..', col5: '2022-10-05', col6: '003F5AET900171', col7: '2022-10-05', col8: '2022-10-05', col9: '-', col10: '-' },
  ]);
});
</script>
<style scoped>
</style>
