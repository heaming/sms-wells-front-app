<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcServiceCenterGroupMgtM - 서비스센터 조 관리
3. 작성자 : 이한울
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스센터 조 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_WK_GRP')">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_EGER')">
          <kw-select
            :model-value="['전체']"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_APY_D_BASE_INQR')"
        >
          <kw-date-picker />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_CHECK_ATC_MARK')">
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
          :label="$t('MSG_TXT_RFLT_APY_D')"
        >
          <kw-date-picker />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RFLT_END_D')"
        >
          <kw-date-picker />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil } from 'kw-lib';

const { t } = useI18n();
const { currentRoute } = useRouter();

const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
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
    { fieldName: 'col1', header: t('MSG_TXT_CENTER_DIVISION'), width: '180', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BRANCH'), width: '162', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EPNO'), width: '110', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_WK_GRP'), width: '166', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_RSB'), width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CO'), width: '166', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_ENTCO_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col9', header: t('MSG_TXT_APPLY_DT'), width: '186', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col10', header: t('MSG_TXT_END_DT'), width: '186', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col11', header: t('MSG_TXT_BUSINS_PH_NO'), width: '156', styleName: 'text-center' },

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
});

</script>
<style scoped>
</style>
