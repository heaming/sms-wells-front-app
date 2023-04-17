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
 - 유상 AS 출장비 관리 (http://localhost:3000/#/service/recap-as-bstr-costs)
 ****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
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
          :label="$t('MSG_BTN_ROW_ADD')"
          dense
          secondary
          @click="onClickAddRow"
        />
        <kw-btn
          :label="$t('MSG_BTN_ROW_DEL')"
          dense
          secondary
          @click="onClickDelRow"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-action-bottom />
      <kw-action-bar>
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          primary
          @click="onClickSave"
        />
      </kw-action-bar>
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
import { notify, gridUtil, defineGrid, useMeta, codeUtil, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const searchParams = ref({
  pdCd: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const pds = await getPartMaster();

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-visit-costs/paging', { params: {
    ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    pdCd: searchParams.value.pdCd ? searchParams.value.pdCd : '',
  });
}
async function onClickDelRow() {
  const view = grdMainRef.value.getView();
  gridUtil.deleteCheckedRows(view);
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
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdCd' }, /* 상품코드 */
    { fieldName: 'izSn' }, /* 내역일련번호 */
    { fieldName: 'bstrCsAmt', dataType: 'number' }, /* 출장비용금액 */
    { fieldName: 'apyStrtdt', dataType: 'date' }, /* 유효시작일시 */
    { fieldName: 'apyEnddt', dataType: 'date' }, /* 유효종료일시 */
    { fieldName: 'rmkCn' }, /* 비고내용 */
  ];
  const columns = [
    /* 상품코드 */
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_NM'),
      width: '150',
      styleName: 'text-left',
      editor: { type: 'dropdown' },
      options: pds.map((x) => ({ codeId: x.cd ? x.cd : '', codeName: x.cdNm ? x.cdNm : '' })),
      rules: 'required',
    },
    /* 출장비용금액 */
    { fieldName: 'bstrCsAmt',
      header: t('MSG_TXT_BSTR_CS_AMT'),
      width: '50',
      styleName: 'text-right',
      editor: { type: 'number', maxLength: 10 },
      rules: 'required',
    },
    /* 유효시작일시 */
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRTDT'),
      width: '50',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 유효종료일시 */
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_ENDDT'),
      width: '50',
      styleName: 'text-center',
      editor: { type: 'date' },
      rules: 'required',
    },
    /* 비고내용 */
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '350',
      styleName: 'text-left',
      editor: { maxLength: 1000 },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setEditOptions({
    editable: true,
    updatable: true,
  });
});
</script>
