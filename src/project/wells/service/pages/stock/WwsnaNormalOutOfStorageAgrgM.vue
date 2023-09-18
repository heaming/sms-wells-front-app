<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaNormalOutOfStorageAgrgM - 정상출고집계현황(K-W-SV-U-0260M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-08-01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정상출고집계현황 http://localhost:3000/#/service/wwsna-normal-out-of-storage-agrg
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고요청접수 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_RCP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :options="customCodes.ostrOjWareNo"
            option-value="codeId"
            option-label="codeName"
            :label="$t('MSG_TXT_OSTR_AK_RCP')"
            rules="required"
            readonly
          />
        </kw-search-item>
        <!-- //출고요청접수 -->
        <!-- 출고품목 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_ITM')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //출고품목 -->
        <!-- 출고요청유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
        >
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="codes.OSTR_AK_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //출고요청유형 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 입고희망일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startStrHopDt"
            v-model:to="searchParams.endStrHopDt"
            rules="date_range_months:1"
            @change="onChangeStrHopDt"
          />
          <!-- //입고희망일자 -->
          <!-- 출고확정-->
          <kw-field
            v-model="searchParams.ostrCnfmYn"
            class="ml20"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.ostrCnfmYn"
                v-bind="field"
                :label="$t('MSG_TXT_OSTR_DTRM')"
              />
            </template>
          </kw-field>
          <!-- //출고확정-->
        </kw-search-item>
        <!-- 출고요청창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_WARE')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
          />
        </kw-search-item>
        <!-- //출고요청창고 -->
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
          v-permission:download
          dense
          icon="excel"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
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

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/normal-out-of-storage-agrg';

const codes = ref(await codeUtil.getMultiCodes(
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ITM_KND_CD',
  'OVIV_TP_CD',
  'ADM_ZN_CLSF_CD',
));
const customCodes = {
  ostrOjWareNo: [
    { codeId: '100002', codeName: '교원파주물류센터' },
  ],
};
codes.value.OSTR_AK_TP_CD = codes.value.OSTR_AK_TP_CD.filter((v) => ['310', '320', '330'].includes(v.codeId)); // 출고요청유형
codes.value.ITM_KND_CD = codes.value.ITM_KND_CD.filter((v) => ['4', '5', '6', '7', '9'].includes(v.codeId)); // 출고품목
codes.value.ADM_ZN_CLSF_CD = codes.value.ADM_ZN_CLSF_CD.filter((v) => v.codeId !== '99'); // 지역 코드 (공통) 제외
const searchParams = ref({
  startStrHopDt: now.format('YYYYMMDD'),
  endStrHopDt: now.format('YYYYMMDD'),
  ostrOjWareNo: '100002',
  ostrCnfmYn: 'N',
  ostrAkTpCd: '',
  itmKndCd: '',
  wareDvCd: '1',
});
const totalCount = ref(0);
let cachedParams;
let gridView;
let gridData;
let logisticsFields;
let serviceFields;
let businessFields;
let fieldsObj;
let fieldsWidth;
// 그리드 -  창고조회
async function fetchWareHouses(wareNos) {
  const result = await dataService.get(`${baseUrl}/ware-houses`, { params: searchParams.value });
  if (result.data.length > 0) {
    const wareHouses = result.data;

    fieldsWidth = 100; // 창고 그리드 가로폭 사이즈 설정
    logisticsFields = [];
    serviceFields = [];
    businessFields = [];

    if (searchParams.value.wareDvCd === '1') { // 물류센터
      const wareLogisticsFields = wareHouses.filter((v) => wareNos.indexOf(v.wareNo) !== -1);
      if (wareLogisticsFields.length > 0) {
        logisticsFields.push(...wareLogisticsFields.map((v) => ({
          fieldName: `ware${v.wareNo}`,
          header: v.wareNm,
          width: fieldsWidth,
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
        })));
      }
    } else if (searchParams.value.wareDvCd === '2') { // 서비스센터
      const wareServiceFields = wareHouses.filter((v) => wareNos.indexOf(v.wareNo) !== -1);
      if (wareServiceFields.length > 0) {
        serviceFields.push(...wareServiceFields.map((v) => ({
          fieldName: `ware${v.wareNo}`,
          header: v.wareNm,
          width: fieldsWidth,
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
        })));
      }
    } else if (searchParams.value.wareDvCd === '3') { // 영업센터
      const wareBusinessFields = wareHouses.filter((v) => wareNos.indexOf(v.wareNo) !== -1);
      if (wareBusinessFields.length > 0) {
        businessFields.push(...wareBusinessFields.map((v) => ({
          fieldName: `ware${v.wareNo}`,
          header: v.wareNm,
          width: fieldsWidth,
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
        })));
      }
    }
    // 필드 셋팅
    fieldsObj.setFields();
  }
}
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  // 출고요청 창고 목록
  const strOjWareNos = [];
  list.forEach((data) => {
    Object.keys(data).forEach((keys) => {
      if (keys.match(/ware/gi)) {
        strOjWareNos.push(keys.slice(4));
      }
    });
  });

  // 데이터가 있는 창고번호만 추출
  const wareNos = strOjWareNos.filter((v, i) => strOjWareNos.indexOf(v) === i);

  await fetchWareHouses(wareNos);
  await nextTick();
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 출고요청접수(로그인 창고) 조회
// async function fetchLoginWare() {
//   const res = await dataService.get(`${baseUrl}/login-ware-houses`, { params: searchParams.value });
//   codes.value.WARE_HOUSE = res.data;
//   if (codes.value.WARE_HOUSE > 0) {
//     searchParams.value.ostrOjWareNo = codes.value.WARE_HOUSE[0].codeId;
//   }
// }
// 입고희망일자 변경시 조회
async function onChangeStrHopDt() {
  const { startStrHopDt } = searchParams.value;
  // 시작일자 변경시 종료일이 해당 달에 마지막일로 지정
  if (startStrHopDt.length > 6) {
    const startStrHopDtYm = startStrHopDt.substring(0, 6);
    const lastDay = new Date(startStrHopDt.substring(0, 4), startStrHopDt.substring(4, 6), 0).getDate();
    searchParams.value.endStrHopDt = dayjs(startStrHopDtYm.concat(lastDay)).format('YYYYMMDD');
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '190', styleName: 'text-left' },
    { fieldName: 'itmLctNm', header: t('MSG_TXT_ITM_LOC'), width: '120', styleName: 'text-left' },
    {
      fieldName: 'pitmStocAGdQty',
      header: t('MSG_TXT_LGST_STOC'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'ostrAkSum',
      header: t('MSG_TXT_OSTR_AK_SUM'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields];
    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields)];

    // 물류센터
    if (logisticsFields.length > 0) {
      columns.push(...logisticsFields);
      layoutColumns.push(
        {
          direction: 'horizontal',
          header: { text: t('MSG_TXT_LGST_CNR') },
          width: fieldsWidth,
          items: [...fieldsObj.getColumnNameArr(logisticsFields)],
        },
      );
    }
    // 서비스센터
    if (serviceFields.length > 0) {
      columns.push(...serviceFields);
      layoutColumns.push(
        {
          direction: 'horizontal',
          header: { text: t('MSG_TXT_SV_CNR') },
          width: fieldsWidth,
          items: [...fieldsObj.getColumnNameArr(serviceFields)],
        },
      );
    }
    // 영업센터
    if (businessFields.length > 0) {
      columns.push(...businessFields);
      layoutColumns.push(
        {
          direction: 'horizontal',
          header: { text: t('MSG_TXT_BSNS_CNTR') },
          width: fieldsWidth,
          items: [...fieldsObj.getColumnNameArr(businessFields)],
        },
      );
    }
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.columnByName('pdNm').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
    if (columns.length > 6) {
      gridView.setFixedOptions({ colCount: 6, resizable: true });
    } else {
      gridView.setFixedOptions({ colCount: 0, resizable: true });
    }
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(objList) {
    return objList.map((obj) => ({ fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
