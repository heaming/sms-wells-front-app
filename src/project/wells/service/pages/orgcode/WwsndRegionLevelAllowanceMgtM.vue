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
import { cloneDeep, isNumber, isUndefined, isNull } from 'lodash-es';
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
  applyDate: dayjs().format('YYYYMMDD'), // 적용일자
});

const tomorrow = dayjs().add(1, 'day').format('YYYYMMDD');
const applyDates = ref({
  movementApplyDate: tomorrow, // 이동급지적용일자
  bizApplyDate: tomorrow, // 업무급지적용일자
});

const originApplyDates = {
  movementApplyDate: '', // 기존 이동급지적용일자
  bizApplyDate: '', // 기존 업무급지적용일자
};

const countInfo = ref({
  movementTotalCount: 0, // 이동급지 총건수
  bizTotalCount: 0, // 업무급지 총건수
});

// 빈값 여부 체크
function isBlank(val) {
  return isUndefined(val) || isNull(val) || val === '';
}

// 기존 적용일자보다 큰 일자인지 체크
function validateOriginDate(type, val) {
  const originApplyDate = dayjs(originApplyDates[type]).format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(originApplyDate)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_BF_DT'));
    return false;
  }
  return true;
}

// 오늘일자인지 체크
function validateToday(val) {
  const today = dayjs().format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(today)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_FUR_DT'));
    return false;
  }
  return true;
}

// 최대적용시작일보다 큰 일자인지 체크
function validateMaxApplyStartDate(maxApyStrtdt, val) {
  const maxApplyStartDate = dayjs(maxApyStrtdt).format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(maxApplyStartDate)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_MAX_DT', [maxApplyStartDate]));
    return false;
  }
  return true;
}

// 기준정보 가져오기
function getBaseInfo(type) {
  const grdBaseRef = type === 'movement' ? grdMovementBaseRef : grdBizBaseRef;
  const view = grdBaseRef.value.getView();
  return view.getJsonRows()[0];
}

// 이동시간 가져오기
function getMoveTime(view, row, rglvlGdCd, value) {
  const { movementAverageSpeed } = getBaseInfo('movement');

  let mmtLdtm = 360; // [이동급지] 급지등급 25등급은 '섬'으로 이동시간 360 고정

  if (rglvlGdCd !== 25) {
    view.setValue(view.getItemIndex(row), 'mmtDstn', value);

    const mmtDstn = isBlank(value) ? 0 : Number(value);
    const averageSpeed = Number(movementAverageSpeed);
    mmtLdtm = (mmtDstn * 60) / averageSpeed;

    view.setValue(view.getItemIndex(row), 'mmtLdtm', mmtLdtm);
  }
  view.commit();
  return mmtLdtm;
}

// 수당 셋팅
function setAllowance(view, row, mmtLdtm) {
  const { movementManHour, movementFieldWeight } = getBaseInfo('movement');
  const manHour = Number(movementManHour);
  const fieldWeight = Number(movementFieldWeight);
  const rglvlAwAmt = Math.round((mmtLdtm * manHour * (fieldWeight / 100)) / 100) * 100;

  view.setValue(view.getItemIndex(row), 'rglvlAwAmt', rglvlAwAmt);
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
  view.commit();
}

// 적용일자 일괄적용
function setApplyDates(view, type) {
  const applyDate = applyDates.value[type];

  if (!validateOriginDate(type, applyDate)) return;
  if (!validateToday(applyDate)) return;

  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    view.setValue(view.getItemIndex(dataRow), 'apyStrtdt', applyDate);
    view.setValue(view.getItemIndex(dataRow), 'apyEnddt', '99991231');
  }
  view.commit();
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

    if (rglvlGdCd === 24) {
      mmtLdtm = 260; // [업무급지] 급지등급 24등급은 "섬"으로 이동시간 260으로 계산
    }

    const rglvlAwAmt = Number(mmtLdtm) * getFieldAirlift(bizManHour, bizFieldWeight);
    view.setValue(view.getItemIndex(dataRow), 'rglvlAwAmt', rglvlAwAmt);
  }
  view.commit();
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

