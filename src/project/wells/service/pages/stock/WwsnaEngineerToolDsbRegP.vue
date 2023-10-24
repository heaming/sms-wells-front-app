<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaEngineerToolDsbRegP - 엔지니어 공구지급
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.03.28
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 엔지니어에게 공구 지급 등록
 ****************************************************************************************************
--->
<template>
  <kw-popup size="2xl">
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="dataParams.ogId"
            :options="svcCenters"
            :multiple="true"
            @update:model-value="onChangeSvcCenters"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_EGER')"
        >
          <kw-select
            v-model="dataParams.egerPrtnrNos"
            :model-value="dataParams.egerPrtnrNos ? dataParams.egerPrtnrNos : dataParams.egerPrtnrNos = []"
            :options="engineers"
            :multiple="true"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
      <kw-btn
        v-permission:create
        dense
        primary
        :label="$t('MSG_BTN_TOOL_DSB')"
        @click="onClickToolDsb"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="pageInfo.pageSize"
      @init="initGrdMain"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useMeta, getComponentType, defineGrid, codeUtil, useDataService, gridUtil, useGlobal, useModal } from 'kw-lib';
// import useSnCode from '~sms-wells/service/composables/useSnCode';

const dataService = useDataService();
// const { getAllEngineers } = useSnCode();
const { getConfig } = useMeta();
const { notify, confirm } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const frmMainRef = ref(getComponentType('KwObserver'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const dataParams = ref({
  ogId: [],
  egerPrtnrNos: [],
  pdCds: [],
});

// let cachedParams;

async function fetchDgr1LevlOgs() {
  const res = await dataService.get('/sms/wells/service/organizations/service-center');
  return res.data;
}

async function fetchEngineers(params) {
  return await dataService.get('/sms/wells/service/organizations/engineer', params);
}

async function getEngineers() {
  const res = await fetchEngineers({ params: { dgr1LevlOgId: dataParams.value.ogId } });
  return res.data;
}

const engineers = ref([]);
const centers = (await fetchDgr1LevlOgs());
const engs = (await getEngineers());

const svcCenters = centers.map((v) => ({ codeName: v.ogNm, codeId: v.ogId }));

function onChangeSvcCenters() {
  if (dataParams.value.ogId.length === 0) {
    dataParams.value.egerPrtnrNos = [];
    engineers.value = [];
  } else {
    const engsByOgCd = engs.filter((v) => dataParams.value.ogId.includes(v.ogId));
    engineers.value = engsByOgCd.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNoNm }));
  }
}

async function fetchData() {
  console.log(pageInfo.value);
  const res = await dataService.get('/sms/wells/service/engineer-tools/parts/paging', { params: pageInfo.value });
  const { list: toolParts, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(toolParts);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickToolDsb() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    return notify(t('MSG_ALT_NOT_SEL_ITEM'));
  }

  // TODO: observer 사용시 컴포넌트 아래 메세지 안보임. 확인 필요
  // if (!await frmMainRef.value.validate()) { return; }

  if (dataParams.value.egerPrtnrNos.length === 0) {
    return notify(t('MSG_ALT_EGER_CHO'));
  }

  if (!await confirm(t('MSG_ALT_SPLY_TOOL_EGER'))) { return; }

  dataParams.value.pdCds = chkRows.map((v) => v.svpdPdCd);

  await dataService.post('/sms/wells/service/engineer-tools', dataParams.value);

  ok();
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [{ fieldName: 'svpdSapCd' }, { fieldName: 'svpdPdCd' }, { fieldName: 'svpdNmAbbr1' }];

  const columns = [
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_ITM_NM'), width: '400' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
