<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwAftnDsnWdrwCstMngtMgtM - 자동이체 지정 출금 고객 관리
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[W-WD-U0006] 요청한 금액으로 이체청구. 한번, 매회 선택가능. 이체, 중단 선택가능
공통
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item label="업무유형">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD.filter(v => v.codeId === '1' ||
              v.codeId === '2' || v.codeId === '3'|| v.codeId === '6')"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item
          label="고객코드"
          required
        >
          <kw-input
            v-model="searchParams.cntr"
            placeholder="계약번호 13자리"
            rules="required"
            type="number"
            maxlength="13"
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
          <span class="ml8">(단위:원)</span>
        </template>

        <kw-btn
          grid-action
          label="삭제"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          grid-action
          label="행추가"
          @click="onClickAddRow"
        />
        <kw-btn
          grid-action
          label="저장"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="totalCount === 0"
          label="엑셀다운로드"
        />
      </kw-action-top>

      <kw-grid
        ref="grdRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { useGlobal, useDataService, codeUtil, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
// eslint-disable-next-line no-unused-vars
const { notify, alert } = useGlobal();
const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { modal } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref();
const grdData = computed(() => grdRef.value?.getData());
// eslint-disable-next-line no-unused-vars
const grdView = computed(() => grdRef.value?.getView());

const totalCount = ref(0);

let initGridData = [];

let cachedParams;
const searchParams = ref({
  sellTpCd: 'ALL',
  cntr: '',
  cntrNo: '',
  cntrSn: '',
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'DSN_WDRW_FNT_PRD_CD', // 1 : 지정일자 / 2 : 매회 추후에 수정

);
async function onClickAddRow() {
  totalCount.value += 1;
  const view = grdRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    fntYn: 'Y',
    dsnWdrwFntPrdCd: '1',
  });
}

function getSaveParams() {
  const view = grdRef.value.getView();

  const changedRows = gridUtil.getChangedRowValues(view);

  return changedRows.map((v) => ({ ...v,
    dpAmt: isEmpty(v.dpAmt) ? 0 : Number(v.dpAmt),
    cntrNo: `W${v.cntr.slice(0, 11)}`, //   계약상세 4 - 7 - 1
    cntrSn: Number(v.cntr.slice(11)) })); // 계약상세일련번호 4 - 7 - 1
}

function isValidateCheck(view) {
  let result = true;
  const rglD = ['10', '15', '20', '25', '27', '31']; // 정규일
  const changedRows = gridUtil.getChangedRowValues(view);
  changedRows.forEach((v, i) => {
    if (isEmpty(v.cntr)) { // 계약번호 체크
      alert(`${i + 1}번째 계약상세번호를 확인해 주세요`);
      result = false;
    } else if (isEmpty(v.dsnWdrwAmt)) { // 지정금액 체크
      alert(`${i + 1}번째 지정금액을 확인해 주세요`);
      result = false;
    } else if (!rglD.includes(v.dsnWdrwFntD)) { // 계약번호 체크
      alert(`${i + 1}번째 이체일을 확인해 주세요 \n ${rglD}일 만 가능`);
      result = false;
    } else if (+v.dsnWdrwAmt < +v.dpAmt) { // 입금금액이 지정금액보다 큰 경우
      alert(`${i + 1}번째 번째 라인은 지정금액보다 입금금액이 큽니다！`);
      result = false;
    }
  });
  return result;
}

async function onClickRemove() {
  const view = grdRef.value.getView();
  const checkedLength = gridUtil.getCheckedRowValues(view).length;
  if (checkedLength === 0) {
    alert(t('행을 선택해 주세요'));
    return;
  }
  gridUtil.deleteCheckedRows(view);
  totalCount.value -= checkedLength;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/w-aftn-dsn-wdrw-cst-inqr', { params: { ...cachedParams } });
  const person = res.data.list.map((v) => ({ ...v, cntr: v.cntr.replace('W', '') }));

  totalCount.value = person.length;

  if (grdData.value) {
    grdData.value.setRows(person);
  } else {
    initGridData = person;
  }
}

async function onClickSave() {
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  if (!isValidateCheck(view)) return; // 이체일 체크
  const data = getSaveParams();
  await dataService.post('/sms/wells/withdrawal/w-aftn-dsn-wdrw-cst-rgst', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickSearch() {
  searchParams.value.cntrNo = `W${searchParams.value.cntr.slice(0, 11)}`;
  searchParams.value.cntrSn = searchParams.value.cntr.slice(11);
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntr' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'dsnWdrwAmt' },
    { fieldName: 'dsnWdrwFntD' },
    { fieldName: 'fntYn' },
    { fieldName: 'dpAmt' },
    { fieldName: 'ucAmt' },
    { fieldName: 'dsnWdrwFntPrdCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcDtm' },
  ];

  const columns = [
    { fieldName: 'cntr',
      header: '계약상세번호',
      width: '120',
      styleName: 'text-center',
      editor: {
        type: 'number',
      },
      styleCallback: (grid, index) => {
        if (gridUtil.isCreatedRow(grid, index.index.dataRow)) {
          return {
            editable: true,
          };
        }
        return {
          editable: false,
        };
      },
    },
    { fieldName: 'cstKnm', header: '고객성명', width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'sellTpCd', header: '업무유형', width: '80', styleName: 'text-center', editable: false, options: codes.SELL_TP_CD },
    { fieldName: 'dsnWdrwAmt',
      header: '지정금액',
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'dsnWdrwFntD',
      header: '이체일',
      width: '120',
      styleName: 'text-center',
      editor: {
        type: 'number',
        maxLength: 2,
      },
    },
    { fieldName: 'fntYn',
      header: '이체구분',
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },

      options: [{ codeId: 'Y', codeName: '이체' }, { codeId: 'N', codeName: '중단' }], // 추후에 수정 코드 못찾음
    },
    { fieldName: 'dpAmt',
      header: '입금금액',
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'ucAmt',
      header: '잔액',
      width: '120',
      styleName: 'text-right',
      editable: false,
      // eslint-disable-next-line no-unused-vars
      displayCallback(grid, index, value) {
        const dsnWdrwAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dsnWdrwAmt');
        const dpAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dpAmt');
        return dsnWdrwAmt - dpAmt;
      },
    },
    { fieldName: 'dsnWdrwFntPrdCd',
      header: '이체주기',
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.DSN_WDRW_FNT_PRD_CD,

    },

    { fieldName: 'prtnrKnm', header: '등록담당자', width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: '등록자 사번', width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcDtm', header: '등록일시', width: '155', styleName: 'text-center', editable: false, datetimeFormat: 'yyyy-MM-dd hh:mm:ss' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  // multi row header setting

  data.setRows(initGridData);
  view.onEditCommit = (grid, index, oldValue, newValue) => {
    let boolean = true;
    const dsnWdrwAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dsnWdrwAmt');
    const dpAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dpAmt');
    if (index.column === 'dpAmt') {
      if (dsnWdrwAmt < newValue) {
        alert(t('입금금액이 지정금액보다 클 순 없습니다.'));
        boolean = false;
        // grid.setValue(index.itemIndex, 'dpAmt', oldValue ? 0 : oldValue);
      }
    }
    if (index.column === 'dsnWdrwAmt') {
      if (newValue < dpAmt) {
        alert(t('지정금액이 입금금액보다 작을 순 없습니다.'));
        boolean = false;
        // grid.setValue(index.itemIndex, 'dsnWdrwAmt', oldValue);
      }
    }

    if (!boolean) view.cancel();
  };
});

</script>

<style scoped>
</style>
