<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbInstallationLocationDetailMgtM - 설치 위치 상세 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2022.12.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 설치 위치 상세 관리 (http://localhost:3000/#/service/wwsnb-installation-location-detail-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.mngtDvCd"
            :options="dvCd"
            readonly=""
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SRVC_CNTR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
            @update:model-value="onUpdateSvcCode"
          />
        </kw-search-item>
        <!-- 엔지니어 -->
        <kw-search-item
          :label="$t('MSG_TXT_EGER')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.egerId"
            :options="engineers"
            first-option="all"
            class="w200"
          />
          <kw-field
            v-model="searchParams.rgsnYn"
            @update:model-value="onUpdateRgsnYn"
          >
            <!-- 퇴사자제외 -->
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조회구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.inqrDv"
            :options="[{ codeId: t('MSG_TXT_IST_DT'), codeName: t('MSG_TXT_IST_DT') }]"
            class="w150"
          />
          <kw-date-range-picker
            v-model:from="searchParams.istDtFrom"
            v-model:to="searchParams.istDtTo"
            rules="required"
          />
        </kw-search-item>
        <!-- 상품그룹 -->
        <!-- TODO : 상품 데이터 이관시 수정-->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            first-option="all"
          />
          <kw-select
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <kw-select
            v-model="searchParams.cstDv"
            :options="codes.CRP_DSC_ANA_CST_DV_CD.filter((v) => v.codeId < 10)"
            first-option="all"
          />
        </kw-search-item>
        <!-- 고객명 -->
        <kw-form-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
            maxlength="17"
          />
        </kw-form-item>
        <!-- 고객번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cstNo"
          />
        </kw-form-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <kw-separator
            vertical
            inset
            spaced
          />
        </template>
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';

import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
// import ZwcmMultiSelect from '@/modules/common/components/ZwcmMultiSelect.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();

const {
  getAllEngineers,
  getServiceCenterOrgs,
  getWorkingEngineers,
} = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const svcCode = await getServiceCenterOrgs();

const engineers = ref();
// 기획서 기준
const eng = (await getAllEngineers('G_ONLY_ENG')).G_ONLY_ENG;
const wrkEng = (await getWorkingEngineers('G_ONLY_ENG')).G_ONLY_ENG;
engineers.value = eng.map((v) => ({ codeId: v.codeId, codeName: v.codeNm1 }));

const dvCd = [{ codeId: '1', codeName: t('MSG_TXT_EGER') }];
const codes = await codeUtil.getMultiCodes(
  // 'CST_DV_CD',
  'CRP_DSC_ANA_CST_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'PRD_MNGT_TP_CD',
);
const now = dayjs();

const {
  notify,
} = useGlobal();

/* 조회조건 */
const searchParams = ref({
  inqrDv: t('MSG_TXT_IST_DT'),
  mngtDvCd: '1',
  ogId: '',
  istDtFrom: now.subtract(7, 'days').format('YYYYMMDD'),
  istDtTo: now.format('YYYYMMDD'),
  cstNm: '',
  cstNo: '',
  egerId: '',
  rgsnYn: 'N',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

/* 페이지 이동용 */

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/installation-locations/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'InstallationLocationDetail',
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/installation-locations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: locations, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(locations);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    await dataService.post('/sms/wells/service/installation-locations', chkRows);
  }

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

function setEngineers() {
  if (searchParams.value.ogId === '') {
    if (searchParams.value.rgsnYn === 'Y') {
      engineers.value = wrkEng.map((v) => ({ codeId: v.codeId, codeName: v.codeNm1 }));
      return;
    }
    engineers.value = eng.map((v) => ({ codeId: v.codeId, codeName: v.codeNm1 }));
  } else {
    if (searchParams.value.rgsnYn === 'Y') {
      const wrkEngByOdId = wrkEng.filter((v) => v.ogCd === searchParams.value.ogId);
      engineers.value = wrkEngByOdId.map((v) => ({ codeId: v.codeId, codeName: v.codeNm1 }));
      return;
    }
    const engByOgId = eng.filter((v) => v.ogCd === searchParams.value.ogId);
    engineers.value = engByOgId.map((v) => ({ codeId: v.codeId, codeName: v.codeNm1 }));
  }
}

async function onUpdateSvcCode() {
  searchParams.value.egerId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.egerId = '';
  setEngineers();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'istDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'dtlSn' },
    { fieldName: 'custNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'telNo' },
    { fieldName: 'cralTelNo' },
    { fieldName: 'zip' },
    { fieldName: 'adr' },
    { fieldName: 'istLctDtlCn' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDtm' },
  ];

  const columns = [
    {
      fieldName: 'istDt',
      header: t('MSG_TXT_IST_DT'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
    },
    {
      fieldName: 'custNm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'sellTpCd',
      header: t('MSG_TXT_TYPE'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PD_NM'),
      width: '350',
      styleName: 'text-center',
    },
    {
      fieldName: 'telNo',
      header: t('MSG_TXT_TEL'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'cralTelNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'zip',
      header: t('MSG_TXT_ZIP'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'adr',
      header: t('MSG_TXT_ADR'),
      width: '248',
    },
    {
      fieldName: 'istLctDtlCn',
      header: t('MSG_TXT_IST_LCT_DTL'),
      width: '248',
      editable: true,
      editor: { type: 'text' },
    },
    {
      fieldName: 'ogNm',
      header: t('MSG_TXT_BLG_CNR'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'prtnrKnm',
      header: t('MSG_TXT_RGR_NM'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_RGR_EMPNO'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_FST_RGST_DT'),
      width: '248',
      styleName: 'text-center',
    },
  ];

  const columnLayout = [
    'istDt',
    'cntrNo',
    'custNm',
    'sellTpCd',
    'pdNm',
    'telNo',
    'cralTelNo',
    'zip',
    'adr',
    'istLctDtlCn',
    'ogNm',
    'prtnrKnm',
    'fstRgstUsrId',
    'fstRgstDtm',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.setCheckBar({ visible: true, checkableExpression: "state = 'C'", checkableOnly: true });
  view.setFixedOptions({ colCount: 3, resizable: true });

  view.onCellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };

  /* TODO : 연결페이지 개발전. 개발완료 시 변경. */
  view.onCellItemClicked = (/* grid, index */) => {
    router.push({
      path: '/service/wwsnc-responsible-area-code-mgt',
      // query: {
      //   value: 'value1'
      // },
    });
  };
});

</script>
