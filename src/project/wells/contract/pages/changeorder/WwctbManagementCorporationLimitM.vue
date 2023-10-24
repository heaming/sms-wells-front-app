<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbManagementCorporationLimitM - 관리법인 주문제한
3. 작성자 : joonghyung.kim
4. 작성일 : 2023.10.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-xxxxxxx] 관리법인 주문제한
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMainDP']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 사업자번호 -->
        <kw-search-item :label="$t('MSG_TXT_ENTRP_NO')">
          <kw-input
            v-model="searchParams.bzrno"
            mask="###-##-#####"
          />
        </kw-search-item>

        <!-- 기준일자 구분 -->
        <kw-search-item :label="t('MSG_TXT_BASE_DT_DV')">
          <kw-field>
            <kw-option-group
              v-model="searchParams.aprReqCtgValid"
              type="checkbox"
              :label="t('MSG_TXT_BASE_DT_IN')"
              :options="aprReqCtCode"
            />
          </kw-field>
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
        <!-- 삭제 -->
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
        <!-- 행추가 -->
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainDPRef"
        name="grdMainDP"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();

const { t } = useI18n();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();

const aprReqCtCode = ref([
  { codeId: true, codeName: t('MSG_TXT_BASE_DT_IN') },
]);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainDPRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'SELL_LM_PROCS_TP_CD',
);

let cachedParams;
const searchParams = ref({
  bzrno: '', // 사업자번호
  aprReqCtgValid: false, // 기준일자 구분
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/changeorder/corp-limits/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainDPRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회 버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  grdMainDPRef.value.getData().clearRows();
  await fetchData();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/contract/changeorder/corp-limits/excel-download', { params: { ...cachedParams } });

  const view = grdMainDPRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 삭제 버튼 클릭
async function onClickDelete() {
  const view = grdMainDPRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/contract/changeorder/corp-limits', { data: [...deletedRows] });

    notify(t('MSG_ALT_DELETED')); // 삭제되었습니다.
    await onClickSearch();
  }
}

// 행추가 버튼 클릭
async function onClickAddRow() {
  const view = grdMainDPRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    sellLmBzrno: searchParams.value.bzrno ?? '',
  });
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = grdMainDPRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/changeorder/corp-limits', changedRows);

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellLmId' }, /* 판매제한ID */
    { fieldName: 'sellLmBzrno' }, /* 판매제한사업자등록번호 */
    { fieldName: 'dlpnrNm' }, /* 거래처명 */
    { fieldName: 'sellLmProcsTpCd' }, /* 판매제한처리유형코드 */
    { fieldName: 'vlStrtDtm' }, /* 유효시작일시 */
    { fieldName: 'vlEndDtm' }, /* 유효종료일시 */
    { fieldName: 'sellLmRsonCn' }, /* 판매제한사유내용 */
    { fieldName: 'fstRgstDtm' }, /* 최초등록일시 */
    { fieldName: 'fstRgstUsrId' }, /* 최초등록사용자ID */
    { fieldName: 'fstRgstUsrNm' }, /* 최초증록사용자이름 */
    { fieldName: 'fnlMdfcDtm' }, /* 최종수정일시 */
    { fieldName: 'fnlMdfcUsrId' }, /* 최종수정사용자ID */
    { fieldName: 'fnlMdfcUsrNm' }, /* 최종수정사용자이름 */
  ];

  const columns = [
    { fieldName: 'sellLmId', visible: false },
    { fieldName: 'sellLmBzrno',
      header: t('MSG_TXT_ENTRP_NO'),
      width: '120',
      styleName: 'text-center',
      editor: { maxLength: 10, type: 'number' },
      displayCallback(grid, index, value) {
        // 사업자번호 3-2-5 형식으로 표시
        if (!isEmpty(value) && value.length === 10) {
          return `${value.substr(0, 3)}-${value.substr(3, 2)}-${value.substr(5, 5)}`;
        }
      },
      rules: 'required',
    }, // 사업자등록번호 [사업자번호]
    { fieldName: 'dlpnrNm',
      header: '거래처명',
      width: '200',
      styleName: 'text-center',
      editable: false,
    }, // 거래처명
    { fieldName: 'sellLmProcsTpCd',
      header: '판매제한처리유형',
      width: '120',
      styleName: 'text-center',
      options: codes.SELL_LM_PROCS_TP_CD,
      editor: {
        type: 'list',
        values: codes.SELL_LM_PROCS_TP_CD.map((item) => item.codeId),
        labels: codes.SELL_LM_PROCS_TP_CD.map((item) => item.codeName),
        textReadOnly: true,
        displayLabels: 'label',
      },
    }, // 판매제한처리유형코드
    {
      fieldName: 'vlStrtDtm',
      header: '유효시작일자',
      width: '140',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'vlEndDtm',
      header: '유효종료일자',
      width: '140',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: { type: 'btdate' },
      rules: 'required',
    },
    { fieldName: 'sellLmRsonCn', header: '판매제한사유내용', width: '300', editable: true },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime', editable: false }, // 최초등록일시 [등록일시]
    { fieldName: 'fstRgstUsrId', visible: false }, // [등록자사번]
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '120', styleName: 'text-center', editable: false }, // 사용자명 [등록자]
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DT'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime', editable: false }, // 최종수정일자 [수정일]
    { fieldName: 'fnlMdfcUsrId', visible: false }, // [수정자사번]
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TIT_MDFC_USR'), width: '120', styleName: 'text-center', editable: false }, // 사용자명 [수정자]
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    if (grid.getColumn(field).name === 'sellLmBzrno') {
      const { sellLmBzrno } = grid.getValues(itemIndex);

      // 사업자 번호 없을 때, 검색 안함. (이전 검색 결과 초기화 없음.(AS-IS 동일))
      if (isEmpty(sellLmBzrno)) {
        return;
      }

      const res = await dataService.get('/sms/common/contract/tax-invoices/business-partners/dealing-partner-code', { params: { bzrno: sellLmBzrno } });
      // console.log(res.data);

      if (isEmpty(res.data)) {
        await alert('사업자번호가 존재하지 않습니다.');
        return;
      }

      grid.setValue(itemIndex, 'dlpnrNm', res.data.dlpnrNm);
    }
  };

  // RowState 가 created 가 아닌 경우, (행추가 아닌 경우)
  // 사업자등록번호 컬럼은 수정할 수 없다.
  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && (index.column === 'sellLmBzrno')) {
      return false;
    }
  };
});
</script>
