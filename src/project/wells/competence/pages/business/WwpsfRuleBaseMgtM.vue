<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSF
2. 프로그램 ID : WwpsfRuleBaseMgtM - 규정 및 기준관리-기본관리
3. 작성자 : jisung you -> park yesol
4. 작성일 : 2023.06.22 -> 2023.12.06
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
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.lvl1Depth"
            :options="lvl1Depth"
            first-option="all"
            option-label="bznsSpptMnalNm"
            option-value="unnKey"
            :label="$t('MSG_TXT_INQR_DV')"
            @change="lvl2DepthChange"
          />
          <kw-select
            v-model="searchParams.lvl2Depth"
            :options="lvl2Depth"
            first-option="all"
            option-label="bznsSpptMnalNm"
            option-value="unnKey"
            :disable="isTwoDepth"
            @change="lvl3DepthChange"
          />
          <kw-select
            v-model="searchParams.lvl3Depth"
            :options="lvl3Depth"
            first-option="all"
            option-label="bznsSpptMnalNm"
            option-value="unnKey"
            :disable="isThreeDepth"
          />
        </kw-search-item>
        <kw-search-item>
          <kw-checkbox
            v-model="searchParams.urgnYn"
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
import { cloneDeep, isEmpty } from 'lodash-es';

const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  lvl1Depth: '',
  lvl2Depth: '',
  lvl3Depth: '',
  urgnYn: 'N',
});

let cachedParams;

const totList = ref([]);
const lvl1Depth = ref([]);
const lvl2Depth = ref([]);
const lvl3Depth = ref([]);

const isTwoDepth = ref(true);
const isThreeDepth = ref(true);

const grdTreeRef = ref({});
const totalCount = ref(0);

const selectedRowValue = ref(null);

const fetchData = async () => {
  cachedParams = { ...searchParams.value };
  const res = await dataService.get('/sms/wells/competence/rulebase', { params: cachedParams });
  const view = grdTreeRef.value.getView();

  const row = {};
  if (!isEmpty(searchParams.value.lvl1Depth)) {
    row.rows = res.data.filter((obj) => obj.unnKey === searchParams.value.lvl1Depth);
  } else {
    row.rows = res.data.filter((obj) => obj.inqrLvTcnt === 1);
  }

  row.rows.forEach((obj) => {
    const lvl2Rows = [];
    res.data.forEach((data) => {
      if (!isEmpty(searchParams.value.lvl2Depth)) {
        if (obj.bznsSpptMnalId === data.hgrBznsSpptMnalId
        && data.unnKey === searchParams.value.lvl2Depth
        && data.inqrLvTcnt === 2) {
          lvl2Rows.push(data);
        }
      } else if (obj.bznsSpptMnalId === data.hgrBznsSpptMnalId && data.inqrLvTcnt === 2) {
        lvl2Rows.push(data);
      }
    });
    obj.rows = lvl2Rows;
    obj.rows.forEach((lvl2) => {
      const lvl3Rows = [];
      res.data.forEach((lvl3) => {
        if (!isEmpty(searchParams.value.lvl3Depth)) {
          if (lvl2.bznsSpptMnalId === lvl3.hgrBznsSpptMnalId
        && lvl3.unnKey === searchParams.value.lvl3Depth
        && lvl3.inqrLvTcnt === 3) {
            lvl3Rows.push(lvl3);
          }
        } else if (lvl2.bznsSpptMnalId === lvl3.hgrBznsSpptMnalId && lvl3.inqrLvTcnt === 3) {
          lvl3Rows.push(lvl3);
        }
      });
      lvl2.rows = lvl3Rows;
    });
  });
  view.getDataSource().setObjectRows(row, 'rows', '', '');
  view.setCurrent(0);
  view.collapseAll();
  totalCount.value = view.getDataSource().getRowCount();
};

const init = async () => {
  const res = await dataService.get('/sms/wells/competence/rulebase', { params: cachedParams });
  lvl1Depth.value = res.data.filter((obj) => obj.inqrLvTcnt === 1);
  totList.value = res.data;
};

const lvl2DepthChange = async (val) => {
  isThreeDepth.value = true;
  searchParams.value.lvl2Depth = '';
  const row = totList.value.filter((obj) => val === obj.unnKey)[0];
  if (!isEmpty(val)) {
    // eslint-disable-next-line max-len
    lvl2Depth.value = totList.value.filter((obj) => row.bznsSpptMnalId === obj.hgrBznsSpptMnalId && obj.inqrLvTcnt === 2);
    isTwoDepth.value = false;
  } else {
    isTwoDepth.value = true;
    lvl2Depth.value = [];
  }
};

