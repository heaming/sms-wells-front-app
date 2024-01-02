<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaItemLocationListM(W-SV-U-0137M01) - 품목위치 관리
3. 작성자 : songTaeSung
4. 작성일 : 2023.07.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
표준창고 적용 및 품목의 위치를 설정하는 화면
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 관리창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionStockList"
            rules="required"
            :label="$t('MSG_TXT_MNGT_WARE')"
            @change="onChangeWareNo"
          />
          <kw-field
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.stckStdGb"
                :label="$t('MSG_TXT_STD_NO_APY')"
                @update:model-value="onCheckedStckNoStdGb"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKnd"
            :options="codes.ITM_KND_CD"
            first-option="all"
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
            :label="t('MSG_TXT_ITM_GRP')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
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
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            upper-case
            type="text"
            :label="$t('TXT_MSG_AS_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
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
          :label="$t('MSG_TXT_SAVE')"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 창고유형코드 -->
        <kw-select
          v-model="baseInfo.wareTpCd"
          dense
          class="w150"
          :options="codes.WARE_TP_CD"
          first-option="select"
        />
        <!-- 위치앵글 -->
        <kw-select
          v-model="baseInfo.lctAngleCd"
          dense
          class="w150"
          :options="angleCode"
          first-option="select"
        />
        <!--위치 층수 -->
        <kw-select
          v-model="baseInfo.lctCofCd"
          dense
          class="w150"
          :options="codes.LCT_COF_CD"
          first-option="select"
        />
        <!-- 위치 층 번호 -->
        <kw-select
          v-model="baseInfo.lctFlorNoCd"
          dense
          class="w150"
          :options="codes.LCT_FLOR_NO_CD"
          first-option="select"
        />
        <!-- 위치 자재 그룹 -->
        <kw-select
          v-model="baseInfo.lctMatGrpCd"
          dense
          class="w150"
          :options="codes.LCT_MAT_GRP_CD"
          first-option="select"
        />
        <!-- 품목위치 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_BTN_ITM_LCT_BLK_CH')"
          @click="onClickGridBulkChange"
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
import { defineGrid, codeUtil, useMeta, useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { notify } = useGlobal();
const store = useStore();
const stdWareUri = '/sms/wells/service/normal-out-of-storages/standard-ware';
const loginWareUri = '/sms/wells/service/returning-goods-store/login-warehouse';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const loginWare = ref();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD', // 품목구분코드
  'PD_GRP_CD', // 품목그룹
  'SV_MAT_GRP_CD', // 자재그룹
  'WARE_TP_CD', // 창고유형코드
  'LCT_ANGLE_CD', // 위치앵글
  'LCT_COF_CD', // 위치 층수
  'LCT_FLOR_NO_CD', // 위치 층 번호
  'LCT_MAT_GRP_CD', // 위치 자재 그룹
);

const searchParams = ref({
  wareNo: '',
  itmKnd: '',
  itmPdCd: '',
  stckStdGb: 'N',
  itmGrpCd: '',
  svMatGrpCd: '',
  prtnrNo: store.getters['meta/getUserInfo'].employeeIDNumber,

});

const stckStdGbChkParams = ref({
  apyYm: dayjs().format('YYYYMM'),
});

