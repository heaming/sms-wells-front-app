<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '역량총무' , '교육관리', '알려ZOOM']"
      />
    </template>
    <kw-search
      :cols="2"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          label="관리구분"
          required
        >
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="rsbDvCd"
            label="관리구분"
            rules="required"
            @change="oneDepthChange"
          />
        </kw-search-item>
        <kw-search-item
          label="조회구분"
          required
        >
          <kw-select
            v-model="searchParams.oneDepth"
            :options="oneDepth"
            label="조회구분"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            rules="required"
            @change="twoDepthChange"
          />
          <kw-select
            v-model="searchParams.twoDepth"
            :options="twoDepth"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            :disable="isTwoDepth"
            @change="threeDepthChange"
          />
          <kw-select
            v-model="searchParams.threeDepth"
            :options="threeDepth"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            :disable="isThreeDepth"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>총</span>
          <span class="accent pl4">{{ totalCount }}</span>
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
            :disable="isReadonly || isRoot"
            @click="onClickMove(-Infinity)"
          />
          <kw-btn
            icon="up"
            dense
            secondary
            class="ml8"
            grid-action
            :disable="isReadonly || isRoot"
            @click="onClickMove(-1)"
          />
          <kw-btn
            icon="down"
            dense
            secondary
            class="ml8"
            grid-action
            :disable="isReadonly || isRoot"
            @click="onClickMove(1)"
          />
          <kw-btn
            icon="bottom"
            dense
            secondary
            class="ml8"
            grid-action
            :disable="isReadonly || isRoot"
            @click="onClickMove(Infinity)"
          />
        </template>
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          dense
          grid-action
          :disable="isReadonly || isRoot"
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="추가"
          dense
          grid-action
          :disable="isReadonly || isRoot"
          @click="onClickMenuAdd"
        />
        <kw-btn
          label="저장"
          grid-action
          dense
          :disable="isReadonly || isRoot"
          @click="onClickSave"
        />
        <kw-btn
          label="상세정보"
          grid-action
          dense
          :disable="isReadonly || isRoot"
          @click="onClickDetail"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="서비스규정 보기"
          primary
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
          ref="zGrdTreeRef"
          name="zGrdTree"
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
import { codeUtil, useGlobal, useDataService, defineTreeGrid, gridUtil } from 'kw-lib';
import { RowState, SelectionStyle } from 'realgrid';
import { cloneDeep } from 'lodash-es';

const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const rsbDvCd = ref();
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
rsbDvCd.value = codes.RSB_DV_CD.filter((v) => ['W0601', 'W0603'].includes(v.codeId));

const zGrdTreeRef = ref({});
let treeData = reactive([]);

const selectedRowValue = ref(null);

const isRoot = computed(() => selectedRowValue.value?.svEducMnalId === 'WELS0000000000');
const isReadonly = computed(() => !selectedRowValue.value);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = reactive({
  rsbDvCd: '',
  oneDepth: '',
  twoDepth: '',
  threeDepth: '',
});

const oneDepth = ref([]);
const twoDepth = ref([]);
const threeDepth = ref([]);

const isTwoDepth = ref(true);
const isThreeDepth = ref(true);

async function fetchData() {
  const cachedParams = { ...searchParams };
  return await dataService.get('/sms/wells/competence/zoom-counsel/tree-list', { params: cachedParams });
}
const totalCount = ref(0);
async function init() {
  const view = zGrdTreeRef.value.getView();
  const data = view.getDataSource();
  treeData = reactive([]);
  zGrdTreeRef.value.getData().clearRows();

  const res = await fetchData();
  const list = res.data;

  treeData.push(...list);
  data.setRows(treeData, 'orgPath', false, '');
  view.refresh();
  zGrdTreeRef.value.getView().expandAll();
  totalCount.value = treeData.length;
  view.onCurrentRowChanged = (g, oldRow, newRow) => {
    if (newRow > -1) {
      selectedRowValue.value = { ...gridUtil.getRowValue(g, newRow) };
    }
  };
}

