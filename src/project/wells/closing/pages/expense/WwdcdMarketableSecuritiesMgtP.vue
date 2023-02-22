<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdMarketableSecuritiesMgtP - 운영비 원천세 정산(유가증권)
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 운영비 원천세 정산(유가증권) 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
  >
    <kw-action-top>
      <template #left>
        <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdPopFourth"
      :visible-rows="1"
      @init="initGrdMain"
    />

    <kw-search
      class="mt30"
      cols="2"
      @search="onSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
          required
        >
          <kw-select
            v-model="searchParams.regionalGroup"
            :options="['A', 'B', 'C', 'D']"
            first-option="all"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
          <kw-select
            v-model="searchParams.buildingNm"
            :options="['A', 'B', 'C', 'D']"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.responsibility"
            :model-value="'지점장'"
            type="radio"
            :options="['지점장', '플래너']"
          /><!--TODO.공통코드가 없어 임시로 -->
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_ELIGIBILITY')"
        >
          <kw-input
            v-model="searchParams.objectPerson"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <h3>
      {{ t('MSG_TXT_OJPS_INQR_RS') }}
      <ul class="kw-notification">
        <li>
          {{ t('MSG_TXT_AMT_IN_AFT_SPMT_BUTN_CLK') }}
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="subPageInfo.totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_OJPS_SPMT')"
        @click="onClickObjectPersonAdd"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSubRef"
      name="grdPopFifth"
      :visible-rows="5"
      class="mb10"
      @init="initGrdSub"
    />
    <h3>
      {{ t('MSG_TXT_FNL_WHTX_ADJ_OJPS') }}
      <ul class="kw-notification">
        <li>
          {{ t('MSG_TXT_SEL_THE_TAR_YOU_WA_TO_EXC_AND_CK_THE_EXC_TAR_BTN') }}
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="thirdPageInfo.totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        primary
        dense
        :label="t('MSG_TXT_OJPS_EXCD')"
      />
    </kw-action-top>
    <kw-grid
      ref="grdThirdRef"
      name="grdPopSixth"
      :visible-rows="5"
      class="mb10"
      @init="initGrdThird"
    />

    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useModal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const dataService = useDataService();
const { confirm, notify } = useGlobal();
const { ok } = useModal();
const searchParams = ref({

});
const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'COD_NOTICOBJ_SRCH_DIV',
  'COD_PAGE_SIZE_OPTIONS',
);

const subPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const thirdPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
let cachedParams;
let mainParams;
async function fetchData() {
  mainParams.useYearMonth = cloneDeep(props.value);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainParams);
}

async function fetchPages() {
  const view = grdSubRef.value.getView();
  const SubServices = ([
    { col1: '2022-08-09 오전 08:03', col2: '경북총괄단', col3: '1111-1111-1111-1111', col4: '오천교송어회', col5: '일반대중음식', col6: '경북 예천군 효명...', col7: '11111111', col8: '123,123', col9: '정산', col10: '선택', col11: '예천빌딩식구', col12: '식사', col13: '원천세 정산', col14: '완료' },
    { col1: '2023-08-09 오전 08:03', col2: '테스트', col3: '1111-1111-1111-1111', col4: '오천교송어회', col5: '일반대중음식', col6: '경북 예천군 효명...', col7: '11111111', col8: '123,123', col9: '정산', col10: '선택', col11: '예천빌딩식구', col12: '식사', col13: '원천세 정산', col14: '완료' },
  ]);
  subPageInfo.value.totalCount = 2;
  view.getDataSource().setRows(SubServices);
  view.resetCurrent();
  console.log(cachedParams);
  console.log(dataService);
  /* TODO.뒷단 완료되면 다시 할꺼
  const response = await dataService.
  get('/sms/wells/expense/operating-cost/withholding-Tax-scr', { params: cachedParams });
  const pages = response.data;

  totalCount.value = pages.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
  view.resetCurrent();
  */
}

async function onSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
}

async function onClickObjectPersonAdd() {
  // 대상자 추가
  const view = grdSubRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    await notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  checkedRows.forEach((obj) => {
    // 등록금액 + [대상자 조회결과 grid]의 금액합산 > 정산대상금액 인 경우
    const adjustObject = 0;
    if (obj.total > adjustObject) {
      view.setValue(searchParams.value.objectPerson);
    }
  });
}

async function onClickSave() {
  // 저장
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  } if (checkedRows.length > 1) {
    notify(t('MSG_ALT_PRGS_OK'));
  }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();

  /* TODO. 뒷단 완료되면 다시 살릴꺼
  await dataService.post('/sms/wells/expense/operating-cost/withholding-Tax-scr', { params: checkedRows });
  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
  */
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_USE_DTM'), width: '230', styleName: 'text-center' }, // 사용일시
    { fieldName: 'col2', header: t('MSG_TXT_MRC'), width: '230', styleName: 'text-left' }, // 가맹점
    { fieldName: 'col3', header: t('MSG_TXT_ADJ_OJ_AMT'), width: '200', styleName: 'text-right' }, // 정산대상금액
    { fieldName: 'col4', header: t('RGST_AMT'), width: '200', styleName: 'text-right' }, // 등록금액
    { fieldName: 'col5', header: t('MSG_TXT_UNRG_AMT'), width: '201', styleName: 'text-right' }, // 미등록금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-left' }, // 총괄단
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '123', styleName: 'text-left' }, // 지역단
    { fieldName: 'col3', header: t('MSG_TXT_BLD_NM'), width: '195', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left' }, // 성명
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'col6', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left' }, // 직책
    { fieldName: 'col7', header: t('MSG_TXT_PERF'), width: '85', styleName: 'text-center' }, // 실적
    { fieldName: 'col8',
      header: {
        text: t('MSG_TXT_AMT'),
        styleName: 'essential',
      },
      width: '211',
      styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const initGrdThird = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PERF'), width: '91', styleName: 'text-left' }, // 총괄단
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '102', styleName: 'text-left' }, // 지역단
    { fieldName: 'col3', header: t('MSG_TXT_BLD_NM'), width: '164', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '83', styleName: 'text-left' }, // 성명
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'col6', header: t('MSG_TXT_EMPL_NM'), width: '105', styleName: 'text-left' }, // 직책
    { fieldName: 'col7', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '169', styleName: 'text-right' }, // 운영비 정산금액
    { fieldName: 'col8', header: t('MSG_TXT_WHTX'), width: '178', styleName: 'text-right' }, // 원천세
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
onMounted(async () => {
  fetchData();
});
</script>
