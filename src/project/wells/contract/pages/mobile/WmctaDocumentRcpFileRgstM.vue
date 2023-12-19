<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : PGE_CTA_00287 - 서류 접수 파일 등록
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-12-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 에듀 참고
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-list class="scoped-divider-list">
      <agrees
        :agrees="agIzs"
        :is-already-agreed="agreed"
        @confirm="onConfirmAgrees"
      />
      <wwcta-contract-settlement-agree-item
        :title="'처리업무 정보'"
        default-opened
      >
        <kw-item-section class="pt20">
          <kw-item>
            <kw-item-section side>
              <kw-item-label class="text-black3 hp-w80 not-flexible">
                {{ '처리업무' }}
              </kw-item-label>
            </kw-item-section>
            <kw-item-section>
              <kw-item-label class="text-black1">
                {{ getCodeName(CNTR_CH_TP_CD, params.cntrChTpCd) }}
              </kw-item-label>
            </kw-item-section>
          </kw-item>
          <kw-item>
            <kw-item-section
              side
              top
            >
              <kw-item-label class="text-black3 hp-w80 not-flexible">
                {{ '계약번호' }}
              </kw-item-label>
            </kw-item-section>
            <kw-item-section>
              <kw-item-label
                v-for="(cntrBas, idx) in params.cntrBasis"
                :key="`${idx}:${cntrBas.cntrNo}-${cntrBas.cntrSn}`"
                class="text-black1 grow"
              >
                {{ `${cntrBas.cntrNo}-${cntrBas.cntrSn}` }}
              </kw-item-label>
            </kw-item-section>
          </kw-item>
        </kw-item-section>
      </wwcta-contract-settlement-agree-item>
      <template v-if="agreed">
        <!-- 명의변경 -->
        <template v-if="params.cntrChTpCd === '103'">
          <wwcta-contract-settlement-agree-item
            title="명의변경 신청서"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-MBG_CH_APF`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="동의서"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-WCON`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="신분증 사본"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file3"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-IDF_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="통장 사본"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file4"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-BNKB_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="사업자등록증 (법인)"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ENTRP_RGCT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="mbgChFiles.file6"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
        </template>
        <!-- 개명신청 -->
        <template v-if="params.cntrChTpCd === '104'">
          <wwcta-contract-settlement-agree-item
            title="신분증 사본"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="nmChApplFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-IDF_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="nmChApplFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
        </template>
        <!-- 자동이체 변경 -->
        <template v-if="params.cntrChTpCd === '301'">
          <wwcta-contract-settlement-agree-item
            :title="'CMS 변경 신청서'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-CMS_CH_APF`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'신분증 사본'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-IDF_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'통장사본'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file3"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-BNKB_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'가족관계증명서류'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file4"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-FML_REL_CRTFD`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'사업자등록증(법인)'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ENTRP_RGCT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'기타'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="autoFntChFiles.file6"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
        </template>
        <!-- 해지/철회신청 -->
        <template v-if="params.cntrChTpCd === '401'">
          <wwcta-contract-settlement-agree-item
            :title="'증빙서류'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="rsgWdwlAplcFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-EVID_DCMT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            :title="'기타'"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-model="rsgWdwlAplcFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
        </template>
      </template>
    </kw-list>
    <template #action>
      <kw-btn
        v-if="agreed"
        filled
        primary
        label="제출"
        @click="onClickTransfer"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { decryptEncryptedParam, postMessage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';
import Agrees
  from '~sms-wells/contract/pages/mobile/WmctaDocumentRcpFileRgstMAgrees.vue';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { useCtCode } from '~sms-common/contract/composable';
import { ATTACH_GROUP_ID } from '~sms-wells/contract/constants/ctConst';

const props = defineProps({
  cntrBasis: { type: Array, default: undefined },
  cntrChTpCd: { type: String, default: undefined }, // 계약변경유형코드, 103 : 명의변경, 104 : 개명신청, 301 : 자동이체변경, 401 : 계약해약신청
  cntrCstNo: { type: String, default: undefined },
  cntrChRcpId: { type: String, default: undefined },
  dcmtRcpSn: { type: String, default: undefined },
  reRgstYn: { type: String, default: 'N' },
  cntrChPrgsMoCn: { type: String, default: undefined },
  encryptedParam: { type: String, default: undefined },
  chRcpUsrId: { type: String, default: '' }, // 변경접수 사용자 ID
});

const dataService = useDataService();

const CNTR_CH_TP_CD = 'CNTR_CH_TP_CD';
// eslint-disable-next-line no-unused-vars
const { codes, getCodeName } = await useCtCode(CNTR_CH_TP_CD);

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrBasis: props.cntrBasis === 'undefined' || props.cntrBasis === 'null' ? null : props.cntrBasis,
  cntrChTpCd: props.cntrChTpCd === 'undefined' || props.cntrChTpCd === 'null' ? null : props.cntrChTpCd,
  cntrChRcpId: props.cntrChRcpId === 'undefined' || props.cntrChRcpId === 'null' ? null : props.cntrChRcpId,
  dcmtRcpSn: props.dcmtRcpSn === 'undefined' || props.dcmtRcpSn === 'null' ? null : props.dcmtRcpSn,
  cntrChPrgsMoCn: props.cntrChPrgsMoCn === 'undefined' || props.cntrChPrgsMoCn === 'null' ? null : props.cntrChPrgsMoCn,
  cntrCstNo: props.cntrCstNo === 'undefined' || props.cntrCstNo === 'null' ? null : props.cntrCstNo,
  reRgstYn: props.reRgstYn === 'undefined' || props.reRgstYn === 'null' ? 'N' : props.cntrCstNo,
  chRcpUsrId: props.chRcpUsrId === 'undefined' || props.chRcpUsrId === 'null' ? 'N' : props.chRcpUsrId,
});

