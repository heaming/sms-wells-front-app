<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSecProductMgtMShipping - 삼성전자 상품관리(배송)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(배송)
****************************************************************************************************
--->
<template>
  <kw-search>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        required
      >
        <kw-date-range-picker
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          rules="date_range_required|date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_GUBUN')"
        required
      >
        <kw-field :model-value="[]">
          <template #default="{ field }">
            <kw-checkbox
              v-bind="field"
              :label="$t('MSG_TXT_PROD_CLSF_DET')"
              val=""
            />
          </template>
        </kw-field>
      </kw-search-item>
    </kw-search-row>
    <kw-search-row
      v-if="true"
    >
      <kw-search-item
        :colspan="3"
        :label="$t('MSG_TXT_PD_DTL')"
        required
      >
        <kw-list class="checkbox-group col">
          <kw-item>
            <kw-field :model-value="[]">
              <template #default="{ field }">
                <kw-checkbox
                  v-bind="field"
                  :label="$t('MSG_TXT_WASHER')"
                  val=""
                />
              </template>
            </kw-field>
            <kw-separator
              vertical
              inset
              spaced="20px"
            />
            <kw-option-group
              :model-value="[]"
              type="checkbox"
              :options="['세탁기(WV20M9670)', '세탁기(WV20M9670)', '세탁기(WF21T6500)', '세탁기(WF21N8750)',
                         '비스포크 세탁기 실버','비스포크 세탁기 화이트']"
            />
          </kw-item>
          <kw-item>
            <kw-field :model-value="[]">
              <template #default="{ field }">
                <kw-checkbox
                  v-bind="field"
                  :label="$t('MSG_TXT_DRYER')"
                  val=""
                />
              </template>
            </kw-field>
            <kw-separator
              vertical
              inset
              spaced="20px"
            />
            <kw-option-group
              :model-value="[]"
              type="checkbox"
              :options="['건조기-DV90M53더오름', '건조기(DV14T8520)', '건조기(DV16T8740)']"
            />
          </kw-item>
          <kw-item>
            <kw-field :model-value="[]">
              <template #default="{ field }">
                <kw-checkbox
                  v-bind="field"
                  :label="$t('MSG_TXT_DRESSER')"
                  val=""
                />
              </template>
            </kw-field>
            <kw-separator
              vertical
              inset
              spaced="20px"
            />
            <kw-option-group
              :model-value="[]"
              type="checkbox"
              :options="['드레서(우드브라운)', '드레서(우드로즈)', '드레서(버건디미러)', '드레서(크리스탈미러)',
                         '드레서 일반 크리스탈미러','드레서 일반 글램화이트' ,'드레서 대용량 크리스탈미러']"
            />
          </kw-item>
          <kw-item>
            <kw-field :model-value="[]">
              <template #default="{ field }">
                <kw-checkbox
                  v-bind="field"
                  :label="$t('MSG_TXT_ARCN')"
                  val=""
                />
              </template>
            </kw-field>
            <kw-separator
              vertical
              inset
              spaced="20px"
            />
            <kw-option-group
              :model-value="[]"
              type="checkbox"
              :options="['무풍갤러리(AF18R)', '무풍갤러리멀티전용']"
            />
          </kw-item>
        </kw-list>
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
      </template>
      <kw-btn
        icon="download_on"
        :disable="pageInfo.totalCount === 0"
        secondary
        dense
        :label="$t('MSG_BTN_DOWN_COM_EXCEL')"
      />
      <kw-btn
        icon="download_on"
        :disable="pageInfo.totalCount === 0"
        secondary
        dense
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount===0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRefShipping"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdShipping"
      @init="initGrdShipping"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, gridUtil, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRefShipping = ref(getComponentType('KwGrid'));

