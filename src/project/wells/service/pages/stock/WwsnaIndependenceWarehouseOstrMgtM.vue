<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaIndependenceWarehouseOstrMgtM - 독립창고출고관리(W-SV-U-0193M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 관리자가 물류센터로 독립창고에 물량을 일괄요청하는 화면 (http://localhost:3000/#/service/wwsna-independence-warehouse-ostr-mgt)
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
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.apyYm"
            type="month"
            rules="required"
            @change="onChangeApyYm"
          />
        </kw-search-item>
        <!-- 배정년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            rules="required"
            @change="onChangeData"
          />
        </kw-search-item>
        <!-- 회차 -->
        <kw-search-item
          :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
          required
        >
          <kw-input
            v-model="searchParams.cnt"
            rules="required|numeric|min_value:1|max_value:999999999999"
            @change="onChangeData"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.ostrWareNo"
            :options="optionsOstrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            rules="required"
            @change="onChangeData"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            :label="$t('MSG_TXT_STR_WARE')"
            class="w180"
            rules="required"
          />
          <kw-select
            v-model="searchParams.strWareNo"
            :options="optionsStrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="$t('MSG_TXT_STR_WARE')"
            first-option="select"
            rules="required"
          />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            type="date"
            :min-date="minDate"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            first-option="all"
            class="w150"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
            :multiple="true"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>

        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_TXT_SAVE')"
          :disable="totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-permission:update
          :label="`${t('MSG_TXT_LGST')}${t('MSG_TXT_TF')}`"
          dense
          primary
          @click="onClickLgstTrs"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="30"
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
import { codeUtil, useDataService, getComponentType, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify, alert, confirm } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'WARE_DTL_DV_CD',
);

const now = dayjs();
const minDate = now.format('YYYY-MM-DD');

let cachedParams;
const searchParams = ref({
  apyYm: now.format('YYYYMM'),
  asnOjYm: now.format('YYYYMM'),
  cnt: '1',
  ostrWareNo: '100002',
  itmKndCd: '',
  itmPdCds: [],
  ostrDt: now.format('YYYYMMDD'),
  wareDvCd: '3',
  wareDtlDvCd: '32',
  strWareNo: '',
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
});

// 품목구분 필터링
const filterCodes = ref({
  wareDtlDvCd: [],
  itmKndCd: [],
});

function codeFilter() {
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['32'].includes(v.codeId));
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['4', '5', '6'].includes(v.codeId));
}

// 입고창고 조회
const optionsStrWareNo = ref();

async function onChangeHgrStrWareNo() {
  searchParams.value.strWareNo = '';
  const result = await dataService.get('/sms/wells/service/independence-ware-ostrs/storage-wares', { params: { ...searchParams.value } });
  optionsStrWareNo.value = result.data;
}

const optionsOstrWareNo = ref();
// 출고창고 조회
const onChangeOstrWareHouse = async () => {
  searchParams.value.ostrWareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/independence-ware-ostrs/out-of-storage-wares',
    { params: {
      apyYm: searchParams.value.apyYm,
    } },
  );
  optionsOstrWareNo.value = result.data;
  if (!isEmpty(result.data)) {
    searchParams.value.ostrWareNo = result.data[0].wareNo;
    const { asnOjYm, cnt, ostrWareNo } = searchParams.value;
    if (!isEmpty(asnOjYm) && !isEmpty(cnt) && !isEmpty(ostrWareNo)) {
      onChangeHgrStrWareNo();
    }
  }
};

function onChangeApyYm() {
  const { apyYm, asnOjYm, cnt, ostrWareNo } = searchParams.value;
  if (isEmpty(apyYm)) {
    searchParams.value.ostrWareNo = '';
    optionsOstrWareNo.value = [];

    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    return;
  }
  onChangeOstrWareHouse();

  if (isEmpty(asnOjYm) || isEmpty(cnt) || isEmpty(ostrWareNo)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];
  }
}

