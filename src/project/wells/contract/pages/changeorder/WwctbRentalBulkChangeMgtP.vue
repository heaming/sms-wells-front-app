<template>
  <kw-popup
    size="xl"
    title="렌탈 일괄변경 등록"
  >
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          label="처리구분"
          required
        >
          <kw-select
            :model-value="['취소원복(설치전)']"
            :options="['취소원복(설치전)', 'B', 'C', 'D']"
            rules="required"
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
        label="수정"
      />
      <kw-btn
        grid-action
        label="삭제"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        secondary
        label="행추가"
      />
      <kw-btn
        dense
        secondary
        label="저장"
      />
    </kw-action-top>
    <kw-grid
      :visible-rows="3"
      @init="initGrid"
    />

    <template #action>
      <kw-btn
        negative
        label="취소"
      />
      <kw-btn
        primary
        label="등록"
      />
    </template>
  </kw-popup>
</template>

<script setup>
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '176' },
    { fieldName: 'col2', header: '계약자명', width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: '비고', width: '528.4' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '-', col2: '김계약', col3: '-' },

  ]);
}
</script>

<style scoped lang="scss">

</style>
