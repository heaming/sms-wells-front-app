<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfRuleBaseInquirylistP - 규정 및 기준조회-사이트멥
3. 작성자 : gs.piit225
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 규정 및 기준조회-사이트멥
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <div class="row justify-end items-center pb10">
      <kw-btn
        icon="plus"
        dense
        secondary
        :label="$t('MSG_BTN_ALL_SPREAD')"
        @click="expandAll"
      />
      <kw-btn
        icon="minus"
        dense
        secondary
        :label="$t('MSG_BTN_ALL_FOLD')"
        @click="collapseAll"
      />
    </div>

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
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, useMeta } from 'kw-lib';

const { getUserInfo } = useMeta();
const userInfo = getUserInfo();

const { ok } = useModal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let treeData = ref([]);

const grdTreeRef = ref({});
async function fetchData() {
  const cachedParams = {
    ogTpCd: userInfo.ogTpCd,
    rsbDvCd: userInfo.baseRleCd,
  };
  console.log('userInfo', userInfo);

  return await dataService.get('/sms/wells/competence/business/rulebase/user', { params: cachedParams });
}

function expandAll() {
  grdTreeRef.value.getView().expandAll();
}

function collapseAll() {
  grdTreeRef.value.getView().collapseAll();
}

async function init() {
  const view = grdTreeRef.value.getView();
  const data = view.getDataSource();
  treeData = ref([]);
  grdTreeRef.value.getData().clearRows();

  const res = await fetchData();
  const list = res.data;

  treeData.value.push(...list);
  data.setRows(treeData.value, 'orgPath', false, '');
  expandAll();
}

async function onClickSave(data) {
  ok(data);
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
    { fieldName: 'fnlMdfcUsrNm', visible: false },
    { fieldName: 'fnlMdfcDt', visible: false },
  ];
  data.setFields(treeColumns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(treeColumns);

  view.header.visible = false;

  view.onCellDblClicked = async (g, clickData) => {
    const clickDatas = g.getValues(clickData.itemIndex);
    console.log(g);
    console.log(clickData);
    onClickSave(clickDatas);
  };
};
</script>
