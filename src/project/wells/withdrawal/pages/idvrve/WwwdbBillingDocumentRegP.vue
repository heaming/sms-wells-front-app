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
              rules="required|max:16"
              :disable="regMainData.isSearchChk"
              maxlength="48"
              counter
              @click-icon="onClickSearchUser"
            />
            <!-- :custom-messages="{ is: $t('MSG_ALT_CHK_DUP') }" -->
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

      <kw-separator />

      <kw-action-top>
        <template #left>
          <kw-paging-info />
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_DEL')"
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
          @click="onClickAddRow"
        />
      <!-- label="행 추가" -->
      </kw-action-top>
      <kw-grid
        ref="grdPageRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </kw-observer>
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

import { defineGrid, getComponentType, gridUtil, modal, notify, useDataService, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const now = dayjs();

const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();
const { t } = useI18n();
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPageRef = ref(getComponentType('KwGrid'));
const userInfo = getters['meta/getUserInfo'];
// const grdPageRef = ref();
const { userId, userName } = userInfo;
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
  sellPrtnrNo: userId, // 이건 나중에 사번으로 바꿔야함
  sellPrtnrNm: userName,
  state: '',
  isSearchChk: false,
});

// 행추가
async function onClickAddRow() {
  const view = grdPageRef.value.getView();

  const dataSource = view.getDataSource();

  dataSource.checkRowStates(true);

  gridUtil.insertRowAndFocus(view, 0, {});
}

let cachedParams;

// 저장 버튼
async function onClickSave() {
  if (await obsRef.value.alertIfIsNotModified()) { return; }

  // if (!await obsRef.value.validate()) { return; }

  const view = grdPageRef.value.getView();

  const gridSize = view.getDataSource().getRowCount();

  if (gridSize < 1) {
    notify(t('MSG_ALT_BIL_IZ'));
    // alert('청구 내역을 입력하세요.');
    return;
  }

  // if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  const mainData = cloneDeep(regMainData.value);

  console.log(mainData);

  cachedParams = {
    saveDtlsReq: changedRows,
    saveMainReq: mainData,
  };

  console.log(cachedParams);

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);

  notify(t('MSG_ALT_SAVE_DATA'));

  ok();
}

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    console.log(payload);
    // regMainData.value.cstFnm = payload.cstNm;
    regMainData.value.cstFnm = payload.name;
  }
}

let dataParam;

async function fetchData() {
  dataParam = cloneDeep(regMainData.value);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/details', { params: dataParam });
  const list = res.data;

  const view = grdPageRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(list);
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

  const mainData = cloneDeep(regMainData.value);

  cachedParams = {
    saveDtlsReq: deletedRows,
    saveMainReq: mainData,
  };

  console.log(deletedRows);

  if (deletedRows.length > 0) {
    await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);
    await fetchData();
  }

  const allCount = await gridUtil.getAllRowValues(view);

  if (allCount === 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/billing-document-orders', { data: deletedRows });
    ok();
  }
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

    await obsRef.value.init();
    await fetchData();
  } else {
    regMainData.value.state = 'created';
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
    { fieldName: 'bildcPblSn' },
    { fieldName: 'bildcPblNo' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdQty' },
    { fieldName: 'pdUprc' },
    { fieldName: 'pdSellAmt', dataType: 'number' },
    { fieldName: 'pdSplAmt' },
    { fieldName: 'pdVat' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'pdNm',
      rules: 'required|max:33',
      header: t('MSG_TXT_PRDT_NM'),
      // , header: '상품명'
      width: '200',
      styleName: 'text-left' },
    { fieldName: 'pdQty',
      header: t('MSG_TXT_QTY'),
      // header: '수량',
      width: '100',
      // styleName: 'text-right',
      rules: 'required|max:12',
      editor: {
        type: 'number',
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
      } },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      // , header: '비고'
      width: '485',
      styleName: 'text-left',
      rules: 'max:333' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // 체크박스 설정
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
    }
  };

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