// 기본 데이터 조회
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

// 이동급지, 업무급지 데이터 조회
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

// 조회버튼 클릭
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

// 적용일자 변경여부 체크
function validateApplyDate(view) {
  const originApyStrtdt = gridUtil.getOrigCellValue(view, 0, 'apyStrtdt');
  const apyStrtdt = gridUtil.getCellValue(view, 0, 'apyStrtdt');

  if (originApyStrtdt === apyStrtdt) {
    notify(t('MSG_ALT_APY_STRT_D_CH_NCST'));
    return false;
  }
  return true;
}

// 그리드 변경 데이터 저장
async function saveData(view, additionalInfo, viewType) {
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!validateApplyDate(view)) return;

  const changedRows = gridUtil.getChangedRowValues(view).map((v) => {
    const mmtDstn = isBlank(v.mmtDstn) ? '0' : v.mmtDstn;
    const mmtLdtm = isBlank(v.mmtLdtm) ? '0' : v.mmtLdtm;
    return { ...v, mmtDstn, mmtLdtm, ...additionalInfo };
  });

  await dataService.post('/sms/wells/service/region-level-allowances', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData(viewType);
  await fetchDefaultData(viewType);
}

// 이동급지 저장
async function onClickMovementSave() {
  const { movementManHour, movementFieldWeight, movementAverageSpeed } = getBaseInfo('movement');
  const additionalInfo = { minPerManho: movementManHour, rglvlWeit: movementFieldWeight, avVe: movementAverageSpeed };
  await saveData(grdMovementLevelRef.value.getView(), additionalInfo, MOVEMENT);
}

// 업무급지 저장
async function onClickBizSave() {
  const { bizManHour, bizFieldWeight } = getBaseInfo('biz');
  const avVe = getFieldAirlift(bizManHour, bizFieldWeight);
  const additionalInfo = { minPerManho: bizManHour, rglvlWeit: bizFieldWeight, avVe };
  await saveData(grdBizLevelRef.value.getView(), additionalInfo, BIZ);
}

// 섬 표시 설정
function setDisplayCallback(grid, index, value) {
  if (value === '9999') {
    return '섬';
  } if (isBlank(value)) {
    return 0;
  }
  return value;
}

// 마운트 처리
onMounted(async () => {
  await fetchDefaultData(ALL);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMovementLevel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rglvlDvCd' }, // 급지구분코드
    { fieldName: 'bizRglvlCd' }, // 업무급지코드
    { fieldName: 'mmtDstn' }, // 이동거리
    { fieldName: 'rglvlGdCd', dataType: 'number' }, // 급지등급코드
    { fieldName: 'mmtLdtm', dataType: 'number' }, // 이동소요시간
    { fieldName: 'rglvlAwAmt', dataType: 'number' }, // 급지수당금액
    { fieldName: 'apyStrtdt' }, // 적용시작일
    { fieldName: 'apyEnddt' }, // 적용종료일
    { fieldName: 'chEmpno' }, // 변경사번
    { fieldName: 'chNm' }, // 변경성명
    { fieldName: 'minPerManho', dataType: 'number' }, // 분당공수
    { fieldName: 'rglvlWeit', dataType: 'number' }, // 급지비중
    { fieldName: 'avVe', dataType: 'number' }, // 평균속도
    { fieldName: 'maxApyStrtdt' }, // 최대 적용시작일
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
      sortable: false,
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
    { fieldName: 'chNm', header: t('MSG_TXT_CH_FNM'), width: '100', styleName: 'text-center' },
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
  view.sortingOptions.commitBeforeSorting = true;

  // view.onGetEditValue = async (grid, index, editResult) => {
  view.onCellEdited = (grid, itemIndex) => {
    grid.commit();
    const { mmtDstn } = grid.getValues(itemIndex);
    const rglvlGdCd = gridUtil.getCellValue(view, itemIndex, 'rglvlGdCd'); // 급지등급코드
    const mmtLdtm = getMoveTime(view, itemIndex, rglvlGdCd, mmtDstn); // 이동시간

    setAllowance(view, itemIndex, mmtLdtm);
    grid.commit();
    isMovementChanged = true;
  };
});

