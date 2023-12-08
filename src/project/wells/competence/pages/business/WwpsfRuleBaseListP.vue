<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfRuleBaseInquirylistP - 규정 및 기준조회-사이트멥
3. 작성자 : jisung you
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
import { useDataService, useModal } from 'kw-lib';

const { ok } = useModal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdTreeRef = ref({});

const expandAll = () => {
  grdTreeRef.value.getView().expandAll();
};

const collapseAll = () => {
  grdTreeRef.value.getView().collapseAll();
};

const init = async () => {
  const view = grdTreeRef.value.getView();
  grdTreeRef.value.getData().clearRows();

  const res = await dataService.get('/sms/wells/competence/rulebase/user');

  const treeData = {};
  treeData.rows = res.data.filter((obj) => obj.inqrLvTcnt === 1);

  treeData.rows.forEach((obj) => {
    const lvl2Rows = [];
    res.data.forEach((data) => {
      if (obj.bznsSpptMnalId === data.hgrBznsSpptMnalId && data.inqrLvTcnt === 2) {
        lvl2Rows.push(data);
      }
    });
    obj.rows = lvl2Rows;
    obj.rows.forEach((lvl2) => {
      const lvl3Rows = [];
      res.data.forEach((lvl3) => {
        if (lvl2.bznsSpptMnalId === lvl3.hgrBznsSpptMnalId && lvl3.inqrLvTcnt === 3) {
          lvl3Rows.push(lvl3);
        }
      });
      lvl2.rows = lvl3Rows;
    });
  });
  view.getDataSource().setObjectRows(treeData, 'rows', '', '');
  view.resetCurrent();
};

const onClickSave = (data) => {
  ok(data);
};

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
    onClickSave(clickDatas);
  };
};
</script>
