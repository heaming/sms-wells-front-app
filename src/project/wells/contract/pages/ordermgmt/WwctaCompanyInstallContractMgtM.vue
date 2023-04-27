<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCompanyInstallContractMgtM - 회사설치 주문 관리(생성, 현황조회) 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 주문 관리(생성, 현황조회) 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RCP_D')"
          required
          :colspan="2"
        >
          <kw-date-range-picker
            :label="$t('MSG_TXT_RCP_D')"
            rules="date_range_required|date_range_monts:1"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_INST_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            :label="$t('MSG_TXT_INST_DT')"
            rules="date_range_monts:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_NO')"
        >
          <kw-input
            :label="$t('MSG_TXT_CNTR_NO')"
            clearable
            icon="search"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_IST_NM')"
        >
          <kw-input />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_INST_CLS')"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INST_PURP')"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_PRNT_DV')"
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '1. 반품제외']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '본사', '신채널']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="100"
          />
          <span class="ml8">(단위: 개월)</span>
        </template>

        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          :label="$t('MSG_BTN_RGST')"
          dense
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="1"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid } from 'kw-lib';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

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
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
    { fieldName: 'col41' },
    { fieldName: 'col42' },
    { fieldName: 'col43' },
    { fieldName: 'col44' },
    { fieldName: 'col45' },
    { fieldName: 'col46' },
    { fieldName: 'col47' },
    { fieldName: 'col48' },
    { fieldName: 'col49' },
    { fieldName: 'col50' },
    { fieldName: 'col51' },
    { fieldName: 'col52' },
    { fieldName: 'col53' },
    { fieldName: 'col54' },
    { fieldName: 'col55' },
    { fieldName: 'col56' },
    { fieldName: 'col57' },
    { fieldName: 'col58' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ORD_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_DIV'), width: '130', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_DTRM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RE_REG'), width: '130', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNCL_ASGMT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RRNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_CRNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_INSTR'), width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_RCP_D'), width: '130', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_MNG_COMP'), width: '130', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_MGMT_DEPT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_MNGT_DV'), width: '130', styleName: 'text-center' },
    { fieldName: 'col17', header: `WP${t('MSG_TXT_DIV')}`, width: '130', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_INST_PROD_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_INST_PROD_NM'), width: '259' },
    { fieldName: 'col20', header: t('MSG_TXT_SEED_PKG_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_PKG_NM'), width: '237' },
    { fieldName: 'col22', header: `BS ${t('MSG_TXT_CYCL')}`, width: '130', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_USWY_DV'), width: '130', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_PROD_GRD'), width: '130', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_INST_CLS'), width: '130', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_INST_PURP'), width: '130', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_INST_PLAC'), width: '130' },
    { fieldName: 'col28', header: t('MSG_TXT_VST_PRD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_FREE_PRD'), width: '130', styleName: 'text-right' },
    { fieldName: 'col30', header: `A/S${t('MSG_TXT_PRD')}(년?)`, width: '130', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_FILTER_CST'), width: '130', styleName: 'text-center' },
    { fieldName: 'col32', header: `${t('MSG_TXT_DSC_RT')}(%)`, width: '130', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_DUEDT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_INST_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_RET_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col36', header: t('MSG_TXT_COMP_D'), width: '130', styleName: 'text-center' },
    { fieldName: 'col37', header: t('MSG_TXT_REFER_ARTC'), width: '259', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_CTT_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col39', header: t('MSG_TXT_CTT_ICHR'), width: '130', styleName: 'text-center' },
    { fieldName: 'col40', header: t('MSG_TXT_SPEC_CNTR_CNTN'), width: '259' },
    { fieldName: 'col41', header: t('MSG_TXT_MTR_DV'), width: '130', styleName: 'text-center' },
    { fieldName: 'col42', header: t('MSG_TXT_DATA_TP'), width: '130', styleName: 'text-center' },
    { fieldName: 'col43', header: t('MSG_TXT_ORD_NO_DET'), width: '130', styleName: 'text-center' },
    { fieldName: 'col44', header: t('MSG_TXT_SEED_DET_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col45', header: `${t('MSG_TXT_ETC')}1`, width: '130', styleName: 'text-center' },
    { fieldName: 'col46', header: t('MSG_TXT_IS_REG_DEL'), width: '130', styleName: 'text-center' },
    { fieldName: 'col47', header: `${t('MSG_TXT_ETC')}3`, width: '130', styleName: 'text-center' },
    { fieldName: 'col48', header: t('MSG_TXT_CLS_MEM_CST'), width: '130', styleName: 'text-center' },
    { fieldName: 'col49', header: `${t('MSG_TXT_ETC')}5`, width: '130', styleName: 'text-center' },
    { fieldName: 'col50', header: `${t('MSG_TXT_ETC')}6`, width: '130', styleName: 'text-center' },
    { fieldName: 'col51', header: t('MSG_TXT_IN_D'), width: '130', styleName: 'text-center' },
    { fieldName: 'col52', header: t('MSG_TXT_IN_HH'), width: '130', styleName: 'text-center' },
    { fieldName: 'col53', header: t('MSG_TXT_PIC_INP'), width: '130', styleName: 'text-center' },
    { fieldName: 'col54', header: t('MSG_TXT_IN_ICHR_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col55', header: t('MSG_TXT_MDFC_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col56', header: t('MSG_TXT_FERT_TM'), width: '130', styleName: 'text-center' },
    { fieldName: 'col57', header: t('MSG_TXT_MDFC_ICHR_EPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col58', header: t('MSG_TXT_PIC_REV_NM'), width: '130', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_ODER_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6'],
    },
    'col7', 'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20', 'col21', 'col22', 'col23', 'col24', 'col25', 'col26', 'col27', 'col28', 'col29', 'col30', 'col31', 'col32', 'col33', 'col34', 'col35', 'col36', 'col37', 'col38', 'col39', 'col40', 'col41', 'col42', 'col43', 'col44', 'col45', 'col46', 'col47', 'col48', 'col49', 'col50', 'col51', 'col52', 'col53', 'col54', 'col55', 'col56', 'col57', 'col58',
  ]);

  data.setRows([
    { col1: '8888-18667', col2: '2', col3: '프라퍼티', col4: '확정', col5: '재접수', col6: '배정취소', col7: '900101-2100022', col8: '-', col9: '123456789', col10: '수원경기', col11: '프라퍼티', col12: '2022-10-10', col13: '4', col14: '20', col15: '71409', col16: '2', col17: 'Y', col18: '4048', col19: '웰스팜/와이드/공유SVC', col20: '431', col21: '건강 샐러드&주스 WIDE', col22: '2', col23: '0', col24: '2', col25: '2', col26: '5', col27: '-', col28: '0', col29: '60', col30: '2', col31: 'N', col32: '-', col33: '2022-10-10', col34: '2022-10-15', col35: '-', col36: '-', col37: '내부체험단 5년무상 A급 BS생성있음...', col38: '01', col39: '0', col40: '-', col41: '-', col42: '-', col43: '1234-1234567-1', col44: '-', col45: '-', col46: '-', col47: '-', col48: '렌탈', col49: '0', col50: '-', col51: '2022-10-10', col52: '13:34:44', col53: '12345', col54: '김교원', col55: '2022-10-15', col56: '15:33:10', col57: '12345', col58: '김교원' },
  ]);
});
</script>
