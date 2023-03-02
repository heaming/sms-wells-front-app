<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeManagerListM - M조직 수수료 생성관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 생성관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="['전체', '플래너', '지점장']"
            rules="required"
            @change="onChangedRsbTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BLG')+$t('MSG_TXT_CODE')"
        >
          <kw-input
            v-model="searchParams.blgCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ searchParams.statTitle }}</h3>
      <kw-stepper
        v-model="stepInitNum"
        heading-text
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="t('MSG_TXT_METG')+ t('MSG_TXT_PRSC')+ t('MSG_TXT_AGRG')"
          :done="stepInitNum > 1"
          prefix="1"
          @click="openMetgPrscAgrgPopup"
        />
        <kw-step
          :name="2"
          :title="t('MSG_TXT_FEE')+ t('MSG_TXT_CRT')"
          :done="stepInitNum > 2"
          prefix="2"
          @click="openFeeCrtPopup"
        />
        <kw-step
          :name="3"
          :title="t('MSG_TXT_ETC')+ t('MSG_TXT_UPLOAD')"
          :done="stepInitNum > 3"
          prefix="3"
        />
        <kw-step
          :name="4"
          :title="t('MSG_TXT_TAX')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 4"
          prefix="4"
          :done-icon="'retry'"
          @click="openTaxDdtnPopup"
        />
        <kw-step
          :name="5"
          :title="t('MSG_TXT_WHTX')+t('MSG_TXT_RGS')"
          :done="stepInitNum > 5"
          prefix="5"
          :tooltip="'클릭하여 $원천세 등록$을(를) 진행하세요.'"
          :active-icon="'write'"
          @click="openWhTxRgstPopup"
        />
        <kw-step
          :name="6"
          :title="t('MSG_TXT_HIR_INSR')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 6"
          prefix="6"
          @click="openEinsrDdtnPopup"
        />
        <kw-step
          :name="7"
          :title="t('MSG_TXT_PNPYAM')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 7"
          prefix="7"
          @click="openPnpyamDdtnPopup"
        />
        <kw-step
          :name="8"
          :title="t('MSG_TXT_BU')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 8"
          prefix="8"
          @click="openBuDdtnPopup"
        />
        <kw-step
          :name="9"
          :title="t('MSG_TXT_RDS')+t('MSG_TXT_RV')"
          :done="stepInitNum > 9"
          prefix="9"
          @click="openGurDepAmtPopup"
        />
        <kw-step
          :name="10"
          :title="t('MSG_TXT_FNT')+t('MSG_TXT_MTR')+t('MSG_TXT_CRT')"
          :done="stepInitNum > 10"
          prefix="10"
          @click="openFntMtrCrtPopup"
        />
        <kw-step
          :name="11"
          :title="t('MSG_TXT_CNST_WRTE')"
          :done="stepInitNum > 11"
          prefix="11"
        />
        <kw-step
          :name="12"
          :title="t('MSG_TIT_SLIP_CRT')"
          :done="stepInitNum > 12"
          prefix="12"
        />
        <kw-step
          :name="13"
          :title="t('MSG_TIT_PIA_SELL_FEE_CNFM')"
          :done="stepInitNum > 13"
          prefix="13"
          @click="openPiaSellFeeCnfmPopup"
        />

        <kw-step-panel :name="5">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info
                :total-count="totalCount"
              />
            </template>
            <kw-btn
              dense
              secondary
              icon="download_on"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="totalCount.value === 0"
              @click="onClickExcelDownload"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              secondary=""
              :label="$t('MSG_BTN_HIS_MGT')"
              @click="openHistMngtPopup"
            />
          </kw-action-top>
          <kw-grid
            v-if="isGrid1Visile"
            ref="grdMainRef"
            name="grd1Main"
            :visible-rows="10"
            @init="initGrd1Main"
          />
          <kw-grid
            v-if="isGrid2Visile"
            ref="grdMainRef"
            name="grd2Main"
            :visible-rows="10"
            @init="initGrd2Main"
          />
          <kw-grid
            v-if="isGrid3Visile"
            ref="grdMainRef"
            name="grd3Main"
            :visible-rows="10"
            @init="initGrd3Main"
          />
        </kw-step-panel>
      </kw-stepper>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const stepInitNum = ref(5);
