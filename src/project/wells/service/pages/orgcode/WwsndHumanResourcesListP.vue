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
            ref="selectMngrDvCdRef"
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
            :readonly="!isEmpty(deptMngrDvCd)"
            rules="required"
            @update:model-value="onUpdateMngrDvCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DEPTARTMENT_1')"
        >
          <kw-select
            ref="selectDeptCdRef"
            v-model="searchParams.deptCd"
            :options="customCodes.deptCd"
            option-value="deptCd"
            option-label="deptNm"
            first-option="all"
            :readonly="!isManager(searchParams.mngrDvCd)"
            @update:model-value="onUpdateDeptCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CENTER_DIVISION', [$t('MSG_TXT_CENTER_DIVISION')])"
        >
          <kw-select
            v-model="searchParams.cnrCd"
            :options="customCodes.cnrCd"
            option-value="cnrCd"
            option-label="cnrNm"
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
import { codeUtil, gridUtil, defineGrid, useDataService, useModal, getComponentType, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { onMounted } from 'vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { cancel: onClickCancel, ok } = useModal();
const dataService = useDataService();
const userInfo = useStore().getters['meta/getUserInfo'];
const emit = defineEmits(['update:modelValue']);

// TODO: 팝업 사용 요건에 따라 변경 필요
const props = defineProps({
  mngrDvCd: {
    type: String,
  },
  deptCd: {
    type: String,
  },
  cnrCd: {
    type: String,
  },
  searchText: {
    type: String,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const selectMngrDvCdRef = ref(getComponentType('KwSelect'));
const selectDeptCdRef = ref(getComponentType('KwSelect'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD',
);

const customCodes = ref({
  deptCd: [],
  cnrCd: [],
});

const managerCodes = {
  deptCd: [],
  cnrCd: [],
};

const engineerCodes = {
  deptCd: [],
  cnrCd: [],
};

const searchParams = ref({
  mngrDvCd: '',
  deptCd: '',
  cnrCd: '',
  searchText: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

// TODO: 부서 코드 정해지면 수정 필요
const deptMngrDvCd = computed(() => {
  if (userInfo.departmentId === '매니저') {
    return '1';
  }
  if (userInfo.departmentId === '엔지니어') {
    return '2';
  }
  return '';
});

function isManager(val) {
  return val === '1';
}

async function fetchHumanResourcesPages(params) {
  return await dataService.get('/sms/wells/service/human-resources/paging', params);
}

async function getHumanResourcesPages() {
  const res = await fetchHumanResourcesPages({ params: { ...cachedParams, ...pageInfo.value } });
  const { list: workNotices, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(workNotices);
  view.resetCurrent();
}

async function fetchManagerDepartmentCodes() {
  return await dataService.get('/sms/wells/service/human-resources/manager-departments');
}

async function fetchManagerCenterCodes(deptCd) {
  return await dataService.get(`/sms/wells/service/human-resources/manager-centers/${deptCd}`);
}

async function fetchEngineerCenterCodes() {
  return await dataService.get('/sms/wells/service/human-resources/engineer-centers');
}

async function initManagerCodes() {
  const res1 = await fetchManagerDepartmentCodes();
  managerCodes.deptCd = res1.data;
  const res2 = await fetchManagerCenterCodes('ALL');
  managerCodes.cnrCd = res2.data;
}

async function initEngineerCodes() {
  const res = await fetchEngineerCenterCodes();
  engineerCodes.deptCd = [];
  engineerCodes.cnrCd = res.data;
}

await initManagerCodes();
await initEngineerCodes();
searchParams.value.mngrDvCd = isEmpty(deptMngrDvCd.value) ? '1' : cloneDeep(deptMngrDvCd.value);

watch(() => searchParams.value.mngrDvCd, (newVal) => {
  if (isManager(newVal)) {
    customCodes.value.deptCd = cloneDeep(managerCodes.deptCd);
    customCodes.value.cnrCd = cloneDeep(managerCodes.cnrCd);
  } else {
    customCodes.value.deptCd = [];
    customCodes.value.cnrCd = cloneDeep(engineerCodes.cnrCd);
  }
}, { immediate: true });

watch(() => searchParams.value.deptCd, async (newVal) => {
  if (isManager(searchParams.value.mngrDvCd)) {
    if (isEmpty(newVal)) {
      customCodes.value.cnrCd = cloneDeep(managerCodes.cnrCd);
    } else {
      const res = await fetchManagerCenterCodes(newVal);
      customCodes.value.cnrCd = res.data;
    }
  }
}, { immediate: true });

function onUpdateMngrDvCd(val) {
  if (selectMngrDvCdRef.value.pending) {
    emit('update:modelValue', val);
    return;
  }
  searchParams.value.deptCd = '';
  searchParams.value.cnrCd = '';
  emit('update:modelValue', val);
}

function onUpdateDeptCd(val) {
  if (selectMngrDvCdRef.value.pending) {
    emit('update:modelValue', val);
    return;
  }
  searchParams.value.cnrCd = '';
  emit('update:modelValue', val);
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
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_CENTER_DIVISION')]), width: '250', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_BRANCH')]), width: '250', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_PSTN'), width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_ROLE_1'), width: '150', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_ENTCO')]), width: '150', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'col10', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_RSGN')]), width: '150', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
  ];

  const layouts = [
    {
      header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_CENTER_DIVISION')]),
      direction: 'horizontal',
      items: ['col1', 'col2'],
    },
    'col3',
    'col4',
    {
      header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_BRANCH')]),
      direction: 'horizontal',
      items: ['col5', 'col6'],
    },
    'col7',
    'col8',
    'col9',
    'col10',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

onMounted(async () => {
  // TODO: 팝업 사용 요건에 따라 변경 필요
  let searchFlag = false;
  if (!isEmpty(props.mngrDvCd)) {
    searchParams.value.mngrDvCd = cloneDeep(props.mngrDvCd);
    if (!isEmpty(props.deptCd)) searchParams.value.deptCd = cloneDeep(props.deptCd);
    if (!isEmpty(props.cnrCd)) searchParams.value.cnrCd = cloneDeep(props.cnrCd);
    searchFlag = true;
  }
  if (!isEmpty(props.searchText)) {
    searchParams.value.searchText = cloneDeep(props.searchText);
    searchFlag = true;
  }
  if (searchFlag) await onClickSearch();
});
</script>
