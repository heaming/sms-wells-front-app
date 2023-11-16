<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaSeedingPackageCtrQtyRegP - 모종패키지 조정수량 등록(W-SV-U-0298P01)
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.07.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 모종패키지 조정 수량을 서비스센터 출고일자, 모종패키지별로 등록하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="lg"
  >
    <kw-search
      :cols="2"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
          required
        >
          <kw-select
            v-model="searchParams.dgGgLctCd"
            :options="codes.GG_LCT_CD"
            :label="$t('MSG_TXT_SV_CNR')"
            rules="required"
            @change="onChangeCenter"
          />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            type="date"
            rules="required"
            :label="$t('MSG_TXT_OSTR_DT')"
            @change="onChangeOstrDt"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span class="ml8">
          ({{ t('MSG_TXT_UNIT') }} : EA)
        </span>
      </template>
      <!-- 저장 -->
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        :disable="totalCount === 0"
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
        icon="download_on"
        :disable="totalCount === 0"
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :total-count="totalCount"
      @init="initGrdMain"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify, alert } = useGlobal();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const popupRef = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  ostrDt: {
    type: String,
    default: '',
  },
});

let cachedParams;
const searchParams = ref({
  ostrDt: isEmpty(props.ostrDt) ? dayjs().format('YYYYMMDD') : props.ostrDt, // 기준년월
  dgGgLctCd: '03',
});

const codes = await codeUtil.getMultiCodes(
  'GG_LCT_CD',
);

let daysOfWeek;

// 서비스센터 변경 시
async function onChangeCenter() {
  daysOfWeek = [];
  const { dgGgLctCd } = searchParams.value;

  if (!isEmpty(dgGgLctCd)) {
    // 센터별 요일 조회
    const res = await dataService.get('/sms/wells/service/seeding-package-ctr-qtys-reg/days-of-week', { params: { dgGgLctCd } });
    daysOfWeek = res.data;
  }
}

// 출고일자 유효성 체크
async function validOstrDt(dow) {
  const isValidDow = daysOfWeek.includes(dow);
  if (!isValidDow) {
    // 출고 예정 요일이 아닙니다.
    await alert(t('MSG_ALT_OSTR_EXP_DOW'));
    return false;
  }
  return true;
}

// 출고일자 변경 시
async function onChangeOstrDt() {
  const { ostrDt } = searchParams.value;
  if (!isEmpty(ostrDt)) {
    const dow = dayjs(ostrDt).format('d');
    await validOstrDt(dow);
  }
}

const totalCount = ref(0);
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seeding-package-ctr-qtys-reg', { params: { ...cachedParams } });
  const ctrQtys = res.data;
  totalCount.value = res.data.length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(ctrQtys);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  const { ostrDt } = searchParams.value;
  const dow = dayjs(ostrDt).format('d');
  // 출고일자 유효성 체크
  if (!await validOstrDt(dow)) return;

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    // 선택된 데이터가 없습니다.
    notify(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) { return; }

  // 출고당일 오전 7시 30분 이후 수량 조정 불가
  const curTime = dayjs().format('YYYYMMDDHHmmss');
  const { ostrDt } = cachedParams;
  if (curTime >= `${ostrDt}073000`) {
  // 출고당일 7:30 이후, 수량을 조정할 수 없습니다.
    await alert(t('MSG_ALT_OSTR_TOD_QTY_CTR_IMP'));
    return;
  }

  let validPdNm = '';
  checkedRows.forEach((item) => {
    const { ostrQty, excdQty, spmtQty, sdingPkgNm } = item;
    // 출고 + 추가수량 < 제외수량
    if (ostrQty + spmtQty < excdQty) {
      validPdNm = sdingPkgNm;
      return false;
    }

    item.ostrDuedt = cachedParams.ostrDt;
    item.dgGgLctCd = cachedParams.dgGgLctCd;
  });

  if (!isEmpty(validPdNm)) {
    // 품목의 제외수량은 출고+추가수량을 초과할 수 없습니다.
    await alert(`${validPdNm} ${t('MSG_ALT_NOT_OVR_EXCD_QTY_OSTR_QTY')}`);
    return;
  }

  const res = await dataService.post('/sms/wells/service/seeding-package-ctr-qtys-reg', checkedRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/seeding-package-ctr-qtys-reg', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

// 초기화 버튼 클릭
async function onClickReset() {
  await onChangeCenter();
}

onMounted(async () => {
  await onChangeCenter();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sdingPkgNm' }, // 품목명
    { fieldName: 'sdingPkgCd' }, // 품목코드
    { fieldName: 'ostrQty', dataType: 'number' }, // 출고수량
    { fieldName: 'excdQty', dataType: 'number' }, // 제외수량
    { fieldName: 'spmtQty', dataType: 'number' }, // 추가수량
  ];

  const columns = [
    { fieldName: 'sdingPkgCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'sdingPkgNm', header: t('MSG_TXT_ITM_NM'), width: '170', styleName: 'text-left' },
    { fieldName: 'ostrQty', header: t('MSG_TXT_OSTR_QTY'), width: '80', styleName: 'text-right' },
    { fieldName: 'excdQty',
      header: `${t('MSG_TXT_EXCD')}${t('MSG_TXT_QTY')}`,
      width: '80',
      styleName: 'text-right',
      rules: 'min_value:0|max_value:999999999999',
      editor: {
        type: 'number',
        editable: true } },
    { fieldName: 'spmtQty',
      header: `${t('MSG_TXT_ADD')}${t('MSG_TXT_QTY')}`,
      width: '80',
      styleName: 'text-right',
      rules: 'min_value:0|max_value:999999999999',
      editor: {
        type: 'number',
        editable: true } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 제외수량, 추가수량만 수정 가능
    if (['excdQty', 'spmtQty'].includes(index.column)) {
      return true;
    }

    return false;
  };
});

</script>
