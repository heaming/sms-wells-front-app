<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbBillingDocumentRegP - 청구서 작성 팝업
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서를 작성 하는 팝업
****************************************************************************************************
--->

<template>
  <kw-popup
    class="kw-popup--2xl"
    :title="t('MSG_TIT_BILDC_WRTE')"
  >
    <h3>{{ t('CST_INF_IN') }}</h3>
    <!-- <h3>고객 정보</h3> -->
    <kw-observer ref="obsRef">
      <kw-form
        :cols="2"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_CST_NM')"
            required
          >
            <!-- label="고객명" -->
            <kw-input
              v-model="regMainData.cstFnm"
              icon="search"
              clearable
              :label="t('MSG_TXT_CUSTOMER')"
              :disable="regMainData.isSearchChk"
              maxlength="48"
              :rules="validateCst"
              :custom-messages="{ required:$t('MSG_ALT_USE_DT_SRCH_AF') }"
              @click-icon="onClickSearchUser"
              @keydown="onKeyDownSelectUser"
              @clear="onClearSelectUser"
            />
            <!-- 23-06-20 요청에 따라 제거 counter -->
            <!-- rules="required|max:16" -->
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_WRTE_DT')"
            :colspan="1"
            required
          >
            <!-- label="작성일자" -->
            <kw-date-picker
              v-model="regMainData.bildcWrteDt"
              :label="t('MSG_TXT_WRTE_DT')"
              rules="required"
            />
            <!-- :disable="true" -->
            <!-- :custom-messages="{ is: $t('MSG_ALT_CHK_DUP') }" -->
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>
          <!-- 청구내역 -->
          {{ t('MSG_TXT_BIL_IZ') }}
        </h3>
        <!-- <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        /> -->
      </template>
      <kw-btn
        :label="t('MSG_BTN_DEL')"
        dense
        secondary
        grid-action
        @click="onClickRemove"
      />
      <!-- label="삭제" -->
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="t('MSG_TXT_ROW_SPMT')"
        dense
        secondary
        grid-action
        @click="onClickAddRow"
      />
      <!-- label="행 추가" -->
    </kw-action-top>

    <kw-grid
      ref="grdPageRef"
      name="grdPage"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />

    <template #action>
      <kw-btn
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <!-- label="취소" -->
      <kw-btn
        primary
        :label="t('MSG_TXT_SAVE')"
        @click="onClickSave"
      />
      <!-- label="저장" -->
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, getComponentType, gridUtil, modal, notify, useDataService, useModal, validate, alert, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const now = dayjs();

const { ok } = useModal();
const dataService = useDataService();
const { t } = useI18n();
const { getters } = useStore();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );

const grdPageRef = ref(getComponentType('KwGrid'));
const userInfo = getters['meta/getUserInfo'];
const { userName, employeeIDNumber } = userInfo;

const props = defineProps({
  bildcPblNo: {
    type: String,
    default: null,
  },
  cstFnm: {
    type: String,
    default: null,
  },
  bildcWrteDt: {
    type: String,
    default: null,
  },
  // bildcPblSn: {
  //   type: String,
  //   default: null,
  // },
});

const obsRef = ref();

const regMainData = ref({
  bildcPblNo: '',
  // bildcPblSn: '',
  cstFnm: '', // 고객명
  bildcWrteDt: now.format('YYYYMMDD'), // 작성일자
  sellPrtnrNo: employeeIDNumber, // 이건 나중에 사번으로 바꿔야함
  sellPrtnrNm: userName, // 판매파트너명
  state: '',
  isSearchChk: false,
  cstNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

// 행추가
async function onClickAddRow() {
  const view = grdPageRef.value.getView();

  const dataSource = view.getDataSource();

  dataSource.checkRowStates(true);

  gridUtil.insertRowAndFocus(view, 0, {});
}

let cachedParams;

const validateCst = computed(() => async (val, options) => {
  const errors = [];

  if (!regMainData.value.isSearchChk) {
    errors.push(
      ...(await validate(regMainData.value.cstNo, 'required', options)).errors,
    );
  }

  return errors[0] || true;
});

async function validateGrid(grid) {
  let flag = 0;
  grid.forEach((data) => {
    if (data.pdQty < 1 || data.pdQty === '') {
      flag += 1;
    }
  });
  return flag;
}
// 저장 버튼
async function onClickSave() {
  const view = grdPageRef.value.getView();
  const list = gridUtil.getAllRowValues(view);

  if (!await obsRef.value.validate()) { return; }

  if (!await gridUtil.validate(view)) { return; }

  // 추가된 데이터중 수량 0 또는 빈칸이 존재할경우 validate
  if (await validateGrid(list) > 0) {
    // 수량은(는) 0보다 커야합니다.
    await alert(t('MSG_ALT_ZERO_IS_BIG', [t('MSG_TXT_QTY')]));
    return;
  }

  // console.log(obsRef.value.isModified());
  // console.log(!gridUtil.isModified(view));

  if (await !obsRef.value.isModified() && await !gridUtil.isModified(view)) {
    await alert(t('MSG_ALT_NO_CHG_CNTN')); // 변경된 내용이 없습니다.
    return;
  }

  const gridSize = view.getDataSource().getRowCount();

  if (gridSize < 1) {
    notify(t('MSG_ALT_BIL_IZ'));
    // alert('청구 내역을 입력하세요.');
    return;
  }

  const changedRows = gridUtil.getChangedRowValues(view);
  const mainData = cloneDeep(regMainData.value);

  cachedParams = {
    saveDtlsReq: changedRows,
    saveMainReq: mainData,
  };

  // console.log(cachedParams);

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.

  ok({
    cstFnm: regMainData.value.cstFnm,
    isSearchChk: true,
  });
}

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP',
    componentProps: { cstNm: regMainData.value.cstFnm, cstType: '1' } });

  if (result) {
    regMainData.value.cstNo = payload.cstNo;
    regMainData.value.cstFnm = payload.name;
  }
}

