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
        <wwcta-contract-settlement-agree-item
          :title="'CMS 변경 신청서'"
          default-opened
        >
          <kw-item-section class="pt20">
            <zwcm-file-attacher
              v-model="files.cmsChApf"
              attach-group-id="ATG_CTA_RCP_FILE"
              :attach-document-id="`${cntrChRcpKey}-CMS_CH_APF`"
            />
            <kw-image-preview
              v-if="previews.cmsChApf"
              class="scoped-image-preview"
              :images="previews.cmsChApf"
              :curr-idx="1"
            />
          </kw-item-section>
        </wwcta-contract-settlement-agree-item>
        <wwcta-contract-settlement-agree-item
          :title="'신분증 사본'"
          default-opened
        >
          <kw-item-section class="pt20">
            <zwcm-file-attacher
              v-model="files.idfCy"
              attach-group-id="ATG_CTA_RCP_FILE"
              :attach-document-id="`${cntrChRcpKey}-IDF_CY`"
            />
            <kw-image-preview
              v-if="previews.idfCy"
              class="scoped-image-preview"
              :images="previews.idfCy"
              :curr-idx="1"
            />
          </kw-item-section>
        </wwcta-contract-settlement-agree-item>
        <wwcta-contract-settlement-agree-item
          :title="'통장사본'"
          default-opened
        >
          <kw-item-section class="pt20">
            <zwcm-file-attacher
              v-model="files.bnkbCy"
              attach-group-id="ATG_CTA_RCP_FILE"
              :attach-document-id="`${cntrChRcpKey}-BNKB_CY`"
            />
            <kw-image-preview
              v-if="previews.bnkbCy"
              class="scoped-image-preview"
              :images="previews.bnkbCy"
              :curr-idx="1"
            />
          </kw-item-section>
        </wwcta-contract-settlement-agree-item>
        <wwcta-contract-settlement-agree-item
          :title="'가족관계증명서류'"
          default-opened
        >
          <kw-item-section class="pt20">
            <zwcm-file-attacher
              v-model="files.fmlRelCrtfd"
              attach-group-id="ATG_CTA_RCP_FILE"
              :attach-document-id="`${cntrChRcpKey}-FML_REL_CRTFD`"
            />
            <kw-image-preview
              v-if="previews.fmlRelCrtfd"
              class="scoped-image-preview"
              :images="previews.fmlRelCrtfd"
              :curr-idx="1"
            />
          </kw-item-section>
        </wwcta-contract-settlement-agree-item>
        <wwcta-contract-settlement-agree-item
          :title="'가족관계증명서류'"
          default-opened
        >
          <kw-item-section class="pt20">
            <zwcm-file-attacher
              v-model="files.bzrc"
              attach-group-id="ATG_CTA_RCP_FILE"
              :attach-document-id="`${cntrChRcpKey}-BZRC`"
            />
            <kw-image-preview
              v-if="previews.bzrc"
              class="scoped-image-preview"
              :images="previews.bzrc"
              :curr-idx="1"
            />
          </kw-item-section>
        </wwcta-contract-settlement-agree-item>
      </template>
    </kw-list>
    <template #action>
      <kw-btn
        v-if="agreed"
        filled
        primary
        label="전송"
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
import { alert } from 'kw-lib';
import Agrees
  from '~sms-wells/contract/pages/mobile/WmctaDocumentRcpFileRgstMAgrees.vue';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  cntrBasis: { type: Array, default: undefined },
  cntrChTpCd: { type: String, default: undefined },
  cntrChRcpId: { type: String, default: undefined },
  dcmtRcpSn: { type: String, default: undefined },
  encryptedParam: { type: String, default: undefined },
});

const CNTR_CH_TP_CD = 'CNTR_CH_TP_CD';
// eslint-disable-next-line no-unused-vars
const { codes, getCodeName } = await useCtCode(CNTR_CH_TP_CD);

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrBasis: props.cntrBasis,
  cntrChTpCd: props.cntrChTpCd,
});
const cntrChRcpKey = (params.cntrChRcpId && params.dcmtRcpSn)
  ? `${params.cntrChRcpId}-${params.dcmtRcpSn}`
  : 'new';

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

const files = reactive({
  cmsChApf: undefined, // CMS변경신청서
  idfCy: undefined, //  신분증사본
  bnkbCy: undefined, // 통장사본
  fmlRelCrtfd: undefined, // 가족관계증명서류
  bzrc: undefined, // 사업자등록증(법인)
});
const previews = reactive({
  cmsChApf: undefined,
  idfCy: undefined,
  bnkbCy: undefined,
  fmlRelCrtfd: undefined,
  bzrc: undefined,
});
watchEffect(() => {
  previews.cmsChApf = files.cmsChApf ? [files.cmsChApf] : undefined;
  previews.idfCy = files.idfCy ? [files.idfCy] : undefined;
  previews.bnkbCy = files.bnkbCy ? [files.bnkbCy] : undefined;
  previews.fmlRelCrtfd = files.fmlRelCrtfd ? [files.fmlRelCrtfd] : undefined;
  previews.bzrc = files.bzrc ? [files.bzrc] : undefined;
});

function onConfirmAgrees(agreedInfos) {
  agreed.value = true;
  agIzs.value = agreedInfos;
}

async function onClickTransfer() {
  ok('done!');
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