const lvl3DepthChange = async (val) => {
  searchParams.value.lvl3Depth = '';
  const row = totList.value.filter((obj) => val === obj.unnKey)[0];
  if (!isEmpty(val)) {
    // eslint-disable-next-line max-len
    lvl3Depth.value = totList.value.filter((obj) => row.bznsSpptMnalId === obj.hgrBznsSpptMnalId && obj.inqrLvTcnt === 3);
    isThreeDepth.value = false;
  } else {
    isThreeDepth.value = true;
    lvl3Depth.value = [];
  }
};

const onClickSearch = async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const onClickMove = async (amount) => {
  const view = grdTreeRef.value.getView();
  const data = view.getDataSource();
  const { dataRow } = selectedRowValue.value;
  const siblings = gridUtil.getSiblings(view, dataRow);
  const crrIdx = siblings.findIndex((v) => v === dataRow);
  if (crrIdx + amount < 0 || crrIdx + amount === siblings.length) {
    return;
  }
  const parent = data.getChildren(data.getParent(dataRow));
  if (amount.toString().indexOf('Infinity') < 0) {
    const preRow = gridUtil.getRowValue(view, siblings[crrIdx + amount]);
    let count = 0;
    parent.forEach((rowId) => {
      const row = gridUtil.getRowValue(view, rowId);
      if (row.bznsSpptMnalId === preRow.bznsSpptMnalId) {
        count += 1;
      }
    });
    await data.moveRowSibling(dataRow, amount * count);
    await data.setValue(dataRow, 'expsrOdr', Number(crrIdx + amount * count) + 1);
  } else {
    await data.moveRowSibling(dataRow, amount);
    await data.setValue(dataRow, 'expsrOdr', amount === '-Infinity' ? 1 : siblings.length);
  }
  view.setCurrent({ dataRow });
  parent.forEach((rowId) => {
    data.setValue(rowId, 'expsrOdr', (gridUtil.getSiblings(view, dataRow).findIndex((v) => v === rowId)) + 1);
  });
};

const onClickDetail = async () => {
  const { result } = await modal({
    component: 'WwpsfRuleBaseDtlP',
    componentProps: {
      bznsSpptMnalId: selectedRowValue.value.bznsSpptMnalId,
      hgrBznsSpptMnalId: selectedRowValue.value.hgrBznsSpptMnalId,
      apnFileDocId: selectedRowValue.value.apnFileDocId,
    },
  });

  if (result) {
    if (searchParams.value.lvl1Depth !== '') {
      onClickSearch();
    }
    selectedRowValue.value = null;
  }
};

const insertChildRow = async (rowValue) => {
  const view = grdTreeRef.value.getView();
  const parentRowValue = selectedRowValue.value;
  const parentRow = parentRowValue.dataRow;
  const parentIndex = view.getItemIndex(parentRow);
  const arrayalOrder = gridUtil.getChildren(view, parentRow)?.length || 0;
  const expsrOdr = Number(arrayalOrder) + 1;/* 노출순서 */
  const inqrLvTcnt = Number(parentRowValue.inqrLvTcnt) + 1;
  view.expand(parentIndex);
  view.getDataSource().insertChildRow(parentRow, arrayalOrder, {
    hgrBznsSpptMnalId: parentRowValue.bznsSpptMnalId, /* 상위영업지원매뉴얼ID */
    bznsSpptMnalNm: rowValue.menuName, /* 서비스교육매뉴얼명 */
    inqrLvTcnt, /* 조회단계차수 */
    expsrOdr, /* 노출순서 */
    vlStrtDtm: '', /* 유효시작일시 */
    vlEndDtm: '', /* 유효종료일시 */
    bznsSpptMnalRgstCd: '', /* 영업지원매뉴얼등록코드 */
    bznsSpptMnalChCn: '', /* 영업지원매뉴얼변경내용 */
    mnalRghRelId: '', /* 매뉴얼권한관계ID */
    rowState: 'created',
    arrayalOrder,
    bznsSpptMnalMpblDvCd: '',
  });
};
const onClickSave = async () => {
  const view = grdTreeRef.value.getView();
  const rows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/rulebase/tree', rows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
  selectedRowValue.value = null;
};

async function onClickMenuAdd() {
  insertChildRow({
    menuName: '새 메뉴',
  });
}

async function onClickDelete() {
  const data = grdTreeRef.value.getData();
  const { dataRow, svEducMnalId, rowState } = selectedRowValue.value;
  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    data.removeRow(dataRow);
    if (rowState !== 'created') {
      await dataService.delete('/sms/wells/competence/rulebase', { data: { svEducMnalId } });
    }
    selectedRowValue.value = null;
  }
}

onMounted(async () => {
  await init();
  await fetchData();
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
  data.setOptions({
    restoreMode: 'NONE',
  });

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