function oneDepthChange() {
  const depthData = [];

  isTwoDepth.value = true;
  isThreeDepth.value = true;
  twoDepth.value = [];
  threeDepth.value = [];
  searchParams.oneDepth = '';
  searchParams.twoDepth = '';
  searchParams.threeDepth = '';

  treeData.forEach((obj) => {
    if (obj.inqrLvTcnt === 1 && obj.rsbDvCd === searchParams.rsbDvCd) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.svEducMnalId;
      addData.codeName = obj.svEducMnalNm;
      depthData.push(addData);
    }
  });
  oneDepth.value = depthData;
}

function twoDepthChange() {
  isTwoDepth.value = false;
  const depthData = [];
  searchParams.twoDepth = '';
  searchParams.threeDepth = '';
  if (searchParams.oneDepth === '') {
    isTwoDepth.value = true;
    isThreeDepth.value = true;
    twoDepth.value = [];
    threeDepth.value = [];
  }
  treeData.forEach((obj) => {
    if (obj.inqrLvTcnt === 2 && obj.hgrSvEducMnalId === searchParams.oneDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.svEducMnalId;
      addData.codeName = obj.svEducMnalNm;
      depthData.push(addData);
    }
  });
  twoDepth.value = depthData;
}

function threeDepthChange() {
  isThreeDepth.value = false;
  const depthData = [];
  searchParams.threeDepth = '';
  if (searchParams.twoDepth === '') {
    isThreeDepth.value = true;
    threeDepth.value = [];
  }
  treeData.forEach((obj) => {
    if (obj.inqrLvTcnt === 3 && obj.hgrSvEducMnalId === searchParams.twoDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.svEducMnalId;
      addData.codeName = obj.svEducMnalNm;
      depthData.push(addData);
    }
  });
  threeDepth.value = depthData;
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

async function onClickSearch() {
  cloneDeep(searchParams.value);
  const sarchTreeData = reactive([]);
  let addDepthText = 'WELS0000000000';
  const cachedParams = { ...searchParams };
  treeData.forEach((obj) => {
    if (obj.rsbDvCd === cachedParams.rsbDvCd) {
      if (cachedParams.oneDepth !== '') {
        if (obj.svEducMnalId === cachedParams.oneDepth) {
          addDepthText += `.${obj.svEducMnalId}`;
        }
      }
      if (cachedParams.twoDepth !== '') {
        if (obj.svEducMnalId === cachedParams.twoDepth) {
          addDepthText += `.${obj.svEducMnalId}`;
        }
      }
      if (cachedParams.threeDepth !== '') {
        if (obj.svEducMnalId === cachedParams.threeDepth) {
          addDepthText += `.${obj.svEducMnalId}`;
        }
      }
    } else {
      addDepthText = '';
    }
  });

  treeData.forEach((obj) => {
    let inOneDept = false;
    let inTwoDept = false;
    if (obj.svEducMnalId === 'WELS0200000000') {
      sarchTreeData.push(obj);
    }
    if (cachedParams.oneDepth !== '') {
      if (obj.svEducMnalId === cachedParams.oneDepth) {
        inOneDept = true;
      }
    }
    if (cachedParams.twoDepth !== '') {
      if (obj.svEducMnalId === cachedParams.twoDepth) {
        inTwoDept = true;
      }
    }
    if (addDepthText !== '' && (obj.orgPath.includes(addDepthText) || inOneDept || inTwoDept)) {
      sarchTreeData.push(obj);
    }
  });

  const view = zGrdTreeRef.value.getView();
  const data = view.getDataSource();
  zGrdTreeRef.value.getData().clearRows();
  totalCount.value = 0;
  data.setRows(sarchTreeData, 'orgPath', false, '');
  view.refresh();
  zGrdTreeRef.value.getView().expandAll();
  totalCount.value = sarchTreeData.length;
}

function onClickMove(amount) {
  if (isReadonly.value || isRoot.value) return;

  const view = zGrdTreeRef.value.getView();
  const data = view.getDataSource();

  const { dataRow } = selectedRowValue.value;
  data.moveRowSibling(dataRow, amount);
  view.setCurrent({ dataRow });

  const siblings = gridUtil.getSiblings(view, dataRow);
  const newExpsrOdr = siblings.findIndex((v) => v === dataRow);

  console.log('newExpsrOdr:', Number(newExpsrOdr) + 1);

  data.setValue(dataRow, 'expsrOdr', Number(newExpsrOdr) + 1);
  data.setValue(dataRow, 'rowState', 'update');
}

async function onClickDelete() {
  if (isReadonly.value || isRoot.value) return;
  const data = zGrdTreeRef.value.getData();
  const { dataRow, svEducMnalId } = selectedRowValue.value;

  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    if (dataRow > 1) {
      data.removeRow(dataRow);
      await dataService.delete('/sms/wells/competence/zoom-counsel', { data: { svEducMnalId } });
      await init();
      if (searchParams.oneDepth !== '') {
        onClickSearch();
      }

      selectedRowValue.value = null;
    }
  }
}

