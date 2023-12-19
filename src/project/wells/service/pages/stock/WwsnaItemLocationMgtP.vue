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
            :readonly="true"
          />
        </kw-form-item>
        <!-- 품목명 -->
        <kw-form-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-input
            v-model="propParams.itmPdNm"
            :readonly="true"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 관리창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_WARE')"
        >
          <kw-input
            v-model="propParams.wareNm"
            :readonly="true"
          />
          <!-- 표준 미적용 -->
          <kw-checkbox
            v-model="propParams.stdWareUseYn"
            class="ml20"
            :label="$t('MSG_TXT_STD_NO_APY')"
            @update:model-value="onCheckedStckNoStdGb"
          />
        </kw-form-item>
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
      <!-- 저장 -->
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
      <!-- 엑셀다운로드 -->
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
const { notify } = useGlobal();
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
  apyYm: props.apyYm,
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 표준미적용 조회
async function stckStdGbFetchData() {
  const { apyYm, wareNo } = propParams.value;
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
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);

  const { stdWareUseYn } = propParams.value;
  if (stdWareUseYn === 'N') {
    modifedData[0].wareNo = '200012';
  }

  const res = await dataService.put(baseURI, modifedData);
  if (res.data.processCount > 0) {
    notify(t('MSG_ALT_SAVE_DTA'));
    ok();
  } else {
    notify(t('MSG_ALT_SVE_ERR'));
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: response.data,
  });
}

// 코드 또는 코드명으로 코드정보 찾기
function getInfoByCodeAndName(codeGb, value) {
  // 앵글
  if (codeGb === 'GB1') {
    // 코드명으로 찾기
    let codeInfo = codes.LCT_ANGLE_CD.find((e) => e.codeName === value?.toUpperCase());
    // 코드값으로 찾기
    if (isEmpty(codeInfo)) {
      codeInfo = codes.LCT_ANGLE_CD.find((e) => Number(e.codeId) === Number(value));
    }
    return codeInfo;
  // 층수
  } if (codeGb === 'GB2') {
    if (value === '0' || value === '00') {
      return codes.LCT_COF_CD.find((e) => e.codeId === '00');
    }

    return codes.LCT_COF_CD.find((e) => Number(e.codeId) === Number(value));
  // 층번호
  } if (codeGb === 'GB3') {
    return codes.LCT_FLOR_NO_CD.find((e) => Number(e.codeId) === Number(value));
  }
  return '';
}

// 위치명 가져오기
function getLocationName(angle, cof, flor, grp) {
  grp = !grp ? '' : grp;

  const term1 = !isEmpty(angle) && !isEmpty(cof) ? '-' : '';
  const term2 = !isEmpty(cof) && !isEmpty(flor) ? '-' : '';
  const term3 = !isEmpty(flor) && !isEmpty(grp) ? '-' : '';

  if (!isEmpty(grp)) {
    const grpNm = codes.LCT_MAT_GRP_CD.find((e) => e.codeId === grp).codeName;
    return `${angle}${term1}${cof}${term2}${flor}${term3}${grpNm}`;
  }
  return `${angle}${term1}${cof}${term2}${flor}`;
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
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', dataType: 'text' }, // SAP 코드
    { fieldName: 'itmPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '146', styleName: 'text-center', dataType: 'text' }, // 품목코드
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '320', dataType: 'text' }, // 품목명
    { fieldName: 'pitmStocAGdQty', header: `${t('MSG_TXT_STOC')}(EA)`, width: '80', styleName: 'text-right', dataType: 'number' }, // 재고
    { fieldName: 'angleValNm', // 앵글
      header: t('MSG_TXT_ANGLE'),
      width: '80',
      styleName: 'text-center',
      editable: true,
      editOptions: { editable: true },
    },
    { fieldName: 'cofValNm', // 층수
      header: t('MSG_TXT_FLOR_CNT'),
      width: '80',
      styleName: 'text-center',
      editable: true,
    },
    { fieldName: 'florNoValNm', // 층번호
      header: t('MSG_TXT_FLOR_NO'),
      width: '96',
      styleName: 'text-center',
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
  const gridField = columns.map((v) => ({ fieldName: v.fieldName, dataType: v.dataType }));
  const fields = [...gridField,
    { fieldName: 'wareNo' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'stdWareUseYn' },
    { fieldName: 'itmLctAngleVal' },
    { fieldName: 'itmLctCofVal' },
    { fieldName: 'itmLctFlorNoVal' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  const editFields = ['angleValNm', 'cofValNm', 'florNoValNm', 'itmLctMatGrpCd'];

  view.onCellEditable = (grid, clickData) => editFields.includes(clickData.column);

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { angleValNm, cofValNm, florNoValNm, itmLctMatGrpCd } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);
    let newName = '';

    // 앵글
    if (changedFieldName === 'angleValNm') {
      const codeInfo = getInfoByCodeAndName('GB1', angleValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctAngleVal', '');
        grid.setValue(itemIndex, 'angleValNm', '');
      } else {
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctAngleVal', codeInfo.codeId);
        grid.setValue(itemIndex, 'angleValNm', newName);
      }

      // 위치명
      const locationNm = getLocationName(newName, cofValNm, florNoValNm, itmLctMatGrpCd);
      grid.setValue(itemIndex, 'itmLctNm', locationNm);

    // 층수
    } else if (changedFieldName === 'cofValNm') {
      const codeInfo = getInfoByCodeAndName('GB2', cofValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctCofVal', '');
        grid.setValue(itemIndex, 'cofValNm', '');
      } else {
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctCofVal', codeInfo.codeId);
        grid.setValue(itemIndex, 'cofValNm', newName);
      }

      // 위치명
      const locationNm = getLocationName(angleValNm, newName, florNoValNm, itmLctMatGrpCd);
      grid.setValue(itemIndex, 'itmLctNm', locationNm);

    // 층번호
    } else if (changedFieldName === 'florNoValNm') {
      const codeInfo = getInfoByCodeAndName('GB3', florNoValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctFlorNoVal', '');
        grid.setValue(itemIndex, 'florNoValNm', '');
      } else {
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctFlorNoVal', codeInfo.codeId);
        grid.setValue(itemIndex, 'florNoValNm', newName);
      }

      // 위치명
      const locationNm = getLocationName(angleValNm, cofValNm, newName, itmLctMatGrpCd);
      grid.setValue(itemIndex, 'itmLctNm', locationNm);

    // 그룹
    } else if (changedFieldName === 'itmLctMatGrpCd') {
      // 위치명
      const locationNm = getLocationName(angleValNm, cofValNm, florNoValNm, itmLctMatGrpCd);
      grid.setValue(itemIndex, 'itmLctNm', locationNm);
    }
  };
});
</script>
