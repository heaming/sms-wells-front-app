<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfRuleBaseMgtM - 규정 및 기준관리-기본관리
3. 작성자 : gs.piit225
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 규정 및 기준관리-기본관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
          required
        >
          <kw-select
            v-model="searchParams.oneDepth"
            :options="oneDepth"
            :label="$t('MSG_TXT_INQR_DV')"
            first-option="select"
            rules="required"
            @change="twoDepthChange"
          />
          <kw-select
            v-model="searchParams.twoDepth"
            :options="twoDepth"
            first-option="select"
            rules="required"
            :disable="isTwoDepth"
            @change="threeDepthChange"
          />
          <kw-select
            v-model="searchParams.threeDepth"
            :options="threeDepth"
            first-option="select"
            rules="required"
            :disable="isThreeDepth"
          />
        </kw-search-item>
        <kw-search-item>
          <kw-checkbox
            v-model="searchParams.urgnYN"
            :label="$t('MSG_TXT_VER_SEA')"
            :false-value="'N'"
            :true-value="'Y'"
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
          <kw-separator
            spaced
            vertical
            inset
          />
          <kw-btn
            icon="top"
            dense
            secondary
            grid-action
            @click="onClickMove(-Infinity)"
          />
          <kw-btn
            icon="up"
            dense
            secondary
            class="ml8"
            grid-action
            @click="onClickMove(-1)"
          />
          <kw-btn
            icon="down"
            dense
            secondary
            class="ml8"
            grid-action
            @click="onClickMove(1)"
          />
          <kw-btn
            icon="bottom"
            dense
            secondary
            class="ml8"
            grid-action
            @click="onClickMove(Infinity)"
          />
        </template>
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          dense
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_ADD')"
          dense
          grid-action
          @click="onClickMenuAdd"
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          dense
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_DTL_INFO')"
          grid-action
          dense
          @click="onClickDetail"
        />
      </kw-action-top>
      <kw-scroll-area
        visible
        class="border-box pa0 h580"
      >
        <!-- 트리 시작 -->
        <kw-tree-grid
          ref="grdTreeRef"
          name="grdTree"
          :visible-rows="20"
          @init="initTreeGrid"
        />
      <!-- // 트리 끝 -->
      </kw-scroll-area>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, gridUtil, useGlobal } from 'kw-lib';
import { RowState } from 'realgrid';

const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  oneDepth: '',
  twoDepth: '',
  threeDepth: '',
  urgnYN: 'N',
});

const oneDepth = ref([]);
const twoDepth = ref([]);
const threeDepth = ref([]);

const isTwoDepth = ref(true);
const isThreeDepth = ref(true);

const grdTreeRef = ref({});
let treeData = ref([]);

let lastSearchDepth = '';

console.log(lastSearchDepth);

const selectedRowValue = ref(null);

const today = new Date();
const yyyy = today.getFullYear();
const mm = today.getMonth() < 9 ? `0${today.getMonth() + 1}` : (today.getMonth() + 1);
const dd = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

async function fetchData() {
  const cachedParams = { ...searchParams.value };
  return await dataService.get('/sms/wells/competence/business/rulebase', { params: cachedParams });
}

const totalCount = ref(0);
async function init() {
  const view = grdTreeRef.value.getView();
  const data = view.getDataSource();
  treeData = ref([]);
  grdTreeRef.value.getData().clearRows();

  const res = await fetchData();
  const list = res.data;

  treeData.value.push(...list);
  data.setRows(treeData.value, 'orgPath', false, '');
  view.refresh();
  grdTreeRef.value.getView().expandAll();
  totalCount.value = treeData.value.length;

  isTwoDepth.value = true;
  isThreeDepth.value = true;
  twoDepth.value = [];
  threeDepth.value = [];
  searchParams.value.oneDepth = '';
  searchParams.value.twoDepth = '';
  searchParams.value.threeDepth = '';

  treeData.value.forEach((obj) => {
    if (obj.inqrLvTcnt === 1) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      oneDepth.value.push(addData);
    }
  });
}

