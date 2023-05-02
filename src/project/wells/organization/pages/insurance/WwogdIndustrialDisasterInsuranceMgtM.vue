<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGD
2. 프로그램 ID : WwogdInddInsrMgtM - 산재보험관리
3. 작성자 : 한용희
4. 작성일 : 2023-04-19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 산재보험관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            clearable
            :placeholder="$t('MSG_TIT_PRTNR_NO')"
          />

          <kw-input
            v-model="searchParams.prtnrKnm"
            icon="search"
            clearable
            readonly
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            :on-click-icon="onClickPrtnrSea"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_BIZ_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.bzStatCd"
            type="radio"
            :options="bizDivOption"
            option-value="value"
            option-label="label"
            first-option="all"
            first-option-value="0"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          grid-action
          :label="t('MSG_BTN_DEL')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickDelete"
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
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
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
          :label="t('MSG_BTN_INDD_ULD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_DTRM')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickConfirm"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useGlobal, useMeta, useDataService, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { modal, notify } = useGlobal();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs().format('YYYYMM');
const bizDivOption = ref([{ value: 1, label: t('MSG_TXT_BLNG_TO') }, { value: 2, label: t('MSG_TXT_CLTN') }]);
const searchParams = ref({
  baseYm: now,
  prtnrNo: undefined,
  prtnrKnm: undefined,
  bzStatCd: '0',
});
let baseYm;
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 파트너 검색
async function onClickPrtnrSea() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.prtnrKnm = payload.prtnrKnm;
    searchParams.value.ogTpCd = payload.ogTpCd;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/insurance/industrial-disaster/pages', {
    params: { ...searchParams.value, ...pageInfo.value },
  });
  return res;
}
// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = '1';
  baseYm = searchParams.value.baseYm;
  const res = await fetchData();
  const { list: insurances, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(insurances);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/insurance/industrial-disaster/excel-download', { params: { ...searchParams.value } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 확정
async function onClickConfirm() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length > 0) {
    await dataService.put('/sms/wells/insurance/industrial-disaster', checkedRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  } else {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  }
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const deletedKeys = deletedRows.map((obj) => ({
      prtnrNo: obj.prtnrNo,
      ogTpCd: obj.ogTpCd,
      dsbYm: obj.dsbYm }));
    await dataService.delete('/sms/wells/insurance/industrial-disaster', { data: deletedKeys });
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 산재보험 업로드
async function onClickExcelUpload() {
  const apiUrl = `/sms/wells/insurance/industrial-disaster/excel-upload/${baseYm}`;
  const templateId = 'FOM_INDD_INSR';
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

onMounted(async () => {
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'level2Nm', header: t('MSG_TXT_RGNL_GRP'), width: '136', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '110', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_CLTN_DT'), width: '106', styleName: 'text-center' },
    { fieldName: 'inddInsrDdctam', header: t('MSG_TXT_DDCTAM'), width: '130', styleName: 'text-center' },
    { fieldName: 'inddInsrUcamAmt', header: t('MSG_TXT_INDD_INSRFE_DDTN_PNPYAM_SUM'), width: '138', styleName: 'text-right' },
    { fieldName: 'inddInsrFnlCnfmYn', header: t('MSG_TXT_DTRM_YN'), width: '130', styleName: 'text-center' },
    { fieldName: 'dsbYm', visible: false },
    { fieldName: 'ogTpCd', visible: false },
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 스크롤 다운 이벤트
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      const res = await fetchData();
      view.getDataSource().addRows(res.data.list);
    }
  };
});

</script>

<style scoped>
</style>
