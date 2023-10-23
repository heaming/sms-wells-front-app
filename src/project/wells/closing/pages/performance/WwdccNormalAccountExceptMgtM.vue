<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccNormalAccountExceptMgtM - 정상계정 제외관리 - W-CL-U-0067M01
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정상계정 제외관리
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_INQR_BASE')">
          <kw-option-group
            v-model="searchParams.searchGubun"
            type="radio"
            :options="searchGubunCode"
          />
        </kw-search-item>

        <kw-search-item
          v-if="searchParams.searchGubun === '1'"
          :label="$t('MSG_TXT_PRDT_CODE')"
          :max-length="10"
        >
          <kw-input
            v-model="searchParams.pdCd"
          />
        </kw-search-item>

        <kw-search-item
          v-else
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.regDtFrom"
            v-model:to="searchParams.regDtTo"
            rules="date_range_months:1"
          />
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
        <kw-btn
          v-permission:delete
          dense
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
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        v-if="gridControl.gubun === '1'"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :total-count="totalCount"
        @init="initGridMain"
      />
      <kw-grid
        v-else
        ref="grdMainRef"
        name="grdCntr"
        :visible-rows="10"
        :total-count="totalCount"
        @init="initGridCntr"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, getComponentType, useGlobal, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { getSearchGubunAccount } from '~sms-common/closing/utils/clUtil';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue'; // 계약상세번호 팝업

const dataService = useDataService();
const { t } = useI18n();

const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'PMOT_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const searchGubunCode = await getSearchGubunAccount();

let cachedParams;

const searchParams = ref({
  searchGubun: searchGubunCode[0].codeId,
  pdCd: '',
  cntrNo: '',
  cntrSn: '',
  regDtFrom: now.format('YYYYMM01'),
  regDtTo: now.format('YYYYMMDD'),
});

const gridControl = ref({
  gubun: searchGubunCode[0].codeId,
});

async function fetchData() {
  const apiParam = searchParams.value.searchGubun === '1' ? 'by-product' : 'by-contract';

  const res = await dataService.get(`/sms/wells/closing/normal-account/${apiParam}/lists`, { params: { ...cachedParams } });
  const lists = res.data;
  totalCount.value = lists.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(lists);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  gridControl.value.gubun = searchParams.value.searchGubun;

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {});
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.post('/sms/wells/closing/normal-account', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const nomAccExcdIds = deletedRows.map(({ nomAccExcdId }) => nomAccExcdId);
    await dataService.delete('/sms/wells/closing/normal-account', { params: { nomAccExcdIds } });
    await fetchData();
  }
}

async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/closing/normal-account/excel-upload';
  const templateId = 'FOM_NORMAL_ACCOUNT_EXCEPT';
  const { result } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

const isChecked = ref(true);

onMounted(async () => {
  isChecked.value = true;
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'nomAccExcdId', visible: false }, // 정상계정제외ID
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD, editor: { type: 'dropdown' } }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD, editor: { type: 'dropdown' } }, // 판매유형상세
    { fieldName: 'pdHclsfId', header: t('MSG_TXT_PD_HCLSF'), width: '120', styleName: 'text-center', editable: false }, // 상품대분류
    { fieldName: 'pdMclsfId', header: t('MSG_TXT_PD_MCLSF'), width: '120', styleName: 'text-center', editable: false }, // 상품중분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center', rules: 'required' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '120', editable: false }, // 상품명
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '120', styleName: 'text-center' }, // 프로모션코드
    { fieldName: 'pmotNm', header: t('MSG_TXT_PMOT_NM'), width: '120', options: codes.PMOT_CD, editable: false }, // 프로모션명
    { fieldName: 'cntrStrtdt', header: `${t('MSG_TXT_CNTRCT_DT')}(${t('MSG_TXT_STRT')})`, width: '130', styleName: 'text-center', editor: { type: 'btdate' }, datetimeFormat: 'date' }, // 계약시작일
    { fieldName: 'cntrEnddt', header: `${t('MSG_TXT_CNTRCT_DT')}(${t('MSG_TXT_SHUTDOWN')})`, width: '130', styleName: 'text-center', editor: { type: 'btdate' }, datetimeFormat: 'date' }, // 계약종료일
    { fieldName: 'nomAccExcdRsonCn', header: t('MSG_TXT_EXCD_RSON'), width: '200' }, // 제외사유
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 등록일자
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGST_ICHR_NO'), width: '120', styleName: 'text-center', editable: false }, // 등록담당자
    { fieldName: 'fstUserNm', header: t('MSG_TXT_RGST_PSIC'), width: '120', styleName: 'text-center', editable: false }, // 등록담당자명
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 수정일자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_ICHR_NO'), width: '120', styleName: 'text-center', editable: false }, // 수정담당자
    { fieldName: 'fnlUserNm', header: t('MSG_TXT_MDFC_PSIC'), width: '120', styleName: 'text-center', editable: false }, // 수정담당자명
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

const initGridCntr = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'nomAccExcdId', visible: false }, // 정상계정제외ID
    { fieldName: 'cntrNo', visible: false }, // 계약번호
    { fieldName: 'cntrSn', visible: false }, // 계약일련번호
    { fieldName: 'cntrDtl', header: t('MSG_TXT_CNTR_DTL'), width: '120', styleName: 'text-center rg-button-icon--search', button: 'action', rules: 'required' }, // 계약상세
    { fieldName: 'cntrExcdRsonCn', header: t('MSG_TXT_CNTN'), width: '180' }, // 계약제외사유
    { fieldName: 'nomAccExcdRsonCn', header: t('MSG_TXT_EXCD_RSON'), width: '200' }, // 제외사유
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 등록일자
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGST_ICHR_NO'), width: '120', styleName: 'text-center', editable: false }, // 등록담당자
    { fieldName: 'fstUserNm', header: t('MSG_TXT_RGST_PSIC'), width: '120', styleName: 'text-center', editable: false }, // 등록담당자명
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 수정일자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_ICHR_NO'), width: '120', styleName: 'text-center', editable: false }, // 수정담당자
    { fieldName: 'fnlUserNm', header: t('MSG_TXT_MDFC_PSIC'), width: '120', styleName: 'text-center', editable: false }, // 수정담당자명
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellButtonClicked = async (grid) => {
    grid.commit();
    const current = view.getCurrent();
    const { result, payload } = await modal({
      component: 'WwctaContractNumberListP',
    });
    if (result) {
      if (result.length === 0) {
        grid.setValue(current.itemIndex, 'cntrDtl', '');
        grid.setValue(current.itemIndex, 'cntrNo', '');
        grid.setValue(current.itemIndex, 'cntrSn', '');
        return;
      }
      grid.setValue(current.itemIndex, 'cntrDtl', `${payload.cntrNo}-${payload.cntrSn}`);
      grid.setValue(current.itemIndex, 'cntrNo', payload.cntrNo);
      grid.setValue(current.itemIndex, 'cntrSn', payload.cntrSn);
    }
  };
});
</script>
