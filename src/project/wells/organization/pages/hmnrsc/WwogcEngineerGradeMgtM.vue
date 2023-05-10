<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerGradeMgtM - 엔지니어 등급 관리
3. 작성자 : gs.rahul.m
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 등급 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_MNGT_DV')">
          <kw-select
            :model-value="[]"
            :options="['엔지니어', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ROLE_1')">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_NO_RGS')">
          <kw-field :model-value="[]">
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
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        />
        <kw-btn
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        :model-value="1"
        :total-count="pageInfo.totalCount"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_EPNO'), width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '166', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '106', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_ROLE_1'), width: '106', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_ENTCO_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_GD'), width: '166', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_APY_STRTDT'), width: '178', styleName: 'text-center ' },
    { fieldName: 'col9', header: t('MSG_TXT_APY_ENDDT'), width: '178', styleName: 'text-center ' },
    { fieldName: 'col10', header: t('MSG_TXT_NOTE'), width: '499.7', styleName: 'text-center' },

  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남서비스센터', col2: '0000000', col3: '홍길동(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '유인열(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '강성환(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김창민(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '박준찬(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김종수(0000000)', col4: '-', col5: '정규직', col6: '2008-09-13', col7: '-', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '유인열(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '강성환(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김창민(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '박준찬(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },

  ]);
});
</script>
