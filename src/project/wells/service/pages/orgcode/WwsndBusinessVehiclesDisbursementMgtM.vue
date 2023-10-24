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
        <!-- 서비스센터 -->
        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.ogId"
          v-model:prtnr-no="searchParams.prtnrNo"
          dgr1-levl-og-first-option="all"
          partner-first-option="all"
          use-og-level="1"
          use-partner
          partner-label="prtnrNoNm"
        />
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
        <!-- <kw-btn
          dense
          secondary
          label="고객 기본정보 테스트"
          @click="onClickTest"
        /> -->
        <kw-btn
          v-permission:download
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
          v-permission:create
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
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

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
  ogId: '',
  prtnrNo: '',
  findGb: '',
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/business-vehicles/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: businessVehicles, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(businessVehicles);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

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

  const res = await dataService.get('/sms/wells/service/business-vehicles', { params: cachedParams, timeout: 300000 });
  await gridUtil.exportView(view, {
    fileName: '업무차량 지급목록',
    timePostfix: true,
    exportData: res.data,
  });
}

// async function onClickTest() {
//   const { result, payload } = await modal({
//     component: 'WwsnyCustomerBaseInformationP',
//   });
//   console.log(result);
//   console.log(payload);
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rolDvCd' },
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
    { fieldName: 'ogId' },
    { fieldName: 'vhcMngtNo' },
    { fieldName: 'vhcMngtSn' },
    { fieldName: 'vhcMngtPrtnrNo' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_SV_CNR'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'rolDvCd', header: t('MSG_TXT_ROLE_1'), width: '100', styleName: 'text-center' }, // TODO: 관련 데이터 작업 완료 시 수정 필요
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'carno', header: t('MSG_TXT_CARNO'), width: '120', styleName: 'text-center' },
    { fieldName: 'carnm', header: t('MSG_TXT_VHC_KND'), width: '100', styleName: 'text-center' },
    { fieldName: 'vhcMngtTpNm', header: t('MSG_TXT_J_TP'), width: '100', styleName: 'text-center' },
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
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (grid) => {
    if (pageInfo.value.totalCount > 0) {
      const {
        ogId,
        vhcMngtNo,
        vhcMngtSn,
        prtnrNo,
        vhcMngtPrtnrNo,
      } = gridUtil.getRowValue(grid, grid.getCurrent().dataRow);

      const { result } = await modal({
        component: 'WwsndBusinessVehiclesRegP',
        componentProps: { ogId, vhcMngtNo, vhcMngtSn, prtnrNo, vhcMngtPrtnrNo },
      });

      if (result) await fetchData();
    }
  };
});
</script>