const { modal } = useGlobal();
const isGrid1Visile = ref(false);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(true);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbTp: '',
  no: '',
  blgCd: '',
  statTitle: t('MSG_TXT_PRGS_STE'),

});
let cachedParams;

/*
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbTp() {
  if (searchParams.value.rsbTp === '플래너') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    isGrid3Visile.value = false;
  } else if (searchParams.value.rsbTp === '지점장') {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isGrid3Visile.value = false;
  } else {
    isGrid1Visile.value = false;
    isGrid2Visile.value = false;
    isGrid3Visile.value = true;
  }
}

/*
 *  Event - 미팅참석집계 프로세스 클릭 (Z-CO-U-0034P01 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openMetgPrscAgrgPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P01',
    componentProps: param,
  });
}

/*
 *  Event - 수수료생성 프로세스 클릭 (W-CO-U-0047P02 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openFeeCrtPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'WCOU0047P02',
    componentProps: param,
  });
}

/*
 *  Event - 세금공제 프로세스 클릭 (Z-CO-U-0034P02 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openTaxDdtnPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P02',
    componentProps: param,
  });
}

/*
 *  Event - 원천세 등록 프로세스 클릭 (Z-CO-U-0034P03 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openWhTxRgstPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P03',
    componentProps: param,
  });
}

/*
 *  Event - 고용보험 공제 프로세스 클릭 (Z-CO-U-0034P04 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openEinsrDdtnPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P04',
    componentProps: param,
  });
}

/*
 *  Event - 가지급금 공제 프로세스 클릭 (Z-CO-U-0034P05 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openPnpyamDdtnPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P05',
    componentProps: param,
  });
}

/*
 *  Event - 부담공제 프로세스 클릭 (Z-CO-U-0034P06 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openBuDdtnPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P06',
    componentProps: param,
  });
}

/*
 *  Event - 보증예치금 적립 프로세스 클릭 (Z-CO-U-0034P07 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openGurDepAmtPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P07',
    componentProps: param,
  });
}

/*
 *  Event - 이체자료생성 프로세스 클릭 (Z-CO-U-0034P08 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openFntMtrCrtPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P08',
    componentProps: param,
  });
}

/*
 *  Event - 선판매 수수료 확정 프로세스 클릭 (W-CO-U-0047P04 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openPiaSellFeeCnfmPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'WCOU0047P04',
    componentProps: param,
  });
}

/*
 *  Event - 이력 관리 버튼 클릭 (Z-CO-U-0034P09 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openHistMngtPopup() {
  const param = {
    ogTp: 'M',
  };
  await modal({
    component: 'ZCOU0034P09',
    componentProps: param,
  });
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: t('MSG_TXT_MANAGER') + t('MSG_TXT_OG') + t('MSG_TXT_FEE') + t('MSG_TXT_CRT') + t('MSG_TXT_MGT') + t('MSG_TXT_IZ'),
    timePostfix: true,
  });
}

async function setTitle() {
  const { perfYm } = searchParams.value;
  const { rsbTp } = searchParams.value;
  const title = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')} ${rsbTp} ${t('MSG_TXT_PRGS_STE')}`;
  searchParams.value.statTitle = title + t('MSG_TXT_PRGS_STE');
}

async function fetchData() {
  let uri = '';

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
  view.resetCurrent();
  await setTitle();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrd1Main(data, view) {
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
    { fieldName: 'col59' },
    { fieldName: 'col60' },
    { fieldName: 'col61' },
    { fieldName: 'col62' },
    { fieldName: 'col63' },
    { fieldName: 'col64' },
    { fieldName: 'col65' },
    { fieldName: 'col66' },
    { fieldName: 'col67' },
    { fieldName: 'col68' },
    { fieldName: 'col69' },
    { fieldName: 'col70' },
    { fieldName: 'col71' },
    { fieldName: 'col72' },
    { fieldName: 'col73' },
    { fieldName: 'col74' },
    { fieldName: 'col75' },
    { fieldName: 'col76' },
    { fieldName: 'col77' },
    { fieldName: 'col78' },
    { fieldName: 'col79' },
    { fieldName: 'col80' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'col6', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'col7', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col14', header: `OJT${t('MSG_TXT_DC')}`, width: '88.7', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7' },
    { fieldName: 'col19', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7' },
    { fieldName: 'col20', header: t('MSG_TXT_PRFMT_MON'), width: '122.7' },
    { fieldName: 'col21', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '89.3' },
    { fieldName: 'col22', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col23', header: `WM${t('MSG_TXT_OPNG')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'col24', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_RENTAL'), width: '122.7' },
    { fieldName: 'col27', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col31', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '122.7', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_FXAM'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_FXAM'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col41', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col42', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'col43', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '176', styleName: 'text-right' },
    { fieldName: 'col44', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col45', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col46', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col47', header: t('MSG_TXT_HOME_CARE'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col48', header: t('MSG_TXT_LIVE_PAKG'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'col49', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col50', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col51', header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col52', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col53', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col54', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col55', header: t('MSG_TXT_EDUC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col56', header: t('MSG_TXT_STMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col57', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right' },
    { fieldName: 'col58', header: t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col59', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col60', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col61', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col62', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col63', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col64', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col65', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col66', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col67', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col68', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'col69', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'col70', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'col71', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col72', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col73', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col74', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'col75', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col76', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col77', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col78', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col79', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_DDTN') + t('MSG_TXT_AMT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col80', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
    {
      header: t('MSG_TXT_SRTUP'),
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    'col10',
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13'],
    },
    'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['col21', 'col22'],
    },
    'col23', 'col24', 'col25',
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['col26', 'col27', 'col28'],
    },
    'col29', 'col30', 'col31',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['col32', 'col33'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col34', 'col35', 'col36'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col37', 'col38'],
    },
    'col39', 'col40', 'col41', 'col42', 'col43',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col44', 'col45', 'col46'],
    },
    'col47', 'col48', 'col49', 'col50', 'col51', 'col52', 'col53', 'col54', 'col55', 'col56', 'col57', 'col58', 'col59',
    'col60', 'col61', 'col62', 'col63', 'col64', 'col65', 'col66', 'col67', 'col68', 'col69', 'col70', 'col71', 'col72',
    'col73', 'col74', 'col75', 'col76', 'col77', 'col78', 'col79', 'col80', 'col81', 'col82',
  ]);
}
function initGrd2Main(data, view) {
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
    { fieldName: 'col59' },
    { fieldName: 'col60' },
    { fieldName: 'col61' },
    { fieldName: 'col62' },
    { fieldName: 'col63' },
    { fieldName: 'col64' },
    { fieldName: 'col65' },
    { fieldName: 'col66' },
    { fieldName: 'col67' },
    { fieldName: 'col68' },
    { fieldName: 'col69' },
    { fieldName: 'col70' },
    { fieldName: 'col71' },
    { fieldName: 'col72' },
    { fieldName: 'col73' },
    { fieldName: 'col74' },
    { fieldName: 'col75' },
    { fieldName: 'col76' },
    { fieldName: 'col77' },
    { fieldName: 'col78' },
    { fieldName: 'col79' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'col6', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'col7', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_NMN'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_FNL_CLTN_MM'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_PRFMT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '122.7' },
    { fieldName: 'col19', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7' },
    { fieldName: 'col20', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7' },
    { fieldName: 'col21', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '89.3' },
    { fieldName: 'col22', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col23', header: 'WP', width: '91.4', styleName: 'text-center' },
    { fieldName: 'col24', header: 'WM', width: '122.7', styleName: 'text-center' },
    { fieldName: 'col25', header: 'SP', width: '122.7', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '122.7' },
    { fieldName: 'col27', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_INDV') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_FXAM'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_FXAM'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col41', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col42', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'col43', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '176', styleName: 'text-right' },
    { fieldName: 'col44', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col45', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col46', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col47', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col48', header: t('MSG_TXT_HOME_CARE'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'col49', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col50', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col51', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col52', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col53', header: t('MSG_TXT_EDUC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col54', header: t('MSG_TXT_STMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col55', header: t('MSG_TXT_MCHN_CH'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col56', header: t('MSG_TXT_MGT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col57', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col58', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col59', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col60', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col61', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col62', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col63', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col64', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col65', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col66', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col67', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'col68', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'col69', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'col70', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col71', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col72', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col73', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'col74', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col75', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col76', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col77', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col78', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_DDTN') + t('MSG_TXT_AMT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col79', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    'col10', 'col11', 'col12', 'col13', 'col14', 'col15', 'col16',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['col17', 'col18'],
    },
    'col19', 'col20',
    {
      header: t('MSG_TXT_ACL_ACTI_PPL'),
      direction: 'horizontal',
      items: ['col21', 'col22', 'col23', 'col24', 'col25', 'col26'],
    },
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['col27', 'col28', 'col29'],
    },
    'col30', 'col31', 'col32',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['col33', 'col34'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col35', 'col36', 'col37'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col38', 'col39'],
    },
    'col40', 'col41', 'col42', 'col43', 'col44',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col45', 'col46', 'col47'],
    },
    'col48', 'col49', 'col50', 'col51', 'col52', 'col53', 'col54', 'col55',
    'col56', 'col57', 'col58', 'col59', 'col60', 'col61', 'col62', 'col63',
    'col64', 'col65', 'col66', 'col67', 'col68', 'col69', 'col70', 'col71',
    'col72', 'col73', 'col74', 'col75', 'col76', 'col77', 'col78', 'col79',

  ]);
}
function initGrd3Main(data, view) {
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
    { fieldName: 'col59' },
    { fieldName: 'col60' },
    { fieldName: 'col61' },
    { fieldName: 'col62' },
    { fieldName: 'col63' },
    { fieldName: 'col64' },
    { fieldName: 'col65' },
    { fieldName: 'col66' },
    { fieldName: 'col67' },
    { fieldName: 'col68' },
    { fieldName: 'col69' },
    { fieldName: 'col70' },
    { fieldName: 'col71' },
    { fieldName: 'col72' },
    { fieldName: 'col73' },
    { fieldName: 'col74' },
    { fieldName: 'col75' },
    { fieldName: 'col76' },
    { fieldName: 'col77' },
    { fieldName: 'col78' },
    { fieldName: 'col79' },
    { fieldName: 'col80' },
    { fieldName: 'col81' },
    { fieldName: 'col82' },
    { fieldName: 'col83' },
    { fieldName: 'col84' },
    { fieldName: 'col85' },
    { fieldName: 'col86' },
    { fieldName: 'col87' },
    { fieldName: 'col88' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'col6', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'col7', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'col15', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7' },
    { fieldName: 'col19', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7' },
    { fieldName: 'col20', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7' },
    { fieldName: 'col21', header: t('MSG_TXT_PRFMT_MON'), width: '89.3' },
    { fieldName: 'col22', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'col24', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'col25', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7' },
    { fieldName: 'col27', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'col29', header: 'WP', width: '110.4', styleName: 'text-center' },
    { fieldName: 'col30', header: 'WM', width: '122.7', styleName: 'text-right' },
    { fieldName: 'col31', header: 'SP', width: '122.7', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col38', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col41', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col42', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'col43', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right' },
    { fieldName: 'col44', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col45', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col46', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col47', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'col48', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'col49', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col50', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col51', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col52', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col53', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col54', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col55', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col56', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'col57', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col58', header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col59', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col60', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col61', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col62', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col63', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col64', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right' },
    { fieldName: 'col65', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right' },
    { fieldName: 'col66', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col67', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col68', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col69', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'col70', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col71', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'col72', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col73', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'col74', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right' },
    { fieldName: 'col75', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right' },
    { fieldName: 'col76', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'col77', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'col78', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'col79', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col80', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col81', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col82', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'col83', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col84', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'col85', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'col86', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col87', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'col88', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
    {
      header: t('MSG_TXT_SRTUP'),
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    'col10',
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13'],
    },
    'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20', 'col21',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['col22', 'col23'],
    },
    'col24', 'col25', 'col26',
    {
      header: t('MSG_TXT_ACL_ACTI_PPL'),
      direction: 'horizontal',
      items: ['col27', 'col28', 'col29', 'col30', 'col31', 'col32'],
    },
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['col33', 'col34', 'col35'],
    },
    'col36', 'col37', 'col38',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['col39', 'col40'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col41', 'col42', 'col43'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col44', 'col45'],
    },
    'col46', 'col47', 'col48', 'col49', 'col50',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['col51', 'col52', 'col53'],
    },
    'col54', 'col55', 'col56', 'col57', 'col58', 'col59', 'col60', 'col61',
    'col62', 'col63', 'col64', 'col65', 'col66', 'col67', 'col68', 'col69',
    'col70', 'col71', 'col72', 'col73', 'col74', 'col75', 'col76', 'col77',
    'col78', 'col79', 'col80', 'col81', 'col82', 'col83', 'col84', 'col85',
    'col86', 'col87', 'col88',

  ]);
}

</script>

<style scoped>
</style>