const initGrdBizLevel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rglvlDvCd' }, // 급지구분코드
    { fieldName: 'bizRglvlCd' }, // 업무급지코드
    { fieldName: 'mmtDstn' }, // 이동거리
    { fieldName: 'mmtLdtm' }, // 이동소요시간
    { fieldName: 'rglvlGdCd', dataType: 'number' }, // 급지등급코드
    { fieldName: 'rglvlAwAmt', dataType: 'number' }, // 급지수당금액
    { fieldName: 'apyStrtdt' }, // 적용시작일
    { fieldName: 'apyEnddt' }, // 적용종료일
    { fieldName: 'chEmpno' }, // 변경사번
    { fieldName: 'chNm' }, // 변경성명
    { fieldName: 'minPerManho', dataType: 'number' }, // 분당공수
    { fieldName: 'rglvlWeit', dataType: 'number' }, // 급지비중
    { fieldName: 'maxApyStrtdt' }, // 최대 적용시작일
  ];

  const columns = [
    { fieldName: 'mmtLdtm',
      header: t('MSG_TXT_MMT_HH_M'),
      width: '100',
      styleName: 'text-right',
      sortable: false,
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
    { fieldName: 'chNm', header: t('MSG_TXT_CH_FNM'), width: '100', styleName: 'text-center' },
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
  view.sortingOptions.commitBeforeSorting = true;
  view.sortingOptions.commitBeforeSorting = true;
});

function initGrdMovementBase(data, view) {
  const fields = [
    { fieldName: 'movementManHour', dataType: 'number' }, // 이동급지 분당공수
    { fieldName: 'movementFieldWeight', dataType: 'number' }, // 이동급지 급지비중
    { fieldName: 'movementAverageSpeed', dataType: 'number' }, // 이동급지 평균시속
  ];

  const columns = [
    { fieldName: 'movementManHour',
      header: t('MSG_TXT_AIRLIFT_PER_MIN'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'movementFieldWeight',
      header: t('MSG_TXT_RGLVL_WEIT'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'movementAverageSpeed',
      header: t('MSG_TXT_AV_HH_VE'),
      width: '100',
      styleName: 'text-right',
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
    { fieldName: 'bizManHour', dataType: 'number' }, // 업무급지 분당공수
    { fieldName: 'bizFieldWeight', dataType: 'number' }, // 업무급지 급지비중
    { fieldName: 'bizFieldAirlift', dataType: 'number' }, // 업무급지 급지공수
  ];

  const columns = [
    { fieldName: 'bizManHour',
      header: t('MSG_TXT_AIRLIFT_PER_MIN'),
      width: '100',
      styleName: 'text-right',
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
      styleName: 'text-right',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 3,
        editFormat: '##0',
      } },
    { fieldName: 'bizFieldAirlift', header: t('MSG_TXT_RGLVL_AIRLIFT'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;

  view.onCellEdited = (grid, itemIndex) => {
    grid.commit();
    const { fieldName } = grid.getCurrent();
    const { bizManHour, bizFieldWeight } = grid.getValues(itemIndex);
    let bizFieldAirlift = 0;
    if (fieldName === 'bizManHour') {
      bizFieldAirlift = getFieldAirlift(bizManHour, grid.getValue(itemIndex, 'bizFieldWeight'));
    } else if (fieldName === 'bizFieldWeight') {
      bizFieldAirlift = getFieldAirlift(grid.getValue(itemIndex, 'bizManHour'), bizFieldWeight);
    }

    grid.setValue(itemIndex, 'bizFieldAirlift', bizFieldAirlift);
    grid.commit();
  };
}
</script>
