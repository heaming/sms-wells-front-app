<!--
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNY (기준정보)
 2. 프로그램 ID : PGE_SNY_00005 - 유상 AS 출장비 관리 (W-SV-U-0101M01)
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
            first-option="select"
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
        <kw-btn
          :disable="isDisable"
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
        <!--        <kw-separator
          inset
          spaced
          vertical
        />
        <kw-date-range-picker
          :from-placeholder="$t('MSG_TXT_APY_STRT_D_CHO')"
          :to-placeholder="$t('MSG_TXT_APY_END_D_CHO')"
          class="w320"
          dense
        />
        <kw-btn
          :label="$t('MSG_BTN_APY_DT_BLK_CH')"
          dense
          secondary
        />-->
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <!-- 자재구분 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_MAT_DV') }}
          </p>
          <kw-field
            v-model="searchParams.apyMtrChk"
          >
            <template #default="{ field }">
              <!-- TODO: 현재적용자재 -->
              <kw-checkbox
                :label="$t('MSG_TXT_CRTL_APY_MAT')"
                dense
                v-bind="field"
                val="현재적용자재"
              />
            </template>
          </kw-field>
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
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
import { alert, notify, gridUtil, defineGrid, useMeta, codeUtil, getComponentType, useDataService }
  from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
// eslint-disable-next-line no-unused-vars
import dayjs from 'dayjs';

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isDisable = ref(false);
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

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
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
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-visit-costs/paging', { params: {
    ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
  isDisable.value = false;
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);
  modifedData.forEach((item) => {
    const oldData = gridUtil.getOrigRowValue(view, item.dataRow);
    item.oldApyStrtdt = oldData.apyStrtdt;
    item.oldApyEnddt = oldData.apyEnddt;
    item.oldRmkCn = oldData.rmkCn;
  });
  await dataService.put('/sms/wells/service/as-visit-costs', modifedData);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-visit-costs/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) return;
  if (checkedRows[0].isLast === 'Y') {
    gridUtil.deleteCheckedRows(view);
    isDisable.value = false;
  } else alert('현재적용자재만 삭제 가능합니다.');
}

async function onClickAdd() {
  if (isEmpty(searchParams.value.pdGrpCd) || isEmpty(searchParams.value.pdCd)) {
    alert('상품그룹 및 제품을 선택해주세요');
    return false;
  }

  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    sapMatCd: '',
    pdCd: searchParams.value.pdCd,
    pdNm: '',
    bstrCsAmt: '0',
    apyStrtdt: dayjs().add('1', 'day').format('YYYYMMDD'),
    apyEnddt: '99991231',
    isLast: 'Y',
  });
  isDisable.value = true;
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
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    /* 품목코드 */
    { fieldName: 'pdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '180',
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
  view.checkBar.exclusive = true;
  view.rowIndicator.visible = true;

  view.editOptions.editable = true;
  // view.setEditOptions({
  //   editable: true,
  //   updatable: true,
  // });

  view.onCellEditable = (g, { column, itemIndex, dataRow }) => {
    // if (['bstrCsAmt', 'rmkCn'].includes(column) && g.getValues(itemIndex).isLast === 'Y') {
    //   return true;
    // }
    if (['bstrCsAmt', 'rmkCn', 'apyStrtdt'].includes(column)
    && gridUtil.isCreatedRow(g, dataRow)
    && g.getValues(itemIndex).isLast === 'Y') {
      return true;
    }
    return false;
  };
});
</script>