function twoDepthChange() {
  isTwoDepth.value = false;
  const depthData = [];
  searchParams.value.twoDepth = '';
  searchParams.value.threeDepth = '';
  if (searchParams.value.oneDepth === '') {
    isTwoDepth.value = true;
    isThreeDepth.value = true;
    twoDepth.value = [];
    threeDepth.value = [];
  }
  treeData.value.forEach((obj) => {
    if (obj.inqrLvTcnt === 2 && obj.hgrBznsSpptMnalId === searchParams.value.oneDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      depthData.push(addData);
    }
  });
  twoDepth.value = depthData;
}

function threeDepthChange() {
  isThreeDepth.value = false;
  const depthData = [];
  searchParams.value.threeDepth = '';
  if (searchParams.value.twoDepth === '') {
    isThreeDepth.value = true;
    threeDepth.value = [];
  }
  treeData.value.forEach((obj) => {
    if (obj.inqrLvTcnt === 3 && obj.hgrBznsSpptMnalId === searchParams.value.twoDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      depthData.push(addData);
    }
  });
  threeDepth.value = depthData;
}

async function onClickSearch() {
  selectedRowValue.value = null;
  const sarchTreeData = ref([]);
  let addDepthText = '000000000000001';
  const cachedParams = { ...searchParams.value };

  treeData.value.forEach((obj) => {
    if (cachedParams.oneDepth !== '') {
      if (obj.bznsSpptMnalId === cachedParams.oneDepth) {
        addDepthText += `.${obj.bznsSpptMnalId}`;
      }
    }
    if (cachedParams.twoDepth !== '') {
      if (obj.bznsSpptMnalId === cachedParams.twoDepth) {
        addDepthText += `.${obj.bznsSpptMnalId}`;
      }
    }
    if (cachedParams.threeDepth !== '') {
      if (obj.bznsSpptMnalId === cachedParams.threeDepth) {
        addDepthText += `.${obj.bznsSpptMnalId}`;
      }
    }
  });

  treeData.value.forEach((obj) => {
    let inOneDept = false;
    let inTwoDept = false;

    if (cachedParams.oneDepth !== '') {
      if (obj.bznsSpptMnalId === cachedParams.oneDepth) {
        inOneDept = true;
      }
    }
    if (cachedParams.twoDepth !== '') {
      if (obj.bznsSpptMnalId === cachedParams.twoDepth) {
        inTwoDept = true;
      }
    }

    if (addDepthText !== '' && (obj.orgPath.includes(addDepthText) || inOneDept || inTwoDept)) {
      sarchTreeData.value.push(obj);
    }
  });
  const view = grdTreeRef.value.getView();
  const data = view.getDataSource();
  grdTreeRef.value.getData().clearRows();
  totalCount.value = 0;
  data.setRows(sarchTreeData.value, 'orgPath', false, '');
  view.refresh();
  grdTreeRef.value.getView().expandAll();
  totalCount.value = sarchTreeData.value.length;

  if (cachedParams.threeDepth !== '' && cachedParams.twoDepth !== '' && cachedParams.oneDepth !== '') {
    lastSearchDepth = 'threeDepth';
  } else if (cachedParams.threeDepth === '' && cachedParams.twoDepth !== '' && cachedParams.oneDepth !== '') {
    lastSearchDepth = 'twoDepth';
  } else if (cachedParams.threeDepth === '' && cachedParams.twoDepth === '' && cachedParams.oneDepth !== '') {
    lastSearchDepth = 'oneDepth';
  } else {
    lastSearchDepth = '';
  }
}

const onClickReset = async () => {
  searchParams.value = {
    rsbDvCd: '',
    oneDepth: '',
    twoDepth: '',
    threeDepth: '',
  };
  isTwoDepth.value = true;
  isThreeDepth.value = true;
  oneDepth.value = [];
  twoDepth.value = [];
  threeDepth.value = [];
  await init();
};

function onClickMove(amount) {
  const view = grdTreeRef.value.getView();
  const data = view.getDataSource();

  const { dataRow } = selectedRowValue.value;
  data.moveRowSibling(dataRow, amount);
  view.setCurrent({ dataRow });

  const siblings = gridUtil.getSiblings(view, dataRow);
  const newExpsrOdr = siblings.findIndex((v) => v === dataRow);

  data.setValue(dataRow, 'expsrOdr', Number(newExpsrOdr) + 1);
}

