<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsbZoomMgtM - 알림 ZOOM
3. 작성자 : gs.piit225
4. 작성일 : 2023.05.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 알림 ZOOM
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
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
            v-model="searchParams.rsbDvCd"
            :options="rsbDvCd"
            :label="$t('MSG_TXT_MNGT_DV')"
            rules="required"
            @change="onChangeManage"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-select
            v-model="searchParams.lvl1Depth"
            :options="lvl1Depth"
            :label="$t('MSG_TXT_INQR_DV')"
            option-label="svEducMnalNm"
            option-value="svEducMnalId"
            first-option="all"
            @change="lvl2DepthChange"
          />
          <kw-select
            v-model="searchParams.lvl2Depth"
            :options="lvl2Depth"
            option-label="svEducMnalNm"
            option-value="svEducMnalId"
            first-option="all"
            :disable="isTwoDepth"
            @change="lvl3DepthChange"
          />
          <kw-select
            v-model="searchParams.lvl3Depth"
            :options="lvl3Depth"
            option-label="svEducMnalNm"
            option-value="svEducMnalId"
            first-option="all"
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
          :label="$t('MSG_BTN_ADD')"
          dense
          grid-action
          :disable="isAddDisable || isReadonly || isRoot"
          @click="onClickMenuAdd"
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          dense
          :disable="isReadonly || isRoot"
          @click="onClickSave"
        />
        <kw-btn
          :label="$t('MSG_TXT_DTL_INFO')"
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
          :label="$t('MSG_BTN_SV_RUL_BRWS')"
          primary
          dense
          @click="onClickWebPage"
        />
      </kw-action-top>
      <kw-scroll-area
        visible
        class="border-box pa0 h580"
      >
        <!-- 트리 시작 -->
        <kw-tree-grid
          ref="treeRef"
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
import { codeUtil, useGlobal, useDataService, gridUtil, alert } from 'kw-lib';
import { RowState } from 'realgrid';
import { cloneDeep, isEmpty } from 'lodash-es';

const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const rsbDvCd = ref();
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
rsbDvCd.value = codes.RSB_DV_CD.filter((v) => ['W0601', 'W0603'].includes(v.codeId));

const treeRef = ref({});
const selectedRowValue = ref(null);

const isRoot = computed(() => selectedRowValue.value?.svEducMnalId === 'WELS0000000000');
const isReadonly = computed(() => !selectedRowValue.value);
const isAddDisable = computed(() => selectedRowValue.value?.inqrLvTcnt === '4');

const searchParams = ref({
  rsbDvCd: '',
  lvl1Depth: '',
  lvl2Depth: '',
  lvl3Depth: '',
});
let cachedParams;

const totList = ref([]);
const lvl1Depth = ref([]);
const lvl2Depth = ref([]);
const lvl3Depth = ref([]);

const isTwoDepth = ref(true);
const isThreeDepth = ref(true);

const init = async () => {
  const res = await dataService.get('/sms/wells/competence/zoom-counsel/trees', { params: cachedParams });
  totList.value = res.data;
};

const fetchData = async () => {
  cachedParams = { ...searchParams.value };
  const res = await dataService.get('/sms/wells/competence/zoom-counsel/trees', { params: cachedParams });
  totList.value = res.data;
  const view = treeRef.value.getView();

  const data = {};
  data.rows = res.data.filter((obj) => obj.inqrLvTcnt === 0);
  data.rows.forEach((row) => {
    const lvl1Rows = totList.value.filter((obj) => {
      if (!isEmpty(searchParams.value.lvl1Depth)) {
        return row.svEducMnalId === obj.hgrSvEducMnalId && searchParams.value.lvl1Depth === obj.svEducMnalId
         && obj.inqrLvTcnt === 1 && obj.rsbDvCd === searchParams.value.rsbDvCd;
      }
      return obj.inqrLvTcnt === 1 && obj.rsbDvCd === searchParams.value.rsbDvCd;
    });

    lvl1Rows.forEach((lvl1) => {
      const lvl2Rows = [];
      res.data.forEach((tData) => {
        if (!isEmpty(searchParams.value.lvl2Depth)) {
          if (lvl1.svEducMnalId === tData.hgrSvEducMnalId
          && searchParams.value.lvl2Depth === tData.svEducMnalId
          && tData.rsbDvCd === searchParams.value.rsbDvCd
          && tData.inqrLvTcnt === 2) {
            lvl2Rows.push(tData);
          }
        } else if (lvl1.svEducMnalId === tData.hgrSvEducMnalId && tData.inqrLvTcnt === 2
        && tData.rsbDvCd === searchParams.value.rsbDvCd) {
          lvl2Rows.push(tData);
        }
      });
      lvl2Rows.forEach((lvl2) => {
        const lvl3Rows = [];
        res.data.forEach((tData) => {
          if (!isEmpty(searchParams.value.lvl3Depth)) {
            if (lvl2.svEducMnalId === tData.hgrSvEducMnalId
            && searchParams.value.lvl3Depth === tData.svEducMnalId
            && tData.rsbDvCd === searchParams.value.rsbDvCd
            && tData.inqrLvTcnt === 3) {
              lvl3Rows.push(tData);
            }
          } else if (lvl2.svEducMnalId === tData.hgrSvEducMnalId && tData.inqrLvTcnt === 3
          && tData.rsbDvCd === searchParams.value.rsbDvCd) {
            lvl3Rows.push(tData);
          }
        });
        lvl3Rows.forEach((lvl3) => {
          const lvl4Rows = [];
          res.data.forEach((tData) => {
            if (lvl3.svEducMnalId === tData.hgrSvEducMnalId
            && tData.rsbDvCd === searchParams.value.rsbDvCd
            && tData.inqrLvTcnt === 4) {
              lvl4Rows.push(tData);
            }
          });
          lvl3.rows = lvl4Rows;
        });
        lvl2.rows = lvl3Rows;
      });
      lvl1.rows = lvl2Rows;
    });
    row.rows = lvl1Rows;
  });

  view.getDataSource().setObjectRows(data, 'rows', '', '');
  view.setCurrent(0);
  totalCount.value = view.getDataSource().getRowCount();
};

