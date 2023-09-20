<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SND (조직관리)
 2. 프로그램 ID : WwsndRegionLevelAllowanceMgtM - 급지 수당 관리
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 급지 수당 관리 (http://localhost:3000/#/service/wwsnd-region-level-allowance-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 적용일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.applyDate"
            :label="$t('MSG_TXT_APPLY_DT')"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <kw-action-top>
            <template #left>
              <!-- 이동급지 -->
              <h3>{{ $t('MSG_TXT_MMT_RGLVL') }}</h3>
            </template>
            <!-- 적용 -->
            <kw-btn
              primary
              dense
              :label="$t('MSG_BTN_APPLY')"
              :disable="countInfo.movementTotalCount === 0"
              @click="onClickMovementBulkApply"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMovementBaseRef"
            :visible-rows="1"
            @init="initGrdMovementBase"
          />
        </div>
        <div class="grid-horizontal-wrap__section">
          <kw-action-top>
            <template #left>
              <!-- 업무급지 -->
              <h3>{{ $t('MSG_TXT_BIZ_RGLVL') }}</h3>
            </template>
            <!-- 적용 -->
            <kw-btn
              primary
              dense
              :label="$t('MSG_BTN_APPLY')"
              :disable="countInfo.bizTotalCount === 0"
              @click="onClickBizBulkApply"
            />
          </kw-action-top>
          <kw-grid
            ref="grdBizBaseRef"
            :visible-rows="1"
            @init="initGrdBizBase"
          />
        </div>
      </div>
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section mt30">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="countInfo.movementTotalCount"
              />
            </template>
            <kw-btn
              v-permission:update
              grid-action
              :label="$t('MSG_BTN_SAVE')"
              @click="onClickMovementSave"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-date-range-picker
              v-model:from="applyDates.movementApplyDate"
              dense
              class="w300"
              :from-placeholder="$t('MSG_TXT_APY_STRT_D_CHO')"
              :to-placeholder="$t('MSG_TXT_APY_END_D_CHO')"
              to="99991231"
              :to-disable="true"
            />
            <!-- 적용일자 일괄변경 -->
            <kw-btn
              :label="$t('MSG_TXT_APY_DT_BLK_CH')"
              dense
              :disable="countInfo.movementTotalCount === 0"
              @click="onClickMovementBulkApplyDate"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMovementLevelRef"
            :visible-rows="getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')"
            @init="initGrdMovementLevel"
          />
        </div>
        <div class="grid-horizontal-wrap__section mt30">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="countInfo.bizTotalCount"
              />
            </template>
            <kw-btn
              v-permission:update
              grid-action
              :label="$t('MSG_BTN_SAVE')"
              @click="onClickBizSave"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-date-range-picker
              v-model:from="applyDates.bizApplyDate"
              dense
              class="w300"
              :from-placeholder="$t('MSG_TXT_APY_STRT_D_CHO')"
              :to-placeholder="$t('MSG_TXT_APY_END_D_CHO')"
              to="99991231"
              :to-disable="true"
            />
            <!-- 적용일자 일괄변경 -->
            <kw-btn
              :label="$t('MSG_TXT_APY_DT_BLK_CH')"
              dense
              :disable="countInfo.bizTotalCount === 0"
              @click="onClickBizBulkApplyDate"
            />
          </kw-action-top>
          <kw-grid
            ref="grdBizLevelRef"
            :visible-rows="getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')"
            @init="initGrdBizLevel"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isNumber, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { notify } = useGlobal();

const ALL = 0;
const MOVEMENT = 1;
const BIZ = 2;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMovementLevelRef = ref(getComponentType('KwGrid'));
const grdBizLevelRef = ref(getComponentType('KwGrid'));
const grdMovementBaseRef = ref(getComponentType('KwGrid'));
const grdBizBaseRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  applyDate: dayjs().format('YYYYMMDD'),
});

const tomorrow = dayjs().add(1, 'day').format('YYYYMMDD');
const applyDates = ref({
  movementApplyDate: tomorrow,
  bizApplyDate: tomorrow,
});

const originApplyDates = {
  movementApplyDate: '',
  bizApplyDate: '',
};

