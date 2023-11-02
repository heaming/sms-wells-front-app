<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSH
2. 프로그램 ID : WpshVocReceiptMngtDetailP
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.11.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- VOC 접수관리-상세정보
****************************************************************************************************
-->
<template>
  <kw-popup
    class="kw-popup--2xl"
    :title="t('MSG_TIT_DTL_INFO')"
  >
    <kw-action-top class="mb20">
      <template #left>
        <h3>작성내역</h3>
      </template>
      <kw-btn
        v-permission:update
        :label="t('MSG_TXT_EVL_SAVE')"
        primary
        dense
        @click="onClickEvalSave"
      />
    </kw-action-top>

    <kw-form>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_TTL')"
        >
          <p>{{ props.vocRcpTitNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_DIV')"
        >
          <p>{{ receiptParams.vocBizTpCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="props.vocBizTpCd === '10'"
        :cols="2"
      >
        <kw-form-item
          :label="t('MSG_TXT_CST_CD')"
        >
          <p>{{ cntrParams.cntrCstNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CNTRT')"
        >
          <p>{{ cntrParams.cstKnm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="props.vocBizTpCd === '10'"
        :cols="2"
      >
        <kw-form-item
          :label="t('MSG_TXT_GOODS_NM')"
        >
          <p>{{ cntrParams.pdNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_CNTR_DATE')"
        >
          <p>{{ stringUtil.getDateFormat(cntrParams.cntrDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="props.vocBizTpCd === '10'"
        :cols="2"
      >
        <kw-form-item
          :label="t('MSG_TXT_IST_DT')"
        >
          <p>{{ stringUtil.getDateFormat(cntrParams.istDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_SELL_RGRP')"
        >
          <p>{{ cntrParams.sellPrtnrBlgCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="props.vocBizTpCd === '10'"
        :cols="2"
      >
        <kw-form-item
          :label="t('MSG_TXT_SELLER_NO')"
        >
          <p>{{ cntrParams.sellPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_SELL_NM')"
        >
          <p>{{ cntrParams.sellPrtnrNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_DOC_CRTR_BLG')"
        >
          <p>{{ props.deptId }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_WRP_RSB')"
        >
          <p>{{ props.rsbEnNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_WRP_NO')"
        >
          <p>{{ props.epno }}</p>
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_WRP_NM')"
        >
          <p>{{ props.usrNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CNTN)')"
          colspan="3"
        >
          <p
            style="white-space: pre-line;"
            v-text="props.bizAkCn"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_ATTH_FILE')"
          colspan="3"
        >
          <zwcm-file-attacher
            attach-group-id="ATG_PSH_VOC_RCP"
            :attach-document-id="props.vocRcpId"
            readonly
            multiple
            downloadable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="insertParams.vocProcsStatCd === '30'"
      >
        <kw-form-item
          :label="t('MSG_TXT_STFD_EVL')"
        >
          <template
            v-for="index in Number(evalParams.stfdEvlVal)"
            :key="index"
          >
            <kw-btn
              icon="bookmark_on"
              borderless
              style="font-size: 20px;"
              class="mr6 ml6"
              @click="onClickStfdEvlVal(index)"
            />
          </template>
          <template
            v-for="index in 5 - Number(evalParams.stfdEvlVal)"
            :key="index"
          >
            <kw-btn
              icon="bookmark_off"
              borderless
              style="font-size: 20px;"
              class="mr6 ml6"
              @click="onClickStfdEvlVal(index + Number(evalParams.stfdEvlVal))"
            />
          </template>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form>
      <kw-action-top class="mb20">
        <template #left>
          <h3>접수 및 처리내역</h3>
        </template>
        <kw-btn
          :label="t('MSG_TXT_SAVE')"
          primary
          dense
          @click="onClickRcpAdd"
        />
        <kw-separator
          v-if="insertParams.vocProcsStatCd === '20'"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="insertParams.vocProcsStatCd === '20'"
          :label="t('MSG_TXT_PROCS_FSH')"
          primary
          dense
          @click="onClickProcsFsh"
        />
      </kw-action-top>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_CATG')"
        >
          <kw-select
            v-model="receiptParams.vocRcpCtgCd"
            :options="vocRcpCtgCd"
            first-option="select"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_RCP_TP')"
        >
          <kw-select
            v-model="receiptParams.vocRcpDvCd"
            :options="commonCodes.VOC_RCP_DV_CD"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_RCST')"
        >
          <p>{{ userInfo.userName }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_RCP_MO')"
          colspan="2"
        >
          <kw-input
            v-model="receiptParams.rcpMoCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!--답변 없는 경우-->
    <kw-separator
      v-if="insertParams.vocRlyId === '' || insertParams.vocRlyId === undefined || insertParams.vocRlyId === null"
    />
    <kw-form
      v-if="insertParams.vocRlyId === '' || insertParams.vocRlyId === undefined || insertParams.vocRlyId === null"
    >
      <kw-action-top class="mb20">
        <template #left>
          <h3>답변</h3>
        </template>
        <kw-btn
          :label="t('MSG_BTN_RGST')"
          primary
          dense
          @click="onClickRlyAdd"
        />
      </kw-action-top>
      <kw-form-row :cols="2">
        <p>
          답변이 존재하지 않습니다.
        </p>
      </kw-form-row>
      <kw-separator />
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_ANS_CNTN')"
          colspan="2"
        >
          <kw-input
            v-model="insertParams.rlyCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-item
        :label="t('MSG_TXT_ATTH_FILE')"
        colspan="3"
      >
        <zwcm-file-attacher
          v-model="attachFilesRly"
          attach-group-id="ATG_PSH_VOC_RLY"
          multiple
          downloadable
        />
      </kw-form-item>
    </kw-form>

    <!--답변 있는 경우-->
    <kw-separator
      v-if="insertParams.vocRlyId !== '' && insertParams.vocRlyId !== undefined && insertParams.vocRlyId !== null"
    />
    <kw-form
      v-if="insertParams.vocRlyId !== '' && insertParams.vocRlyId !== undefined && insertParams.vocRlyId !== null"
    >
      <kw-action-top class="mb20">
        <template #left>
          <h3>답변</h3>
        </template>
        <kw-btn
          :label="t('MSG_BTN_RGST')"
          primary
          dense
          @click="onClickRlyAdd"
        />
      </kw-action-top>
      <kw-form-row :cols="2">
        <div>
          <kw-avatar
            size="26px"
            font-size="16px"
            icon="user_24"
          />
          <span>{{ insertParams.rlyPrtnrNm }}</span>
        </div>
        <p class="kw-fc--black3">
          <kw-avatar
            size="28px"
            font-size="18px"
            icon="break"
          />
          {{ stringUtil.getDatetimeFormat(insertParams.fnlMdfcDtm, 'YYYY-MM-DD hh:mm:ss') }}
        </p>
      </kw-form-row>
      <kw-form-row :cols="2">
        <div
          style="white-space: pre-line;"
          v-text="insertParams.beforeRlyCn"
        />
      </kw-form-row>
      <kw-separator />
      <kw-form-row :cols="2">
        <kw-form-item
          :label="t('MSG_TXT_ANS_CNTN')"
          colspan="2"
        >
          <kw-input
            v-model="insertParams.rlyCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-item
        :label="t('MSG_TXT_ATTH_FILE')"
        colspan="3"
      >
        <zwcm-file-attacher
          v-model="attachFilesRly"
          :attach-document-id="insertParams.vocRlyId"
          attach-group-id="ATG_PSH_VOC_RLY"
          multiple
          downloadable
        />
      </kw-form-item>
    </kw-form>
    <template
      #action
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, stringUtil, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

const { t } = useI18n();
const { getUserInfo } = useMeta();
const dataService = useDataService();
const now = dayjs();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const attachFilesRly = ref([]);
const vocRcpCtgCd = ref();
const commonCodes = await codeUtil.getMultiCodes(
  'VOC_RCP_CTG_CD',
  'VOC_RCP_DV_CD',
  'VOC_BIZ_TP_CD',
);
vocRcpCtgCd.value = commonCodes.VOC_RCP_CTG_CD.filter((v) => ['250', '260', '270', '280', '290', '300'].includes(v.codeId));
const props = defineProps({
  vocRcpId: { type: String, default: '' },
  vocRcpTitNm: { type: String, default: '' },
  vocBizTpCd: { type: String, default: '' },
  deptId: { type: String, default: '' },
  rsbEnNm: { type: String, default: '' },
  epno: { type: String, default: '' },
  usrNm: { type: String, default: '' },
  bizAkCn: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  cstNo: { type: String, default: '' },
});

const receiptParams = ref({
  vocRcpId: props.vocRcpId,
  vocRcpCtgCd: '',
  vocRcpDvCd: '10',
  vocBizTpCd: props.vocBizTpCd,
  rcpDtm: now.format('YYYYMMDDHHmmss'),
  rcpMoCn: '',
  rcstPrtnrNo: userInfo.employeeIDNumber,
});

const insertParams = ref({
  vocRcpId: props.vocRcpId,
  vocRlyId: '',
  beforeRlyCn: '',
  rlyCn: '',
  fnlMdfcDtm: '',
  rlyPrtnrNm: '',
  vocProcsStatCd: '',
  attachFilesRly: [],
});

const procsParams = ref({
  vocRcpId: props.vocRcpId,
  pcpPrtnrNo: userInfo.employeeIDNumber,
  procsDtm: now.format('YYYYMMDDHHmmss'),
});

const cntrParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  cntrCstNo: props.cstNo,
  cstKnm: '',
  sellTpCd: '',
  istDt: '',
  cntrDt: '',
  pdNm: '',
  sellPrtnrBlgCd: '',
  sellPrtnrNo: '',
  sellPrtnrNm: '',
});

const evalParams = ref({
  vocRcpId: props.vocRcpId,
  stfdEvlVal: '',
});
async function fetchDetailData() {
  cachedParams = cloneDeep(insertParams.value);
  const res = await dataService.get('/sms/wells/competence/voc/dtl', { params: cachedParams });
  if (res !== null) {
    receiptParams.value.vocRcpCtgCd = res.data.vocRcpCtgCd;
    receiptParams.value.vocRcpDvCd = res.data.vocRcpDvCd;
    receiptParams.value.rcpMoCn = res.data.rcpMoCn;
    insertParams.value.beforeRlyCn = res.data.rlyCn;
    insertParams.value.fnlMdfcDtm = res.data.fnlMdfcDtm;
    insertParams.value.vocRlyId = res.data.vocRlyId;
    insertParams.value.rlyPrtnrNm = res.data.rlyPrtnrNm;
    insertParams.value.vocProcsStatCd = res.data.vocProcsStatCd;
    evalParams.value.stfdEvlVal = res.data.stfdEvlVal;
  }
  console.log(props.vocBizTpCd);
  if (props.vocBizTpCd === '10') {
    let resCntr = '';
    cachedParams = cloneDeep(cntrParams.value);
    resCntr = await dataService.get('/sms/wells/contract/contracts/order-details/customer-bases', { params: cachedParams });

    console.log(resCntr);
    cntrParams.value.cntrCstNo = resCntr.data[0].cntrCstNo;
    cntrParams.value.sellTpCd = resCntr.data[0].sellTpCd;
    cntrParams.value.cstKnm = resCntr.data[0].cstKnm;
    cachedParams = cloneDeep(cntrParams.value);
    resCntr = await dataService.get('/sms/wells/contract/contracts/order-details/management-information', { params: cachedParams });
    console.log(resCntr);

    cntrParams.value.istDt = resCntr.data[0].istDt;
    cntrParams.value.cntrDt = resCntr.data[0].cntrDt;
    cntrParams.value.pdNm = resCntr.data[0].pdNm;
    cntrParams.value.sellPrtnrBlgCd = resCntr.data[0].sellPrtnrBlgCd;
    cntrParams.value.sellPrtnrNo = resCntr.data[0].sellPrtnrNo;
    cntrParams.value.sellPrtnrNm = resCntr.data[0].sellPrtnrNm;
  }

  if (receiptParams.value.vocBizTpCd === '10') {
    receiptParams.value.vocBizTpCd = '고객 클레임/구제요청';
  } else if (receiptParams.value.vocBizTpCd === '20') {
    receiptParams.value.vocBizTpCd = '프로세스 개선';
  } else if (receiptParams.value.vocBizTpCd === '30') {
    receiptParams.value.vocBizTpCd = '비밀글';
  }
}
async function onClickRcpAdd() {
  console.log(receiptParams.value);
  cachedParams = cloneDeep(receiptParams.value);
  await dataService.post('/sms/wells/competence/voc/rcp', cachedParams);
  await fetchDetailData();
}
async function onClickRlyAdd() {
  insertParams.value.attachFilesRly = attachFilesRly.value;
  console.log(insertParams.value);
  cachedParams = cloneDeep(insertParams.value);
  await dataService.post('/sms/wells/competence/voc/rly', cachedParams);
  await fetchDetailData();
}
async function onClickProcsFsh() {
  console.log(procsParams.value);
  cachedParams = cloneDeep(procsParams.value);
  await dataService.post('/sms/wells/competence/voc/procs', cachedParams);
  await fetchDetailData();
}
async function onClickStfdEvlVal(val) {
  evalParams.value.stfdEvlVal = val;
}
async function onClickEvalSave() {
  cachedParams = cloneDeep(evalParams.value);
  await dataService.post('/sms/wells/competence/voc/evl', cachedParams);
  await fetchDetailData();
}
onMounted(async () => {
  console.log(receiptParams.value);
  console.log(insertParams.value);
  await fetchDetailData();
});

</script>
