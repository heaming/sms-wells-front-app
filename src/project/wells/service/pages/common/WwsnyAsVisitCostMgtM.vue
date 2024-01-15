<!--
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNY (기준정보)
 2. 프로그램 ID : WwsnyAsVisitCostMgtM - 유상 AS 출장비 관리 (W-SV-U-0101M01)
 3. 작성자 : gs.piit122
 4. 작성일 : 2022.11.18
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 유상 AS 출장비 관리 (http://localhost:3000/#/service/wwsny-as-visit-cost-mgt)
 ****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
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
        <!-- 삭제 -->
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          inset
          spaced
          vertical
        />
        <!-- 저장 -->
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          inset
          spaced
          vertical
        />
        <kw-btn
          :disable="!isAdd"
          :label="$t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickAdd"
        />
        <kw-separator
          inset
          spaced
          vertical
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          dense
          icon="download_on"
          secondary
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <!-- 자재구분 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_MAT_DV') }}
          </p>
          <kw-field
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <!-- 현재적용자재 -->
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.apyMtrChk"
                :label="$t('MSG_TXT_CRTL_APY_MTR')"
                @update:model-value="onUpdateMtrChk"
              />
            </template>
          </kw-field>
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-action-bottom />
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
import { alert, notify, gridUtil, defineGrid, useMeta, codeUtil, getComponentType, useDataService, confirm } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import { RowState } from 'realgrid';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
  apyMtrChk: 'N',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
);

const curDt = dayjs().format('YYYYMMDD');

const pds = ref([]);
// 상품그룹 변경 시
async function changePdGrpCd() {
  pds.value = [];
  searchParams.value.pdCd = '';

  const { pdGrpCd } = searchParams.value;

  if (isEmpty(pdGrpCd)) return;

  pds.value = await getPartMaster(
    '4',
    searchParams.value.pdGrpCd,
    'M',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'Y',
  );
}

const isAdd = ref(false);
function isValidAddBtn() {
  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    const createdRows = gridUtil.getCreatedRowValues(view);
    isAdd.value = !isEmpty(cachedParams) && cachedParams.pdCd !== '' && isEmpty(createdRows);
  } else {
    isAdd.value = false;
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-visit-costs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  isValidAddBtn();
}

// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (!await gridUtil.validate(view, { isCheckedOnly: true })) { return; }

  const res = await dataService.post('/sms/wells/service/as-visit-costs', chkRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-visit-costs/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 마지막 데이터 찾기
function findLastData(pdCd) {
  const view = grdMainRef.value.getView();
  const rows = gridUtil.filter(view, (e) => e.pdCd === pdCd && e.rowState !== RowState.CREATED);
  const sortRows = rows.sort((a, b) => {
    if (Number(a.izSn) < Number(b.izSn)) return 1;
    if (Number(a.izSn) > Number(b.izSn)) return -1;
    return 0;
  });
  return isEmpty(sortRows) ? '' : sortRows[0];
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return;
  }

  let valid = false;
  checkedRows.forEach((e) => {
    const { apyStrtdt } = e;
    if (apyStrtdt < curDt) {
      valid = true;
      return false;
    }
  });

  if (valid) {
    // 오늘 이후의 건만 삭제할 수 있습니다.
    await alert(t('MSG_ALT_TOD_AF_DEL_VALID'));
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (isEmpty(deletedRows)) {
    const { pdCd } = cachedParams;
    const lastData = findLastData(pdCd);
    if (!isEmpty(lastData) && lastData.apyEnddt === '99991231') {
      const data = grdMainRef.value.getData();
      data.setValue(lastData.dataRow, 'isLast', 'Y');
    }
    isValidAddBtn();
    return;
  }

  const res = await dataService.delete('/sms/wells/service/as-visit-costs', { data: [...deletedRows] });
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

// 적용시작일 찾기
function findLastApyStrtDt(pdCd) {
  const lastData = findLastData(pdCd);

  if (isEmpty(lastData)) {
    return curDt;
  }

  const { apyStrtdt, apyEnddt } = lastData;
  if (apyEnddt === '99991231') {
    return curDt < apyStrtdt ? dayjs(apyStrtdt).add('1', 'day').format('YYYYMMDD') : curDt;
  }

  return dayjs(apyEnddt).add('1', 'day').format('YYYYMMDD');
}

// 행 추가
async function onClickAdd() {
  const { pdGrpCd, pdCd } = cachedParams;

  if (isEmpty(pdGrpCd) || isEmpty(pdCd)) {
    alert(t('MSG_TXT_PD_GRP_PDCT_CHO'));
    return false;
  }

  const view = grdMainRef.value.getView();

  const pdInfo = pds.value.find((v) => v.cd === pdCd);
  const lastData = findLastData(pdCd);
  const apyStrtDt = findLastApyStrtDt(pdCd);
  const izSn = isEmpty(lastData) ? 1 : Number(lastData.izSn) + 1;

  const row = gridUtil.find(view, (e) => e.isLast === 'Y');
  if (!isEmpty(row)) {
    const data = grdMainRef.value.getData();
    data.setValue(row.dataRow, 'isLast', 'N');
    view.checkItem(row.dataRow, false);
  }

  await gridUtil.insertRowAndFocus(view, 0, {
    sapMatCd: Number(pdInfo.sapMatCd),
    pdCd,
    pdNm: pdInfo.cdNm,
    bstrCsAmt: '0',
    apyStrtdt: apyStrtDt,
    apyEnddt: '99991231',
    isLast: 'Y',
    izSn,
  });

  view.checkItem(0, true);
  isValidAddBtn();
}

// 현재적용자재 체크
async function onUpdateMtrChk(val) {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  // 그리드 변경상태가 있을 경우
  if (!isEmpty(changedRows)) {
    if (!await confirm(t('MSG_ALT_CHG_CNTN'))) {
      searchParams.value.apyMtrChk = val === 'Y' ? 'N' : 'Y';
      return;
    }
  }
  await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, /* SAP자재코드 */
    { fieldName: 'pdCd' }, /* 상품코드 */
    { fieldName: 'pdNm' }, /* 상품명 */
    { fieldName: 'izSn' }, /* 내역일련번호 */
    { fieldName: 'bstrCsAmt', dataType: 'number' }, /* 출장비용금액 */
    { fieldName: 'apyStrtdt', dataType: 'date' }, /* 유효시작일시 */
    { fieldName: 'apyEnddt', dataType: 'date' }, /* 유효종료일시 */
    { fieldName: 'rmkCn' }, /* 비고내용 */
    { fieldName: 'isLast' }, /* 현재적용자재 */
  ];
  const columns = [
    /* SAP코드 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '100', styleName: 'text-center' },
    /* 품목코드 */
    { fieldName: 'pdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '120',
      styleName: 'text-center',
      editor: { type: 'dropdown' },
      options: codes.PD_CD,
      rules: 'required',
    },
    /* 상품명 */
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '280' },
    /* 적용시작일 */
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 적용종료일 */
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 출장비(원) */
    { fieldName: 'bstrCsAmt',
      header: t('MSG_TXT_TRCS_WON'),
      width: '150',
      styleName: 'text-right',
      editor: { type: 'number', maxLength: 10, numberFormat: '#,##0' },
      rules: 'required|min_value:1|numeric|max_value:9999999',
    },
    /* 비고 */
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '300',
      styleName: 'text-left',
      editor: { maxLength: 1000 },
    },
    /* 현재적용자재 */
    { fieldName: 'isLast', header: t('MSG_TXT_CRTL_APY_MAT'), width: '100' },
  ];

  const columnLayout = [
    'sapMatCd',
    'pdCd',
    'pdNm',
    'apyStrtdt',
    'apyEnddt',
    'bstrCsAmt',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  // 조건따라 채크박스 disable 처리
  const f = function checked(dataSource, item) {
    if ((data.getValue(item.dataRow, 'isLast') === 'Y')) {
      return true;
    }
    return false;
  };

  view.setCheckBar({ checkableCallback: f });
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.editOptions.editable = true;

  view.onCellEditable = (g, { column, itemIndex, dataRow }) => {
    const { isLast } = g.getValues(itemIndex);
    const isCreated = gridUtil.isCreatedRow(g, dataRow);

    if (isLast !== 'Y') return false;

    // 신규
    if (isCreated) {
      return ['bstrCsAmt', 'rmkCn', 'apyStrtdt'].includes(column);
    }
    return ['bstrCsAmt', 'rmkCn'].includes(column);
  };

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { pdCd, apyStrtdt } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);

    if (changedFieldName === 'apyStrtdt') {
      const lastStrtDt = findLastApyStrtDt(pdCd);
      const formatDt = `${lastStrtDt.substring(0, 4)}-${lastStrtDt.substring(4, 6)}-${lastStrtDt.substring(6, 8)}`;

      if (apyStrtdt < lastStrtDt) {
        // 적용시작일자는 {0} 이후로 입력해 주세요.
        notify(t('MSG_ALT_APY_DT_VALID', [formatDt]));
        grid.setValue(itemIndex, 'apyStrtdt', lastStrtDt);
      }
    }
  };
});
</script>
