<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaItemBaseInformationListP(W-SV-U-0173P01) - 품목 기본정보
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.02.20
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 기타출고등록 관리 (http://localhost:3000/#/service/wwsna-item-base-information-List)
 ****************************************************************************************************
--->

<template>
  <kw-popup
    class="kw-popup--3xl"
  >
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :readonly="isKndCd"
            :options="codes.ITM_KND_CD"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmPdCd"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-input
            v-model="searchParams.itmPdNm"
            class="w200"
          />
          <kw-field
            :model-value="[]"
          >
            <template
              #default="{ field }"
            >
              <!-- /TODO: 안전재고미달품목 체크박스 로직 추후 추가 -->
              <kw-checkbox
                v-show="checkField"
                v-bind="field"
                :label="$t('MSG_TXT_SFT_STOC_SRTFL_ITM')"
                val=""
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="aplcList"
      >
        <!-- 신청리스트 -->
        <kw-search-item
          :label="$t('MSG_TXT_APLC_LIST')"
        >
          <kw-select
            v-if="aplcList"
            v-model="aplcParams.aplcList"
            :options="codes.APLC_DV_ACD"
            first-option="all"
            @change="onChangeAplcDvAcd"
            @update:model-value="onUpdateAplcDvAcd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SAPCD')">
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            :regex="/^[0-9]*$/i"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            :regex="/^[0-9]*$/i"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="sapCombo"
      >
        <kw-search-item
          v-if="sapCombo"
          :label="$t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            :regex="/^[0-9]*$/i"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            :regex="/^[0-9]*$/i"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
      </template>
    </kw-action-top>
    <kw-grid
      v-if="isGrid"
      ref="grdMainRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />
    <kw-grid
      v-show="isGrid2"
      ref="grdMainRef2"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain2"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
      <kw-btn
        v-permission:create
        primary
        :label="$t('MSG_BTN_SELT')"
        @click="onClickSelt"
      />
    </template>
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// import { codeUtil, defineGrid, useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { codeUtil, useModal, getComponentType, defineGrid, gridUtil, useDataService, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

// import { onMounted } from 'vue';
// import dayjs from 'dayjs';
// import { alert } from 'lodash-es';
const { t } = useI18n();
const dataService = useDataService();
const { cancel: onClickClose, ok } = useModal();
const { modal, notify } = useGlobal();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const { getConfig } = useMeta();
const isKndCd = ref(false); // 품목종류
const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'MNGT_UNIT_CD',
  'APLC_DV_ACD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 그리드1
const isGrid = ref();
// 그리드2
const isGrid2 = ref();
// 신청리스트
const aplcList = ref();
// SAP코드 FROM~TO
const sapCombo = ref();
// 안전재고체크박스
const checkField = ref();

// TODO: 현재 테스트진행중 chk가 2인경우는 출고요청등록에서 들어온경우
const props = defineProps({
  chk: {
    type: String,
    required: true,
  },
  itmPdCd: {
    type: String,
    default: undefined,
  },
  itmPdNm: {
    type: String,
    default: undefined,
  },
  itmKndCd: {
    type: String,
    default: '',
  },
  wareNo: {
    type: String,
    default: '',
  },
  ostrWareNo: {
    type: String,
    default: '',
  },
  lpGbYn: {
    type: String,
    default: '',
  },
  wareDvCd: {
    type: String,
    default: '',
  },

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  itmKndCd: props.itmKndCd,
  itmPdNm: props.itmPdNm,
  itmPdCd: '',
  lpGbYn: props.lpGbYn,
  wareNo: props.wareNo,
  ostrWareNo: props.ostrWareNo,
  wareDvCd: '',
  wareDtlDvCd: '',
  strtSapCd: '',
  endSapCd: '',

});

const aplcParams = ref({
  itmKndCd: searchParams.value.itmKndCd,
  aplcList: '',
});

const isRadio = computed(() => props.lpGbYn === 'Y');

async function onClickSelt() {
  let view;

  if (props.chk === '1') {
    view = grdMainRef2.value.getView();
  } else {
    view = grdMainRef.value.getView();
  }

  const checkedRows = gridUtil.getCheckedRowValues(view).map((v) => ({ ...v, itmGdCd: 'A' }));

  if (isEmpty(checkedRows)) {
    ok(gridUtil.getSelectedRowValues(view));
  } else {
    ok(checkedRows);
  }
}

function validateChangeCode() {
  if (!isEmpty(props.itmKndCd)) {
    isKndCd.value = true;
  }
}

const aplcLists = ref([]);
let target = [];
let list = [];
async function fetchAplcLists() {
  const res = await dataService.get('/sms/wells/service/item-base-informations/aplclists', { params: aplcParams.value });
  console.log(aplcParams.value);
  aplcLists.value = res.data;
  console.log(res.data);

  const view = grdMainRef.value.getView();

  target = [];

  res.data.forEach((obj) => {
    const temp = list.find((i) => i.itmPdCd === obj.itmPdCd);
    if (temp) {
      target.push(temp);
      return true;
    }
    return false;
  });
  view.getDataSource().setRows(target);
}

async function onUpdateAplcDvAcd(val) {
  console.log(val);

  await fetchAplcLists();
}
let cachedParams;
async function fetchData() {
  let pages;
  let view;
  if (props.chk === '1') {
    const res = await dataService.get('/sms/wells/service/item-base-informations/paging', { params: { ...cachedParams, ...pageInfo.value } });
    const { list: itemBase, pageInfo: pagingResult } = res.data;
    pageInfo.value = pagingResult;
    pages = itemBase;
    view = grdMainRef2.value.getView();
  } else {
    const res = await dataService.get('/sms/wells/service/item-base-informations/out-of/paging', { params: { ...cachedParams, ...pageInfo.value } });
    const { list: itemBase, pageInfo: pagingResult } = res.data;
    pages = itemBase;
    pageInfo.value = pagingResult;
    view = grdMainRef.value.getView();
  }

  view.getDataSource().setRows(pages);
  validateChangeCode();

  list = gridUtil.getAllRowValues(view, false);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function initDefault() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/item-base-informations/checked-code', { params: cachedParams });
  searchParams.value.wareDvCd = res.data[0].wareDvCd;
  searchParams.value.wareDtlDvCd = res.data[0].wareDtlDvCd;
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

// 기본정보 세팅
async function initData() {
  if (props.chk === '1') {
    isGrid.value = false;
    aplcList.value = false;
    checkField.value = false;
    isGrid2.value = true;
    sapCombo.value = true;
  } else {
    isGrid2.value = false;
    isGrid.value = true;
    aplcList.value = true;
    checkField.value = true;
    sapCombo.value = false;
  }
  await onClickSearch();
}

onMounted(async () => {
  if (isEmpty(props.itmKndCd)) {
    searchParams.value.itmKndCd = '4';
  }
  if (isEmpty(props.wareDvCd)) {
    searchParams.value.wareDvCd = '2';
  } else {
    searchParams.value.wareDvCd = props.wareDvCd;
  }
  if (props.chk === '2') {
    await initDefault();
  }

  await initData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'itmPdNm1' },
    { fieldName: 'itmPdAbbr1' },
    { fieldName: 'itemKnd' },
    { fieldName: 'boxUnitQty' },
    { fieldName: 'delUnt' },
    { fieldName: 'imgUrl' },
    { fieldName: 'warehouseQty', dataType: 'number' },
    { fieldName: 'centerQty', dataType: 'number' },
    { fieldName: 'centerBQty' },
    { fieldName: 'indiQty', dataType: 'number' },
    { fieldName: 'useQty', dataType: 'number' },
    { fieldName: 'useQtyY', dataType: 'number' },
    { fieldName: 'useQtyP', dataType: 'number' },
    { fieldName: 'shortSupply', dataType: 'number' },
    { fieldName: 'totalQty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center', autoFilter: false },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '250' },
    { fieldName: 'imgUrl',
      header: t('MSG_TXT_PHO'),
      width: '100',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      displayCallback: () => t('MSG_TXT_IMG_BRWS'),
    },
    { fieldName: 'warehouseQty', header: t('MSG_TXT_LGST'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQtyY', header: t('MSG_TXT_PVO_Y'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQtyP', header: t('MSG_TXT_LSTMM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQty', header: t('MSG_TXT_THM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'indiQty', header: t('MSG_TXT_INDV'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'shortSupply', header: t('MSG_TXT_APLC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totalQty', header: t('MSG_TXT_TOT_STOC'), width: '175', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { imgUrl } = g.getValues(itemIndex);
    if (column === 'imgUrl') {
      if (isEmpty(imgUrl)) {
        notify(t('MSG_ALT_NOT_PHO'));
      } else {
        await modal({
          component: 'ZwcmzImagePreviewP',
          componentProps: { files: [
            { fileUid: imgUrl },
          ] },
          // componentProps: { files: [imgUrl] }, // fileUid만 주면 됨
        // componentProps: { files: ['FIL-E9E84666-BFC3-44E2-9EC1-D3AFD05BF77B'] }, // fileUid만 주면 됨
        });
      }
    }
  };
});

const initGrdMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' },
    { fieldName: 'sapGrp' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'itmPdAbbr1' },
    { fieldName: 'lgstQty', dataType: 'number' },
    { fieldName: 'centerQty', dataType: 'number' },
    { fieldName: 'myCenterQty', dataType: 'number' },
    { fieldName: 'indiStckQty', dataType: 'number' },
    { fieldName: 'lQty', dataType: 'number' },
    { fieldName: 'itmKnd' },
    { fieldName: 'itmKndNm' },
    { fieldName: 'delUnt' },
    { fieldName: 'delUntNm' },
    { fieldName: 'imgUrl' },
    { fieldName: 'apldFr' },
    { fieldName: 'apldTo' },
    { fieldName: 'boxQty' },
    { fieldName: 'leadTime' },

  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'lgstQty', header: t('MSG_TXT_LGST'), width: '100', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'myCenterQty', header: t('MSG_TXT_OG_WARE'), width: '100', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'indiStckQty', header: t('MSG_TXT_INDV_WARE'), width: '100', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'sapGrp', header: t('TXT_MSG_SAP_MAT_GRP_VAL'), width: '100', styleName: 'text-center' },
    { fieldName: 'leadTime', header: t('MSG_TXT_LEAD_TIME'), width: '100', styleName: 'text-center' },
    { fieldName: 'delUntNm', header: t('TXT_MSG_OSTR_UNIT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'apldFr', header: t('MSG_TXT_USE_STRTDT'), width: '100', datetimeFormat: 'date', styleName: 'text-center' },
    { fieldName: 'apldTo', header: t('MSG_TXT_USE_ENDDT'), width: '100', datetimeFormat: 'date', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.checkBar.exclusive = isRadio.value;
  // 체크박스 설정
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      grid.checkItem(
        clickData.itemIndex,
        isRadio.value ? true : !grid.isCheckedItem(clickData.itemIndex),
        isRadio.value,
      );
    }
  };

  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 3, resizable: true });
  view.onCellDblClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
    onClickSelt(grid, clickData);
  };
});

</script>
