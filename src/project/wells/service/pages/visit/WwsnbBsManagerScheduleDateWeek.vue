<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbBsManagerScheduleDateWeek - BS관리일정조회(주차별)
 3. 작성자 : 홍세기
 4. 작성일 : 2023.06.01
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - KSS에서 넘어온화면
 ****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 관리년월 -->
      <kw-search-item
        :label="$t('관리년도')"
        required
      >
        <kw-date-picker
          v-model="searchParams.managementYear"
          type="year"
          class="w120"
          rules="required"
          :label="$t('관리년도')"
          @change="initInfo"
        />
        <kw-select
          v-model="searchParams.selectweeks"
          :options="weekItems"
          first-option="all"
          option-label="codeName"
          option-value="codeId"
          rules="required"
          :label="$t('관리항목')"
          @change="changeWeeks"
        />
      </kw-search-item>
      <!-- 담당자 -->
      <kw-form-item :label="$t('MSG_TXT_PIC')">
        <kw-input
          v-model.trim="searchParams.fxnPrtnrKnm"
          icon="search"
          class="w120"
          clearable
          :disable="wmAuth"
          @click-icon="onFxnPrtnrNoSearchPopup"
        />
        <kw-input
          v-model="searchParams.fxnPrtnrNo"
          class="w120"
          placeholder=""
          disable
        />
      </kw-form-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-grid
      ref="grdfrontMainRef"
      class="mt12"
      :visible-rows="1"
      @init="initfrontGrdMain"
    />
    <div
      class="mt50"
      style="overflow-x: auto;"
    >
      <table
        class="kw-table--normal"
        style="width: 100%;"
      >
        <colgroup>
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
        </colgroup>
        <thead>
          <tr>
            <th>{{ $t('MSG_TXT_DIV') }}</th>
            <th>{{ $t('MSG_TXT_SUN') }}</th>
            <th>{{ $t('MSG_TXT_MON') }}</th>
            <th>{{ $t('MSG_TXT_TUE') }}</th>
            <th>{{ $t('MSG_TXT_WED') }}</th>
            <th>{{ $t('MSG_TXT_THU') }}</th>
            <th>{{ $t('MSG_TXT_FRI') }}</th>
            <th>{{ $t('MSG_TXT_SAT') }}</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-if="bsList.length === 0"
          >
            <tr>
              <td
                class="text-left"
                colspan="15"
              >
                {{ $t('MSG_TXT_NO_DATA_FOUND') }}
              </td>
            </tr>
          </template>
          <template
            v-for="(item, index) in bsList"
            :key="index"
          >
            <tr>
              <td class="text-center">
                {{ item.weekGubun }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay1 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay2 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay3 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay4 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay5 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay6 }}
              </td>
              <td class="text-center">
                {{ item.bsWeekDay7 }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, getComponentType, useDataService, useMeta } from 'kw-lib';

import dayjs from 'dayjs';

const { t } = useI18n();

const { getConfig } = useMeta();

const { modal, notify } = useGlobal();
const dataService = useDataService();

// DEF_4653 관련 웰스매니저인 경우 본인만 조회 가능하도록...
const store = useStore();
const userInfo = store.getters['meta/getUserInfo'];
const wmAuth = ref((userInfo.rsbNm === '매니저' || userInfo.rsbNm === '플래너') && userInfo.tenantCd === 'W' && userInfo.ogTpCd !== 'HR1');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdfrontMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  baseDateFrom: dayjs().format('YYYYMMDD'),
  baseDateTo: dayjs().format('YYYYMMDD'),
  fxnPrtnrNo: '',
  fxnPrtnrKnm: '',
  managementYear: dayjs().format('YYYY'),
  selectweeks: '',
  weekDay1: '',
  weekDay2: '',
  weekDay3: '',
  weekDay4: '',
  weekDay5: '',
  weekDay6: '',
  weekDay7: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const weekItems = ref([{
  codeName: '',
  codeId: '',
  cntrSn: 0,
  dayC1: '',
  dayC2: '',
  dayC3: '',
  dayC4: '',
  dayC5: '',
  dayC6: '',
  dayC7: '',
  dayS1: '',
  dayS2: '',
  dayS3: '',
  dayS4: '',
  dayS5: '',
  dayS6: '',
  dayS7: '',
}]);

async function onChangeYear() {
  const { data } = await dataService.get('/sms/wells/service/bs-manager-schedule/weeks-items', { params: searchParams.value });
  return data;
}

async function fetchData1() {
  /** 위 집계 그리드 * */
  const res1 = await dataService.get('/sms/wells/service/bs-manager-schedule/dt-aggregates', { params: searchParams.value });

  const view1 = grdfrontMainRef.value.getView();
  view1.getDataSource().setRows(res1.data);
  view1.resetCurrent();
}

const bsList = ref({});
async function fetchData2() {
  /** 위 집계 그리드 * */
  const res2 = await dataService.get('/sms/wells/service/bs-manager-schedule/details', { params: searchParams.value });
  bsList.value = res2.data;
}

async function onClickSearch() {
  if (!searchParams.value.fxnPrtnrNo) {
    notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_PIC')]));
    return;
  }
  pageInfo.value.pageIndex = 1;
  await fetchData1();
  await fetchData2();
}

