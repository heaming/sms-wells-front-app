<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaItemLocationMgtP(W-SV-U-0210P01) - 품목위치관리
3. 작성자 : inho.choi
4. 작성일 : 2023.04.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 표준창고 적용 및 품목의 위치를 설정하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
    :modified-targets="['grdMain']"
  >
    <kw-form
      :cols="2"
      ignore-on-modified
    >
      <kw-form-row>
        <!-- 품목코드 -->
        <kw-form-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
        >
          <kw-input
            v-model="propParams.itmPdCd"
            :disable="true"
          />
        </kw-form-item>
        <!-- //품목코드 -->
        <!-- 품목명 -->
        <kw-form-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-input
            v-model="propParams.itmPdNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //품목명 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 관리창고 -->
        <kw-form-item

          :label="$t('MSG_TXT_MNGT_WARE')"
        >
          <kw-input
            v-model="propParams.wareNm"
            :disable="true"
          />
          <!-- 표준 미적용 -->
          <kw-checkbox
            v-model="propParams.stdWareUseYn"
            class="ml20"
            :label="$t('MSG_TXT_STD_NO_APY')"
            @update:model-value="onCheckedStckNoStdGb"
          />
          <!-- //표준 미적용 -->
        </kw-form-item>
        <!-- //관리창고 -->
      </kw-form-row>
    </kw-form>

    <kw-separator />

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
        v-permission:update
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:download
        dense
        secondary
        icon="excel"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="propParams.totalCount === 0"
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
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid, useModal, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { confirm, notify } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const baseURI = '/sms/wells/service/item-locations';
const stdWareUri = '/sms/wells/service/normal-out-of-storages/standard-ware';

const props = defineProps({
  itmPdCd: {
    type: String,
    default: '',
  },
  wareNo: {
    type: String,
    default: '',
  },
  apyYm: {
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const popupRef = ref();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LCT_ANGLE_CD',
  'LCT_COF_CD',
  'LCT_FLOR_NO_CD',
  'LCT_MAT_GRP_CD',
);

const propParams = ref({
  itmPdCd: props.itmPdCd,
  wareNo: props.wareNo,
  apyYm: props.apyYm,
  wareNm: '',
  itmPdNm: '',
  stdWareUseYn: 'N',
  totalCount: '0',
});

const searchParams = ref({
  itmPdCd: props.itmPdCd,
  wareNo: props.wareNo,
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 표준미적용 조회
async function stckStdGbFetchData() {
  const apyYm = propParams.value.apyYm.substring(0, 6);
  const { wareNo } = propParams.value;
  const res = await dataService.get(stdWareUri, { params: { apyYm, wareNo } });
  const { stckStdGb } = res.data;
  propParams.value.stdWareUseYn = stckStdGb === 'Y' ? 'N' : 'Y';
}

// 조회
async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  propParams.value.totalCount = searchData.length;
  if (!isEmpty(searchData)) {
    propParams.value.itmPdNm = searchData[0].pdAbbrNm;
    propParams.value.wareNm = searchData[0].wareNm;
  }

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 표준미적용 체크 시
async function onCheckedStckNoStdGb() {
  const stckStdGb = propParams.value.stdWareUseYn === 'N' ? 'Y' : 'N';
  const { apyYm, wareNo } = propParams.value;

  const res = await dataService.put(stdWareUri, { apyYm, stckStdGb, wareNo });
  if (res.data > 0) {
    notify(t('MSG_ALT_CHG_DATA'));
    await fetchData();
  }
}

// 저장
async function onClickSave() {
  const dataParams = grdMainRef.value.getView();
  const rows = dataParams.getCheckedItems();

  const confirmData = ref([]);
  confirmData.value = rows.map((v) => {
    const {
      wareNo,
      itmPdCd,
      itmLctAngleVal,
      itmLctCofVal,
      itmLctFlorNoVal,
      itmLctMatGrpCd,
      itmKndCd,
    } = dataParams.getValues(v);

    return {
      wareNo,
      itmPdCd,
      itmLctAngleVal,
      itmLctCofVal,
      itmLctFlorNoVal,
      itmLctMatGrpCd,
      itmKndCd,
    };
  });

  // 등록하시겠습니까?
  if (await confirm(t('MSG_ALT_RGST'))) {
    const res = await dataService.put(baseURI, confirmData.value);
    if (res.data.processCount > 0) {
      ok();
      notify(t('MSG_ALT_SAVE_DTA'));
    } else {
      notify(t('MSG_ALT_SVE_ERR'));
    }
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get(baseURI, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await stckStdGbFetchData();
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' }, // SAP 코드
    { fieldName: 'itmPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '146', styleName: 'text-center' }, // 품목코드
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '320' }, // 품목명
    { fieldName: 'pitmStocAGdQty', header: `${t('MSG_TXT_STOC')}(EA)`, width: '80', styleName: 'text-center' }, // 재고
    { fieldName: 'itmLctAngleVal', // 앵글
      header: t('MSG_TXT_ANGLE'),
      width: '80',
      styleName: 'text-center',
      options: codes.LCT_ANGLE_CD,
      editor: { type: 'list' },
      editable: true,
      editOptions: { editable: true },
    },
    { fieldName: 'itmLctCofVal', // 층수
      header: t('MSG_TXT_FLOR_CNT'),
      width: '80',
      styleName: 'text-center',
      options: codes.LCT_COF_CD,
      editor: { type: 'list' },
      editable: true,
    },
    { fieldName: 'itmLctFlorNoVal', // 층번호
      header: t('MSG_TXT_FLOR_NO'),
      width: '96',
      styleName: 'text-center',
      options: codes.LCT_FLOR_NO_CD,
      editor: { type: 'list' },
      editable: true,
    },
    { fieldName: 'itmLctMatGrpCd', // 그룹
      header: t('MSG_TXT_SAP_GRP'),
      width: '118',
      styleName: 'text-center',
      options: codes.LCT_MAT_GRP_CD,
      editor: { type: 'list' },
      editable: true,
    },
    { fieldName: 'itmLctNm', header: t('MSG_TXT_LCT_NM'), width: '283' }, // 위치명
  ];
  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'wareNo' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'stdWareUseYn' }];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  const editFields = ['itmLctAngleVal', 'itmLctCofVal', 'itmLctFlorNoVal', 'itmLctMatGrpCd'];

  view.onCellEditable = (grid, clickData) => {
    if (!editFields.includes(clickData.column)) {
      return false;
    }
  };
  view.onCellClicked = (grid, clickData) => {
    if (editFields.includes(clickData.column)) {
      view.editOptions.editable = true;
    } else {
      view.editOptions.editable = false;
    }
  };
});
</script>
