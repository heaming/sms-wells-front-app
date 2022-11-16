<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보)
2. 프로그램 ID : WwsnyAfterServiceCodeMgtP - AS 코드관리
3. 작성자 : gs.piit122
4. 작성일 : 2022.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsny-after-service-code-mgt)
****************************************************************************************************
--->
<template>
  <kw-popup size="2xl">
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--상품그룹-->
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes2.SB01"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="label"
            option-value="value"
          />
        </kw-search-item>
        <!--서비스유형-->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svTpCd"
            :options="codes2.SB21"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="label"
            option-value="value"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!--AS위치-->
        <kw-search-item :label="$t('MSG_TXT_AS_LCT')">
          <kw-select
            v-model="searchParams.asLctCd"
            :options="codes2.SB31"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="label"
            option-value="value"
          />
        </kw-search-item>
        <!--AS현상-->
        <kw-search-item :label="$t('MSG_TXT_AS_PHN')">
          <kw-select
            v-model="searchParams.asPhnCd"
            :options="codes2.SB32"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="label"
            option-value="value"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        :visible-rows="10"
        @init="initGrd"
      />
    </div>
    <kw-action-bottom>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </kw-action-bottom>
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  useMeta,
} from 'kw-lib';
import { getLcCommoncodeCo110tb } from '~sms-wells/utils/common';

const { t } = useI18n();
const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const { getConfig } = useMeta();
const searchParams = ref({
  pdGrpCd: '',
  svTpCd: '',
  asLctCd: '',
  asPhnCd: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes2 = await getLcCommoncodeCo110tb();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'asCausCd' },
    { fieldName: 'asCausNm' },
  ];

  const columns = [
    { fieldName: 'asCausCd', header: t('MSG_TXT_CODE_ID'), width: '30', styleName: 'text-center' },
    {
      fieldName: 'asCausNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '100',
      lookupDisplay: true,
      lookupData: codes2.SB33,
    },
  ];

  const columnLayout = [
    {
      direction: 'horizontal',
      items: [
        'asCausCd',
        'asCausNm',
      ],
      header: {
        text: t('MSG_TXT_AS_CAUS'),
      },
    },
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log(g, column, itemIndex);
  };
});
</script>