async function changeWeeks() {
  const sfdf = weekItems.value.find((v) => v.codeId === searchParams.value.selectweeks);

  const selectedDay = document.querySelectorAll('.kw-table--normal thead tr th');
  selectedDay[1].textContent = sfdf.dayS1;
  selectedDay[2].textContent = sfdf.dayS2;
  selectedDay[3].textContent = sfdf.dayS3;
  selectedDay[4].textContent = sfdf.dayS4;
  selectedDay[5].textContent = sfdf.dayS5;
  selectedDay[6].textContent = sfdf.dayS6;
  selectedDay[7].textContent = sfdf.dayS7;
  searchParams.value.weekDay1 = sfdf.dayC1;
  searchParams.value.weekDay2 = sfdf.dayC2;
  searchParams.value.weekDay3 = sfdf.dayC3;
  searchParams.value.weekDay4 = sfdf.dayC4;
  searchParams.value.weekDay5 = sfdf.dayC5;
  searchParams.value.weekDay6 = sfdf.dayC6;
  searchParams.value.weekDay7 = sfdf.dayC7;
}

async function initInfo() {
  weekItems.value = await onChangeYear();

  const todayWeek = weekItems.value.find((v) => (v.codeId.substring(0, 8) <= dayjs().format('YYYYMMDD')) && (v.codeId.substring(8, 16) >= dayjs().format('YYYYMMDD')));
  searchParams.value.selectweeks = todayWeek.codeId;
}

/*
 *  Event - 방문담당자 검색 버튼 클릭
 */
async function onFxnPrtnrNoSearchPopup() {
  if (wmAuth.value) {
    return;
  }
  const mngrDvCd = searchParams.value.fxnPrtnrDvCd ?? '';
  const searchText = searchParams.value.fxnPrtnrKnm;

  const { result: isChanged, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd,
      searchText,
    },
  });

  const arrDgrOgId = [];
  console.log('arrDgrOgId >>>>', arrDgrOgId);

  console.log('close popup userInfo >>>', userInfo);
  console.log('close popup payload[0] >>>', payload[0]);

  if (userInfo.careerLevelCode === '1' || userInfo.careerLevelCode === '2') {
    if (userInfo.ogId !== payload[0].dgr1LevlOgId) {
      searchParams.value.fxnPrtnrNo = '';
      searchParams.value.fxnPrtnrKnm = '';
      await notify(t('소속 매니저가 아닙니다.'));
      return;
    }
  } else if (userInfo.careerLevelCode === '4') {
    if (userInfo.ogId !== payload[0].dgr2LevlOgId) {
      searchParams.value.fxnPrtnrNo = '';
      searchParams.value.fxnPrtnrKnm = '';
      await notify(t('소속 매니저가 아닙니다.'));
      return;
    }
  } else if (userInfo.careerLevelCode === '7') {
    if (userInfo.ogId !== payload[0].dgr3LevlOgId) {
      searchParams.value.fxnPrtnrNo = '';
      searchParams.value.fxnPrtnrKnm = '';
      await notify(t('소속 매니저가 아닙니다.'));
      return;
    }
  }

  if (isChanged) {
    searchParams.value.fxnPrtnrNo = payload[0].prtnrNo;
    searchParams.value.fxnPrtnrKnm = payload[0].prtnrKnm;
  }
}

await Promise.all([
  initInfo(),
]);

onMounted(async () => {
  if (wmAuth.value) {
    searchParams.value.fxnPrtnrKnm = userInfo.userName;
    searchParams.value.fxnPrtnrNo = userInfo.employeeIDNumber;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize front Grid
// -------------------------------------------------------------------------------------------------
const initfrontGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'recntrDt' },
    { fieldName: 'cntrDt' },
    { fieldName: 'mngtAcc' },
    { fieldName: 'vstAcc' },
    { fieldName: 'fshAcc' },
    { fieldName: 'svcProc' },
  ];

  const columns = [
    { fieldName: 'cntrDt',
      header: t('MSG_TXT_INIT_CNTR_DT'),
      width: '150',
    }, // 최초계약일
    { fieldName: 'recntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '100' }, // 계약일자
    { fieldName: 'mngtAcc', header: t('MSG_TXT_MNGT_ACC'), width: '150', styleName: 'text-center' }, // 관리계정
    { fieldName: 'vstAcc', header: t('MSG_TXT_VST_ACC'), width: '100', styleName: 'text-center' }, // 방문계정
    { fieldName: 'fshAcc', header: t('MSG_TXT_FSH_ACC'), width: '150', styleName: 'text-center' }, // 완료계정
    { fieldName: 'svcProc', header: t('MSG_TXT_SVC_PROC'), width: '150', styleName: 'text-center' }, // 서비스처리율(%)
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const columnLayout = [
    'cntrDt',
    'recntrDt',
    'mngtAcc',
    'vstAcc',
    'fshAcc',
    'svcProc',
  ];

  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;
});

// -------------------------------------------------------------------------------------------------
// Initialize Table
// -------------------------------------------------------------------------------------------------

</script>

<style scoped>
</style>
