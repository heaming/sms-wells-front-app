<!----
    ****************************************************************************************************
    * 프로그램 개요
    ****************************************************************************************************
    1. 모듈 : CTC
    2. 프로그램 ID : WwctcEntrepreneurJoinLimitOjMgtM - 사업자가입제한관리 관리
    3. 작성자 : gs.ritvik.m / Myoungbin Joo
    4. 작성일 : 2023.01.26
    ****************************************************************************************************
    * 프로그램 설명
    ****************************************************************************************************
    - 사업자가입제한관리 화면
    ****************************************************************************************************
    --->
<template>
  <kw-page>
    <kw-observer
      ref="obsTabRef"
      name="obsTab"
    >
      <kw-search
        :modified-targets="['grdMain']"
        @search="onClickSearch"
      >
        <kw-search-row>
          <kw-search-item :label="$t('MSG_TXT_OCCUR_DATE')">
            <kw-date-range-picker
              v-model:from="searchParams.sellLmOcStm"
              v-model:to="searchParams.sellLmOcDtm"
            />
          </kw-search-item>
          <kw-search-item :label="$t('MSG_TXT_ENTRP_NO')">
            <kw-input
              v-model="searchParams.sellLmBzrno"
              icon="search"
              mask="###-##-#####"
              @click-icon="onClickBzrno"
            />
          </kw-search-item>
          <kw-search-item :label="$t('MSG_TXT_BSN_NM')">
            <kw-input
              v-model="searchParams.dlpnrNm"
              :maxlength="100"
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
              :total-count="pageInfo.totalCount"
              :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
              @change="onClickSearch"
            />
          </template>
          <kw-btn
            v-permission:delete
            grid-action
            :label="$t('MSG_BTN_DEL')"
            @click="onClickDelete"
          />
          <kw-separator
            spaced
            vertical
            inset
          />
          <kw-btn
            v-permission:create
            grid-action
            :label="$t('MSG_BTN_ROW_ADD')"
            @click="onClickAdd"
          />
          <kw-btn
            v-permission:update
            grid-action
            :label="$t('MSG_BTN_SAVE')"
            @click="onClickSave"
          />
          <kw-separator
            spaced
            vertical
            inset
          />
          <!--
          <kw-btn
            icon="download_on"
            secondary
            dense
            :label="$t('MSG_BTN_FILE_UPLOAD_FORM')"
            @click="onclickExcelTemplatDownload"
          />
          -->
          <kw-btn
            v-permission:create
            icon="upload_on"
            secondary
            dense
            :label="$t('MSG_BTN_FILE_UPLOAD')"
            @click="onClickExcelUpload"
          />
          <kw-btn
            v-permission:download
            icon="download_on"
            dense
            secondary
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            :disable="(pageInfo.totalCount === 0)"
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
        <kw-pagination
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </div>
    </kw-observer>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, defineGrid, codeUtil, useDataService, useGlobal, useMeta, modal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();
const { alert } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_LM_RSON_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  sellLmOcDtm: '',
  sellLmOcStm: '',
  sellLmBzrno: '',
  dlpnrNm: '',
  dlpnrCd: '',
});

const isSellLmOcStmEmpty = computed(() => isEmpty(searchParams.value.sellLmOcStm));
const isSellLmOcDtmEmpty = computed(() => isEmpty(searchParams.value.sellLmOcDtm));

let cachedParams;

// onClickAdd: 행추가 이벤트
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
}

// fetchData: 조회
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/sales-limits/business-partners/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  pageInfo.value = pagingResult;

  dataSource.checkRowStates(false);
  dataSource.setRows(pages);
  dataSource.checkRowStates(true);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// onClickSearch: 조회버튼 클릭 이벤트
async function onClickSearch() {
  const paramsValue = searchParams.value;

  if ((isEmpty(paramsValue.sellLmOcStm) && isEmpty(paramsValue.sellLmOcDtm))
     && isEmpty(paramsValue.dlpnrNm) && isEmpty(paramsValue.sellLmBzrno)) {
    alert(t('MSG_ALT_REQ_INPUT_VAL', [t('MSG_TXT_OCCUR_DATE'), t('MSG_TXT_ENTRP_NO'), t('MSG_TXT_BSN_NM')]));
    return;
  }

  if ((isSellLmOcStmEmpty.value && !isSellLmOcDtmEmpty.value)
     || (!isSellLmOcStmEmpty.value && isSellLmOcDtmEmpty.value)) {
    alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_OCCR_DATE')]));
    return;
  }

  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(paramsValue);
  await fetchData();
}

// onClickSave: 저장 이벤트
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.post(
    '/sms/wells/contract/sales-limits/business-partners',
    changedRows,
  );
  notify(t('MSG_ALT_SAVE_DATA'));
  onClickSearch();
}

// onClickDelete: 삭제 이벤트
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  const deleteKeys = deletedRows.map((row) => row.sellLmId);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/sales-limits/business-partners', { data: deleteKeys });
    onClickSearch();
  }
}
/*
async function onclickExcelTemplatDownload() {
  getStandardFormFile('FOM_CTC_0001');
}
*/

// onClickExcelDownload: 엑셀 다운로드 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/sales-limits/business-partners/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// onClickExcelUpload: 엑셀 업로드 이벤트
async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/contract/sales-limits/business-partners/excel-upload';
  const templateId = 'FOM_CTC_0001';

  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    const { processCount, errorInfo } = payload;
    if (processCount > 0) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    } else {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}
// callBzrnoPopup: 고객 조회 팝업
async function callBzrnoPopup() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      bzrno: searchParams.value.sellLmBzrno,
      cstType: '2',
    },
  });
  if (result) {
    searchParams.value.sellLmBzrno = payload.bzrno;
  }
}