const countInfo = ref({
  movementTotalCount: 0,
  bizTotalCount: 0,
});

function validateOriginDate(type, val) {
  const originApplyDate = dayjs(originApplyDates[type]).format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(originApplyDate)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_BF_DT'));
    return false;
  }
  return true;
}

function validateToday(val) {
  const today = dayjs().format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(today)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_FUR_DT'));
    return false;
  }
  return true;
}

function validateMaxApplyStartDate(maxApyStrtdt, val) {
  const maxApplyStartDate = dayjs(maxApyStrtdt).format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(maxApplyStartDate)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_MAX_DT', [maxApplyStartDate]));
    return false;
  }
  return true;
}

function getBaseInfo(type) {
  const grdBaseRef = type === 'movement' ? grdMovementBaseRef : grdBizBaseRef;
  const view = grdBaseRef.value.getView();
  return view.getJsonRows()[0];
}

function getMoveTime(view, row, rglvlGdCd, value) {
  const { movementAverageSpeed } = getBaseInfo('movement');

  let mmtLdtm = 360; // [이동급지] 급지등급 25등급은 '섬'으로 이동시간 360 고정

  if (rglvlGdCd !== '25') {
    view.setValue(row, 'mmtDstn', value);

    const mmtDstn = isEmpty(value) ? 0 : Number(value);
    const averageSpeed = Number(movementAverageSpeed);
    mmtLdtm = (mmtDstn * 60) / averageSpeed;

    view.setValue(row, 'mmtLdtm', mmtLdtm);
  }
  return mmtLdtm;
}

function setAllowance(view, row, mmtLdtm) {
  const { movementManHour, movementFieldWeight } = getBaseInfo('movement');
  const manHour = Number(movementManHour);
  const fieldWeight = Number(movementFieldWeight);
  const rglvlAwAmt = Math.round((mmtLdtm * manHour * (fieldWeight / 100)) / 100) * 100;

  view.setValue(row, 'rglvlAwAmt', rglvlAwAmt);
}

let isMovementChanged = false;

// 이동급지 - 분당공수, 급지비중, 평균시속 일괄적용
function onClickMovementBulkApply() {
  const { movementManHour, movementFieldWeight, movementAverageSpeed } = getBaseInfo('movement');

  if (!isNumber(movementManHour) || !isNumber(movementFieldWeight) || !isNumber(movementAverageSpeed)) {
    notify(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_CALC_BASE')]));
    return;
  }

  if (movementManHour <= 0 || movementFieldWeight <= 0 || movementAverageSpeed <= 0) {
    notify(t('MSG_ALT_ZERO_IS_BIG', [t('MSG_TXT_CALC_BASE')]));
    return;
  }

  if (isMovementChanged) {
    notify(t('MSG_ALT_MDFC_CN_SAVE_AF_APY'));
    return;
  }

  const view = grdMovementLevelRef.value.getView();
  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    const { rglvlGdCd, mmtDstn } = gridUtil.getRowValue(view, dataRow); // 급지등급코드, 이동거리
    const mmtLdtm = getMoveTime(view, dataRow, rglvlGdCd, mmtDstn); // 이동시간

    setAllowance(view, dataRow, mmtLdtm);
  }
}

// 적용일자 일괄적용
function setApplyDates(view, type) {
  const applyDate = applyDates.value[type];

  if (!validateOriginDate(type, applyDate)) return;
  if (!validateToday(applyDate)) return;

  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    view.setValue(dataRow, 'apyStrtdt', applyDate);
    view.setValue(dataRow, 'apyEnddt', '99991231');
  }
}