let dataParam;

async function fetchData() {
  dataParam = cloneDeep(regMainData.value);
  dataParam = { ...dataParam, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/details', { params: dataParam });

  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdPageRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  await obsRef.value.init();
  data.checkRowStates(true);
}

// 행삭제
async function onClickRemove() {
  const view = grdPageRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  deletedRows.forEach((data) => {
    if (data.rowState === 'none') {
      data.rowState = 'deleted';
    }
  });

  // grdPageRef.value.getData().clearRows();

  const mainData = cloneDeep(regMainData.value);

  cachedParams = {
    saveDtlsReq: deletedRows,
    saveMainReq: mainData,
  };

  if (deletedRows.length > 0) {
    await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);
    grdPageRef.value.getData().clearRows();
    await fetchData();
  }

  const allCount = await gridUtil.getAllRowValues(view);

  if (allCount === 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/billing-document-orders', { data: deletedRows });
  }
}

async function onClearSelectUser() {
  regMainData.value.cstNo = '';
  regMainData.value.cstFnm = '';
}

async function onKeyDownSelectUser() {
  regMainData.value.cstNo = '';
}
async function onClickCancel() {
  ok({
    cstFnm: regMainData.value.cstFnm,
    isSearchChk: regMainData.value.isSearchChk,
  });
}

async function initProps() {
  if (props.bildcPblNo) {
    const { bildcPblNo, cstFnm, bildcWrteDt } = props;
    regMainData.value.bildcPblNo = bildcPblNo;
    regMainData.value.cstFnm = cstFnm;
    regMainData.value.bildcWrteDt = bildcWrteDt;
    // regMainData.value.bildcPblSn = bildcPblSn;
    regMainData.value.state = 'updated';
    regMainData.value.isSearchChk = true;
    await fetchData();
  } else {
    regMainData.value.state = 'created';
    // const view = grdPageRef.value.getView();
    // gridUtil.insertRowAndFocus(view, 0, {});
    await obsRef.value.init();
  }
}

onMounted(async () => {
  await initProps();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'bildcPblSn' }, // 청구서발행일련번호
    { fieldName: 'bildcPblNo' }, // 청구서발행번호
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdQty' }, // 수량
    { fieldName: 'pdUprc' }, // 상품단가
    { fieldName: 'pdSellAmt', dataType: 'number' }, // 판매금액 (단가)
    { fieldName: 'pdSplAmt' }, // 상품공급금액
    { fieldName: 'pdVat' }, // 상품부가가치세
    { fieldName: 'rmkCn' }, // 비고
  ];

  const columns = [
    { fieldName: 'pdNm',
      rules: 'required|max:16',
      header: t('MSG_TXT_PRDT_NM'),
      // , header: '상품명'
      width: '200',
      editor: {
        type: 'line',
        maxLength: 33,
      },
      styleName: 'text-left' },
    { fieldName: 'pdQty',
      header: t('MSG_TXT_QTY'),
      // header: '수량',
      width: '100',
      // styleName: 'text-right',
      rules: 'required|max:12',
      editor: {
        type: 'number',
        maxLength: 12,
      } },
    { fieldName: 'pdSellAmt',
      header: t('MSG_TXT_UPRC_TAM'),
      // header: '단가(총액)',
      rules: 'required|max:20',
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        maxLength: 20,
      } },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      // , header: '비고'
      width: '485',
      styleName: 'text-left',
      rules: 'max:333',
      editor: {
        type: 'line',
        maxLength: 333,
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