// onClickBzrno: 사업자번호 아이콘 클릭 이벤트
async function onClickBzrno() {
  callBzrnoPopup();
}

/*
onMounted(async () => {
  await fetchData();
});
*/
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellLmDv' },
    { fieldName: 'sellLmBzrno' },
    { fieldName: 'dlpnrNm' },
    { fieldName: 'dlgpsNm' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'sellLmRsonCd' },
    { fieldName: 'sellLmOcDtm' },
    { fieldName: 'sellLmRlsDtm' },
    { fieldName: 'sellLmRson' },
    { fieldName: 'sellLmPsicNm' },
    { fieldName: 'sellLmPsicNmEncr' },
    { fieldName: 'sellLmRlsPsicNm' },
    { fieldName: 'sellLmRlsPsicNmEncr' },
    { fieldName: 'sellLmId' },
  ];

  const columns = [
    { fieldName: 'sellLmDv', header: t('MSG_TXT_INF_CLS'), width: '142', styleName: 'text-center', editable: true, editor: { type: 'list' }, options: [{ codeId: '3', codeName: t('MSG_TXT_RGS') }, { codeId: '4', codeName: t('MSG_TXT_RSTRCT') }], rules: 'required' }, /* 공통코드 미존재로 하드코딩 설정 */
    { fieldName: 'sellLmBzrno', header: t('MSG_TXT_ENTRP_NO'), width: '127', styleName: 'text-center', editable: true, editor: { maxLength: 10, mask: { editMask: '000-00-00000' } }, rules: 'required', maxLength: 10 },
    { fieldName: 'dlpnrNm', header: t('MSG_TXT_BSN_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'dlgpsNm', header: t('MSG_TXT_RPRS_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: false, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRsonCd', header: t('MSG_TXT_DFT_CD'), width: '211', styleName: 'text-center', editable: true, editor: { type: 'list' }, options: codes.SELL_LM_RSON_CD },
    { fieldName: 'sellLmOcDtm', header: t('MSG_TXT_OCCUR_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' }, rules: 'required' },
    { fieldName: 'sellLmRlsDtm', header: t('MSG_TXT_CNC_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRson', header: t('MSG_TXT_OCC_RSN'), width: '376', styleName: 'text-left', editable: true, editor: { type: 'text', maxLength: 1000 } },
    { fieldName: 'sellLmPsicNmEncr', header: t('MSG_TXT_RGST_ICHR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'sellLmRlsPsicNmEncr', header: t('MSG_TXT_CNC_INCHR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'sellLmId', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const { fieldName } = grid.getColumn(fieldIndex);
    const sellLmRlsDtm = grid.getValue(itemIndex, 'sellLmRlsDtm');
    const sellLmOcDtm = grid.getValue(itemIndex, 'sellLmOcDtm');

    if (fieldName === 'sellLmBzrno') {
      const sellLmBzrno = grid.getValue(itemIndex, fieldIndex);
      const searchOgParams = ref({
        bzrno: isEmpty(sellLmBzrno) ? '' : sellLmBzrno,
      });

      const res = await dataService.get('/sms/wells/contract/partners', { params: searchOgParams.value });
      const bzrno = res.data;

      if (bzrno.length > 0) {
        view.setValue(itemIndex, 'dlpnrNm', bzrno[0].dlpnrNm);
        view.setValue(itemIndex, 'dlgpsNm', bzrno[0].dlgpsNm);
        view.setValue(itemIndex, 'bryyMmdd', bzrno[0].bryyMmdd);
      } else {
        view.setValue(itemIndex, 'dlpnrNm', '');
        view.setValue(itemIndex, 'dlgpsNm', '');
        view.setValue(itemIndex, 'bryyMmdd', '');
      }
    } else if (fieldName === 'sellLmRlsDtm') {
      if (!isEmpty(sellLmRlsDtm)) {
        if (sellLmRlsDtm.length === 0) {
          grid.setValue(itemIndex, 'sellLmRlsDtm', null);
        } else if (sellLmRlsDtm < sellLmOcDtm) {
          grid.setValue(itemIndex, 'sellLmOcDtm', sellLmRlsDtm);
        }
      }
    } else if (fieldName === 'sellLmOcDtm') {
      if (!isEmpty(sellLmOcDtm)) {
        if (sellLmOcDtm > sellLmRlsDtm) {
          grid.setValue(itemIndex, 'sellLmRlsDtm', sellLmOcDtm);
        }
      }
    }
  };

  view.onEditCanceled = async (grid, { itemIndex, column, fieldIndex }) => {
    if (column === 'sellLmBzrno') {
      const sellLmBzrno = grid.getValue(itemIndex, fieldIndex);
      const searchOgParams = ref({
        bzrno: isEmpty(sellLmBzrno) ? '' : sellLmBzrno,
      });

      const res = await dataService.get('/sms/wells/contract/partners', { params: searchOgParams.value });
      const bzrno = res.data;

      if (bzrno.length > 0) {
        view.setValue(itemIndex, 'dlpnrNm', bzrno[0].dlpnrNm);
        view.setValue(itemIndex, 'dlgpsNm', bzrno[0].dlgpsNm);
        view.setValue(itemIndex, 'bryyMmdd', bzrno[0].bryyMmdd);
      }
    } else if (column === 'sellLmRlsDtm') {
      if (grid.getValue(itemIndex, fieldIndex).length === 0) {
        grid.setValue(itemIndex, 'sellLmRlsDtm', null);
      }
    }
  };
});

</script>