function createSaveData(view = zGrdTreeRef.value.getView(), dataRow = 1) {
  const children = gridUtil.getChildren(view, dataRow);

  return children.reduce((a, v) => {
    const rowValue = gridUtil.getRowValue(view, v);
    if (rowValue.rowState !== RowState.DELETED) {
      a.push({
        ...rowValue,
      }, ...createSaveData(view, v));
    }

    return a;
  }, []);
}

async function onClickSave() {
  if (isReadonly.value || isRoot.value) return;
  const saveData = createSaveData();

  const oneSvEducMnalId = 'WELS0200000000';
  let twoSvEducMnalId = '';
  let threeSvEducMnalId = '';
  let fourSvEducMnalId = '';

  let twoExpsrOdr = 1;
  let threeExpsrOdr = 1;
  let fourExpsrOdr = 1;
  let fiveExpsrOdr = 1;

  saveData.forEach((obj) => {
    if (obj.inqrLvTcnt === '2') {
      threeExpsrOdr = 1;
      fourExpsrOdr = 1;
      fiveExpsrOdr = 1;
      const result2 = oneSvEducMnalId.substring(0, 6);
      let newexpsrOdr = '';
      if (twoExpsrOdr < 10) {
        newexpsrOdr = `0${twoExpsrOdr}`;
      } else {
        newexpsrOdr = twoExpsrOdr;
      }
      obj.svEducMnalId = (result2 + newexpsrOdr).padEnd(14, '0');
      twoSvEducMnalId = obj.svEducMnalId;
      obj.hgrSvEducMnalId = oneSvEducMnalId;
      obj.expsrOdr = newexpsrOdr;
      twoExpsrOdr += 1;
    }
    if (obj.inqrLvTcnt === '3') {
      fourExpsrOdr = 1;
      fiveExpsrOdr = 1;
      let newexpsrOdr = '';
      if (threeExpsrOdr < 10) {
        newexpsrOdr = `0${threeExpsrOdr}`;
      } else {
        newexpsrOdr = threeExpsrOdr;
      }
      const result3 = twoSvEducMnalId.substring(0, 8);
      obj.svEducMnalId = (result3 + newexpsrOdr).padEnd(14, '0');
      threeSvEducMnalId = obj.svEducMnalId;
      obj.hgrSvEducMnalId = twoSvEducMnalId;
      threeExpsrOdr += 1;
    }
    if (obj.inqrLvTcnt === '4') {
      fiveExpsrOdr = 1;
      let newexpsrOdr = '';
      if (fourExpsrOdr < 10) {
        newexpsrOdr = `0${fourExpsrOdr}`;
      } else {
        newexpsrOdr = fourExpsrOdr;
      }
      const result4 = threeSvEducMnalId.substring(0, 10);
      obj.svEducMnalId = (result4 + newexpsrOdr).padEnd(14, '0');
      fourSvEducMnalId = obj.svEducMnalId;
      obj.hgrSvEducMnalId = threeSvEducMnalId;
      fourExpsrOdr += 1;
    }
    if (obj.inqrLvTcnt === '5') {
      let newexpsrOdr = '';
      if (fiveExpsrOdr < 10) {
        newexpsrOdr = `0${fiveExpsrOdr}`;
      } else {
        newexpsrOdr = fiveExpsrOdr;
      }
      const result5 = fourSvEducMnalId.substring(0, 12);
      obj.svEducMnalId = (result5 + newexpsrOdr).padEnd(14, '0');
      obj.hgrSvEducMnalId = fourSvEducMnalId;
      fiveExpsrOdr += 1;
    }
    obj.rowState = 'updated';
  });
  const response = await dataService.post('/sms/wells/competence/zoom-counsel/treeSave', saveData);
  if (response.data) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await init();
    if (searchParams.oneDepth !== '') {
      onClickSearch();
    }
    selectedRowValue.value = null;
  }
}

