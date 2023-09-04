<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보관리)
2. 프로그램 ID : WwsnyBusinessTypeWorkHourMgtM - 업무유형별 작업시간 관리(K-W-SV-U-0023M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-07-24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고집계현황 http://localhost:3000/#/service/wwsny-business-type-work-hour-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_SV_TP_CD')"
        >
          <!--서비스유형-->
          <kw-select
            v-model="searchParams.svDvCd"
            :options="codes.SV_DV_CD"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
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
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <!--업무유형-->
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="codes.SV_BIZ_DCLSF_CD"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
        >
          <kw-date-picker
            v-model="searchParams.apyDt"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <!--조회구분-->
          <kw-select
            v-model="searchParams.findGb"
            :options="tempOptions.findGb"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
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
          icon="save"
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 적용일자 일괄변경 -->
        <kw-date-picker
          v-model="chgApyDt.apyStrtdt"
          dense
          class="w150"
        />
        <kw-date-picker
          v-model="chgApyDt.apyEnddt"
          dense
          class="w150"
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_APY_DT_BLK_CH')"
          @click="onClickApplyDateBulkChange"
        /><!--적용일자 일괄변경-->
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { getPartMaster } = smsCommon();

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/business-type-work-hour';

const codes = await codeUtil.getMultiCodes(
  'SV_DV_CD',
  'SV_BIZ_DCLSF_CD',
  'PD_GRP_CD',
  'WK_GRP_CD',
);

const tempOptions = {
  findGb: [
    { codeId: '1', codeName: t('MSG_TXT_RGS') }, // 등록
    { codeId: '2', codeName: t('MSG_TXT_NO_RGS') }, // 미등록
  ],
};

const chgApyDt = ref({
  apyStrtdt: now.format('YYYYMMDD'),
  apyEnddt: '99991231',
});

const searchParams = ref({
  svDvCd: '', /* 서비스유형 */
  pdGrpCd: '', /* 상품그룹 */
  pdCd: '', /* 상품 */
  svBizDclsfCd: '', /* 업무유형 */
  apyDt: now.format('YYYYMMDD'), /* 적용일자 */
  findGb: '', /* 조회구분 */
});
let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    const response = await dataService.post(`${baseUrl}`, chkRows);
    console.log(response);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

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

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickApplyDateBulkChange() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
  } else if (!chgApyDt.value.apyStrtdt) {
    notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_APY_STRTDT')]));
  } else {
    for (let i = 0; i < chkRows.length; i += 1) {
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_APY_STRTDT')]));
      data.setValue(chkRows[i].dataRow, 'apyStrtdt', chgApyDt.value.apyStrtdt);
      data.setValue(chkRows[i].dataRow, 'apyEnddt', chgApyDt.value.apyEnddt);
    }
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfCdNm' },
    { fieldName: 'izSn' },
    { fieldName: 'pdNm' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'wkGrpCd' },
    { fieldName: 'wkGrpCdNm' },
    { fieldName: 'ldtm' },
    { fieldName: 'ackmtCt' },
    { fieldName: 'istEgerPsno' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-left', editable: false },
    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_ALTN'),
      width: '80',
      styleName: 'text-center',
      editable: false,
      editor: {
        type: 'list',
      },
      options: codes.SV_BIZ_DCLSF_CD,
    },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_CODE'), width: '50', styleName: 'text-center', editable: false },
    { fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'), // 적용시작일
        // styleName: 'essential',
      },
      width: '150',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      rules: 'required',
      styleName: 'text-center',
    },
    { fieldName: 'apyEnddt',
      header: {
        text: t('MSG_TXT_APY_END_DAY'), // 적용종료일
        // styleName: 'essential',
      },
      width: '150',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      rules: 'required',
      styleName: 'text-center',
    },
    { fieldName: 'wkGrpCd', // 작업그룹
      header: t('MSG_TXT_WK_GRP'),
      width: '80',
      rules: 'required',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: codes.WK_GRP_CD,
    },
    { fieldName: 'ldtm', header: t('MSG_TXT_WK_HH'), width: '80', styleName: 'text-center', rules: 'required' },
    { fieldName: 'ackmtCt', header: t('MSG_TXT_COUNT'), width: '50', styleName: 'text-center', rules: 'required' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onGetEditValue = (grd, idx, editResult) => {
    if (idx.fieldName === 'apyStrtdt') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apyStrtdt', editResult.value);
    }
    if (idx.fieldName === 'apyEnddt') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apyEnddt', editResult.value);
    }
    if (idx.fieldName === 'wkGrpCd') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'wkGrpCd', editResult.value);
    }
    if (idx.fieldName === 'ldtm') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'ldtm', editResult.value);
    }
    if (idx.fieldName === 'ackmtCt') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'ackmtCt', editResult.value);
    }
  };
});
</script>