const baseInfo = ref({
  wareTpCd: '',
  lctAngleCd: '',
  lctCofCd: '',
  lctFlorNoCd: '',
  lctMatGrpCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// lpad
function lpad(str, padLen, padStr) {
  if (padStr.length > padLen) return str;

  // 문자로 변경
  str += '';
  padStr += '';

  while (str.length < padLen) { str = padStr + str; }
  str = str.length >= padLen ? str.substring(0, padLen) : str;

  return str;
}

const angleCode = ref([]);

// 앵글코드 정렬
function sortAngleCode() {
  angleCode.value = codes.LCT_ANGLE_CD.sort((a, b) => {
    const beforeName = b.codeName;
    const beforeLength = beforeName.length;
    const afterName = a.codeName;
    const afterLength = afterName.length;

    const beforeAngle = beforeName.substring(0, 1);
    let beforeSerialNo = beforeName.substring(1, beforeLength);
    const afterAngle = afterName.substring(0, 1);
    let afterSerialNo = afterName.substring(1, afterLength);

    if (isEmpty(beforeSerialNo)) {
      beforeSerialNo = lpad(beforeSerialNo, 5, ' ');
    } else {
      beforeSerialNo = lpad(beforeSerialNo, 5, '0');
    }

    if (isEmpty(afterSerialNo)) {
      afterSerialNo = lpad(afterSerialNo, 5, ' ');
    } else {
      afterSerialNo = lpad(afterSerialNo, 5, '0');
    }

    if (`${beforeSerialNo}${beforeAngle}` < `${afterSerialNo}${afterAngle}`) return 1;
    if (`${beforeSerialNo}${beforeAngle}` > `${afterSerialNo}${afterAngle}`) return -1;

    return 0;
  });
}

const allWareNoRes = await dataService.get('/sms/wells/service/item-locations/stock');
const optionStockList = allWareNoRes.data;
searchParams.value.wareNo = optionStockList[0].codeId;

// 표준미적용 조회
async function stckStdGbFetchData() {
  console.log(searchParams.value.stckStdGb);
  const apyYm = stckStdGbChkParams.value.apyYm.substring(0, 6);
  const { wareNo } = searchParams.value;
  const res = await dataService.get(stdWareUri, { params: { apyYm, wareNo } });
  const { stckStdGb } = res.data;
  searchParams.value.stckStdGb = stckStdGb === 'Y' ? 'N' : 'Y';
  console.log(stckStdGb);
}

// 로그인한 사용자의 상위창고 조회
const getWareHouses = async () => {
  const res = await dataService.get(loginWareUri, { params: { prtnrNo: searchParams.value.prtnrNo } });

  if (!isEmpty(res.data)) {
    loginWare.value = res.data;
    searchParams.value.wareNo = loginWare.value[0].hgrWareNo;
  }
};

// 조회
let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/service/item-locations/locations/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/item-locations/locations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 일괄변경시 적용대상 체크
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

// 코드 또는 코드명으로 코드정보 찾기
function getInfoByCodeAndName(codeGb, value) {
  if (isEmpty(value) || !value) return '';

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

// 위치 가져오기
function getLocation(wareTpCd, angle, cof, flor, grp, gubun) {
  if (gubun !== 'CODE' && gubun !== 'NAME') return '';

  wareTpCd = !wareTpCd ? '' : wareTpCd;
  grp = !grp ? '' : grp;

  if (gubun === 'NAME') {
    angle = !angle || isEmpty(angle) ? ' ' : angle;
    cof = !cof || isEmpty(cof) ? ' ' : cof;
    flor = !flor || isEmpty(flor) ? ' ' : flor;
  } else {
    angle = !angle ? '' : angle;
    cof = !cof ? '' : cof;
    flor = !flor ? '' : flor;
  }

  const term = '-';
  const term1 = !isEmpty(wareTpCd) ? '-' : '';
  const term2 = !isEmpty(grp) ? '-' : '';

  // 위치코드
  if (gubun === 'CODE') {
    return `${wareTpCd}${angle}${cof}${flor}${grp}`;
  }

  let wareTpNm = '';
  let grpNm = '';

  if (!isEmpty(wareTpCd)) {
    wareTpNm = codes.WARE_TP_CD.find((e) => e.codeId === wareTpCd).codeName;
  }

  if (!isEmpty(grp)) {
    grpNm = codes.LCT_MAT_GRP_CD.find((e) => e.codeId === grp).codeName;
  }
  return `${wareTpNm}${term1}${angle}${term}${cof}${term}${flor}${term2}${grpNm}`;
}

// 품목위치 일괄변경 클릭 이벤트
async function onClickGridBulkChange() {
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  const { wareTpCd, lctAngleCd, lctCofCd, lctFlorNoCd, lctMatGrpCd } = baseInfo.value;

  // 앵글 정보
  const angleInfo = getInfoByCodeAndName('GB1', lctAngleCd);
  const angleNm = !isEmpty(angleInfo) ? angleInfo.codeName : '';
  // 층수 정보
  const cofInfo = getInfoByCodeAndName('GB2', lctCofCd);
  const cofNm = !isEmpty(cofInfo) ? cofInfo.codeName : '';
  // 층번호 정보
  const florNoInfo = getInfoByCodeAndName('GB3', lctFlorNoCd);
  const florNoNm = !isEmpty(florNoInfo) ? florNoInfo.codeName : '';

  for (let i = 0; i < checkedRows.length; i += 1) {
    const row = checkedRows[i].dataRow;
    if (!isEmpty(wareTpCd)) {
      data.setValue(row, 'wareTpCd', wareTpCd);
    }
    if (!isEmpty(lctAngleCd)) {
      data.setValue(row, 'itmLctAngleVal', lctAngleCd);
      data.setValue(row, 'angleValNm', angleNm);
    }
    if (!isEmpty(lctCofCd)) {
      data.setValue(row, 'itmLctCofVal', lctCofCd);
      data.setValue(row, 'cofValNm', cofNm);
    }
    if (!isEmpty(lctFlorNoCd)) {
      data.setValue(row, 'itmLctFlorNoVal', lctFlorNoCd);
      data.setValue(row, 'florNoValNm', florNoNm);
    }
    if (!isEmpty(lctMatGrpCd)) {
      data.setValue(row, 'itmLctMatGrpCd', lctMatGrpCd);
    }
    const newWareTpCd = data.getValue(row, 'wareTpCd');
    const newAngleVal = data.getValue(row, 'itmLctAngleVal');
    const newAngleNm = data.getValue(row, 'angleValNm');
    const newCofVal = data.getValue(row, 'itmLctCofVal');
    const newCofNm = data.getValue(row, 'cofValNm');
    const newFlorNoVal = data.getValue(row, 'itmLctFlorNoVal');
    const newFlorNm = data.getValue(row, 'florNoValNm');
    const newGrpCd = data.getValue(row, 'itmLctMatGrpCd');

    // 위치코드
    const locationCode = getLocation(newWareTpCd, newAngleVal, newCofVal, newFlorNoVal, newGrpCd, 'CODE');
    data.setValue(row, 'locationCd', locationCode);

    // 위치명
    const locationName = getLocation(newWareTpCd, newAngleNm, newCofNm, newFlorNm, newGrpCd, 'NAME');
    data.setValue(row, 'itmLctNm', locationName);
  }
  notify(t('MSG_ALT_ATC_BLK_CH_FSH'));
}

// 저장버튼 클릭 이벤트
async function onClickSave() {
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  await dataService.put('/sms/wells/service/item-locations/locations', checkedRows.map((v) => ({ ...v, ...{ stckStdGb: searchParams.value.stckStdGb } })));

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 표준미적용 버튼 클릭시
async function onCheckedStckNoStdGb() {
  const stckStdGb = searchParams.value.stckStdGb === 'N' ? 'Y' : 'N';
  const { wareNo } = searchParams.value;
  const res = await dataService.put('/sms/wells/service/item-locations/standard/locations', { stckStdGb, wareNo });
  const count = res.data;
  if (count > 0) {
    notify(t('MSG_ALT_CHG_DATA'));
    await fetchData();
  }
}

// 창고변경 이벤트
async function onChangeWareNo() {
  await stckStdGbFetchData();
}

// 초기화 버튼 클릭
function onClickReset() {
  if (!isEmpty(loginWare.value)) {
    searchParams.value.wareNo = loginWare.value[0].hgrWareNo;
  }
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  // 표준창고여부 조회
  await stckStdGbFetchData();
  // 창고조회
  await getWareHouses();
  // 앵글코드 정렬
  sortAngleCode();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'pdAbbrNm' }, // 품목명
    { fieldName: 'pitmStocAGdQty', dataType: 'number' }, // 재고
    { fieldName: 'wareTpCd' }, // 창고유형코드
    { fieldName: 'itmLctAngleVal' }, // 앵글
    { fieldName: 'angleValNm' }, // 앵글명
    { fieldName: 'itmLctCofVal' }, // 층수
    { fieldName: 'cofValNm' }, // 층수명
    { fieldName: 'itmLctFlorNoVal' }, // 층번호
    { fieldName: 'florNoValNm' }, // 층번호명
    { fieldName: 'itmLctMatGrpCd' }, // 그룹
    { fieldName: 'locationCd' }, // 위치코드
    { fieldName: 'itmLctNm' }, // 품목위치명
    { fieldName: 'wareNo' }, // 창고번호
    { fieldName: 'itmKndCd' }, // 품목구분코드
    { fieldName: 'stdWareUseYn' }, // 상고사용여부
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '320', styleName: 'text-left' },
    { fieldName: 'pitmStocAGdQty', header: t('MSG_TXT_STOC'), width: '80', styleName: 'text-right' },
    { fieldName: 'wareTpCd',
      header: t('MSG_TXT_WARE'),
      width: '80',
      styleName: 'text-center',
      options: codes.WARE_TP_CD,
      firstOption: 'select',
      firstOptionValue: '',
      firstOptionLabel: ' ',
      editor: { type: 'dropdown' },
      editable: true,
    },
    { fieldName: 'angleValNm',
      header: t('MSG_TXT_ANGLE'),
      width: '80',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'cofValNm',
      header: t('MSG_TXT_FLOR_CNT'),
      width: '80',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'florNoValNm',
      header: t('MSG_TXT_FLOR_NO'),
      width: '96',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'itmLctMatGrpCd',
      header: t('MSG_TXT_SAP_GRP'),
      width: '118',
      styleName: 'text-center',
      options: codes.LCT_MAT_GRP_CD,
      firstOption: 'select',
      firstOptionValue: '',
      firstOptionLabel: ' ',
      editor: { type: 'dropdown' },
      editable: true,
    },
    { fieldName: 'locationCd', header: t('MSG_TXT_LCT_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itmLctNm', header: t('MSG_TXT_LCT_NM'), width: '240', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { wareTpCd, itmLctAngleVal, angleValNm, itmLctCofVal,
      cofValNm, itmLctFlorNoVal, florNoValNm, itmLctMatGrpCd } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);
    let newCode = '';
    let newName = '';

    // 앵글
    if (changedFieldName === 'angleValNm') {
      const codeInfo = getInfoByCodeAndName('GB1', angleValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctAngleVal', '');
        grid.setValue(itemIndex, 'angleValNm', '');
      } else {
        newCode = codeInfo.codeId;
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctAngleVal', newCode);
        grid.setValue(itemIndex, 'angleValNm', newName);
      }

      // 위치코드
      const locationCode = getLocation(wareTpCd, newCode, itmLctCofVal, itmLctFlorNoVal, itmLctMatGrpCd, 'CODE');
      grid.setValue(itemIndex, 'locationCd', locationCode);

      // 위치명
      const locationName = getLocation(wareTpCd, newName, cofValNm, florNoValNm, itmLctMatGrpCd, 'NAME');
      grid.setValue(itemIndex, 'itmLctNm', locationName);

    // 층수
    } else if (changedFieldName === 'cofValNm') {
      const codeInfo = getInfoByCodeAndName('GB2', cofValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctCofVal', '');
        grid.setValue(itemIndex, 'cofValNm', '');
      } else {
        newCode = codeInfo.codeId;
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctCofVal', newCode);
        grid.setValue(itemIndex, 'cofValNm', newName);
      }

      // 위치코드
      const locationCode = getLocation(wareTpCd, itmLctAngleVal, newCode, itmLctFlorNoVal, itmLctMatGrpCd, 'CODE');
      grid.setValue(itemIndex, 'locationCd', locationCode);

      // 위치명
      const locationName = getLocation(wareTpCd, angleValNm, newName, florNoValNm, itmLctMatGrpCd, 'NAME');
      grid.setValue(itemIndex, 'itmLctNm', locationName);

    // 층번호
    } else if (changedFieldName === 'florNoValNm') {
      const codeInfo = getInfoByCodeAndName('GB3', florNoValNm);
      if (isEmpty(codeInfo)) {
        grid.setValue(itemIndex, 'itmLctFlorNoVal', '');
        grid.setValue(itemIndex, 'florNoValNm', '');
      } else {
        newCode = codeInfo.codeId;
        newName = codeInfo.codeName;
        grid.setValue(itemIndex, 'itmLctFlorNoVal', newCode);
        grid.setValue(itemIndex, 'florNoValNm', newName);
      }

      // 위치코드
      const locationCode = getLocation(wareTpCd, itmLctAngleVal, itmLctCofVal, newCode, itmLctMatGrpCd, 'CODE');
      grid.setValue(itemIndex, 'locationCd', locationCode);

      // 위치명
      const locationName = getLocation(wareTpCd, angleValNm, cofValNm, newName, itmLctMatGrpCd, 'NAME');
      grid.setValue(itemIndex, 'itmLctNm', locationName);
    } else if (changedFieldName === 'wareTpCd' || changedFieldName === 'itmLctMatGrpCd') {
      // 위치코드
      const locationCode = getLocation(wareTpCd, itmLctAngleVal, itmLctCofVal, itmLctFlorNoVal, itmLctMatGrpCd, 'CODE');
      grid.setValue(itemIndex, 'locationCd', locationCode);

      // 위치명
      const locationName = getLocation(wareTpCd, angleValNm, cofValNm, florNoValNm, itmLctMatGrpCd, 'NAME');
      grid.setValue(itemIndex, 'itmLctNm', locationName);
    }
  };
});

</script>

<style scoped>
</style>