async function insertChildRow(rowValue) {
  const view = zGrdTreeRef.value.getView();
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
  const pSvEducMnalId = parentRowValue.svEducMnalId;
  /*
1:WELS 02 00 00 00 00
2:WELS0201000000
3:WELS0201010000
4:WELS0201010100
*/
  const result1 = pSvEducMnalId.substr(0, 4);
  const result2 = pSvEducMnalId.substr(0, 6);
  const result3 = pSvEducMnalId.substr(0, 8);
  const result4 = pSvEducMnalId.substr(0, 10);
  const result5 = pSvEducMnalId.substr(0, 12);

  let svEducMnalId = '';
  if (inqrLvTcnt === 1) {
    svEducMnalId = (result1 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 2) {
    svEducMnalId = (result2 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 3) {
    svEducMnalId = (result3 + newexpsrOdr).padEnd(14, '0');
  } else if (inqrLvTcnt === 4) {
    svEducMnalId = (result4 + newexpsrOdr).padEnd(14, '0');
  } else {
    svEducMnalId = (result5 + newexpsrOdr).padEnd(14, '0');
  }

  view.expand(parentIndex);
  view.getDataSource().insertChildRow(parentRow, arrayalOrder, {

    svEducMnalId, /* 서비스교육매뉴얼ID */
    hgrSvEducMnalId: parentRowValue.svEducMnalId, /* 상위서비스교육매뉴얼ID */
    svEducMnalNm: rowValue.menuName, /* 서비스교육매뉴얼명 */
    inqrLvTcnt, /* 조회단계차수 */
    expsrOdr, /* 노출순서 */
    svEducCtgNm: '', /* 서비스교육카테고리명 */
    svEducMnalCn: '', /* 서비스교육매뉴얼내용 */
    rsbDvCd: parentRowValue.rsbDvCd, /* 직책구분코드 */
    rowState: 'created',
    arrayalOrder,

  });
}

async function onClickMenuAdd() {
  if (isReadonly.value || isRoot.value) return;

  insertChildRow({
    // menuName: t('MSG_TXT_FLDR_NEW'),
    menuName: '새 메뉴',
  });
}

async function onClickDetail() {
  if (isReadonly.value || isRoot.value) return;

  const { result, payload } = await modal({
    component: 'WwpsbZoomDtlP',
    componentProps: {
      svEducMnalId: selectedRowValue.value.svEducMnalId,
      svEducMnalNm: selectedRowValue.value.svEducMnalNm,
      hgrSvEducMnalId: selectedRowValue.value.hgrSvEducMnalId,
      inqrLvTcnt: selectedRowValue.value.inqrLvTcnt,
      rowState: selectedRowValue.value.rowState,
      rsbDvCd: selectedRowValue.value.rsbDvCd,
      svEducMnalCn: selectedRowValue.value.svEducMnalCn,
      expsrOdr: selectedRowValue.value.expsrOdr,
    },
  });

  if (result) {
    console.log('payload', payload);
    console.log('searchParams.value', searchParams.oneDepth);
    await init();
    if (searchParams.oneDepth !== '') {
      onClickSearch();
    }
    selectedRowValue.value = null;
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initTreeGrid = defineTreeGrid(async (data, view) => {
  const fields = [
    { fieldName: 'svEducMnalId' },
    { fieldName: 'hgrSvEducMnalId' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'svEducMnalNm' },
    { fieldName: 'orgPath' },
    { fieldName: 'svEducMnalCn' },
    { fieldName: 'inqrLvTcnt' },
    { fieldName: 'expsrOdr' },
    { fieldName: 'rowState' },
    { fieldName: 'orgCnt' },

  ];

  const treeColumns = [
    { fieldName: 'svEducMnalNm', header: '트리명', width: '100', styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(treeColumns);
  view.header.visible = false;
  view.displayOptions.selectionStyle = SelectionStyle.SINGLE;
  view.editOptions.movable = true;

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
});

onMounted(() => {
  init();
});

</script>