async function onClickDetail() {
  const randomNo = String(Math.floor(Math.random() * 89999) + 10000);
  const nowDay = String(yyyy) + String(mm) + String(dd);

  let { apnFileDocId } = selectedRowValue.value;
  if (apnFileDocId === undefined) {
    apnFileDocId = selectedRowValue.value.bznsSpptMnalId + nowDay + randomNo;
  }
  console.log('apnFileDocId', apnFileDocId);
  const { result, payload } = await modal({
    component: 'WwpsfRuleBaseDtlP',
    componentProps: {
      bznsSpptMnalId: selectedRowValue.value.bznsSpptMnalId,
      bznsSpptMnalNm: selectedRowValue.value.bznsSpptMnalNm,
      hgrBznsSpptMnalId: selectedRowValue.value.hgrBznsSpptMnalId,
      vlStrtDtm: selectedRowValue.value.vlStrtDtm,
      vlEndDtm: selectedRowValue.value.vlEndDtm,
      bznsSpptMnalChCn: selectedRowValue.value.bznsSpptMnalChCn,
      bznsSpptMnalRgstCd: selectedRowValue.value.bznsSpptMnalRgstCd,
      mnalRghRelId: selectedRowValue.value.mnalRghRelId,
      apnFileDocId,
      inqrLvTcnt: selectedRowValue.value.inqrLvTcnt,
      expsrOdr: selectedRowValue.value.expsrOdr,
      bznsSpptMnalMpblDvCd: selectedRowValue.value.bznsSpptMnalMpblDvCd,
    },
  });

  if (result) {
    console.log('payload', payload);
    await init();
    if (searchParams.value.oneDepth !== '') {
      onClickSearch();
    }
    selectedRowValue.value = null;
  }
}

