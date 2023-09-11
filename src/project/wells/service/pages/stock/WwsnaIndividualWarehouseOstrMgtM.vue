<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaIndividualWarehouseOstrMgtM(W-SV-U-0192M01) - 개인창고출고관리
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.02.18
 5. 수정일 : 2023.03.20 - inho.choi
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 관리자가 물류센터로 개인창고에 물량을 일괄요청하는 화면 (http://localhost:3000/#/service/wwsna-individual-warehouse-ostr-mgt)
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
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="filterCodes.wareDvCd"
            :label="$t('MSG_TXT_STR_WARE')"
            rules="required"
          />
          <kw-select
            v-model="searchParams.hgrStrWareNo"
            :options="optionsHgrStrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="`${t('MSG_TXT_HGR')}${t('MSG_TXT_STR_WARE')}`"
            first-option="select"
            rules="required"
            @change="onChangeHgrStrWareNo"
          />
          <kw-select
            v-model="searchParams.strWareNo"
            :options="optionsStrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="$t('MSG_TXT_STR_WARE')"
            first-option="all"
          />
        </kw-search-item>
        <!-- 총출고 -->
        <kw-search-item
          :label="`${t('MSG_TXT_DTRM')} ${t('MSG_TXT_AF')} ${t('MSG_TXT_STOC')}`"
        >
          <kw-input
            v-model="searchParams.totOutQty"
            :label="`${t('MSG_TXT_DTRM')} ${t('MSG_TXT_AF')} ${t('MSG_TXT_STOC')}`"
            rules="integer|max_value:999999999999"
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
          :label="$t('MSG_TXT_ITM_CD')"
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
        <!-- sap코드 -->
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          :label="`${t('MSG_TXT_LGST')}${t('MSG_TXT_TF')}`"
          dense
          primary
          @click="onClickLgstTrs"
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ t('MSG_TXT_DIV') }}
          </p>
          <kw-field
            :model-value="['N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.ndlvQtyYn"
                :label="$t('MSG_TXT_CHECK_ATC_FLTR')"
                :true-value="'Y'"
                :false-value="'N'"
                @update:model-value="onChangeNdlvQty"
              />
            </template>
          </kw-field>
        </li>
      </ul>
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

import { defineGrid, codeUtil, useDataService, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { alert, notify, confirm } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'WARE_DV_CD',
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
  totOutQty: '',
  ostrDt: now.format('YYYYMMDD'),
  wareDvCd: '3',
  wareDtlDvCd: '31',
  hgrDvCd: '30',
  hgrStrWareNo: '',
  strWareNo: '',
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
  ndlvQtyYn: 'N',
});

const filterCodes = ref({
  wareDvCd: [],
  itmKndCd: [],
});

function codeFilter() {
  filterCodes.value.wareDvCd = codes.WARE_DV_CD.filter((v) => ['3'].includes(v.codeId));
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['4', '5', '6'].includes(v.codeId));
}

// 상위입고창고 조회
const optionsHgrStrWareNo = ref();
const onChangeHgrStrWareHouse = async () => {
  searchParams.value.hgrDvCd = '30';
  searchParams.value.hgrStrWareNo = '';
  const result = await dataService.get('/sms/wells/service/individual-ware-ostrs/storage-wares', { params: { ...searchParams.value } });
  optionsHgrStrWareNo.value = result.data;
};

const optionsOstrWareNo = ref();
// 출고창고 조회
const onChangeOstrWareHouse = async () => {
  searchParams.value.ostrWareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/individual-ware-ostrs/out-of-storage-wares',
    { params: {
      apyYm: searchParams.value.apyYm,
    } },
  );
  optionsOstrWareNo.value = result.data;
  if (!isEmpty(result.data)) {
    searchParams.value.ostrWareNo = result.data[0].wareNo;
    const { asnOjYm, cnt, ostrWareNo } = searchParams.value;
    if (!isEmpty(asnOjYm) && !isEmpty(cnt) && !isEmpty(ostrWareNo)) {
      onChangeHgrStrWareHouse();
    }
  }
};

// 입고창고 조회
const optionsStrWareNo = ref();

async function onChangeHgrStrWareNo() {
  const { hgrStrWareNo } = searchParams.value;

  if (isEmpty(hgrStrWareNo)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];
    return;
  }

  searchParams.value.hgrDvCd = '31';
  searchParams.value.strWareNo = '';
  const result = await dataService.get('/sms/wells/service/individual-ware-ostrs/storage-wares', { params: { ...searchParams.value } });
  optionsStrWareNo.value = result.data;
}

function onChangeApyYm() {
  const { apyYm, asnOjYm, cnt, ostrWareNo } = searchParams.value;
  if (isEmpty(apyYm)) {
    searchParams.value.ostrWareNo = '';
    optionsOstrWareNo.value = [];

    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    searchParams.value.strHgrWareNo = '';
    optionsHgrStrWareNo.value = [];
    return;
  }
  onChangeOstrWareHouse();

  if (isEmpty(asnOjYm) || isEmpty(cnt) || isEmpty(ostrWareNo)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    searchParams.value.strHgrWareNo = '';
    optionsHgrStrWareNo.value = [];
  }
}