const onChangeManage = async (val) => {
  lvl1Depth.value = totList.value.filter((obj) => obj.inqrLvTcnt === 1 && obj.rsbDvCd === val
    && obj.rsbDvCd === searchParams.value.rsbDvCd);
  searchParams.value.lvl1Depth = '';
  searchParams.value.lvl2Depth = '';
  searchParams.value.lvl3Depth = '';
  await init();
};

const lvl2DepthChange = async (val) => {
  isTwoDepth.value = true;
  searchParams.value.lvl2Depth = '';
  if (!isEmpty(val)) {
    lvl2Depth.value = totList.value.filter((obj) => obj.inqrLvTcnt === 2 && obj.hgrSvEducMnalId === val
    && obj.rsbDvCd === searchParams.value.rsbDvCd);
    isTwoDepth.value = false;
  } else {
    isTwoDepth.value = true;
    lvl2Depth.value = [];
  }
};
const lvl3DepthChange = async (val) => {
  isThreeDepth.value = true;
  searchParams.value.lvl3Depth = '';
  if (!isEmpty(val)) {
    lvl3Depth.value = totList.value.filter((obj) => obj.inqrLvTcnt === 3 && obj.hgrSvEducMnalId === val
    && obj.rsbDvCd === searchParams.value.rsbDvCd);
    isThreeDepth.value = false;
  } else {
    isThreeDepth.value = true;
    lvl3Depth.value = [];
  }
};

const onClickReset = async () => {
  searchParams.value = {
    rsbDvCd: '',
    lvl1Depth: '',
    lvl2Depth: '',
    lvl3Depth: '',
  };
  isTwoDepth.value = true;
  isThreeDepth.value = true;
  lvl1Depth.value = [];
  lvl2Depth.value = [];
  lvl3Depth.value = [];
  await init();
};

const onClickSearch = async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

function onClickMove(amount) {
  if (isReadonly.value || isRoot.value) return;

  const view = treeRef.value.getView();
  const data = view.getDataSource();

  const { dataRow } = selectedRowValue.value;
  data.moveRowSibling(dataRow, amount);
  view.setCurrent({ dataRow });

  const parent = data.getChildren(data.getParent(dataRow));
  parent.forEach((rowId) => {
    data.setValue(rowId, 'expsrOdr', (gridUtil.getSiblings(view, dataRow).findIndex((v) => v === rowId)) + 1);
  });
}

const onClickDelete = async () => {
  if (isReadonly.value || isRoot.value) return;
  const data = treeRef.value.getData();
  const { dataRow, svEducMnalId, rowState } = selectedRowValue.value;
  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    data.removeRow(dataRow);
    if (rowState !== 'created') {
      await dataService.delete('/sms/wells/competence/zoom-counsel', { data: { svEducMnalId } });
      await fetchData();
    }
    selectedRowValue.value = null;
  }
};

const onClickSave = async () => {
  const view = treeRef.value.getView();
  const rows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/zoom-counsel/zooms', rows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
  selectedRowValue.value = null;
};

const insertChildRow = async (rowValue) => {
  const view = treeRef.value.getView();
  const parentRowValue = selectedRowValue.value;
  const parentRow = parentRowValue.dataRow;
  const parentIndex = view.getItemIndex(parentRow);
  const arrayalOrder = gridUtil.getChildren(view, parentRow)?.length || 0;
  const expsrOdr = Number(arrayalOrder) + 1;/* 노출순서 */
  const inqrLvTcnt = Number(parentRowValue.inqrLvTcnt) + 1;
  if (inqrLvTcnt > 4) {
    await alert(t('MSG_ALT_NOT_INSERT_SUB_NODE'));
    return;
  }
  view.expand(parentIndex);
  view.getDataSource().insertChildRow(parentRow, arrayalOrder, {
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
};

const onClickMenuAdd = async () => {
  if (isReadonly.value || isRoot.value) return;
  insertChildRow({
    menuName: '새 메뉴',
  });
};

async function onClickDetail() {
  if (isReadonly.value || isRoot.value) return;
  const { result: isChanged } = await modal({
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

  if (isChanged) {
    fetchData();
    selectedRowValue.value = null;
  }
}

onMounted(async () => {
  await init();
  searchParams.value.rsbDvCd = 'W0601';
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initTreeGrid = async (data, view) => {
  const treeColumns = [
    { fieldName: 'svEducMnalNm' },
    { fieldName: 'hgrSvEducMnalId', visible: false },
    { fieldName: 'svEducMnalId', visible: false },
    { fieldName: 'rsbDvCd', visible: false },
    { fieldName: 'orgPath', visible: false },
    { fieldName: 'osvEducMnalCngId', visible: false },
    { fieldName: 'svEducMnalCn', visible: false },
    { fieldName: 'inqrLvTcnt', visible: false },
    { fieldName: 'expsrOdr', visible: false },
    { fieldName: 'rowState', visible: false },
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
