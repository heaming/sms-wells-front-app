<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalBulkChangeMgtP - 렌탈 일괄변경 등록
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 일괄변경 등록
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
    :title="$t('MSG_TXT_REG_RENT_BATCH_CHNG')"
  >
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            :model-value="['취소원복(설치전)']"
            :options="['취소원복(설치전)', 'B', 'C', 'D']"
            rules="required"
            :label="$t('MSG_TXT_PROCS_DV')"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="0"
        />
      </template>
      <kw-btn
        grid-action
        :label="$t('MSG_BTN_MOD')"
      />
      <kw-btn
        grid-action
        :label="$t('MSG_BTN_DEL')"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        secondary
        :label="$t('MSG_BTN_ROW_ADD')"
      />
      <kw-btn
        dense
        secondary
        :label="$t('MSG_BTN_SAVE')"
      />
    </kw-action-top>
    <kw-grid
      name="grdMain"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_RGST')"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '176' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_NOTE'), width: '528.4' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '-', col2: '김계약', col3: '-' },

  ]);
});
</script>

<style scoped lang="scss">

</style>
