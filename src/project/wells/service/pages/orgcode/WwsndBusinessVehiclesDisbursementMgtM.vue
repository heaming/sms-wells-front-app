<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SND
 2. 프로그램 ID : WwsndBusinessVehiclesDisbursementMgtM - 업무차량 지급관리
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.01.25
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 엔지니어가 사용하는 업무차량을 조회 (http://localhost:3000/#/service/wwsnd-business-vehicles-disbursement-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 광역센터 -->
        <kw-search-item :label="$t('MSG_TXT_WIDA_CNR')">
          <kw-select
            v-model="searchParams.hgrOgId"
            :options="centers"
            first-option="all"
            @update:model-value="onUpdateCenters"
          />
        </kw-search-item>
        <!-- 지점 -->
        <kw-search-item :label="$t('MSG_TXT_BRANCH')">
          <kw-select
            v-model="searchParams.ogCd"
            :options="branchs"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
            @update:model-value="onUpdateBranchs"
          />
        </kw-search-item>
        <!-- 엔지니어 -->
        <kw-search-item :label="$t('MSG_TXT_EGER')">
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            first-option="all"
          />
        </kw-search-item>
        <!-- 조회구분 -->
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-select
            v-model="searchParams.findGb"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_NO_RGS') }]"
            first-option="all"
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
            @change="fetchData"
          />
        </template>
        <kw-btn
          dense
          icon="print"
          label="인쇄"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_VHC_DSB_RGST')"
          dense
          primary
          @click="onClickVhcDsbRegBtn"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, getComponentType, defineGrid, codeUtil, useGlobal, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getServiceCenterOrgs, getAllEngineers } = useSnCode();
const { getConfig } = useMeta();
const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'VHC_MNGT_TP_CD',
);

const searchParams = ref({
  hgrOgId: '',
  ogCd: '',
  prtnrNo: '',
  findGb: '',
});

let cachedParams;

const centers = ref();
const branchs = ref();
const engineers = ref();
const svcCenters = (await getServiceCenterOrgs());
const engs = (await getAllEngineers('G_ONLY_ENG')).G_ONLY_ENG;

centers.value = svcCenters.map((v) => ({ codeName: v.ogNm, codeId: v.ogId }));
// engineers.value = engs.map((v) => ({ codeId: v.codeId, codeName: v.codeNm }));

async function onUpdateBranchs() {
  if (searchParams.value.ogCd === '') {
    searchParams.value.prtnrNo = '';
  } else {
    const engByOgCd = engs.filter((v) => v.ogCd === searchParams.value.ogCd);
    engineers.value = engByOgCd.map((v) => ({ codeId: v.codeId, codeName: v.codeNm }));
  }
}

async function onUpdateCenters() {
  if (searchParams.value.hgrOgId === '') {
    searchParams.value.ogCd = '';
  } else {
    const ogCdByHgrOgId = svcCenters.filter((v) => v.hgrOgId === searchParams.value.hgrOgId);
    branchs.value = ogCdByHgrOgId.map((v) => ({ ogNm: v.ogNm, ogCd: v.ogCd }));
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/business-vehicles/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: businessVehicles, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(businessVehicles);
  view.resetCurrent();
}

// TODO: 조회버튼 클릭(월파트너내역 작업 완료 후 mapper.xml 수정)
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickVhcDsbRegBtn() {
  const { result } = await modal({
    component: 'WwsndBusinessVehiclesRegP',
  });

  if (result) await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/business-vehicles', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: '업무차량 지급목록',
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rol' },
    { fieldName: 'cntrDt' },
    { fieldName: 'carno' },
    { fieldName: 'carnm' },
    { fieldName: 'vhcMngtTpNm' },
    { fieldName: 'vhcMngtTpCd' },
    { fieldName: 'vhcPymdt' },
    { fieldName: 'dsbEnddt' },
    { fieldName: 'insrAgeCd' },
    { fieldName: 'rflngCdnoEncr' },
    { fieldName: 'hipsCdnoEncr' },
    { fieldName: 'vhcDsbRmkCn' },
    { fieldName: 'ogCd' },
    { fieldName: 'vhcMngtNo' },
    { fieldName: 'vhcMngtSn' },
    { fieldName: 'vhcMngtPrtnrNo' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_SV_CNR'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'rol', header: t('MSG_TXT_ROLE_1'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'carno', header: t('MSG_TXT_CARNO'), width: '120', styleName: 'text-center' },
    { fieldName: 'carnm', header: t('MSG_TXT_VHC_KND'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'vhcMngtTpNm',
      header: t('MSG_TXT_J_TP'),
      width: '100',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const vhcMngtTpCd = grid.getValue(index.itemIndex, 'vhcMngtTpCd');
        if (vhcMngtTpCd !== null) {
          return codes.VHC_MNGT_TP_CD.find((obj) => obj.codeId === grid.getValue(index.itemIndex, 'vhcMngtTpCd')).codeName;
        }

        return isEmpty(value) ? vhcMngtTpCd : value;
      },
    },
    { fieldName: 'vhcPymdt', header: t('MSG_TXT_DSB_STRT_D'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dsbEnddt', header: t('MSG_TXT_DSB_END_D'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'insrAgeCd', header: t('MSG_TXT_INSR_AGE'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'rflngCdnoEncr',
      header: t('MSG_TXT_RFLNG_CARD'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const rflngCdno = grid.getValue(index.itemIndex, 'rflngCdnoEncr');
        if (rflngCdno !== null) {
          return rflngCdno?.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1-$2-$3-$4');
        }

        return isEmpty(value) ? rflngCdno : value;
      },
    },
    {
      fieldName: 'hipsCdnoEncr',
      header: t('MSG_TXT_HIPS'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const hipsCdno = grid.getValue(index.itemIndex, 'hipsCdnoEncr');
        if (hipsCdno !== null) {
          return hipsCdno?.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1-$2-$3-$4');
        }

        return isEmpty(value) ? hipsCdno : value;
      },
    },
    { fieldName: 'vhcDsbRmkCn', header: t('MSG_TXT_NOTE'), width: '300', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellDblClicked = async (grid) => {
    if (pageInfo.value.totalCount > 0) {
      const {
        ogCd,
        vhcMngtNo,
        vhcMngtSn,
        prtnrNo,
        vhcMngtPrtnrNo,
      } = gridUtil.getRowValue(grid, grid.getCurrent().dataRow);

      const { result } = await modal({
        component: 'WwsndBusinessVehiclesRegP',
        componentProps: { ogCd, vhcMngtNo, vhcMngtSn, prtnrNo, vhcMngtPrtnrNo },
      });

      if (result) await fetchData();
    }
  };
});
</script>
<style scoped> </style>
