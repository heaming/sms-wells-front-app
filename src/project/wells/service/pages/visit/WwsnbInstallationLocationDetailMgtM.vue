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
            option-value="ogId"
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
            class="w140"
          />
          <kw-date-range-picker
            v-model:from="searchParams.istDtFrom"
            v-model:to="searchParams.istDtTo"
            rules="required"
          />
        </kw-search-item>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            first-option="all"
            :options="codes.PD_GRP_CD"
            @update:model-value="onUpdatePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            first-option="all"
            :options="products"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <kw-select
            v-model="searchParams.cstDvCd"
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
          />
        </kw-form-item>
        <!-- 계약번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <kw-input
            v-model="searchParams.cntrDtlNo"
            :maxlength="14"
            :placeholder="$t('MSG_TIT_CNTR_NO_CNTR_SN')"
            class="w200"
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
        </template>
        <kw-btn
          v-permission:update
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
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          v-permission:download
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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

import { cloneDeep, replace, split } from 'lodash-es';
import dayjs from 'dayjs';
// import smsCommon from '~sms-wells/service/composables/useSnCode';
// import ZwcmMultiSelect from '@/modules/common/components/ZwcmMultiSelect.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();

// const {
//   getAllEngineers,
//   getServiceCenterOrgs,
//   getWorkingEngineers,
// } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;

const engineers = ref([]);
const products = ref([]);

const prd = (await dataService.get('/sms/wells/service/installation-locations/products')).data;
products.value = prd;
// engineers.value = eng.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrKnm }));

const dvCd = [{ codeId: '1', codeName: t('MSG_TXT_EGER') }];
const codes = await codeUtil.getMultiCodes(
  // 'CST_DV_CD',
  'CRP_DSC_ANA_CST_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'PRD_MNGT_TP_CD',
);
const now = dayjs();

const router = useRouter();
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
  cstDvCd: '',
  cstNm: '',
  cntrDtlNo: '',
  cntrNo: '',
  cntrSn: '',
  egerId: '',
  rgsnYn: 'N',
  pdGrpCd: '',
  pdCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

/* 페이지 이동용 */

let cachedParams;
// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/installation-locations/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}
// 그리드 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/installation-locations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: locations, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(locations);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회버튼 클릭
async function onClickSearch() {
  const splited = split(searchParams.value.cntrDtlNo, '-');
  searchParams.value.cntrNo = splited[0];
  searchParams.value.cntrSn = splited[1];
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 저장버튼 클릭
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view).map((v) => ({ ...v, dtlSn: '1' }));
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
  } else {
    await dataService.post('/sms/wells/service/installation-locations', chkRows);
  }

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await fetchData();
}
// 엔지니어 콤보박스 정보 세팅
async function setEngineers() {
  if (searchParams.value.ogId === '') {
    engineers.value = [];
  } else {
    const eng = (await dataService.get('/sms/wells/service/organizations/engineer', { params: { dgr1LevlOgId: searchParams.value.ogId, authYn: 'N' } })).data;
    if (searchParams.value.rgsnYn === 'Y') {
      const wrkEngByOdId = eng.filter((v) => v.cltnDt === null || v.cltnDt === '');
      engineers.value = wrkEngByOdId.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
      return;
    }
    engineers.value = eng.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
  }
}
// 상품 콤보박스 값 세팅
function setProducts() {
  if (searchParams.value.pdGrpCd === '') {
    products.value = prd;
  } else {
    products.value = prd.filter((v) => v.pdGrpCd === searchParams.value.pdGrpCd);
  }
}
// 서비스센터 콤보박스 값 선택
async function onUpdateSvcCode() {
  searchParams.value.egerId = '';
  setEngineers();
}
// 퇴사자 제외버튼 클릭시
async function onUpdateRgsnYn() {
  searchParams.value.egerId = '';
  setEngineers();
}
// 상품 그룹 콤보박스 선택
async function onUpdatePdGrpCd() {
  searchParams.value.pdCd = '';
  setProducts();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약상세번호
    { fieldName: 'custNm' }, // 고객명
    { fieldName: 'sellTpNm' },
    { fieldName: 'pdctPdCd' }, // 상품코드
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'locaraTno' }, // 지역전화번호
    { fieldName: 'exnoEncr' }, // 전화국번호암호화
    { fieldName: 'idvTno' }, // 개별전화번호
    { fieldName: 'telNo' }, // 전화번호tot
    { fieldName: 'cralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'cralTelNo' }, // 휴대전화번호tot
    { fieldName: 'zip' }, // 우편번호
    { fieldName: 'adr' }, // 주소
    { fieldName: 'istLctDtlCn' }, // 설치위치상세정보
    { fieldName: 'ogNm' }, // 조직명
    { fieldName: 'ogTpCd' }, // 조직유형코드
    { fieldName: 'prtnrKnm' }, // 담당자명
    { fieldName: 'wkPrtnrNo' }, // 담당자사번
    { fieldName: 'regDtm' }, // 요청일자
  ];

  const columns = [
    {
      fieldName: 'istDt',
      header: t('MSG_TXT_IST_DT'),
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
    },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (g, i) => {
        const { cntrNo, cntrSn } = gridUtil.getRowValue(g, i.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    {
      fieldName: 'custNm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'sellTpNm',
      header: t('MSG_TXT_TYPE'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'sapMatCd',
      header: t('MSG_TXT_SAP_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdctPdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '300',
      styleName: 'text-left',
    },
    {
      fieldName: 'telNo',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (g, i) => {
        const { locaraTno, exnoEncr, idvTno } = gridUtil.getRowValue(g, i.itemIndex);
        return `${replace(locaraTno, null, '')}-${replace(exnoEncr, null, '')}-${replace(idvTno, null, '')}`;
      },
    },
    {
      fieldName: 'cralTelNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (g, i) => {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = gridUtil.getRowValue(g, i.itemIndex);
        return `${replace(cralLocaraTno, null, '')}-${replace(mexnoEncr, null, '')}-${replace(cralIdvTno, null, '')}`;
      },
    },
    {
      fieldName: 'zip',
      header: t('MSG_TXT_ZIP'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'adr',
      header: t('MSG_TXT_ADDR'),
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
      fieldName: 'wkPrtnrNo',
      header: t('MSG_TXT_RGR_EMPNO'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'regDtm',
      header: t('MSG_TXT_FST_RGST_DT'),
      width: '248',
      styleName: 'text-center',
    },
  ];

  const columnLayout = [
    'istDt',
    'cntrNo',
    'custNm',
    'sellTpNm',
    'sapMatCd',
    'pdctPdCd',
    'pdNm',
    'telNo',
    'cralTelNo',
    'zip',
    'adr',
    'istLctDtlCn',
    'ogNm',
    'prtnrKnm',
    'wkPrtnrNo',
    'regDtm',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.setFixedOptions({ colCount: 3, resizable: true });

  view.onCellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };

  view.onCellItemClicked = async (grid, index) => {
    if (index.column === 'cntrNo') {
      const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
