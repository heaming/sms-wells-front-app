<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','nav', '서비스센터 조 관리']"
      />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item label="조직레벨">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="작업그룹">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          label="직책"
        >
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="엔지니어">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          label="적용일기준조회"
        >
          <kw-date-picker />
        </kw-search-item>

        <kw-search-item label="체크한 항목만 표시">
          <kw-field
            :model-value="[]"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                label=""
                val=""
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="반영적용일"
        >
          <kw-date-picker />
        </kw-search-item>
        <kw-search-item
          label="반영종료일"
        >
          <kw-date-picker />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="888000" />
        </template>
        <kw-btn
          label="저장"
          grid-action
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
          label="엑셀다운로드"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>

function initGrid4(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
  ];

  const columns = [
    { fieldName: 'col1', header: '센터', width: '180', styleName: 'text-center' },
    { fieldName: 'col2', header: '지점', width: '162', styleName: 'text-center' },
    { fieldName: 'col3', header: '사번', width: '110', styleName: 'text-center' },
    { fieldName: 'col4', header: '성명', width: '92', styleName: 'text-center' },
    { fieldName: 'col5', header: '작업그룹', width: '166', styleName: 'text-center' },
    { fieldName: 'col6', header: '직책', width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: '조', width: '166', styleName: 'text-left' },
    { fieldName: 'col8', header: '입사일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: '적용일자', width: '186', styleName: 'text-center' },
    { fieldName: 'col10', header: '종료일자', width: '186', styleName: 'text-center' },
    { fieldName: 'col11', header: '업무용전화번호', width: '156', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
    { col1: 'Wells 서비스관리팀', col2: 'ㅇㅇ지점', col3: '0000000', col4: '홍길동', col5: '환경가전', col6: '센터매니저', col7: '관리자', col8: '2008-09-13', col9: '2008-09-13', col10: '2008-09-13', col11: '000-0000-0000' },
  ]);
}

</script>
<style scoped>
</style>
