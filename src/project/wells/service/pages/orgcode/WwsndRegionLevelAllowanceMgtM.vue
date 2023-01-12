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
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 적용일자 -->
        <kw-search-item :label="$t('MSG_TXT_APPLY_DT')">
          <kw-date-picker v-model="searchParams.applyDate" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section w700">
          <table class="kw-table--normal">
            <colgroup>
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
            </colgroup>
            <!-- TODO: 퍼블리싱 수정 버전 나오면 변경 필요 -->
            <tbody>
              <tr>
                <td class="text-left">
                  <!-- 분당공수 -->
                  {{ $t('MSG_TXT_AIRLIFT_PER_MIN') }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.movementManHour"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-left">
                  <!-- 급지비중 -->
                  {{ $t('MSG_TXT_RGLVL_WEIT') }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.movementFieldWeight"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-left">
                  <!-- 평균시속 -->
                  {{ $t('MSG_TXT_AV_HH_VE') }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.movementAverageSpeed"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-right">
                  <!-- 일괄적용 -->
                  <kw-btn
                    dense
                    :label="$t('MSG_TIT_BK_APPLY')"
                    :disable="countInfo.movementTotalCount === 0"
                    @click="onClickMovementBulkApply"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <table class="kw-table--normal">
            <colgroup>
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
            </colgroup>
            <tbody>
              <tr>
                <td class="text-left">
                  <!-- 적용일자 -->
                  {{ $t('MSG_TXT_APPLY_DT') }}
                </td>
                <td
                  class="text-left"
                  colspan="5"
                >
                  <kw-date-range-picker
                    v-model:from="applyDates.movementApplyDate"
                    dense
                    to="99991231"
                    :to-disable="true"
                  />
                </td>
                <td class="text-right">
                  <kw-btn
                    dense
                    :label="$t('MSG_TIT_BK_APPLY')"
                    :disable="countInfo.movementTotalCount === 0"
                    @click="onClickMovementBulkApplyDate"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <h3>{{ $t('MSG_TXT_MMT_RGLVL') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="countInfo.movementTotalCount"
              />
            </template>

            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_SAVE')"
              @click="onClickMovementSave"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMovementLevelRef"
            :visible-rows="getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')"
            @init="initGrdMovementLevel"
          />
        </div>
        <div class="grid-horizontal-wrap__section w700">
          <table class="kw-table--normal">
            <colgroup>
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
            </colgroup>
            <tbody>
              <tr>
                <td class="text-left">
                  <!-- 분당공수 -->
                  {{ $t('MSG_TXT_AIRLIFT_PER_MIN') }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.bizManHour"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-left">
                  <!-- 급지비중 -->
                  {{ $t('MSG_TXT_RGLVL_WEIT' ) }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.bizFieldWeight"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-left">
                  <!-- 급지공수 -->
                  {{ $t('MSG_TXT_RGLVL_AIRLIFT') }}
                </td>
                <td class="text-left">
                  <kw-input
                    v-model="baseInfo.bizFieldAirlift"
                    dense
                    mask="#####"
                  />
                </td>
                <td class="text-right">
                  <!-- 일괄적용 -->
                  <kw-btn
                    dense
                    :label="$t('MSG_TIT_BK_APPLY')"
                    :disable="countInfo.bizTotalCount === 0"
                    @click="onClickBizBulkApply"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <table class="kw-table--normal">
            <colgroup>
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
              <col style="width: 14.2%;">
            </colgroup>
            <tbody>
              <tr>
                <td class="text-left">
                  <!-- 적용일자 -->
                  {{ $t('MSG_TXT_APPLY_DT') }}
                </td>
                <td
                  class="text-left"
                  colspan="5"
                >
                  <kw-date-range-picker
                    v-model:from="applyDates.bizApplyDate"
                    dense
                    to="99991231"
                    :to-disable="true"
                  />
                </td>
                <td class="text-right">
                  <!-- 일괄적용 -->
                  <kw-btn
                    dense
                    :label="$t('MSG_TIT_BK_APPLY')"
                    :disable="countInfo.bizTotalCount === 0"
                    @click="onClickBizBulkApplyDate"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <h3>{{ $t('MSG_TXT_BIZ_RGLVL') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="countInfo.bizTotalCount"
              />
            </template>
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_SAVE')"
              @click="onClickBizSave"
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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMovementLevelRef = ref(getComponentType('KwGrid'));
const grdBizLevelRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  applyDate: dayjs().format('YYYYMMDD'),
});

const baseInfo = ref({
  movementManHour: '',
  movementFieldWeight: '',
  movementAverageSpeed: '',
  bizManHour: '',
  bizFieldWeight: '',
  bizFieldAirlift: '',
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

function getMoveTime(view, row, rglvlGdCd, value) {
  let mmtLdtm = 360; // [이동급지] 급지등급 25등급은 '섬'으로 이동시간 360 고정

  if (rglvlGdCd !== '25') {
    view.setValue(row, 'mmtDstn', value);

    const mmtDstn = Number(value);
    const averageSpeed = Number(baseInfo.value.movementAverageSpeed);
    mmtLdtm = (mmtDstn * 60) / averageSpeed;

    view.setValue(row, 'mmtLdtm', mmtLdtm);
  }
  return mmtLdtm;
}

function setAllowance(view, row, mmtLdtm) {
  const manHour = Number(baseInfo.value.movementManHour);
  const fieldWeight = Number(baseInfo.value.movementFieldWeight);
  const rglvlAwAmt = Math.round((mmtLdtm * manHour * (fieldWeight / 100)) / 100) * 100;

  view.setValue(row, 'rglvlAwAmt', rglvlAwAmt);
}

let isMovementChanged = false;

// 이동급지 - 분당공수, 급지비중, 평균시속 일괄적용
function onClickMovementBulkApply() {
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
  }
}

// 이동급지 - 적용일자 일괄적용
async function onClickMovementBulkApplyDate() {
  await setApplyDates(grdMovementLevelRef.value.getView(), 'movementApplyDate');
}

// 업무급지 - 분당공수, 급지비중, 급지공수
function onClickBizBulkApply() {
  const view = grdBizLevelRef.value.getView();
  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    const rglvlGdCd = gridUtil.getCellValue(view, dataRow, 'rglvlGdCd'); // 급지등급코드
    let mmtLdtm = gridUtil.getCellValue(view, dataRow, 'mmtLdtm'); // 이동시간

    if (rglvlGdCd === '24') {
      mmtLdtm = '260'; // [업무급지] 급지등급 24등급은 "섬"으로 이동시간 260으로 계산
    }

    const manHour = Number(baseInfo.value.bizManHour); // 분당공수
    const fieldWeight = Number(baseInfo.value.bizFieldWeight); // 급지비중
    const fieldAirlift = Math.round((manHour * (fieldWeight / 100)) / 10) * 10; // 급지공수
    baseInfo.value.bizFieldAirlift = fieldAirlift;

    const rglvlAwAmt = Number(mmtLdtm) * fieldAirlift;
    view.setValue(dataRow, 'rglvlAwAmt', rglvlAwAmt);
  }
}

function onClickBizBulkApplyDate() {
  setApplyDates(grdBizLevelRef.value.getView(), 'bizApplyDate');
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/region-level-allowances', { params: { ...cachedParams } });
  const { movementAllowances, bizAllowances } = res.data;

  const movementLevelView = grdMovementLevelRef.value.getView();
  countInfo.value.movementTotalCount = movementAllowances.length;
  movementLevelView.getDataSource().setRows(movementAllowances);
  movementLevelView.resetCurrent();
  originApplyDates.movementApplyDate = movementAllowances[0] ? movementAllowances[0].apyStrtdt : '';

  const bizLevelview = grdBizLevelRef.value.getView();
  countInfo.value.bizTotalCount = bizAllowances.length;
  bizLevelview.getDataSource().setRows(bizAllowances);
  bizLevelview.resetCurrent();
  originApplyDates.bizApplyDate = bizAllowances[0] ? bizAllowances[0].apyStrtdt : '';
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
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

async function saveData(view) {
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!validateApplyDate(view)) return;

  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.post('/sms/wells/service/region-level-allowances', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickMovementSave() {
  await saveData(grdMovementLevelRef.value.getView());
}

async function onClickBizSave() {
  await saveData(grdBizLevelRef.value.getView());
}

async function fetchBaseData() {
  const res = await dataService.get('/sms/wells/service/region-level-allowances/bases');
  baseInfo.value = res.data;
}

onMounted(async () => {
  await fetchBaseData();
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
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'rgstNm' },
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
      displayCallback: (grid, index, value) => (value === '9999' ? '섬' : value),
    },
    { fieldName: 'rglvlGdCd', header: t('MSG_TXT_GD'), width: '100', suffix: ' 급지' },
    { fieldName: 'mmtLdtm',
      header: t('MSG_TXT_MMT_HH_M'),
      width: '100',
      styleName: 'text-right',
      displayCallback: (grid, index, value) => (value === '9999' ? '섬' : value),
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
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_CH_EMPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rgstNm', header: t('MSG_TXT_CH_FNM'), width: '100' },
  ];

  const columnLayout = [
    'mmtDstn',
    'rglvlGdCd',
    'mmtLdtm',
    'rglvlAwAmt',
    'apyStrtdt',
    'apyEnddt',
    'fstRgstUsrId',
    'rgstNm',
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
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'rgstNm' },
  ];

  const columns = [
    { fieldName: 'mmtLdtm',
      header: t('MSG_TXT_MMT_HH_M'),
      width: '100',
      styleName: 'text-right',
      displayCallback: (grid, index, value) => (value === '9999' ? '섬' : value),
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
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_CH_EMPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rgstNm', header: t('MSG_TXT_CH_FNM'), width: '100' },
  ];

  const columnLayout = [
    'mmtLdtm',
    'rglvlGdCd',
    'rglvlAwAmt',
    'apyStrtdt',
    'apyEnddt',
    'fstRgstUsrId',
    'rgstNm',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
});
</script>