// 입고창고조회 관련 데이터 변경 시
function onChangeData() {
  const { apyYm, asnOjYm, cnt, ostrWareNo } = searchParams.value;

  if (isEmpty(apyYm) || isEmpty(asnOjYm) || isEmpty(cnt) || isEmpty(ostrWareNo)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    return;
  }

  onChangeHgrStrWareNo();
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/independence-ware-ostrs/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

await Promise.all([
  codeFilter(),
  onChangeOstrWareHouse(),
  getProducts(),
]);

const totalCount = ref(0);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/independence-ware-ostrs', { params: { ...cachedParams } });
  const ostrItms = res.data;
  totalCount.value = ostrItms.length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(ostrItms);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/independence-ware-ostrs/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_SAV_SEL_DATA'));
    return;
  }

  let validRows = checkedRows.filter((item) => item.lgstTrsYn === 'Y');
  if (!isEmpty(validRows)) {
    // 물류 이관된 데이터는 저장할 수 없습니다.
    await alert(t('MSG_ALT_LGST_TF_SAVE_IMP'));
    return;
  }

  validRows = checkedRows.filter((item) => item.outQty < 1);
  if (!isEmpty(validRows)) {
    // 출고수량은 0보다 커야합니다.
    await alert(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
    return;
  }

  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;

  // 출고일자
  const { ostrDt } = searchParams.value;

  if (isEmpty(ostrDt)) {
    // 출고일자를 선택해주세요
    await alert(t('MSG_ALT_INP_RLS_NOT_DY'));
    return;
  }

  checkedRows.forEach((item) => {
    item.ostrDt = ostrDt;
  });

  const res = await dataService.post('/sms/wells/service/independence-ware-ostrs', checkedRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 물류이관
async function onClickLgstTrs() {
  const { asnOjYm, cnt, ostrWareNo } = searchParams.value;

  if (isEmpty(asnOjYm)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_ASN_YM')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (isEmpty(cnt)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (isEmpty(ostrWareNo)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_OSTR_WARE')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }
  // {0} 물량배정 데이터를 물류로 이관하시겠습니까?
  const msg = `${asnOjYm.substring(0, 4)}-${asnOjYm.substring(4, 6)} ${cnt}`;
  if (!await confirm(`${msg}${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_TXT_INDP_WARE')}${t('MSG_ALT_QOM_ASN_LGST_TRS')}`)) {
    return;
  }
  // 물류 전송
  const res = await dataService.post('/sms/wells/service/independence-ware-ostrs/logistics-transfer', searchParams.value, { timeout: 300000 });
  const { processCount } = res.data;
  if (processCount > 0) {
    // 이관이 완료되었습니다.
    notify(t('MSG_ALT_IS_FSH'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'lgstTrsYn' },
    { fieldName: 'chk', dataType: 'text', booleanFormat: 'N:Y' },
    { fieldName: 'wareNm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'mngtUnit' },
    { fieldName: 'mngtUnitNm' },
    { fieldName: 'matGdCd' },
    { fieldName: 'logisticStocQty', dataType: 'number' },
    { fieldName: 'boxUnitQty', dataType: 'number' },
    { fieldName: 'crtlStocQty', dataType: 'number' },
    { fieldName: 'useQty', dataType: 'number' },
    { fieldName: 'cnfmQty', dataType: 'number' },
    { fieldName: 'cnfmBoxQty', dataType: 'number' },
    { fieldName: 'mcbyAcuOstrQty', dataType: 'number' },
    { fieldName: 'mcbyAcuOstrBoxQty', dataType: 'number' },
    { fieldName: 'filterBoxQty', dataType: 'number' },
    { fieldName: 'outQty', dataType: 'number' },
    { fieldName: 'outBoxQty', dataType: 'number' },
    { fieldName: 'itmQomAsnNo' },
    { fieldName: 'asnOjYm' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'strWareNo' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'rmkCn' },
    { fieldName: 'asnTnN' },
    { fieldName: 'wareDvCd' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'ostrAkSn' },
    { fieldName: 'ostrDt' },
    { fieldName: 'ostrWareDvCd' },
    { fieldName: 'ostrPrtnrNo' },
    { fieldName: 'ostrPrtnrOgTpCd' },
  ];

  const columns = [
    { fieldName: 'lgstTrsYn', header: `${t('MSG_TXT_LGST')}${t('MSG_TXT_TF_YN')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'strWareNo', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '210', styleName: 'text-left' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_MNGT_UNIT'), width: '80', styleName: 'text-center' },
    { fieldName: 'matGdCd', header: t('MSG_TXT_GD'), width: '80', styleName: 'text-center' },
    { fieldName: 'logisticStocQty', header: t('MSG_TXT_HGR_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_UNIT_QTY'), width: '130', styleName: 'text-right' },
    { fieldName: 'crtlStocQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'useQty', header: t('MSG_TXT_NED_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'cnfmQty', header: t('MSG_TXT_QTY'), width: '84', styleName: 'text-right' },
    { fieldName: 'cnfmBoxQty', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'mcbyAcuOstrQty', header: t('MSG_TXT_AGGS'), width: '84', styleName: 'text-right' },
    { fieldName: 'mcbyAcuOstrBoxQty', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'outBoxQty', header: t('MSG_TXT_FILT_BOX_QTY'), width: '130', styleName: 'text-right' },
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      rules: 'required|min_value:0|max_value:999999999999',
      styleName: 'text-right',
      editor: {
        type: 'number',
        editable: true },
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'lgstTrsYn', 'strWareNo', 'wareNm', 'sapMatCd', 'itmPdCd', 'pdAbbrNm', 'mngtUnitNm', 'matGdCd', 'logisticStocQty',
    'boxUnitQty', 'crtlStocQty', 'useQty',
    {
      header: t('MSG_TXT_QOM_ASN_CNFM'), // 물량배정확정 // colspan title
      direction: 'horizontal', // merge type
      items: ['cnfmQty', 'cnfmBoxQty'],
    },
    {
      header: t('MSG_TXT_QOM_ASN_OSTR'), // 물량배정출고
      direction: 'horizontal',
      items: ['mcbyAcuOstrQty', 'mcbyAcuOstrBoxQty'],
    },
    'outBoxQty', 'outQty', 'rmkCn',
  ]);

  view.checkBar.fieldName = 'chk';
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);
    if (changedFieldName === 'outQty') {
      const { outQty } = grid.getValues(itemIndex);

      if (outQty === 0) {
        grid.setValue(itemIndex, 'chk', 'N');
      }
    }
  };

  view.onCellEditable = (grid, index) => {
    // 물류전송여부
    const lgstTrsYn = gridUtil.getCellValue(view, index.dataRow, 'lgstTrsYn');

    // 물류전송이 N인 경우, 출고수량, 비고만 입력 가능
    if (lgstTrsYn === 'N' && ['outQty', 'rmkCn'].includes(index.column)) {
      return true;
    }

    return false;
  };
});
</script>
