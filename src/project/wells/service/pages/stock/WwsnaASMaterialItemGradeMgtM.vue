<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaASMaterialItemGradeMgtM(W-SV-U-0115M01) - AS자재 품목등급관리
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.06.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 관리자가 AS 자재의 품목등급을 조정하여 관리하는 화면 (http://localhost:3000/#/service/wwsna-as-material-item-grade-mgt)
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
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <!-- 관리창고번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_WARE_NO')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            rules="required"
            :disable="true"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
            @change="onChangeWareDtlDvCd"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목관리등급 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_MNGT_GD')">
          <kw-select
            v-model="searchParams.itmMngtGdCd"
            :options="['S', 'A', 'B', 'C', 'D', 'S+A+B', 'C+D']"
            :label="$t('MSG_TXT_ITM_MNGT_GD')"
            first-option="all"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item :label="$t('MSG_TXT_USE_YN')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            :label="$t('MSG_TXT_USE_YN')"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          required
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            :label="$t('MSG_TXT_ITM_DV')"
            rules="required"
            :disable="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- 자재구분 -->
        <kw-search-item :label="t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            :options="codes.CMN_PART_DV_CD"
            :label="$t('MSG_TXT_MAT_DV')"
            first-option="all"
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          :disable="pageInfo.totalCount === 0"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  wareDvCd: '2',
  wareDtlDvCd: '',
  wareNo: '',
  itmKndCd: '6',
  useYn: 'Y',
  itmMngtGdCd: '',
  itmPdCd: '',
  matUtlzDvCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'USE_YN',
  'ITM_KND_CD',
  'CMN_PART_DV_CD',
);

const filterCodes = ref({
  wareDtlDvCd: [],
});

function wareDtlDvCdFilter() {
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
}

const optionsCrtItmMngtGdCd = [];

function makeCrtItmMngtGdCd() {
  optionsCrtItmMngtGdCd.push({ codeId: 'S', codeName: 'S' });
  optionsCrtItmMngtGdCd.push({ codeId: 'A', codeName: 'A' });
  optionsCrtItmMngtGdCd.push({ codeId: 'B', codeName: 'B' });
  optionsCrtItmMngtGdCd.push({ codeId: 'C', codeName: 'C' });
  optionsCrtItmMngtGdCd.push({ codeId: 'D', codeName: 'D' });
}

const optionsWareNo = ref();
// 창고번호 조회
const onChangeWareHouse = async () => {
  // 창고번호 클리어
  searchParams.value.wareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/as-material-item-grades/ware-houses',
    { params: {
      baseYm: searchParams.value.baseYm,
      wareDvCd: searchParams.value.wareDvCd,
      wareDtlDvCd: searchParams.value.wareDtlDvCd,
    } },
  );
  optionsWareNo.value = result.data;
};

await Promise.all([
  wareDtlDvCdFilter(),
  makeCrtItmMngtGdCd(),
  onChangeWareHouse(),
]);

// 기준년월이 변경되었을 때 창고번호 재조회
function onChangeBaseYm() {
  const searchBaseYm = searchParams.value.baseYm;
  if (isEmpty(searchBaseYm)) {
    searchParams.value.wareNo = '';
    optionsWareNo.value = [];
    return;
  }
  onChangeWareHouse();
}

// 창고세부구분이 변경되었을 때 창고번호 재조회
function onChangeWareDtlDvCd() {
  onChangeWareHouse();
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-material-item-grades/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itmGd, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (isEmpty(itmGd)) {
    const { baseYm } = cachedParams;

    // 해당월의 자료가 없습니다. 자료를 생성합니다.
    await alert(t('MSG_ALT_CRSP_MM_NO_DATA_MTR_CRT'));

    const validRes = await dataService.get('/sms/wells/service/as-material-item-grades/duplication-check', { params: { ...cachedParams } });
    const validYn = validRes.data;

    // 데이터가 생성되지 않았을 경우만 생성
    if (validYn === 'N') {
      const createRes = await dataService.post('/sms/wells/service/as-material-item-grades/item-grades', {
        baseYm: cachedParams.baseYm,
        itmKndCd: cachedParams.itmKndCd,
      });
      const { processCount } = createRes.data;
      if (processCount > 0) {
        // {0} 월 데이터가 신규 생성되었습니다.
        notify(`${baseYm.substring(0, 4)}-${baseYm.substring(4, 6)}${t('MSG_ALT_CREATED_NEW_DATA')}`);
        // 자료 생성 후 총 건수 표기
        pageInfo.value.needTotalCount = true;
        await fetchData();
      }
      return;
    }
    await alert(`${baseYm.substring(0, 4)}-${baseYm.substring(4, 6)}${t('MSG_TXT_EXIST_NEW_DATA')}`);
    return;
  }

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(itmGd);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  const currentMonth = dayjs().format('YYYYMM');
  const searchBaseYm = searchParams.value.baseYm;

  if (searchBaseYm > currentMonth) {
    // 기준년월 > 현재년월일 경우 메시지 처리, 현재 월까지만 조회 가능합니다
    await alert(t('MSG_ALT_INQR_CRTL_MM_PSB'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  const { itmMngtGdCd } = searchParams.value;
  searchParams.value.itmMngtGdCd = itmMngtGdCd.replace(/\+/gi, '');
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);

  const res = await dataService.post('/sms/wells/service/as-material-item-grades', modifedData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-material-item-grades/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 상품명
    { fieldName: 'jbfMms3OstrQty', dataType: 'number' }, // 직전 3개월 출고량 합계
    { fieldName: 'mlmnOstrQty', dataType: 'number' }, // 월 평균
    { fieldName: 'dAvOstrQty', dataType: 'number' }, // 일 평균
    { fieldName: 'itmMngtGdCd' }, // 품목관리등급
    { fieldName: 'ctrItmMngtGdCd' }, // 조정관리등급
    { fieldName: 'rmkCn' }, // 조정사유
    { fieldName: 'mngtYm' }, // 관리년월
  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'jbfMms3OstrQty', header: t('MSG_TXT_JBF_MMS3_OSTR_SUM'), width: '100', styleName: 'text-right' },
    { fieldName: 'mlmnOstrQty', header: t('MSG_TXT_MM_AV'), width: '100', styleName: 'text-right' },
    { fieldName: 'dAvOstrQty', header: t('MSG_TXT_D_AV'), width: '100', styleName: 'text-right' },
    { fieldName: 'itmMngtGdCd', header: t('MSG_TXT_ITM_MNGT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ctrItmMngtGdCd',
      header: t('MSG_TXT_CTR_MNGT_GD'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      options: optionsCrtItmMngtGdCd,
      editor: { type: 'dropdown' },
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_CTR_RSON'),
      width: '348',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const headerHeight = view.header.height;
  view.header.height = headerHeight + 50;

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 조정관리등급, 조정사유만 변경가능
    if (['ctrItmMngtGdCd', 'rmkCn'].includes(index.column)) {
      return true;
    }
    return false;
  };
});

</script>
<style scoped>
</style>
