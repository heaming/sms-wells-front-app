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
            :maxlength="15"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
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
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_GD_TF')"
          secondary
          dense
          @click="onClickHmstGradeTransfer"
        />
        <kw-btn
          v-permission:update
          dense
          primary
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

import { useDataService, getComponentType, gridUtil, defineGrid, modal, notify, confirm } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

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
  prtnrKnm: '',

});

const saveData = ref({

  mngtYm: '',
  emplNm: '',
  prtnrNo: '',
  clDvCd: '',

});

let cachedParams;

async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/home-master-grades', { params: cachedParams, timeout: 300000 });
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
  // const { mngtYm } = searchParams.value;
  // const bfMonth = now.add(-1, 'month').format('YYYYMM');

  /* TEST를 위해 임시로 막습니다. */
  // if (bfMonth !== mngtYm) {
  //   await alert(t('MSG_ALT_LSTMM_PSB')); // 전월만 실행 가능합니다.
  //   return;
  // }

  // 임시 메시지
  if (await confirm('실행 하시겠습니까?')) {
    await dataService.post('/sms/wells/fee/home-master-grades/grade-transfers', searchParams.value);
    notify(t('MSG_ALT_TRNS_FIN'));
    await fetchData();
  }
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

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { mngtYm, prtnrNo } = searchParams.value;
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: mngtYm,
      prtnrNo,
      ogTpCd: 'W01',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'mngtYm', header: t('MSG_TXT_MGT_YNM'), width: '106', styleName: 'text-center', editable: false, dataType: 'datetime', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'belong', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-left', editable: false },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'rgstYm', header: t('MSG_TXT_RGST_YM'), width: '106', styleName: 'text-center', editable: false, dataType: 'datetime', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'brmgrEmplNm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'clDvCd', header: t('MSG_TXT_GD'), width: '78', styleName: 'text-right', dataType: 'number', positiveOnly: true, editor: { type: 'number', dataType: 'number', positiveOnly: true, textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'pointHistory', header: t('MSG_TXT_P') + t('MSG_TXT_HIS'), width: '112', styleName: 'text-center', renderer: { type: 'button' }, editable: false },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
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
    'clDvCd', 'pointHistory',
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'pointHistory') {
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
