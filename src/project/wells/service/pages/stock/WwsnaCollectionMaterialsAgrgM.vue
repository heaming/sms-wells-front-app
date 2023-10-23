<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaCollectionMaterialsAgrgM - 회수자재집계현황(K-W-SV-U-0259M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-10-19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회수자재집계현황 http://localhost:3000/#/service/wwsna-collection-materials-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 수불일자 -->
        <kw-search-item
          :colspan="2"
          :label="t('MSG_TXT_RVPY_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_months:1"
            :label="t('MSG_TXT_RVPY_DT')"
          />
        </kw-search-item>

        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId))"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          v-model:options-ware-dv-cd="customCodes.wareDvCd"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option-value=""
          sub-first-option="all"
          :colspan="3"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
        <kw-field
          v-model="searchParams.rgsnYn"
        >
          <template #default="{ field }">
            <kw-checkbox
              v-model="searchParams.rgsnYn"
              v-bind="field"
              :label="$t('MSG_TXT_RGSN_EXCD')"
            />
          </template>
        </kw-field>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_ASN_PS_PRNT')"
          @click="onClickOZ"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/collection-materials-agrg';
const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
);

const customCodes = {
  wareDvCd: {
    WARE_DV_CD: [
      { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
    ],
  },
};
const searchParams = ref({
  startDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  wareDvCd: '2', // 창고구분
  wareDtlDvCd: 'ALL', // 창고상세구분
  wareNoM: '', // 조직창고
  wareNoD: '', // 개인창고
  rgsnYn: 'N', // 퇴사자 제외 여부
});

let cachedParams;
const totalCount = ref(0);

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}
// 창고구분 변경시, 창고상세구분 세팅 END

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
async function onClickOZ() {
  const ozParam = ref({
    ozrPath: '/kyowon_as/sellmtrl.ozr', // OZ 개발 중 ozp://kyowon_as/monthbs.ozr
    odiPath: '',
    args:
      {
        START_DT: searchParams.value.startDt,
        END_DT: searchParams.value.endDt,
        WARE_NO: '100002',
        WARE_NM: '파주물류센터',
      },
    height: 1300,
    width: 1400,
  });
  openReportPopup(
    ozParam.value.ozrPath,
    ozParam.value.odiPath,
    JSON.stringify(ozParam.value.args),
    { width: ozParam.value.width, height: ozParam.value.height },
  );
  console.log(ozParam.value.args);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'wareNm',
      header: t('MSG_TXT_WARE_NM'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'qtySum',
      header: t('MSG_TXT_SUM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'qtyWm07101720',
      header: t('MSG_TXT_KIT'), /* 키트류 */
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'qtyWm07101721',
      header: t('MSG_TXT_WTHOL_VLV'), /* 조리수밸브 */
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'qtyWm07101722',
      header: t('MSG_TXT_WTST_VLV'), /* 연수기밸브 */
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'qtyWm07101723',
      header: t('MSG_TXT_WTST_HOSE'), /* 연수기호스 */
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
