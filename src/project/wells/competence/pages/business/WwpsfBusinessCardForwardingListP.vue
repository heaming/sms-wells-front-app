<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardForwardingListP - 명함첩관리 - 연락처 검색"
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리- 연락처 검색"
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-search
      :cols="1"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input v-model.trim="searchParams.fnm" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdPopupRef"
        :visible-rows="5"
        @init="initGrdPopup"
      />
    </div>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useDataService, useModal, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();
const { t } = useI18n();

const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPopupRef = ref(getComponentType('KwGrid'));
let cachedParams;
const totalCount = ref(0);
const searchParams = ref({
  fnm: '',
});

async function fetchPages() {
  const res = await dataService.get('/sms/wells/competence/business/partner', { params: { ...cachedParams } });
  const view = grdPopupRef.value.getView();
  totalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

const onClickSearch = async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
};

const onClickConfirm = async () => {
  const view = grdPopupRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    ok(checkedRows);
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdPopup = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'realFpath' },
    { fieldName: 'fnm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },

  ];

  const columns = [
    {
      fieldName: 'realFpath',
      header: t('MSG_TXT_BCD_IMG'),
      width: '100',
      styleName: 'text-center rg-thumb-100--rounded',
      renderer: { // 이 부분을 추가해준다.
        type: 'image',
        imageField: 'realFpath', // base64 이미지 데이터
        imageWidth: 80,
        imageHeight: 80, // 이미지 높이
      },
    },

    { fieldName: 'fnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_MPNO'),
      width: '120',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}`;
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
  view.displayOptions.rowHeight = 100;
});

onMounted(async () => {
  await onClickSearch();
});
</script>
<style scoped></style>
