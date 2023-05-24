<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadForSinglePaymentP - 일시불 대량 접수자료 업로드
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 일시불 대량 접수자료 업로드
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
      </template>

      <kw-btn
        icon="upload_on"
        dense
        :label="$t('MSG_TXT_EXCEL_UPLOAD')"
        @click="onClickExcelUpload"
      />
      <kw-btn
        icon="download_off"
        dense
        :label="$t('MSG_BTN_TEMP_DOWN')"
        @click="onClickTemplateDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      v-model:page-size="pageInfo.pageSize"
      name="grdMain"
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
import { defineGrid, getComponentType, useMeta, gridUtil, codeUtil } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

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
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DV_1'), width: '111', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_DV_2'), width: '125', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '125' },
    { fieldName: 'col4', header: t('MSG_TXT_ALNC_CD'), width: '125', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_PD_DC_CLASS'), width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_DISC_CODE'), width: '282', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_FRISU_MSH'), width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_FRISU_AS'), width: '125', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_KWK'), width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CST_NM'), width: '125', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_BIRTH_DATE'), width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_GENDER_MF'), width: '128', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_TEL_NO'), width: '128', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_ZIP'), width: '128', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_ADDR'), width: '275', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_DT_OF_SALE'), width: '128', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_CLSF_BS'), width: '128', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_CLSF_BUS'), width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'BW', col2: '16', col3: '3020', col4: '50', col5: '1', col6: '36. 무상멤버십 3년', col7: '36', col8: '36', col9: '123456789', col10: '김고객', col11: '1990-01-01', col12: '1', col13: '010-0000-0000', col14: '02-000-0000', col15: '123-12', col16: '서울시 종로구 을지로 100길 10', col17: '2022-10-10', col18: '1', col19: '11' },

  ]);
});
</script>
