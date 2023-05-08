<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGD
2. 프로그램 ID : WwogdInddInsrMgtM - 서비스센터 조 관리
3. 작성자 : 이한울
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스센터 조 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CLSFICATN_OF_BUSINS')"
          required
        >
          <kw-option-group
            :label="$t('MSG_TXT_CLSFICATN_OF_BUSINS')"
            :model-value="'전체'"
            type="radio"
            :options="['전체', '재직', '해약']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            icon="search"
            clearable
          />
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_DEL')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondry
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_DTRM')"
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_INDD_ULD')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil } from 'kw-lib';

const { t } = useI18n();
const { currentRoute } = useRouter();

const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

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
    { fieldName: 'col1', header: t('MSG_TXT_RGNL_GRP'), width: '136', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '88', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CRLV'), width: '78', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SRTUP'), width: '106', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col7', header: t('MSG_TXT_CLTN_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col8', header: t('MSG_TXT_DDCTAM'), width: '138', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_INDD_INSRFE_DDTN_PNPYAM_SUM'), width: '174', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },

  ]);
});

</script>

<style scoped>
</style>
