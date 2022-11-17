<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncResponsibilityLocalAreaCodeMgtM - 책임지역 지역코드 관리
3. 작성자 : gs.piit129
4. 작성일 : 2022.11.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 책임지역 지역코드 관리 (http://localhost:3000/#/service/wwsnc-responsibility-local-area-code-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row cols="4">
        <!--우편번호-->
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
        >
          <kw-input
            v-model="searchParams.zip1"
            maxlength="250"
          />
          <span>~</span>
          <kw-input />
        </kw-search-item>
        <!--광역시/도-->
        <kw-search-item
          :label="$t('MSG_TXT_MGPO')"
        >
          <kw-select
            v-model="searchParams.fr2pLgldCd"
            :options="sido"
            first-option="all"
            first-option-label="전체"
            first-option-value=""
            option-label="tryNm"
            option-value="fr2pLgldCd"
            @update:model-value="changeSido"
          />
        </kw-search-item>
        <!--시군구-->
        <kw-search-item
          :label="$t('MSG_TXT_SGG')"
        >
          <kw-select
            v-model="searchParams.sggNm"
            :options="sigungu"
            first-option="all"
            first-option-label="전체"
            first-option-value=""
            option-label="sggNm"
            option-value="sggNm"
          />
        </kw-search-item>
        <!--서비스센터-->
        <kw-search-item
          :label="$t('MSG_TXT_SRVC_CNTR')"
        >
          <kw-select
            :model-value="[]"
            :options="svcCode"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="ogNm"
            option-value="ogCd"
          />
          <kw-btn
            label="test"
            @click="test"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row cols="4">
        <!--작업그룹-->
        <kw-search-item :label="$t('MSG_TXT_WK_GRP')">
          <kw-select
            :model-value="[]"
            :options="codes2.BD10"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="label"
            option-value="value"
          />
        </kw-search-item>
        <!--적용일자-->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
        >
          <kw-date-picker />
        </kw-search-item>
        <!--지역코드-->
        <kw-search-item
          :label="$t('MSG_TXT_LOCARA_CD')"
        >
          <kw-input />
          <span>~</span>
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>{{ $t('MSG_TXT_COM_TOT') }}</span>
          <span class="accent pl4">156건</span>
          <kw-separator
            vertical
            inset
            spaced
          />
          <kw-select
            v-model="selectData.model"
            class="kw-select--rows-per-page"
            :options="selectData.options"
            borderless
            dense
            :suffix="$t('MSG_TXT_PER_PAGE')"
          />
        </template>
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="10"
        @init="initGrid4"
      />
      <kw-pagination
        :model-value="1"
        :total-count="100"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import 'C:\pjt-kyowon\workspace\sms-wells-front-app\src\project\wells\utils\common';
// import { codeUtil } from 'kw-lib';

import {
  getLcCommoncodeCo110tb,
  getLcAllocateAc125tb,
  getLcAllocateAc112tb,
  // getLcStockSt101tb,
  // getLcAllocateAc112tb,
} from '../../../utils/common';

const { t } = useI18n();

const searchParams = ref({
  zip1: '',
  fr2pLgldCd: '',
  tryNm: '',
  sggNm: '',
});

const selectData = { model: '10',
  options: [
    '10', '20', '30', '40', '50',
  ] };

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// const codes = await codeUtil.getMultiCodes(
//   'PD_GRP_CD',
//   'COD_PAGE_SIZE_OPTIONS',
// );
const codes2 = await getLcCommoncodeCo110tb();
const svcCode = await getLcAllocateAc125tb();
const sido = await getLcAllocateAc112tb('sido');
// const pds = await getLcStockSt101tb();

// let sigungu = [{ fr2pLgldCd: '', tryNm: '', sggNm: '' }];
let sigungu = [];
async function test() {
  console.log(searchParams.value);
  console.log(searchParams.value.fr2pLgldCd);
  console.log(searchParams.value.tryNm);
  // console.log(await getLcAllocateAc112tb('gu', searchParams.value.fr2pLgldCd));
  // console.log(searchParams.value.oggNm);
  // console.log(sigungu);
}

async function changeSido() {
  console.log('change');
  sigungu = await getLcAllocateAc112tb('gu', searchParams.value.fr2pLgldCd);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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
    { fieldName: 'col12' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SV_ACC'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_MLMN_ACTCS'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_TRY_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SGG_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_EMD_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_AMTD_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_LOCARA_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_CH_LOCARA'), width: '100', styleName: 'text-left' },
    { fieldName: 'col10', header: t('MSG_TXT_APY_STRT_D'), width: '120', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_APY_END_DAY'), width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_LOCARA_GRP_CD'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    'col2',
    'col3',
    {
      header: t('MSG_TXT_LGLD'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col4', 'col5', 'col6'],
    },
    'col7',
    'col8',
    'col9',
    'col10',
    'col11',
    'col12',
  ]);

  data.setRows([
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
    { col1: '01000', col2: '1', col3: '1.67', col4: '서울특별시', col5: '강북구', col6: '우이동', col7: '우이동', col8: 'A012', col9: 'A002', col10: '2021-04-01', col11: '9999-12-31', col12: '10058' },
  ]);
}

</script>
<style scoped>
</style>