// 이동급지 - 적용일자 일괄적용
async function onClickMovementBulkApplyDate() {
  if (applyDates.value.movementApplyDate === '') {
    notify(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_APY_STRT_DAY')]));
    return;
  }

  const maxApyStrtdt = grdMovementLevelRef.value.getView().getValue(0, 'maxApyStrtdt');
  if (!validateMaxApplyStartDate(maxApyStrtdt, applyDates.value.movementApplyDate)) return;

  setApplyDates(grdMovementLevelRef.value.getView(), 'movementApplyDate');
}

// 급지공수 가져오기
function getFieldAirlift(manHour, fieldWeight) {
  if (manHour === 0 || fieldWeight === 0) return 0;
  return Math.round((Number(manHour) * (Number(fieldWeight) / 100)) / 10) * 10; // 급지공수
}

// 업무급지 - 분당공수, 급지비중, 급지공수
function onClickBizBulkApply() {
  const { bizManHour, bizFieldWeight } = getBaseInfo('biz');

  if (!isNumber(bizManHour) || !isNumber(bizFieldWeight)) {
    notify(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_CALC_BASE')]));
    return;
  }

  if (bizManHour <= 0 || bizFieldWeight <= 0) {
    notify(t('MSG_ALT_ZERO_IS_BIG', [t('MSG_TXT_CALC_BASE')]));
    return;
  }

  const view = grdBizLevelRef.value.getView();
  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    const rglvlGdCd = gridUtil.getCellValue(view, dataRow, 'rglvlGdCd'); // 급지등급코드
    let mmtLdtm = gridUtil.getCellValue(view, dataRow, 'mmtLdtm'); // 이동시간

    if (rglvlGdCd === '24') {
      mmtLdtm = '260'; // [업무급지] 급지등급 24등급은 "섬"으로 이동시간 260으로 계산
    }

    const rglvlAwAmt = Number(mmtLdtm) * getFieldAirlift(bizManHour, bizFieldWeight);
    view.setValue(dataRow, 'rglvlAwAmt', rglvlAwAmt);
  }
}

// 업무급지 - 적용일자 일괄적용
function onClickBizBulkApplyDate() {
  if (applyDates.value.bizApplyDate === '') {
    notify(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_APY_STRT_DAY')]));
    return;
  }

  const maxApyStrtdt = grdBizLevelRef.value.getView().getValue(0, 'maxApyStrtdt');
  if (!validateMaxApplyStartDate(maxApyStrtdt, applyDates.value.bizApplyDate)) return;

  setApplyDates(grdBizLevelRef.value.getView(), 'bizApplyDate');
}

async function fetchDefaultData(viewType) {
  const res = await dataService.get('/sms/wells/service/region-level-allowances/base-information');
  const { movementBases, bizBases } = res.data;

  if (viewType === ALL || viewType === MOVEMENT) {
    const movementBaseView = grdMovementBaseRef.value.getView();
    movementBaseView.getDataSource().setRows([{
      movementManHour: movementBases?.minPerManho || 0,
      movementFieldWeight: movementBases?.rglvlWeit || 0,
      movementAverageSpeed: movementBases?.avVe || 0,
    }]);
  }

  if (viewType === ALL || viewType === BIZ) {
    const bizBaseView = grdBizBaseRef.value.getView();
    bizBaseView.getDataSource().setRows([{
      bizManHour: bizBases?.minPerManho || 0,
      bizFieldWeight: bizBases?.rglvlWeit || 0,
      bizFieldAirlift: getFieldAirlift(bizBases?.minPerManho || 0, bizBases?.rglvlWeit || 0),
    }]);
  }
}

async function fetchData(viewType) {
  const res = await dataService.get('/sms/wells/service/region-level-allowances', { params: { ...cachedParams } });
  const { movementAllowances, bizAllowances } = res.data;

  if (viewType === ALL || viewType === MOVEMENT) {
    const movementLevelView = grdMovementLevelRef.value.getView();
    countInfo.value.movementTotalCount = movementAllowances.length;
    movementLevelView.getDataSource().setRows(movementAllowances);
    originApplyDates.movementApplyDate = movementAllowances[0] ? movementAllowances[0].apyStrtdt : '';
  }

  if (viewType === ALL || viewType === BIZ) {
    const bizLevelview = grdBizLevelRef.value.getView();
    countInfo.value.bizTotalCount = bizAllowances.length;
    bizLevelview.getDataSource().setRows(bizAllowances);
    originApplyDates.bizApplyDate = bizAllowances[0] ? bizAllowances[0].apyStrtdt : '';
  }
}

async function onClickSearch() {
  const movementView = grdMovementLevelRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(movementView)) return;

  const bizView = grdBizLevelRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(bizView)) return;

  cachedParams = cloneDeep(searchParams.value);
  isMovementChanged = false;
  await fetchData(ALL);
  await fetchDefaultData(ALL);
}

