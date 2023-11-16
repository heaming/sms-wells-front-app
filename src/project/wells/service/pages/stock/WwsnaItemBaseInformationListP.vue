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
 - 품목기본정보 조회 (http://localhost:3000/#/service/wwsna-item-base-information-List)
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
          required
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :readonly="isKndCd"
            :options="codes.ITM_KND_CD"
            :label="$t('MSG_TXT_ITM_KND')"
            rules="required"
          />
        </kw-search-item>
        <!-- 품목그룹 -->
        <kw-search-item
          :label="t('MSG_TXT_ITM_GRP')"
        >
          <kw-select
            v-model="searchParams.itmGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 자재그룹 -->
        <kw-search-item
          :label="t('TXT_MSG_SAP_MAT_GRP_VAL')"
        >
          <kw-select
            v-model="searchParams.svMatGrpCd"
            :options="codes.SV_MAT_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmPdCd"
            upper-case
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-input
            v-model="searchParams.itmPdNm"
            class="w200"
          />
        </kw-search-item>
        <!-- SAP코드 FROM ~ TO -->
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
            @update:model-value="onUpdateAplcDvAcd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
      </template>
    </kw-action-top>
    <kw-grid
      v-if="isGrid"
      ref="grdMainRef"
      :total-count="totalCount"
      @init="initGrdMain"
    />
    <kw-grid
      v-show="isGrid2"
      ref="grdMainRef2"
      :total-count="totalCount"
      @init="initGrdMain2"
    />
    <template #action>
      <!-- 닫기버튼 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
      <!-- 선택 -->
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

import { codeUtil, useModal, getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { cancel: onClickClose, ok } = useModal();
const { modal, notify } = useGlobal();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const isKndCd = ref(false); // 품목종류
const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'MNGT_UNIT_CD',
  'APLC_DV_ACD',
  'PD_GRP_CD',
  'SV_MAT_GRP_CD',
);

// 그리드1
const isGrid = ref();
// 그리드2
const isGrid2 = ref();
// 신청리스트
const aplcList = ref();
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

// 조회 파라미터
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
  itmGrpCd: '',
  svMatGrpCd: '',

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

const totalCount = ref(0);

// 신청리스트 조회
const aplcLists = ref([]);
let list = [];
let target = [];
async function fetchAplcLists() {
  const { aplcList: aplcCode } = aplcParams.value;

  const view = grdMainRef.value.getView();

  if (isEmpty(aplcCode)) {
    totalCount.value = list.length;
    view.getDataSource().setRows(list);
    return;
  }

  const res = await dataService.get('/sms/wells/service/item-base-informations/aplclists', { params: aplcParams.value });
  aplcLists.value = res.data;

  target = [];

  res.data.forEach((obj) => {
    const temp = list.find((i) => i.itmPdCd === obj.itmPdCd);
    if (temp) {
      target.push(temp);
      return true;
    }
    return false;
  });
  totalCount.value = target.length;
  view.getDataSource().setRows(target);
}

// 신청리스트 변경이벤트
async function onUpdateAplcDvAcd() {
  await fetchAplcLists();
}

// 조회
let cachedParams;
async function fetchData() {
  let pages;
  let view;
  if (props.chk === '1') {
    const res = await dataService.get('/sms/wells/service/item-base-informations', { params: { ...cachedParams } });
    pages = res.data;
    view = grdMainRef2.value.getView();
  } else {
    const res = await dataService.get('/sms/wells/service/item-base-informations/out-of', { params: { ...cachedParams } });
    pages = res.data;

    view = grdMainRef.value.getView();
  }

  totalCount.value = pages.length;
  view.getDataSource().setRows(pages);
  validateChangeCode();

  list = gridUtil.getAllRowValues(view, false);
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 화면 로드시 Default
async function initDefault() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/item-base-informations/checked-code', { params: cachedParams });
  searchParams.value.wareDvCd = res.data[0].wareDvCd;
  searchParams.value.wareDtlDvCd = res.data[0].wareDtlDvCd;
}

// SAP코드 input박스 첫번째 입력시
function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

// SAP코드 input박스 두번째 입력시
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
  } else {
    isGrid2.value = false;
    isGrid.value = true;
    aplcList.value = true;
    checkField.value = true;
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
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'itmPdNm' }, // 품목상품명
    { fieldName: 'itmPdNm1' }, // 품목상품명1
    { fieldName: 'itmPdAbbr1' }, // 품목약어
    { fieldName: 'itemKnd' }, // 품목구분
    { fieldName: 'boxUnitQty' }, // 박스단위수량
    { fieldName: 'delUnt' }, // 관리단위
    { fieldName: 'imgUrl' }, // IMGURL
    { fieldName: 'warehouseQty', dataType: 'number' }, // 창고수량
    { fieldName: 'centerQty', dataType: 'number' }, // 센터수량
    { fieldName: 'centerBQty' }, // 센터B수량
    { fieldName: 'indiQty', dataType: 'number' }, // 개인수량
    { fieldName: 'useQty', dataType: 'number' }, // 사용수량
    { fieldName: 'useQtyY', dataType: 'number' }, // 전년도
    { fieldName: 'useQtyP', dataType: 'number' }, // 전월
    { fieldName: 'shortSupply', dataType: 'number' }, // 신청
    { fieldName: 'totalQty', dataType: 'number' }, // 총수량
  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center', autoFilter: false },
    { fieldName: 'itmPdNm1', header: t('MSG_TXT_ITM_NM'), width: '200' },
    { fieldName: 'imgUrl',
      header: t('MSG_TXT_PHO'),
      width: '100',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: true,
      },
      displayCallback: () => t('MSG_TXT_IMG'),
    },
    { fieldName: 'warehouseQty', header: t('MSG_TXT_LGST'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQtyY', header: t('MSG_TXT_PVO_Y'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQtyP', header: t('MSG_TXT_LSTMM'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'useQty', header: t('MSG_TXT_THM'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'indiQty', header: t('MSG_TXT_INDV'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'shortSupply', header: t('MSG_TXT_APLC'), width: '75', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totalQty', header: t('MSG_TXT_TOT_STOC'), width: '130', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;

  // IMG보기 버튼 클릭
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
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'sapGrp' }, // SAP구분
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'itmPdNm' }, // 품목명
    { fieldName: 'itmPdAbbr1' }, // 품목상품약어명
    { fieldName: 'lgstQty', dataType: 'number' }, // 물류수량
    { fieldName: 'centerQty', dataType: 'number' }, // 센터수량
    { fieldName: 'myCenterQty', dataType: 'number' }, // 조직창고
    { fieldName: 'indiStckQty', dataType: 'number' }, // 개인창고수량
    { fieldName: 'lQty', dataType: 'number' }, // 수량
    { fieldName: 'itmKnd' }, // 품목구분
    { fieldName: 'itmKndNm' }, // 품목구분명
    { fieldName: 'delUnt' }, // 출고단위
    { fieldName: 'delUntNm' }, // 출고단위명
    { fieldName: 'imgUrl' }, // IMGURL
    { fieldName: 'apldFr' }, // 사용시작일
    { fieldName: 'apldTo' }, // 사용종료일
    { fieldName: 'boxQty' }, // 박스수량
    { fieldName: 'leadTime' }, // leadTime

  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '75', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmPdAbbr1', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'lgstQty', header: t('MSG_TXT_LGST'), width: '75', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '75', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'myCenterQty', header: t('MSG_TXT_OG_WARE'), width: '75', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'indiStckQty', header: t('MSG_TXT_INDV_WARE'), width: '75', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'sapGrp', header: t('TXT_MSG_SAP_MAT_GRP_VAL'), width: '75', styleName: 'text-center' },
    { fieldName: 'leadTime', header: t('MSG_TXT_LEAD_TIME'), width: '75', styleName: 'text-center' },
    { fieldName: 'delUntNm', header: t('TXT_MSG_OSTR_UNIT_CD'), width: '75', styleName: 'text-center' },
    { fieldName: 'apldFr', header: t('MSG_TXT_USE_STRTDT'), width: '75', datetimeFormat: 'date', styleName: 'text-center' },
    { fieldName: 'apldTo', header: t('MSG_TXT_USE_ENDDT'), width: '75', datetimeFormat: 'date', styleName: 'text-center' },

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
