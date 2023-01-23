<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          :colspan="2"
        >
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_RGNL_GRP')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_BRANCH')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EMP_SRCH')">
          <kw-input icon="search_24" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="7"
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
        <kw-separator
          spaced
          vertical
          inset
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
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid } from 'kw-lib';

const { t } = useI18n();

// Function & Event
// -------------------------------------------------------------------------------------------------
// const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dangOjPrtnrNo' },
    { fieldName: 'dangOcStrtmm' },
    { fieldName: 'dangOjPrtnrOgNm' },
    { fieldName: 'dangOjPrtnrNm' },
    { fieldName: 'dangOjPrtnrPstnDvNm' },
    { fieldName: 'dgr1HgrDgPrtnrNm' },
    { fieldName: 'dgr2HgrDgPrtnrNm' },
    { fieldName: 'bznsSpptPrtnrNo' },
    { fieldName: 'dgr3HgrDgPrtnrNm' },
    { fieldName: 'dangChkNm' },
    { fieldName: 'dangArbitCd' },
    { fieldName: 'dangUncvrCt' },
    { fieldName: 'dangArbitLvyPc' },
    { fieldName: 'dangArbitOgId' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDtm' },

  ];

  const columns = [
    { fieldName: 'dangOjPrtnrNo', header: t('MSG_TXT_EMP_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'dangOcStrtmm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '165', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'dangOjPrtnrOgNm', header: t('MSG_TXT_BLG'), width: '129' },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129' },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129' },
    { fieldName: 'dgr1HgrDgPrtnrNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '129' },
    { fieldName: 'dgr2HgrDgPrtnrNm', header: t('MSG_TXT_RGNL_GRP'), width: '129' },
    { fieldName: 'bznsSpptPrtnrNo', header: 'BM', width: '129' },
    { fieldName: 'dgr3HgrDgPrtnrNm', header: t('MSG_TXT_BRANCH'), width: '129' },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306' },
    { fieldName: 'dangArbitCd', header: t('MSG_TXT_ACTN_ITM'), width: '306' },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129' },
    { fieldName: 'dangArbitLvyPc', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-center' },
    { fieldName: 'dangArbitOgId', header: t('MSG_TXT_ACTN_DPT'), width: '306' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '165', datetimeFormat: 'yyyy-MM' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    // single
    {
      header: t('MSG_TXT_EMP_NO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dangOjPrtnrNo', 'dangOcStrtmm', 'dangOjPrtnrOgNm', 'dangOjPrtnrNm', 'dangOjPrtnrPstnDvNm'],
    },
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['dgr1HgrDgPrtnrNm', 'dgr2HgrDgPrtnrNm', 'bznsSpptPrtnrNo', 'dgr3HgrDgPrtnrNm'],
    },
    {
      header: t('MSG_TXT_PNLTY'),
      direction: 'horizontal',
      items: ['dangChkNm', 'dangArbitCd', 'dangUncvrCt', 'dangArbitLvyPc', 'dangArbitOgId'],
    },
    'fstRgstUsrId', 'fstRgstDtm',

  ]);

  data.setRows([{ dangOjPrtnrNo: '사번입력', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: '', dangOjPrtnrNm: '', dangOjPrtnrPstnDvNm: '', dgr1HgrDgPrtnrNm: '', dgr2HgrDgPrtnrNm: '', bznsSpptPrtnrNo: '', dgr3HgrDgPrtnrNm: '', dangChkNm: '', dangArbitCd: '1-개인정보 도용에 의한 판매계약', dangUncvrCt: '', dangArbitLvyPc: '★★★', dangArbitOgId: '71401-Wells경영지원팀', fstRgstUsrId: '', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },

  ]);
});

</script>