function validateApplyDate(view) {
  const originApyStrtdt = gridUtil.getOrigCellValue(view, 0, 'apyStrtdt');
  const apyStrtdt = gridUtil.getCellValue(view, 0, 'apyStrtdt');

  if (originApyStrtdt === apyStrtdt) {
    notify(t('MSG_ALT_APY_STRT_D_CH_NCST'));
    return false;
  }
  return true;
}

async function saveData(view, additionalInfo, viewType) {
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!validateApplyDate(view)) return;

  const changedRows = gridUtil.getChangedRowValues(view).map((v) => {
    const mmtDstn = isEmpty(v.mmtDstn) ? '0' : v.mmtDstn;
    const mmtLdtm = isEmpty(v.mmtLdtm) ? '0' : v.mmtLdtm;
    return { ...v, mmtDstn, mmtLdtm, ...additionalInfo };
  });

  await dataService.post('/sms/wells/service/region-level-allowances', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData(viewType);
  await fetchDefaultData(viewType);
}

async function onClickMovementSave() {
  const { movementManHour, movementFieldWeight, movementAverageSpeed } = getBaseInfo('movement');
  const additionalInfo = { minPerManho: movementManHour, rglvlWeit: movementFieldWeight, avVe: movementAverageSpeed };
  await saveData(grdMovementLevelRef.value.getView(), additionalInfo, MOVEMENT);
}

async function onClickBizSave() {
  const { bizManHour, bizFieldWeight } = getBaseInfo('biz');
  const avVe = getFieldAirlift(bizManHour, bizFieldWeight);
  const additionalInfo = { minPerManho: bizManHour, rglvlWeit: bizFieldWeight, avVe };
  await saveData(grdBizLevelRef.value.getView(), additionalInfo, BIZ);
}

function setDisplayCallback(grid, index, value) {
  if (value === '9999') {
    return '섬';
  } if (isEmpty(value)) {
    return '0';
  }
  return value;
}

