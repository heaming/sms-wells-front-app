<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : WwsndHumanResourcesListP - 인사기본정보 조회 팝업
3. 작성자 : KJ
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 인사기본정보 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup class="kw-popup--3xl">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ICHR_DV')"
          required
        >
          <kw-select
            ref="cbMngrDvCdRef"
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
            :readonly="!isEmpty(props.mngrDvCd)"
            rules="required"
            @change="onChangeMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="isManagerSelected ? $t('MSG_TXT_MANAGEMENT_DEPARTMENT') : $t('MSG_TXT_CENTER_DIVISION')"
        >
          <kw-select
            ref="cbDgr1LevlOgIdRef"
            v-model="searchParams.dgr1LevlOgId"
            :options="dgr1LevlOgs"
            option-value="ogId"
            option-label="ogNm"
            first-option="all"
            @change="onChangeDgr1LevlOgId"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isManagerSelected"
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-select
            ref="cbDgr2LevlOgIdRef"
            v-model="searchParams.dgr2LevlOgId"
            :options="dgr2LevlOgs"
            option-value="ogId"
            option-label="ogNm"
            first-option="all"
            @change="onChangeDgr2LevlOgId"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isManagerSelected"
          :label="$t('MSG_TXT_BRANCH')"
        >
          <kw-select
            ref="cbDgr3LevlOgIdRef"
            v-model="searchParams.dgr3LevlOgId"
            :options="dgr3LevlOgs"
            option-value="ogId"
            option-label="ogNm"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`"
        >
          <kw-input
            v-model="searchParams.searchText"
            :maxlength="100"
            :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`])"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="getHumanResourcesPages"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="getHumanResourcesPages"
      />
    </div>
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        :label="$t('MSG_BTN_SELT')"
        primary
        @click="onClickSelect"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { onMounted } from 'vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { cancel: onClickCancel, ok } = useModal();
const dataService = useDataService();

const props = defineProps({
  mngrDvCd: {
    type: String,
    default: '',
  },
  dgr1LevlOgId: {
    type: String,
    default: '',
  },
  dgr2LevlOgId: {
    type: String,
    default: '',
  },
  dgr3LevlOgId: {
    type: String,
    default: '',
  },
  searchText: {
    type: String,
    default: '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const cbMngrDvCdRef = ref(getComponentType('KwSelect'));
const cbDgr1LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbDgr2LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbDgr3LevlOgIdRef = ref(getComponentType('KwSelect'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD',
  'MNGER_PSTN_CD',
  'EGER_ROL_CD',
);

const organizations = ref([]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  mngrDvCd: isEmpty(props.mngrDvCd) ? '1' : props.mngrDvCd,
  dgr1LevlOgId: props.dgr1LevlOgId,
  dgr2LevlOgId: props.dgr2LevlOgId,
  dgr3LevlOgId: props.dgr3LevlOgId,
  searchText: props.searchText,
});

let cachedParams;

const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');

const dgr1LevlOgs = computed(() => {
  const ogTpCd = isManagerSelected.value ? 'W02' : 'W06';
  return organizations.value.filter((og) => (og.ogTpCd === ogTpCd && og.ogLevlDvCd === '1'));
});

const dgr2LevlOgs = computed(() => {
  if (isEmpty(searchParams.value.dgr1LevlOgId)) return [];
  return organizations.value.filter((og) => (og.ogTpCd === 'W02' && og.ogLevlDvCd === '2' && og.hgrOgId === searchParams.value.dgr1LevlOgId));
});

const dgr3LevlOgs = computed(() => {
  if (isEmpty(searchParams.value.dgr2LevlOgId)) return [];
  return organizations.value.filter((og) => (og.ogTpCd === 'W02' && og.ogLevlDvCd === '3' && og.hgrOgId === searchParams.value.dgr2LevlOgId));
});

const layouts = computed(() => {
  if (isManagerSelected.value) {
    return [
      {
        header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_BRANCH')]),
        direction: 'horizontal',
        items: ['ogCd', 'ogNm1'],
      },
      'prtnrNo',
      'prtnrKnm',
      'pstnDvCd',
      'cntrDt',
      'cltnDt',
    ];
  }
  return [
    {
      header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_CENTER_DIVISION')]),
      direction: 'horizontal',
      items: ['ogCd', 'ogNm2'],
    },
    'prtnrNo',
    'prtnrKnm',
    'rolDvCd',
    'cntrDt',
    'cltnDt',
  ];
});

async function fetchOrganizations() {
  return await dataService.get('/sms/wells/service/human-resources/organizations');
}

async function getOrganizations() {
  const res = await fetchOrganizations();
  organizations.value = res.data;
}

await getOrganizations();

async function fetchHumanResourcesPages(params) {
  return await dataService.get('/sms/wells/service/human-resources/paging', params);
}

async function getHumanResourcesPages() {
  const res = await fetchHumanResourcesPages({ params: { ...cachedParams, ...pageInfo.value } });
  const { list: humanResources, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.setColumnLayout(layouts.value);

  view.getDataSource().setRows(humanResources);
  view.resetCurrent();
}

function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
}

function onChangeDgr1LevlOgId() {
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
}

function onChangeDgr2LevlOgId() {
  searchParams.value.dgr3LevlOgId = '';
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await getHumanResourcesPages();
}

async function onClickSelect() {
  const view = grdMainRef.value.getView();
  const checked = gridUtil.getCheckedRowValues(view);
  if (checked.length === 0) {
    await alert(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    ok(checked);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// TODO: 조직쪽 테이블 및 로직 확정되면 수정 필요
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogId' }, // 조직ID
    { fieldName: 'ogCd' }, // 조직코드
    { fieldName: 'ogNm' }, // 조직명
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'prtnrKnm' }, // 파트너한글명
    { fieldName: 'pstnDvCd' }, // 직급구분코드
    { fieldName: 'rolDvCd' }, // 직무구분코드
    { fieldName: 'cntrDt' }, // 계약일자
    { fieldName: 'cltnDt' }, // 해약일자
    { fieldName: 'dgr1LevlOgId' }, // 1차레벨조직ID
    { fieldName: 'dgr1LevlOgCd' }, // 1차레벨조직코드
    { fieldName: 'dgr1LevlOgNm' }, // 1차레벨조직명
    { fieldName: 'dgr2LevlOgId' }, // 2차레벨조직ID
    { fieldName: 'dgr2LevlOgCd' }, // 2차레벨조직코드
    { fieldName: 'dgr2LevlOgNm' }, // 2차레벨조직명
    { fieldName: 'dgr3LevlOgId' }, // 3차레벨조직ID
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_CODE'), width: '100', styleName: 'text-center' },
    { name: 'ogNm1', fieldName: 'ogNm', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_BRANCH')]), width: '250', styleName: 'text-left' },
    { name: 'ogNm2', fieldName: 'ogNm', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_CENTER_DIVISION')]), width: '250', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), options: codes.MNGER_PSTN_CD, width: '117', styleName: 'text-center' },
    { fieldName: 'rolDvCd', header: t('MSG_TXT_ROLE_1'), options: codes.EGER_ROL_CD, width: '150', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_ENTCO')]), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_RSGN')]), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts.value);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

onMounted(async () => {
  if (!isEmpty(props.mngrDvCd) && !isEmpty(props.searchText)) await onClickSearch();
});
</script>
