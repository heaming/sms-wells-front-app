<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebHomeMasterGradeRegM - 홈마스터 등급관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 등급 조회 및 등록 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            :label="$t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EMPL_NM')"
        >
          <kw-input
            v-model="searchParams.emplNm"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_GD_TF')"
          secondary
          dense
          @click="onClickHmstGradeTransfer"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          primary
          secondary
          :label="$t('MSG_BTN_GD_SAVE')"
          @click="onClickListSave"
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
import dayjs from 'dayjs';

import { useDataService, getComponentType, gridUtil, defineGrid, modal, notify } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
const isExcelDown = ref(false);
// const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  mngtYm: now.format('YYYYMM'),
  emplNm: '',
  prtnrNo: '',

});

const saveData = ref({

  mngtYm: '',
  emplNm: '',
  prtnrNo: '',
  clDvCd: '',

});

let cachedParams;

async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/home-master-grades', { params: cachedParams });
  const hmstGds = response.data;
  totalCount.value = hmstGds.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(hmstGds);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - Excel 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/home-master-grades', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}
/*
 *  Event - 등급이관 버튼 클릭 (전월등급을 현재등급으로 저장 후 재조회)
 */

async function onClickHmstGradeTransfer() {
  await dataService.post('/sms/wells/fee/home-master-grades/grade-transfers', searchParams.value);
  notify(t('MSG_ALT_TRNS_FIN'));
  await fetchData();
}

/*
 *  Event - 그리드 개별 저장 버튼 클릭
 */
async function onClickSave() {
  const dataProvider = grdMainRef.value.getView().getDataSource();
  const scRow = grdMainRef.value.getView().getCurrent().dataRow;
  await dataService.post('/sms/wells/fee/home-master-grades/grade', saveData.value);
  notify(t('MSG_ALT_SVE_DATA'));
  dataProvider.setRowState(scRow, 'none');
}

/*
 *  Event - 등급저장 버튼 클릭 (등급 리스트 저장)
 */

async function onClickListSave() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  await dataService.post('/sms/wells/fee/home-master-grades/grades', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

/*
 *  Event - Grid 포인트 이력 클릭 open popup
 */
async function openHmstGradePopup() {
  const param = {
    mngtYm: saveData.value.mngtYm,
    emplNm: saveData.value.emplNm,
    prtnrNo: saveData.value.prtnrNo,
  };
  await modal({
    component: 'WwfebHomeMasterPointRegP',
    componentProps: param,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'belong' },
    { fieldName: 'emplNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'rgstYm' },
    { fieldName: 'brmgrEmplNm' },
    { fieldName: 'brmgrPrtnrNo' },
    { fieldName: 'clDvCd' },
    { fieldName: 'save' },
    { fieldName: 'pointHistory' },
  ];

  const columns = [
    { fieldName: 'mngtYm', header: t('MSG_TXT_MGT_YNM'), width: '106', styleName: 'text-center', editable: false, dataType: 'datetime', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'belong', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-left', editable: false },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-left', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'rgstYm', header: t('MSG_TXT_RGST_YM'), width: '106', styleName: 'text-center', editable: false, dataType: 'datetime', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'brmgrEmplNm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-left', editable: false },
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'clDvCd', header: t('MSG_TXT_GD'), width: '78', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'save', header: t('MSG_TXT_SAVE'), width: '78', styleName: 'text-center', renderer: { type: 'button' }, editable: false },
    { fieldName: 'pointHistory', header: t('MSG_TXT_P') + t('MSG_TXT_HIS'), width: '112', styleName: 'text-center', renderer: { type: 'button' }, editable: false },

  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    // single
    {
      header: t('MSG_TXT_HMNRSC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['mngtYm', 'belong', 'emplNm', 'prtnrNo', 'rgstYm'],
    },
    {
      header: t('MSG_TXT_BRMGR'),
      direction: 'horizontal',
      items: ['brmgrEmplNm', 'brmgrPrtnrNo'],
    },
    'clDvCd', 'save', 'pointHistory',
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'save') {
      saveData.value.mngtYm = g.getValue(itemIndex, 'mngtYm');
      saveData.value.prtnrNo = g.getValue(itemIndex, 'prtnrNo');
      saveData.value.clDvCd = g.getValue(itemIndex, 'clDvCd');
      onClickSave();
    } else if (column === 'pointHistory') {
      saveData.value.mngtYm = g.getValue(itemIndex, 'mngtYm');
      saveData.value.emplNm = g.getValue(itemIndex, 'emplNm');
      saveData.value.prtnrNo = g.getValue(itemIndex, 'prtnrNo');
      openHmstGradePopup();
    }
  };
});

</script>

<style scoped>
</style>
