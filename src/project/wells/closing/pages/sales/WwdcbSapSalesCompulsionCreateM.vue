<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSapSalesCompulsionCreateM - SAP매출강제생성 - W-CL-U-0112M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.10.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 업무 프로세스로 생성되는 매출분이 아닌, 입력값으로 매출전표데이터를 INSERT 하는 화면 (야채박스 등)
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SL_MM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
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
          v-permission:download
          icon="download_on"
          :disable="totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExportView"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isUndefined, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { notify, alert } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'SAP_TXN_DTFR_CD',
);

const searchParams = ref({
  baseYm: now.format('YYYYMM'), // 매출월
});

// 조회
let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/sap-sales-compulsion', { params: cachedParams });
  console.log(res.data);
  const mainList = res.data;
  totalCount.value = mainList.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainList);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 엑셀 다운로드 버튼 클릭
async function onClickExportView() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 행추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    baseYm: now.format('YYYYMM'),
    zsiodt: dayjs().subtract(0, 'month').endOf('month').format('YYYYMMDD'),
    zsslty: '3006',
    zsorty: '00000003010005',
    zsmtrl: '00000000',
    zsqntt: 0,
    zssamt: 0,
    zsvamt: 0,
    zstaxg: '0',
    zsblty: '4',
    zsreal: 'X',
    zssasl: '2018',
    lggubn: 'LNC31',
    lgmgub: '06',
    lgjdte: now.format('YYYYMMDD'),
  });
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].zsmtrlNm)) {
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_MATI_NM')]));
      return;
    }

    if (changedRows[i].transYn === 'Y') {
      alert(t('MSG_ALT_SAP_TRS_FSH_MDFC_DL_IMP'));
      return;
    }
  }

  await dataService.post('/sms/wells/closing/sap-sales-compulsion/', changedRows);
  await notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/closing/sap-sales-compulsion/', { data: [...deletedRows] });
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
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'zsslrq', header: t('MSG_TXT_SL_SLIP_AK_NO'), width: '160', styleName: 'text-center', editable: false }, // 매출전표요청번호
    { fieldName: 'zsslsq', header: t('MSG_TXT_SERIAL_NUMBER'), width: '100', styleName: 'text-right', editable: false }, // 일련번호
    { fieldName: 'zsiodt', header: t('MSG_TXT_IOST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 입출고일자
    { fieldName: 'zsslty', header: t('MSG_TXT_SALE_TYPE_CD'), width: '100', styleName: 'text-center', editable: false }, // 매출유형
    { fieldName: 'zsorty', header: t('MSG_TXT_ORD_TYP'), width: '150', styleName: 'text-center', editable: false }, // 주문유형
    { fieldName: 'zsmtrl', header: { text: t('MSG_TXT_MATI_CD'), styleName: 'essential' }, rules: 'required', width: '180', styleName: 'text-center' }, // 자재코드
    { fieldName: 'zsmtrlNm', header: t('MSG_TXT_MATI_NM'), width: '160', styleName: 'text-left', editable: false }, // 자재명
    { fieldName: 'zsqntt',
      header: { text: t('MSG_TXT_SL_QTY'), styleName: 'essential' },
      rules: 'required|max:15',
      width: '100',
      dataType: 'number',
      styleName: 'text-right',
      editor: {
        type: 'number',
        maxLength: 15,
      } }, // 매출수량
    { fieldName: 'zssamt',
      header: { text: t('MSG_TXT_SPLPRC'), styleName: 'essential' },
      rules: 'required|max:15',
      width: '100',
      dataType: 'number',
      styleName: 'text-right',
      editor: {
        type: 'number',
        maxLength: 15,
      } }, // 공급가
    { fieldName: 'zsvamt', header: t('MSG_TXT_VAT'), width: '100', dataType: 'number', styleName: 'text-right', editable: false }, // 부가세
    { fieldName: 'zsrtrn', header: t('MSG_TXT_LSTMM_RTNGD_YN'), width: '100', styleName: 'text-center', editable: false }, // 전월반품여부
    { fieldName: 'zsfree', header: t('MSG_TXT_FRISU_YN'), width: '100', styleName: 'text-center', editable: false }, // 무상여부
    { fieldName: 'zsprft', header: t('TXT_MSG_FGPT_YN'), width: '100', styleName: 'text-center', editable: false }, // 사은품여부
    { fieldName: 'zstaxg', header: t('MSG_TXT_TXN_DTFR_DV'), width: '120', styleName: 'text-center', editable: false, options: codes.SAP_TXN_DTFR_CD }, // 과/면세구분
    { fieldName: 'zsblty', header: t('MSG_TXT_TXINV_PBL_BASE'), width: '140', styleName: 'text-center', editable: false }, // 세금계산서 발행기준
    { fieldName: 'zsmngr', header: t('MSG_TXT_PSIC_CD'), width: '140', styleName: 'text-center', editable: false }, // 담당자코드
    { fieldName: 'zsreal', header: t('MSG_TXT_RVPY_YN'), width: '140', styleName: 'text-center', editable: false }, // 수불대상여부
    { fieldName: 'zssasl', header: t('MSG_TXT_SAVE_LCT'), width: '130', styleName: 'text-center', editable: false }, // 저장위치
    { fieldName: 'lggubn', header: t('MSG_TXT_DIV'), width: '140', styleName: 'text-center', editable: false }, // 구분
    { fieldName: 'lgmgub', header: t('MSG_TXT_SL_DV'), width: '140', styleName: 'text-center', editable: false }, // 매출구분
    { fieldName: 'lgjdte', header: t('MSG_TXT_IN_D'), width: '140', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 입력일
    { fieldName: 'transYn', header: t('MSG_TXT_TRS_YN'), width: '140', styleName: 'text-center', editable: false }, // 전송여부
    { fieldName: 'zsifdt', header: t('MSG_TXT_IF_TRS_D'), width: '140', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // IF전송일
    { fieldName: 'zssadt', header: t('MSG_TXT_SAP_RFLT_D'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // SAP반영일
    { fieldName: 'zsslhq', header: t('MSG_TXT_BZ_DEPT'), width: '100', styleName: 'text-center', editable: false }, // 사업부서
    { fieldName: 'zsdept', header: t('MSG_TXT_OG_INF'), width: '100', styleName: 'text-center', editable: false }, // 조직정보
    { fieldName: 'zscust', header: t('MSG_TXT_CST_INF_ID'), width: '120', styleName: 'text-center', editable: false }, // 고객정보ID
    { fieldName: 'updActDt', header: t('MSG_TXT_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime', editable: false }, // 수정일시
    { fieldName: 'updActId', header: t('MSG_TXT_MDFC_USR'), width: '120', styleName: 'text-center', editable: false }, // 수정자
    { fieldName: 'regActDt', header: t('MSG_TXT_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime', editable: false }, // 등록일시
    { fieldName: 'regActId', header: t('MSG_TXT_RGST_USR'), width: '120', styleName: 'text-center', editable: false }, // 등록자
    { fieldName: 'baseYm', visible: false }, // 매출월
  ];
  view.onItemChecked = () => {
    const checkCount = view.getCheckedRows().length;
    if (checkCount === 0) {
      isChecked.value = true;
    } else {
      isChecked.value = false;
    }
  };

  view.onItemAllChecked = () => {
    const checkCount = view.getCheckedRows().length;
    if (checkCount === 0) {
      isChecked.value = true;
    } else {
      isChecked.value = false;
    }
  };
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onKeyDown = async (grid, event) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const searchParam = {};
    const currentColumn = grid.getCurrent().column;
    const key = event.key || event.keyCode;
    if (key === 'Enter' || key === 'Tab') {
      grid.commit();
      searchParam.value = { zsmtrl: dataProvider.getValue(current.dataRow, 'zsmtrl') };
    }

    if (currentColumn === 'zsmtrl' && (key === 'Enter' || key === 'Tab' || key === 13) && !isUndefined(searchParam.value.zsmtrl)) {
      const res = await dataService.get('/sms/wells/closing/sap-sales-compulsion/sap-map-nm', { params: searchParam.value });
      console.log('res:', res);
      if (res.data.length === 0) {
        grid.setValue(current.itemIndex, 'zsmtrl', '');
        grid.setValue(current.itemIndex, 'zsmtrlNm', '');
        return;
      }
      grid.setValue(current.itemIndex, 'zsmtrl', res.data.sapMatCd);
      grid.setValue(current.itemIndex, 'zsmtrlNm', res.data.sapMatNm);
    }
  };
});
</script>