onMounted(async () => {
  await fetchDefaultData(ALL);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMovementLevel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rglvlDvCd' },
    { fieldName: 'bizRglvlCd' },
    { fieldName: 'mmtDstn' },
    { fieldName: 'rglvlGdCd' },
    { fieldName: 'mmtLdtm' },
    { fieldName: 'rglvlAwAmt', dataType: 'number' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'chEmpno' },
    { fieldName: 'chNm' },
    { fieldName: 'minPerManho', dataType: 'number' },
    { fieldName: 'rglvlWeit', dataType: 'number' },
    { fieldName: 'avVe', dataType: 'number' },
    { fieldName: 'maxApyStrtdt' },
  ];

  const columns = [
    { fieldName: 'mmtDstn',
      header: {
        text: t('MSG_TXT_MMT_DSTN_KM'),
        styleName: 'essential',
      },
      width: '150',
      editable: true,
      editor: {
        type: 'text',
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
      displayCallback: setDisplayCallback,
    },
    { fieldName: 'rglvlGdCd', header: t('MSG_TXT_GD'), width: '100', suffix: ' 급지' },
    { fieldName: 'mmtLdtm',
      header: t('MSG_TXT_MMT_HH_M'),
      width: '100',
      styleName: 'text-right',
      displayCallback: setDisplayCallback,
    },
    { fieldName: 'rglvlAwAmt', header: t('MSG_TXT_RGLVL_AW_WON'), width: '100', styleName: 'text-right' },
    { fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'),
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date',
    },
    { fieldName: 'apyEnddt',
      header: {
        text: t('MSG_TXT_APY_END_DAY'),
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'chEmpno', header: t('MSG_TXT_CH_EMPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'chNm', header: t('MSG_TXT_CH_FNM'), width: '100' },
    { fieldName: 'minPerManho' },
    { fieldName: 'rglvlWeit' },
    { fieldName: 'avVe' },
    { fieldName: 'maxApyStrtdt' },
  ];

  const columnLayout = [
    'mmtDstn',
    'rglvlGdCd',
    'mmtLdtm',
    'rglvlAwAmt',
    'apyStrtdt',
    'apyEnddt',
    'chEmpno',
    'chNm',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onGetEditValue = async (grid, index, editResult) => {
    const rglvlGdCd = gridUtil.getCellValue(view, index.itemIndex, 'rglvlGdCd'); // 급지등급코드
    const mmtLdtm = getMoveTime(view, index.itemIndex, rglvlGdCd, editResult.value); // 이동시간

    setAllowance(view, index.itemIndex, mmtLdtm);
    isMovementChanged = true;
  };
});

const initGrdBizLevel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rglvlDvCd' },
    { fieldName: 'bizRglvlCd' },
    { fieldName: 'mmtDstn' },
    { fieldName: 'mmtLdtm' },
    { fieldName: 'rglvlGdCd' },
    { fieldName: 'rglvlAwAmt', dataType: 'number' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'chEmpno' },
    { fieldName: 'chNm' },
    { fieldName: 'minPerManho', dataType: 'number' },
    { fieldName: 'rglvlWeit', dataType: 'number' },
    { fieldName: 'maxApyStrtdt' },
  ];

  const columns = [
    { fieldName: 'mmtLdtm',
      header: t('MSG_TXT_MMT_HH_M'),
      width: '100',
      styleName: 'text-right',
      displayCallback: setDisplayCallback,
    },
    { fieldName: 'rglvlGdCd', header: t('MSG_TXT_GD'), width: '100', suffix: ' 급지' },
    { fieldName: 'rglvlAwAmt', header: t('MSG_TXT_RGLVL_AW_WON'), width: '100', styleName: 'text-right' },
    { fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'),
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'apyEnddt',
      header: {
        text: t('MSG_TXT_APY_END_DAY'),
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'chEmpno', header: t('MSG_TXT_CH_EMPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'chNm', header: t('MSG_TXT_CH_FNM'), width: '100' },
    { fieldName: 'minPerManho' },
    { fieldName: 'rglvlWeit' },
    { fieldName: 'maxApyStrtdt' },
  ];

  const columnLayout = [
    'mmtLdtm',
    'rglvlGdCd',
    'rglvlAwAmt',
    'apyStrtdt',
    'apyEnddt',
    'chEmpno',
    'chNm',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
});

function initGrdMovementBase(data, view) {
  const fields = [
    { fieldName: 'movementManHour', dataType: 'number' },
    { fieldName: 'movementFieldWeight', dataType: 'number' },
    { fieldName: 'movementAverageSpeed', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'movementManHour',
      header: t('MSG_TXT_AIRLIFT_PER_MIN'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'movementFieldWeight',
      header: t('MSG_TXT_RGLVL_WEIT'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'movementAverageSpeed',
      header: t('MSG_TXT_AV_HH_VE'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;
}

function initGrdBizBase(data, view) {
  const fields = [
    { fieldName: 'bizManHour', dataType: 'number' },
    { fieldName: 'bizFieldWeight', dataType: 'number' },
    { fieldName: 'bizFieldAirlift', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'bizManHour',
      header: t('MSG_TXT_AIRLIFT_PER_MIN'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      },
    },
    { fieldName: 'bizFieldWeight',
      header: t('MSG_TXT_RGLVL_WEIT'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'bizFieldAirlift', header: t('MSG_TXT_RGLVL_AIRLIFT'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;

  view.onGetEditValue = async (grid, index, editResult) => {
    let bizFieldAirlift = 0;
    if (index.fieldName === 'bizManHour') {
      bizFieldAirlift = getFieldAirlift(editResult.value, grid.getValue(index.dataRow, 'bizFieldWeight'));
    } else if (index.fieldName === 'bizFieldWeight') {
      bizFieldAirlift = getFieldAirlift(grid.getValue(index.dataRow, 'bizManHour'), editResult.value);
    }

    grid.setValue(index.dataRow, index.fieldName, editResult.value);
    grid.setValue(index.dataRow, 'bizFieldAirlift', bizFieldAirlift);
  };
}
</script>