const cntrChRcpKey = computed(() => {
  if (params.cntrChRcpId && params.cntrChRcpId !== 'undefined' && params.cntrChRcpId !== 'null'
  && params.dcmtRcpSn && params.dcmtRcpSn !== 'undefined' && params.dcmtRcpSn !== 'null') return `${params.cntrChRcpId}-${params.dcmtRcpSn}`;

  return 'new';
});

function ok(payload) {
  postMessage(payload);
  window.close();
}

function close(payload) {
  postMessage(payload, false);
  window.close();
}

async function validateProps() {
  if (!params.cntrBasis?.length) {
    await alert('계약번호는 필수입니다.');
    close('Some props is wrong!');
    return;
  }
  let contractAlert;
  params.cntrBasis.forEach(({ cntrNo, cntrSn }) => {
    if (!cntrNo) {
      contractAlert = alert('계약번호가 없는 계약정보가 있습니다.');
    }
    if (!cntrSn) {
      contractAlert = alert('계약일련번호가 없는 계약정보가 있습니다.');
    }
  });
  if (contractAlert) {
    await contractAlert;
    close('Some props is wrong!');
    return;
  }
  if (!params.cntrChTpCd) {
    await alert('계약변경유형은 필수입니다.');
    close('Some props is wrong!');
  }
}

await validateProps();

const agreed = ref(false);
const agIzs = ref([
  {
    mndtYn: 'Y',
    agAtcDvCd: '111',
  },
]);

// 명의 변경 파일들 (cntrChTpCd = 103)
const mbgChFiles = ref({
  file1: undefined, // 명의변경 신청서
  file2: undefined, // 동의서
  file3: undefined, // 신분증 사본
  file4: undefined, // 통장 사본
  file5: undefined, // 사업자등록증 (법인)
  file6: undefined, // 기타
});

// 개명 신청 파일들 (cntrChTpCd = 104)
const nmChApplFiles = ref({
  file1: undefined, // 신분증 사본
  file2: undefined, // 기타
});

// 자동이체 변경 파일들 (cntrChTpCd = 301)
const autoFntChFiles = ref({
  file1: undefined, // CMS 변경신청서
  file2: undefined, // 신분증 사본
  file3: undefined, // 통장 사본
  file4: undefined, // 가족관계 증명서류
  file5: undefined, // 사업자등록증 (법인)
  file6: undefined, // 기타
});

// 해지 및 철회신청 파일들 (cntrChTpCd = 401)
const rsgWdwlAplcFiles = ref({
  file1: undefined, // 증빙서류
  file2: undefined, // 기타
});

function onConfirmAgrees(agreedInfos) {
  agreed.value = true;
  agIzs.value = agreedInfos;
}

async function onClickTransfer() {
  let fileList;
  switch (params.cntrChTpCd) {
    case '103':
      fileList = Object.values(mbgChFiles.value);
      break;
    case '104':
      fileList = Object.values(nmChApplFiles.value);
      break;
    case '301':
      fileList = Object.values(autoFntChFiles.value);
      break;
    case '401':
      fileList = Object.values(rsgWdwlAplcFiles.value);
      break;
  }
  const param = {
    CNTR_CH_TP_CD: params.cntrChTpCd, // 계약변경유형
    CST_NO: params.cntrCstNo, // 고객번호
    CNTR_CH_PRGS_MO_CN: params.cntrChPrgsMoCn, // 계약변경진행 메모내용
    CNTR_LIST: params.cntrBasis.map((x) => ({ CNTR_NO: x.cntrNo, CNTR_SN: x.cntrSn })), // 계약목록
    FILE_LIST: fileList.map((x) => ({
      APN_FILE_ID: x?.attachDocumentId,
      REAL_FPATH: x?.realityFilePath,
      FILE_NM: x?.fileName,
      FILE_EXTS_NM: x?.fileExtensionName,
    })),
    CH_RCP_USR_ID: params.chRcpUsrId, // 변경접수 사용자 ID
  };

  const res = await dataService.post('/sms/wells/contract/contracts/document-receipts', param);

  if (res?.data?.scsYn) {
    ok('done!');
  }
}
</script>

<style lang="scss" scoped>
@import "~@css/variables";
@import "kw-lib/src/css/mixins";

:deep(.scoped-divider-list) {
  > .kw-item-type + .kw-item-type {
    border-top: 8px solid $bg-body;
  }
}

:deep(.scoped-image-preview) {
  &.gallery_area {
    .prev-arrow {
      display: none;
    }

    .next-arrow {
      display: none;
    }
  }
}
</style>
