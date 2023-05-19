<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadForInstallLocationP - 대량 접수자료 업로드(설치처) 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 접수자료 업로드(설치처) 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    title="$t('MSG_TXT_UPL_MASS_APP_DATA')"
  >
    <kw-action-top>
      <template #left>
        <span>총</span>
        <span class="accent pl4">0건</span>
      </template>
      <kw-btn
        icon="upload_on"
        dense
        :label="$t('MSG_BTN_EXCEL_UP')"
      />
      <kw-btn
        icon="download_off"
        dense
        :label="$t('MSG_BTN_TEMP_DOWN')"
        :disable="pageInfo.totalCount===0"
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

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_RGST')"
      />
    </template>
  </kw-popup>
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
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));

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
  ];

  const columns = [
    { fieldName: 'col1', header: `${t('MSG_TXT_DIV')} (1:일시불, 2:렌탈, 6:정기배송)`, width: '267', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_Y'), width: '125', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_CD'), width: '125', styleName: 'text-center' },
    { fieldName: 'col4', header: `${t('MSG_TXT_SERIAL_NUMBER')}(렌탈/일시불:0)`, width: '204', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CST_NM'), width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_ZIP'), width: '128', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_ADDR'), width: '263', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_TEL_NO'), width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1', col2: '2022', col3: '1234567', col4: '1', col5: '김고객', col6: '123-12', col7: '서울시 종로구 을지로 100길 10', col8: '010-0000-0000', col9: '02-000-0000' },
  ]);
});
</script>