// 입고창고조회 관련 데이터 변경 시
function onChangeData() {
  const { apyYm, asnOjYm, cnt, ostrWareNo } = searchParams.value;

  if (isEmpty(apyYm) || isEmpty(asnOjYm) || isEmpty(cnt) || isEmpty(ostrWareNo)) {
    searchParams.value.strWareNo = '';
    optionsStrWareNo.value = [];

    searchParams.value.strHgrWareNo = '';
    optionsHgrStrWareNo.value = [];
    return;
  }

  onChangeHgrStrWareHouse();
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/individual-ware-ostrs/products');
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
const allOstrItms = ref([]);
// 미출고 수량제외 필터링
function onChangeNdlvQty() {
  const { ndlvQtyYn, totOutQty } = searchParams.value;

  const view = grdMainRef.value.getView();
  if (ndlvQtyYn === 'Y') {
    // 필터링 전 데이터 담기
    allOstrItms.value = view.getDataSource().getRows();
    // 필터링, 출고수량이 0보다 크고, 물류전송여부가 N인 경우
    const filterRows = gridUtil.filter(view, (e) => e.outQty > 0 && e.lgstTrsYn === 'N' && (isEmpty(totOutQty) || e.totOutQty <= totOutQty));
    totalCount.value = filterRows.length;
    view.getDataSource().setRows(filterRows);
    return;
  }

  totalCount.value = allOstrItms.value.length;
  view.getDataSource().setRows(allOstrItms.value);
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/individual-ware-ostrs', { params: { ...cachedParams } });
  const ostrItms = res.data;

  totalCount.value = ostrItms.length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(ostrItms);
  }

  const { ndlvQtyYn } = searchParams.value;
  if (ndlvQtyYn === 'Y') {
    onChangeNdlvQty();
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/individual-ware-ostrs/excel-download', { params: cachedParams });

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
    // 생성수량은 0보다 커야합니다.
    await alert(t('MSG_ALT_CRT_QTY_ZERO_BE_BIG'));
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

  const res = await dataService.post('/sms/wells/service/individual-ware-ostrs', checkedRows);
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
  if (!await confirm(`${msg}${t('MSG_TXT_ORDERSELECT_TITLE')} ${t('MSG_TXT_INDV_WARE')}${t('MSG_ALT_QOM_ASN_LGST_TRS')}`)) {
    return;
  }
  // 물류 전송
  const res = await dataService.post('/sms/wells/service/individual-ware-ostrs/logistics-transfer', searchParams.value, { timeout: 360000 });
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
    { fieldName: 'hgrCrtlStocQty', dataType: 'number' },
    { fieldName: 'totOutQty', dataType: 'number' },
    { fieldName: 'mngtUnit' },
    { fieldName: 'matGdCd' },
    { fieldName: 'logisticStocQty', dataType: 'number' },
    { fieldName: 'boxUnitQty', dataType: 'number' },
    { fieldName: 'crtlStocQty', dataType: 'number' },
    { fieldName: 'cnfmQty', dataType: 'number' },
    { fieldName: 'aclOstrQty', dataType: 'number' },
    { fieldName: 'outQty', dataType: 'number' },
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
    { fieldName: 'wareNm', header: t('MSG_TXT_STR_WARE'), width: '160', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'hgrCrtlStocQty', header: t('MSG_TXT_CNR_STOC'), width: '110', styleName: 'text-right' },
    { fieldName: 'outQty',
      header: `${t('MSG_TXT_CRT')}${t('MSG_TXT_QTY')}`,
      width: '110',
      rules: 'required|min_value:0|max_value:999999999999',
      styleName: 'text-right',
      editor: {
        type: 'number',
        editable: true } },
    { fieldName: 'totOutQty', header: `${t('MSG_TXT_DTRM')} ${t('MSG_TXT_AF')} ${t('MSG_TXT_STOC')}`, width: '100', styleName: 'text-right' },
    { fieldName: 'logisticStocQty', header: `${t('MSG_TXT_LGST_CNR')}(${t('MSG_TXT_PAJU')})`, width: '100', styleName: 'text-right' },
    { fieldName: 'crtlStocQty', header: `${t('MSG_TXT_STOC_QTY')}(${t('MSG_TXT_INDV')})`, width: '100', styleName: 'text-right' },
    { fieldName: 'cnfmQty', header: `${t('MSG_TXT_FST')} ${t('MSG_TXT_CRT')}${t('MSG_TXT_QTY')}`, width: '84', styleName: 'text-right' },
    { fieldName: 'aclOstrQty', header: t('MSG_TXT_CNFM_QTY'), width: '84', styleName: 'text-right' },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '240',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

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
