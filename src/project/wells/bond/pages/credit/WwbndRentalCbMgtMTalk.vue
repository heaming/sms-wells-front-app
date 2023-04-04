<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BND
2. 프로그램 ID : WwbndRentalCbMgtMTalk ( W-BN-U-0067M01 )- 렌탈CB 알림톡 발송 제외
3. 작성자 : gilyong.han
4. 작성일 : 2023.03.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-[W-BN-U0037] 렌탈CB 알림톡 발송 제외 자료 등록
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :modified-targets="['grdMainTalk']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          @click-icon="onClickCustomer"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </template>
      <kw-btn
        :label="$t('MSG_TXT_DEL')"
        grid-action
        @click="onClickRemove"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_BTN_ROW_ADD')"
        grid-action
        @click="onClickAdd"
      />
      <kw-btn
        :label="$t('MSG_TXT_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        icon="upload_on"
        secondary
        dense
        :label="$t('MSG_BTN_EXCEL_UP')"
        @click="onClickExcelUpload"
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRefTalk"
      :visible-rows="10"
      name="grdMainTalk"
      @init="initGridTalk"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="onChangePageInfo"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  defineGrid,
  getComponentType,
  useMeta,
  gridUtil,
  useGlobal,
  codeUtil,
} from 'kw-lib';
import {
  cloneDeep,
  isEmpty,
} from 'lodash-es';

const {
  modal,
  notify,
} = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const grdMainRefTalk = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const baseUrl = '/sms/wells/bond/rentalCB/notification-talks';
const searchParams = ref({
  cstNo: '',
  cstKnm: '',
  ctntExcdBndBizCd: '02', // 렌탈CB
  ctntExcdOjTpCd: '01', // 고객번호
  ctntExcdMediTpCd: '03', // 알림톡
});

// TODO: [Z-CU-U-0002P01] 화면 팝업
const onClickCustomer = async () => {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    const { cstNo, name } = payload;
    searchParams.value.cstNo = cstNo;
    searchParams.value.cstKnm = name;
  }
};
// 검색 조회
let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: data, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRefTalk.value.getView();
  view.getDataSource().setRows(data);
  view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onChangePageInfo() {
  if (isEmpty(cachedParams)) return;
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRefTalk.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const deletedKeys = deletedRows.map((row) => ({
    bndCntcExcdOjId: row.bndCntcExcdOjId,
  }));
  if (deletedRows.length > 0) {
    await dataService.delete(baseUrl, deletedKeys);
    await fetchData();
  }
}

function onClickAdd() {
  const view = grdMainRefTalk.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    ctntExcdBndBizCd: '02', // 렌탈CB
    ctntExcdOjTpCd: '01', // 고객번호
    ctntExcdMediTpCd: '03', // 알림톡
  });
  view.checkItem(0, true);
}

async function onClickSave() {
  const view = grdMainRefTalk.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.put(baseUrl, changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// TODO: 추후 개발 예정
const onClickExcelUpload = async () => {
  const apiUrl = `${baseUrl}/excel-upload`;
  const templateId = '';
  const {
    result,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
  }
};

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRefTalk.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridTalk = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '450', styleName: 'text-center', rules: 'numeric', editor: { maxLength: 10 } },
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_YM'), width: '498', styleName: 'text-center', editor: { type: 'btdate' }, datetimeFormat: 'YYYY-MM' },
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_YM'), width: '498', styleName: 'text-center', editor: { type: 'btdate' }, datetimeFormat: 'YYYY-MM' },
    { fieldName: 'bndCntcExcdOjId', visible: false },
    { fieldName: 'ctntExcdBndBizCd', visible: false },
    { fieldName: 'ctntExcdOjTpCd', visible: false },
    { fieldName: 'ctntExcdMediTpCd', visible: false },
    { fieldName: 'ctntExcdRsonDvCd', visible: false },
    { fieldName: 'fnlMdfcDtm', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };
});

</script>
