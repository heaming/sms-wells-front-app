<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSG
2. 프로그램 ID : WwpsgBusinessCellPhoneChMgtP - 업무폰변경 관리 팝업 (K-W-GM-U-0043P01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
업무폰변경 관리 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
    :title="t('MSG_TXT_DTL_INFO')"
  >
    <kw-form :cols="3">
      <h3 class="mt0">
        {{ t('MSG_TXT_RCP_IZ') }}
      </h3>
      <kw-form-row :cols="1">
        <kw-form-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <p>{{ t('MSG_TXT_BIZ_CPHON_CH') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 담당자 -->
        <kw-form-item
          :label="t('MSG_TXT_PIC') + ' ' + t('MSG_TXT_EMPL_NM')"
        >
          <p>{{ searchParams.prtnrKnm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_EPNO')"
        >
          <p>{{ searchParams.prtnrNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CONTACT')"
        >
          <p>{{ searchParams.cralLocaraTno +"-"+ searchParams.mexnoEncr +"-"+searchParams.cralIdvTno }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 접수자 -->
        <kw-form-item
          :label="t('MSG_TXT_RCST') + ' ' + t('MSG_TXT_EMPL_NM')"
        >
          <p>{{ searchParams.rcstPrtnrNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_EPNO')"
        >
          <p>{{ searchParams.rcstPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CONTACT')"
        >
          <p>{{ searchParams.rcstPhoneNo }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매자 -->
        <kw-form-item
          :label="t('MSG_TXT_SELLER_PERSON') + ' ' + t('MSG_TXT_EMPL_NM')"
        >
          <p>{{ searchParams.sellPrtnrNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_PRTNR_NO')"
        >
          <p>{{ searchParams.sellPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_BLG')"
        >
          <p>{{ searchParams.ogNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_RSB')"
        >
          <p>{{ searchParams.rsbDvNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_TYPE')"
        >
          <p>{{ searchParams.bizCralTelChTpNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CH_AK')+t('MSG_TXT_DTM')"
        >
          <p>{{ searchParams.chRqdt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_BFCH')"
        >
          <p>{{ searchParams.bfchNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_AFCH')"
        >
          <p>{{ searchParams.afchNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_RCP_DTM')"
        >
          <p>{{ searchParams.aplcDtm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CNTN')"
          colspan="3"
        >
          <p>{{ searchParams.bizAkCn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!--'처리중' 상태시 -->
    <kw-separator />

    <kw-form
      v-if="colParams.procsTerritory"
      ref="frmMainRef"
      :cols="1"
    >
      <h3>{{ t('MSG_TXT_PROCS_IZ') }}</h3>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_STT')"
        >
          <kw-select
            v-model="saveParams.rpotBizProcsStatCd"
            :label="$t('MSG_TXT_STT')"
            first-option="select"
            :options="codes.RPOT_BIZ_PROCS_STAT_CD.filter(v => v.codeId==='30' || v.codeId ==='40')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_CNTN')"
          colspan="2"
        >
          <kw-input
            v-model="saveParams.procsCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-form
      v-else-if="colParams.finishTerritory"
      :cols="3"
    >
      <kw-form-row>
        <kw-form-item
          :label="colParams.name"
        >
          <p>{{ searchParams.procsPrtnrKnm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_EPNO')"
        >
          <p>{{ searchParams.procsPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CONTACT')"
        >
          <p>
            {{ searchParams.procsCralLocaraTno
              +"-"+ searchParams.procsMexnoEncr
              +"-"+searchParams.procsCralIdvTno }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="colParams.dtm"
        >
          <p>{{ searchParams.fnlMdfcDtm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_TYPE')"
        >
          <p>{{ searchParams.rpotBizProcsStatNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="1">
        <kw-form-item
          :label="t('MSG_TXT_CNTN')"
          colspan="3"
        >
          <p>{{ searchParams.procsCn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        v-if="colParams.procsTerritory"
        negative
        :label="t('MSG_TXT_CANCEL')"
        @click="cancel"
      />
      <kw-btn
        v-if="colParams.procsTerritory"
        primary
        :label="t('MSG_TXT_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, getComponentType, useDataService, useMeta, useModal } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const { cancel, ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RPOT_BIZ_PROCS_STAT_CD',
);

const props = defineProps({
  rowData: {
    type: Object,
    default: () => undefined,
  },
});

// eslint-disable-next-line no-unused-vars
const frmMainRef = ref(getComponentType('KwForm'));

const searchParams = ref({
  prtnrKnm: '',
  prtnrNo: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  rsbDvNm: '',
  bizCralTelChTpNm: '',
  aplcDtm: '',
  bizAkCn: '',
  rpotBizAplcId: '',
  procsSn: '',
  rpotBizProcsStatCd: '',
  procsCn: '',
  attachDocId: '',
  procsPrtnrNo: '',
  procsPrtnrKnm: '',
  procsCralLocaraTno: '',
  procsMexnoEncr: '',
  procsCralIdvTno: '',
  fnlMdfcDtm: '',
  rpotBizProcsStatNm: '',
  rcstPrtnrNo: '',
  rcstPrtnrNm: '',
  rcstPhoneNo: '',
  chRqdt: '',
  sellPrtnrNm: '',
  sellPrtnrNo: '',
  ogCd: '',
  ogNm: '',
  bfchNo: '',
  afchNo: '',
});

const saveParams = ref({
  rpotBizAplcId: '',
  procsSn: '',
  rpotBizProcsStatCd: '',
  procsCn: '',
});

const colParams = ref({
  procsTerritory: false,
  finishTerritory: false,
  name: '',
  dtm: '',
});

async function setBusiPhoneInfo() {
  searchParams.value = props.rowData;

  searchParams.value.prtnrNo = props.rowData.aplcnsPrtnrNo;

  saveParams.value.rpotBizAplcId = props.rowData.rpotBizAplcId;
  saveParams.value.procsSn = props.rowData.procsSn;
}

async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  await dataService.put('/sms/wells/competence/rent-management/business-phone-procs', saveParams.value);
  ok();
}

async function setColName() {
  colParams.value.procsTerritory = false;
  colParams.value.finishTerritory = false;

  console.log(userInfo.baseRleCd);

  if (saveParams.value.rpotBizProcsStatCd === '30') {
    colParams.value.name = t('MSG_TXT_FSH_FNM');
    colParams.value.dtm = `${t('MSG_TXT_COMPLETE')} ${t('MSG_TXT_DTM')}`;
    colParams.value.finishTerritory = true;
  } else if (saveParams.value.rpotBizProcsStatCd === '40') {
    colParams.value.name = t('MSG_TXT_SB_FNM');
    colParams.value.dtm = `${t('MSG_TXT_SB')} ${t('MSG_TXT_DTM')}`;
    colParams.value.finishTerritory = true;
  } else if (userInfo.baseRleCd === 'W1580' || userInfo.baseRleCd === null) {
    colParams.value.procsTerritory = true;
  }
}

// eslint-disable-next-line no-unused-vars
async function getBaseInfo() {
  console.log(saveParams.value);
  const baseInfoRes = await dataService.get('/sms/wells/competence/rent-management/rent-popup', { params: saveParams.value });

  saveParams.value.rpotBizProcsStatCd = baseInfoRes.data.rpotBizProcsStatCd;
  saveParams.value.procsCn = baseInfoRes.data.procsCn;
  searchParams.value.procsCn = baseInfoRes.data.procsCn;
  searchParams.value.procsPrtnrNo = baseInfoRes.data.procsPrtnrNo;
  searchParams.value.procsPrtnrKnm = baseInfoRes.data.procsPrtnrKnm;
  searchParams.value.procsCralLocaraTno = baseInfoRes.data.procsCralLocaraTno;
  searchParams.value.procsMexnoEncr = baseInfoRes.data.procsMexnoEncr;
  searchParams.value.procsCralIdvTno = baseInfoRes.data.procsCralIdvTno;
  searchParams.value.fnlMdfcDtm = baseInfoRes.data.fnlMdfcDtm;
  searchParams.value.rpotBizProcsStatNm = baseInfoRes.data.rpotBizProcsStatNm;

  await setColName();
}

onMounted(() => {
  console.log(props.rowData);
  setBusiPhoneInfo();
  getBaseInfo();
});
</script>
