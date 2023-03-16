<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSalesDtlP - 매출 상세정보 - W-CL-U-0028P02
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약상세번호 별 매출상세정보를 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form
      v-if="isShow1"
      :cols="4"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_REG_FEE')"
        >
          <p>{{ saledDetailInf1.col1 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_MM_CHRAM')"
        >
          <p>{{ saledDetailInf1.col7 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_PUR_MM_INTAM')"
        >
          <p>{{ saledDetailInf1.col13 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_REQD_RQDT')"
        >
          <p>{{ saledDetailInf1.col19 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RGST_COST_DSC')"
        >
          <p>{{ saledDetailInf1.col2 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_DSC')"
        >
          <p>{{ saledDetailInf1.col8 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_PD_DC_CLASS')"
        >
          <p>{{ saledDetailInf1.col14 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CANC_DT')"
        >
          <p>{{ saledDetailInf1.col20 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RNTL_TOTAL')"
        >
          <p>{{ saledDetailInf1.col3 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_MCNT')"
        >
          <p>{{ saledDetailInf1.col9 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DISC_CODE')"
        >
          <p>{{ saledDetailInf1.col15 }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_LEASE_DV')"
        >
          <p>{{ saledDetailInf1.col4 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_MM_CHRAM')"
        >
          <p>{{ saledDetailInf1.col10 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_PRD_MCNT')"
        >
          <p>{{ saledDetailInf1.col16 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_1PLUS1_LK_CNTR')"
        >
          <p>{{ saledDetailInf1.col5 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_DSC')"
        >
          <p>{{ saledDetailInf1.col11 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_PAR_CNTR')"
        >
          <p>{{ saledDetailInf1.col17 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ALNC_LK_CNTR')"
        >
          <p>{{ saledDetailInf1.col6 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_MCNT')"
        >
          <p>{{ saledDetailInf1.col12 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SL_DT')"
        >
          <p>{{ saledDetailInf1.col18 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-form
      v-if="isShow2"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MM_SSPCS')"
        >
          <p>{{ saledDetailInf2.col1 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DISC_CODE')"
        >
          <p>{{ saledDetailInf2.col4 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_WDWAL_DT')"
        >
          <p>{{ saledDetailInf2.col7 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_TXT_MSG_SV_VST_PRD_CD')"
        >
          <p>{{ saledDetailInf2.col10 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_STPL_MCNT')"
        >
          <p>{{ saledDetailInf2.col2 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AMT')"
        >
          <p>{{ saledDetailInf2.col5 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_VST_DT')"
        >
          <p>{{ saledDetailInf2.col8 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_PRD')"
        >
          <p>{{ saledDetailInf2.col3 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_J_DT')"
        >
          <p>{{ saledDetailInf2.col6 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_VST_NMN')"
        >
          <p>{{ saledDetailInf2.col9 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-form
      v-if="isShow3"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FRISU_MSH')"
        >
          <p>{{ saledDetailInf3.col1 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SALE_PRICE')"
        >
          <p>{{ saledDetailInf3.col4 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_TK_AMT')"
        >
          <p>{{ saledDetailInf3.col7 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_MCNT')"
        >
          <p>{{ saledDetailInf3.col10 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FRISU_AS')"
        >
          <p>{{ saledDetailInf3.col2 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CNTRCT_AMT')"
        >
          <p>{{ saledDetailInf3.col5 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_AMT')"
        >
          <p>{{ saledDetailInf3.col8 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RECAP_MSH')"
        >
          <p>{{ saledDetailInf3.col3 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SBSCM')"
        >
          <p>{{ saledDetailInf3.col6 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MM_INTAM')"
        >
          <p>{{ saledDetailInf3.col9 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const props = defineProps({
  cntrDtlNo: {
    type: String,
    required: false,
    default: '',
  },
  taskDiv: {
    type: String,
    required: false,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isShow1 = ref(true);
const isShow2 = ref(true);
const isShow3 = ref(true);

const searchParams = ref({
  cntrDtlNo: props.cntrDtlNo,
  taskDiv: props.taskDiv,
});

const saledDetailInf1 = ref({});
const saledDetailInf2 = ref({});
const saledDetailInf3 = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  const { taskDiv } = searchParams.value;
  if (taskDiv === '2' || taskDiv === '3') {
    const res = await dataService.get('/sms/wells/closing/sales-detail/rental', { params: cachedParams });
    console.log(res.data);
    saledDetailInf1.value = res.data;
  } else if (taskDiv === '4') {
    const res = await dataService.get('/sms/wells/closing/sales-detail/membership', { params: cachedParams });
    saledDetailInf2.value = res.data;
  } else if (taskDiv === '1') {
    const res = await dataService.get('/sms/wells/closing/sales-detail/single-payment', { params: cachedParams });
    saledDetailInf3.value = res.data;
  }
}

onMounted(async () => {
  console.log('props.taskDiv:', props.taskDiv);
  if (props.taskDiv === '2' || props.taskDiv === '3') { // 렌탈, 금융리스
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
  } else if (props.taskDiv === '4') { // 멤버십
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
  } else if (props.taskDiv === '1') { // 일시불
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
  }
  await fetchData();
});
</script>