async function onClickExcelDownload() {
  const view = grdMainRefShipping.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdShipping = defineGrid((data, view) => {
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
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SUS_CUST'), width: '100', styleName: 'text-left' },
    {
      fieldName: 'col2',
      header: t('MSG_TXT_ORD_INQ_DT'),
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
    },
    { fieldName: 'col3', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' },
    {
      fieldName: 'col4',
      header: `${t('MSG_TXT_ORD_NO')}(${t('MSG_TXT_SEC')})`,
      width: '180',
      styleName: 'text-center',
    },
    { fieldName: 'col5', header: t('MSG_TXT_EXTRAD'), width: '100', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_ZIP'), width: '120', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_ADDR'), width: '400', styleName: 'text-left' },
    {
      fieldName: 'col8',
      header: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_TXT_MSG_PD_HCLSF_ID')})`,
      width: '240',
      styleName: 'text-left',
    },
    {
      fieldName: 'col9',
      header: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_TXT_MSG_PD_LCLSF_ID')})`,
      width: '240',
      styleName: 'text-left',
    },
    { fieldName: 'col10', header: t('MSG_TXT_TEL_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_MPNO'), width: '134', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_UNUITM'), width: '200', styleName: 'text-left' },
    { fieldName: 'col13', header: t('MSG_TXT_INST'), width: '134', styleName: 'text-center' },
    {
      fieldName: 'col14',
      header: t('MSG_TXT_INST_DT'),
      width: '134',
      styleName: 'text-center',
      datetimeFormat: 'date',
    },
    { fieldName: 'col15', header: t('MSG_TXT_SR_NUM'), width: '134', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_ORD_TYP'), width: '134', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  data.setRows([
    {
      col1: '고객명 의심',
      col2: '2022-10-01',
      col3: '1234-567890',
      col4: '000000000',
      col5: '김고객',
      col6: '12345',
      col7: '서울 관악구 난곡로 00길 1-1 교원A동 105호',
      col8: '삼성 건조기 9kg',
      col9: '건조기(DV90T5540)',
      col10: '02-111-1234',
      col11: '010-1234-1234',
      col12: '-',
      col13: 'Y',
      col14: '2022-10-10',
      col15: '-',
      col16: 'L20',
    },
    {
      col1: '고객명 의심',
      col2: '2022-10-01',
      col3: '1234-567890',
      col4: '000000000',
      col5: '김고객',
      col6: '12345',
      col7: '서울 관악구 난곡로 00길 1-1 교원A동 105호',
      col8: '삼성 건조기 9kg',
      col9: '건조기(DV90T5540)',
      col10: '02-111-1234',
      col11: '010-1234-1234',
      col12: '-',
      col13: 'Y',
      col14: '2022-10-10',
      col15: '-',
      col16: 'L20',
    },
    {
      col1: '고객명 의심',
      col2: '2022-10-01',
      col3: '1234-567890',
      col4: '000000000',
      col5: '김고객',
      col6: '12345',
      col7: '서울 관악구 난곡로 00길 1-1 교원A동 105호',
      col8: '삼성 건조기 9kg',
      col9: '건조기(DV90T5540)',
      col10: '02-111-1234',
      col11: '010-1234-1234',
      col12: '-',
      col13: 'Y',
      col14: '2022-10-10',
      col15: '-',
      col16: 'L20',
    },
    {
      col1: '고객명 의심',
      col2: '2022-10-01',
      col3: '1234-567890',
      col4: '000000000',
      col5: '김고객',
      col6: '12345',
      col7: '서울 관악구 난곡로 00길 1-1 교원A동 105호',
      col8: '삼성 건조기 9kg',
      col9: '건조기(DV90T5540)',
      col10: '02-111-1234',
      col11: '010-1234-1234',
      col12: '-',
      col13: 'Y',
      col14: '2022-10-10',
      col15: '-',
      col16: 'L20',
    },
  ]);
});
</script>
<style scoped lang="scss">
.border-top {
  border-top: 1px solid $line-line;
}

</style>