async function insertChildRow(rowValue) {
  const view = grdTreeRef.value.getView();
  const parentRowValue = selectedRowValue.value;
  const parentRow = parentRowValue.dataRow;
  const parentIndex = view.getItemIndex(parentRow);
  const arrayalOrder = gridUtil.getChildren(view, parentRow)?.length || 0;
  const expsrOdr = Number(arrayalOrder) + 1;/* 노출순서 */
  let newexpsrOdr = '';
  if (expsrOdr < 10) {
    newexpsrOdr = `0${expsrOdr}`;
  }

  const inqrLvTcnt = Number(parentRowValue.inqrLvTcnt) + 1;
  const hgrBznsSpptMnalId = parentRowValue.bznsSpptMnalId;
  /*
1:WELS 02 00 00 00 00
2:WELS0201000000
3:WELS0201010000
4:WELS0201010100
*/
  const result1 = hgrBznsSpptMnalId.substring(0, 4);
  const result2 = hgrBznsSpptMnalId.substring(0, 6);
  const result3 = hgrBznsSpptMnalId.substring(0, 8);
  const result4 = hgrBznsSpptMnalId.substring(0, 10);
  const result5 = hgrBznsSpptMnalId.substring(0, 12);

  let bznsSpptMnalId = '';
  if (inqrLvTcnt === 1) {
    bznsSpptMnalId = (result1 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 2) {
    bznsSpptMnalId = (result2 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 3) {
    bznsSpptMnalId = (result3 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 4) {
    bznsSpptMnalId = (result4 + newexpsrOdr).padEnd(14, '0');
  } else {
    bznsSpptMnalId = (result5 + newexpsrOdr).padEnd(14, '0');
  }

  const randomNo = String(Math.floor(Math.random() * 89999) + 10000);
  const nowDay = String(yyyy) + String(mm) + String(dd);

  const apnFileDocId = bznsSpptMnalId + nowDay + randomNo;

  view.expand(parentIndex);
  view.getDataSource().insertChildRow(parentRow, arrayalOrder, {

    bznsSpptMnalId, /* 영업지원매뉴얼ID */
    hgrSvEducMnalId: parentRowValue.bznsSpptMnalId, /* 상위영업지원매뉴얼ID */
    bznsSpptMnalNm: rowValue.menuName, /* 서비스교육매뉴얼명 */
    inqrLvTcnt, /* 조회단계차수 */
    expsrOdr, /* 노출순서 */
    vlStrtDtm: '', /* 유효시작일시 */
    vlEndDtm: '', /* 유효종료일시 */
    bznsSpptMnalRgstCd: '', /* 영업지원매뉴얼등록코드 */
    bznsSpptMnalChCn: '', /* 영업지원매뉴얼변경내용 */
    mnalRghRelId: '', /* 매뉴얼권한관계ID */
    apnFileDocId, /* 첨부파일문서ID */
    rowState: 'created',
    arrayalOrder,
    bznsSpptMnalMpblDvCd: '',

  });
}

function createSaveData(view = grdTreeRef.value.getView(), dataRow = 1) {
  const children = gridUtil.getChildren(view, dataRow);

  return children.reduce((a, v) => {
    const rowValue = gridUtil.getRowValue(view, v);
    a.push({
      ...rowValue,
    }, ...createSaveData(view, v));
    return a;
  }, []);
}

async function onClickSave() {
  const saveData = createSaveData();

  let newExpsrOdr01 = 0;
  let newExpsrOdr02 = 0;
  let newExpsrOdr03 = 0;

  saveData.forEach((obj) => {
    if (obj.inqrLvTcnt === '1') {
      newExpsrOdr02 = 0;
      newExpsrOdr03 = 0;
      newExpsrOdr01 += 1;
      obj.expsrOdr = newExpsrOdr01;
    }
    if (obj.inqrLvTcnt === '2') {
      newExpsrOdr03 = 0;
      newExpsrOdr02 += 1;
      obj.expsrOdr = newExpsrOdr02;
    }
    if (obj.inqrLvTcnt === '3') {
      newExpsrOdr03 += 1;
      obj.expsrOdr = newExpsrOdr03;
    }
  });

  await dataService.post('/sms/wells/competence/business/rulebase/tree', saveData);
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();
  if (searchParams.value.oneDepth !== '') {
    onClickSearch();
  }
  selectedRowValue.value = null;
}

async function onClickMenuAdd() {
  insertChildRow({
    // menuName: t('MSG_TXT_FLDR_NEW'),
    menuName: '새 메뉴',
  });
}

async function onClickDelete() {
  const data = grdTreeRef.value.getData();
  const { dataRow, svEducMnalId } = selectedRowValue.value;

  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    if (dataRow > 1) {
      data.removeRow(dataRow);
      await dataService.delete('/sms/wells/competence/business/rulebase', { data: { svEducMnalId } });
      await init();
      if (searchParams.value.oneDepth !== '') {
        onClickSearch();
      }

      selectedRowValue.value = null;
    }
  }
}

onMounted(() => {
  init();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initTreeGrid = async (data, view) => {
  const treeColumns = [
    { fieldName: 'bznsSpptMnalNm' },
    { fieldName: 'vlStrtDtm', visible: false },
    { fieldName: 'vlEndDtm', visible: false },
    { fieldName: 'hgrBznsSpptMnalId', visible: false },
    { fieldName: 'bznsSpptMnalId', visible: false },
    { fieldName: 'bznsSpptMnalRgstCd', visible: false },
    { fieldName: 'bznsSpptMnalChCn', visible: false },
    { fieldName: 'inqrLvTcnt', visible: false },
    { fieldName: 'expsrOdr', visible: false },
    { fieldName: 'apnFileDocId', visible: false },
    { fieldName: 'mnalRghRelId', visible: false },
    { fieldName: 'orgPath', visible: false },
    { fieldName: 'dtaDlYn', visible: false },
  ];
  data.setFields(treeColumns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(treeColumns);

  view.header.visible = false;

  view.onCellDblClicked = async (g, clickData) => {
    selectedRowValue.value = gridUtil.getRowValue(g, clickData.dataRow);

    onClickDetail();
  };

  view.setRowStyleCallback((g, { dataRow }) => {
    const rowState = data.getRowState(dataRow);
    if (rowState !== RowState.NONE) return 'bg-amber-1';
  });

  view.onCurrentRowChanged = (g, oldRow, newRow) => {
    if (newRow > -1) {
      selectedRowValue.value = { ...gridUtil.getRowValue(g, newRow) };
    }
  };
};

</script>
