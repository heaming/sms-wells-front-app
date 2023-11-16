<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [K-W-SV-U-0165P01] WwsnbServiceProcDetailListP - 서비스처리상세내역
3. 작성자 : leeminwoo
4. 작성일 : 2023.09.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스처리상세내역 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--3xl"
    :title="$t('MSG_TIT_SVC_PROC_DTL_IZ')"
    no-action
  >
    <kw-form>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CUST_STMT')">
          <p>{{ dtlIz.rcgvpKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ dtlIz.cntrDtlNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_TEL_NO')">
          <p>{{ dtlIz.cralLocaraTno }}-{{ dtlIz.mexnoEncr }}-{{ dtlIz.cralIdvTno }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          :colspan="2"
        >
          <p>{{ dtlIz.rnadr }} {{ dtlIz.rdadr }}</p>
          <zwcm-post-code class="kw-grow" />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CST_SV_ASN_NO')">
          <p>{{ dtlIz.cstSvAsnNo }}</p>
          <kw-btn
            :label="$t('MSG_BTN_IST_CFDC')"
            class="px12 ml8"
            @click="onClickIstCfdc"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PRDT')"
          :colspan="2"
        >
          <p>{{ dtlIz.pdNm }} {{ dtlIz.wkBcNo }} {{ dtlIz.flBcNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_COMP_WK')">
          <p>{{ dtlIz.acpnPrtnrNo }} {{ dtlIz.acpnPrtnrKnm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RCP_CN')"
          :colspan="2"
        >
          <kw-input
            v-model="dtlIz.cnslCn"
            type="textarea"
            :rows="3"
            counter
            maxlength="200"
            readonly
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_BTN_CST_SIGN')">
          <div
            class="border-box col pa10 h90"
          >
            <img
              :src="signSrc"
              alt=""
              class="h60"
            >
          </div>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MEMO')"
          :colspan="3"
        >
          <kw-input
            v-model="dtlIz.cnslMoCn"
            type="textarea"
            :rows="3"
            counter
            maxlength="200"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRCSDT')">
          <p>
            {{ dayjs(dtlIz.vstFshDt).isValid() ?
              dayjs(dtlIz.vstFshDt).format("YYYY-MM-DD HH:mm:ss") : '' }}
          </p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRCS_ICHR')">
          <p>{{ dtlIz.prtnrKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PROCS_CN')">
          <p>{{ dtlIz.asCausCdNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_IZ')"
          :colspan="3"
        >
          <kw-input
            v-model="dtlIz.svProcsCn"
            type="textarea"
            :rows="3"
            counter
            maxlength="200"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_LCT')">
          <p>{{ dtlIz.asLctCdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PHN')">
          <p>{{ dtlIz.asPhnCdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CAUS')">
          <p>{{ dtlIz.tonepIstOpt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_IMPT')">
          <p>{{ dtlIz.imptaRsonCdNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_IST_LCT_DTL')">
          <p>{{ dtlIz.istLctDtlCn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator class="mb0" />
    <div class="grid-horizontal-wrap">
      <div class="grid-horizontal-wrap__section">
        <div>
          <h3>{{ $t('MSG_TXT_STLM_IZ') }}</h3>
          <kw-form
            :cols="2"
            dense
            class="mt20 mb14"
          >
            <kw-form-row>
              <kw-form-item :label="$t('MSG_TXT_TXINV_APPL')">
                <p>{{ dtlIz.aplcYn }}</p>
              </kw-form-item>
              <kw-form-item :label="$t('MSG_TXT_PBL_DT')">
                <p>
                  {{ dayjs(dtlIz.pblDt).isValid() ?
                    dayjs(dtlIz.pblDt).format("YYYY-MM-DD") : '' }}
                </p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalCountForStlmIz.totalCount"
              />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdMainRef1"
            :visible-rows="6"
            @init="initGrid1"
          />
        </div>
        <div>
          <h3>{{ $t('MSG_TXT_BIL_ITEM') }}</h3>
          <kw-action-top class="mt14">
            <template #left>
              <kw-paging-info
                :total-count="totalCountForBilItem.totalCount"
              />
              <span class="ml8">(단위:원)</span>
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdMainRef2"
            :visible-rows="6"
            @init="initGrid2"
          />
        </div>
      </div>
      <div class="grid-horizontal-wrap__section">
        <div>
          <h3>{{ $t('MSG_TXT_PU_PART') }}</h3>
          <kw-action-top class="mt14">
            <template #left>
              <kw-paging-info
                :total-count="totalCountForPuPart.totalCount"
              />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdMainRef3"
            :visible-rows="17"
            class="h758"
            @init="initGrid3"
          />
        </div>
      </div>
    </div>
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, getComponentType, useDataService, codeUtil, modal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdMainRef3 = ref(getComponentType('KwGrid'));

const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
    default: '',
  },
  cntrSn: {
    type: String,
    required: true,
    default: '',
  },
  cstSvAsnNo: {
    type: String,
    required: true,
    default: '',
  },
  // 구분(gubun) 코드 설명
  // TB_SVPD_CST_SV_WK_RS_IZ - WK_PRGS_STAT_CD(작업진행상태) 코드에 따라
  // * A/S 작업완료(코드값 : 20) 건 : AD
  // * B/S 작업완료(코드값 : 20) 건 : BD
  // * A/S 작업미완료(그 외) 건 : AY
  // * B/S 작업미완료(그 외) 건 : BY
  // A/S, B/S 구분 불가 시, BD 또는 BY로 호출 가능
  gubun: {
    type: String,
    required: true,
    default: '',
  },
});

const dtlIzParam = ref({
  cntrNo: '',
  cntrSn: '',
  cstSvAsnNo: '',
  gubun: '',
});

const totalCountForStlmIz = ref({
  totalCount: 0,
});

const totalCountForBilItem = ref({
  totalCount: 0,
});

const totalCountForPuPart = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const baseUrl = '/sms/wells/service/service-proc-detail-list';

const codes = await codeUtil.getMultiCodes(
  'STLM_DV_CD',
  'ISCMP_CD',
  'CS_BIL_ATC_CD',
);

const dtlIz = ref({}); // 상품기본
const signSrc = ref({});

// 상세내역
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...dtlIzParam.value } });
  dtlIz.value = res.data;
  if (isEmpty(dtlIz.value.cstSignCnByte)) {
    signSrc.value = '';
  } else {
    signSrc.value = `data:image/png;base64,${dtlIz.value.cstSignCnByte}`;
  }
}
// 결제내역
async function fetchData1() {
  const res = await dataService.get(`${baseUrl}/stlm-iz`, { params: { ...dtlIzParam.value } });
  const list = res.data;

  totalCountForStlmIz.value.totalCount = list.length;

  const view = grdMainRef1.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
// 청구항목
async function fetchData2() {
  const res = await dataService.get(`${baseUrl}/bil-item`, { params: { ...dtlIzParam.value } });
  const list = res.data;

  totalCountForBilItem.value.totalCount = list.length;

  const view = grdMainRef2.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
// 투입부품
async function fetchData3() {
  const res = await dataService.get(`${baseUrl}/pu-part`, { params: { ...dtlIzParam.value } });
  const list = res.data;

  totalCountForPuPart.value.totalCount = list.length;

  const view = grdMainRef3.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
// 설치확인서 팝업(WwsnbInstallationConfirmationDocumentP)
async function onClickIstCfdc() {
  await modal({
    component: 'WwsnbInstallationConfirmationDocumentP',
    componentProps: { cntrNo: dtlIzParam.value.cntrNo, cntrSn: dtlIzParam.value.cntrSn },
  });
}

async function initProps() {
  const { cntrNo, cntrSn, cstSvAsnNo, gubun } = props;
  dtlIzParam.value.cntrNo = cntrNo;
  dtlIzParam.value.cntrSn = cntrSn;
  dtlIzParam.value.cstSvAsnNo = cstSvAsnNo;
  dtlIzParam.value.gubun = gubun;
  if (!isEmpty(dtlIzParam.value.cntrNo) && !isEmpty(dtlIzParam.value.cntrSn)
  && !isEmpty(dtlIzParam.value.cstSvAsnNo) && !isEmpty(dtlIzParam.value.gubun)) {
    if (dtlIzParam.value.gubun === 'AD' || dtlIzParam.value.gubun === 'BD') {
      await Promise.all([
        await fetchData(),
        await fetchData1(),
        await fetchData2(),
        await fetchData3(),
      ]);
    } else {
      await Promise.all([
        await fetchData(),
      ]);
    }
  }
}

onMounted(async () => {
  await initProps();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// 결제내역
const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'stlmDvCd' },
    { fieldName: 'dpSumAmt', dataType: 'number' },
    { fieldName: 'iscmpCd' },
    { fieldName: 'crcdnoEncr' },
    { fieldName: 'istmMcn' },
  ];

  const columns = [
    { fieldName: 'stlmDvCd', header: t('MSG_TXT_STLM_DV'), width: '80', styleName: 'text-left', options: codes.STLM_DV_CD }, // 결제구분
    {
      fieldName: 'dpSumAmt',
      header: t('MSG_TXT_AMT_WON'),
      width: '140',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    }, // 금액(원)
    { fieldName: 'iscmpCd', header: t('MSG_TXT_CDCO'), width: '120', styleName: 'text-left', options: codes.ISCMP_CD }, // 카드사
    { fieldName: 'crcdnoEncr', header: t('MSG_TXT_CARD_NO'), width: '160', styleName: 'text-center' }, // 카드번호
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '119', styleName: 'text-right' }, // 할부개월
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('stlmDvCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center text-weight-bold' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
// 청구항목
const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'csBilAtcCd' },
    { fieldName: 'bilOjAmt', dataType: 'number' },
    { fieldName: 'bilCtrSumAmt', dataType: 'number' },
    { fieldName: 'bilRveAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'csBilAtcCd', header: t('MSG_TXT_BIL_ITEM'), width: '80', styleName: 'text-left', options: codes.CS_BIL_ATC_CD }, // 청구항목
    {
      fieldName: 'bilOjAmt',
      header: t('MSG_TXT_BIL_AMT'),
      width: '140',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    }, // 청구금액
    {
      fieldName: 'bilCtrSumAmt',
      header: t('MSG_TXT_CTR_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    }, // 조정금액
    {
      fieldName: 'bilRveAmt',
      header: t('MSG_TXT_RVE_AMT'),
      width: '160',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-blue' },
    }, // 수납금액
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('csBilAtcCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center text-weight-bold' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
// 투입부품
const initGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdNm' },
    { fieldName: 'fnlBcNo' },
    { fieldName: 'useQty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_PU_PART'), width: '380', styleName: 'text-left' }, // 투입부품
    { fieldName: 'fnlBcNo', header: t('MSG_TXT_BARCODE'), width: '160', styleName: 'text-center' }, // 바코드
    { fieldName: 'useQty', header: t('MSG_TXT_USE_QTY'), width: '80', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 사용수량
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
<style lang="scss" scoped>
.grid-horizontal-wrap {
  gap: 40px !important;
}

.kw-form--dense .kw-form-row--cols-2 .kw-form-item {
  width: calc((100% - 40px) / 2) !important;
}

.kw-form--dense .kw-form-row {
  gap: 40px !important;
}
</style>
