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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                v-model="mbgChFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '1')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '2')?.apnFileId"
                v-model="mbgChFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '2')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '2')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '3')?.apnFileId"
                v-model="mbgChFiles.file3"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '3')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '3')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '4')?.apnFileId"
                v-model="mbgChFiles.file4"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '4')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '4')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '5')?.apnFileId"
                v-model="mbgChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '5')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '5')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
                v-model="mbgChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ENTRP_RGCT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            v-for="(etcFile, idx) in etcFiles"
            :key="idx"
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-if="etcFile.existedFile"
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="etcFile.existedFile"
                :attach-document-id="etcFile.attachDocumentId"
              />
              <zwcm-file-attacher
                v-else
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC_${idx}`"
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                v-model="nmChApplFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '1')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
                v-model="nmChApplFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-IDF_CY`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            v-for="(etcFile, idx) in etcFiles"
            :key="idx"
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-if="etcFile.existedFile"
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="etcFile.existedFile"
                :attach-document-id="etcFile.attachDocumentId"
              />
              <zwcm-file-attacher
                v-else
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC_${idx}`"
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                v-model="autoFntChFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '1')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '2')?.apnFileId"
                v-model="autoFntChFiles.file2"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '2')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '2')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '3')?.apnFileId"
                v-model="autoFntChFiles.file3"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams.find((x) => x.dcmtRcpSn === '3')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '3')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '4')?.apnFileId"
                v-model="autoFntChFiles.file4"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '4')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '4')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '5')?.apnFileId"
                v-model="autoFntChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '5')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '5')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
                v-model="autoFntChFiles.file5"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ENTRP_RGCT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            v-for="(etcFile, idx) in etcFiles"
            :key="idx"
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-if="etcFile.existedFile"
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="etcFile.existedFile"
                :attach-document-id="etcFile.attachDocumentId"
              />
              <zwcm-file-attacher
                v-else
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC_${idx}`"
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
                v-if="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                v-model="rsgWdwlAplcFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams?.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                :attach-document-id="updateParams?.find((x) => x.dcmtRcpSn === '1')?.dcevdnDocId"
              />
              <zwcm-file-attacher
                v-else
                v-model="rsgWdwlAplcFiles.file1"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="updateParams.find((x) => x.dcmtRcpSn === '1')?.apnFileId"
                :attach-document-id="`${cntrChRcpKey}-EVID_DCMT`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
          <wwcta-contract-settlement-agree-item
            v-for="(etcFile, idx) in etcFiles"
            :key="idx"
            title="기타"
            default-opened
          >
            <kw-item-section class="pt20">
              <zwcm-file-attacher
                v-if="etcFile.existedFile"
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                file-uid-mode
                :file-uid="etcFile.existedFile"
                :attach-document-id="etcFile.attachDocumentId"
              />
              <zwcm-file-attacher
                v-else
                v-model="etcFile.file"
                :attach-group-id="ATTACH_GROUP_ID.RCP_FILE"
                :attach-document-id="`${cntrChRcpKey}-ETC`"
              />
            </kw-item-section>
          </wwcta-contract-settlement-agree-item>
        </template>
        <div class="pa20">
          <kw-btn
            class="full-width"
            label="기타파일 추가"
            @click="onClickAddEtcFile"
          />
        </div>
      </template>
    </kw-list>
    <template #action>
      <kw-btn
        v-if="agreed"
        filled
        primary
        label="제출"
        @click="onClickSave"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { postMessage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import Agrees
  from '~sms-wells/contract/pages/mobile/WmctaDocumentRcpFileRgstMAgrees.vue';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { useCtCode } from '~sms-common/contract/composable';
import { ATTACH_GROUP_ID } from '~sms-wells/contract/constants/ctConst';

const router = useRouter();

const params = router?.options?.history?.state?.stateParam ?? {};

const dataService = useDataService();

const CNTR_CH_TP_CD = 'CNTR_CH_TP_CD';
// eslint-disable-next-line no-unused-vars
const { codes, getCodeName } = await useCtCode(CNTR_CH_TP_CD);

const updateMode = ref(false);
const updateParams = ref(null);

const etcFiles = ref([]);

const cntrChRcpKey = computed(() => {
  if (params.cntrChRcpId && params.cntrChRcpId !== 'undefined' && params.cntrChRcpId !== 'null'
  && params.dcmtRcpSn && params.dcmtRcpSn !== 'undefined' && params.dcmtRcpSn !== 'null') return `${params.cntrChRcpId}-${params.dcmtRcpSn}`;

  return 'new';
});

function ok(payload) {
  postMessage(payload);
  router.replace('/wmcta-document-rcp-file-rgst-complete');
  // window.close();
}

function close(payload) {
  postMessage(payload, false);
  window.open('about:blank', '_self');
  // window.close();
}

async function validateparams() {
  if (!params.cntrBasis?.length) {
    await alert('계약번호는 필수입니다.');
    close('Some params is wrong!');
    return;
  }
  let contractAlert;
  params.cntrBasis.forEach(({ cntrNo, cntrSn }) => {
    if (!cntrNo) {
      contractAlert = '계약번호가 없는 계약정보가 있습니다.';
    }
    if (!cntrSn) {
      contractAlert = '계약일련번호가 없는 계약정보가 있습니다.';
    }
  });
  if (contractAlert) {
    await alert(contractAlert);
    close('Some params is wrong!');
    return;
  }
  if (!params.cntrChTpCd) {
    await alert('계약변경유형은 필수입니다.');
    close('Some params is wrong!');
  }
}

await validateparams();

async function checkReRegistration() {
  const res = await dataService.get('/sms/wells/contract/contracts/document-receipts', { params: { cntrNo: params.cntrBasis[0].cntrNo, cntrSn: params.cntrBasis[0].cntrSn, cntrChTpCd: params.cntrChTpCd } });
  if (res.data?.length > 0) {
    await alert('이미 접수된 서류가 있습니다. 해당 서류를 불러옵니다.');
    updateMode.value = true;
    updateParams.value = res.data.map((x) => ({ ...x, existedFile: x.apnFileId }));
    let etcFileSn;
    if (params.cntrChTpCd === '103' || params.cntrChTpCd === '301') etcFileSn = 6;
    else etcFileSn = 2;

    updateParams.value.filter((x) => x.dcmtRcpSn >= etcFileSn).forEach((x) => {
      etcFiles.value.push({
        file: x.apnFileId,
        existedFile: x.apnFileId,
        attachDocumentId: x.dcevdnDocId,
        dcmtRcpSn: x.dcmtRcpSn,
      });
    });
  }
}

await checkReRegistration();

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
});

// 개명 신청 파일들 (cntrChTpCd = 104)
const nmChApplFiles = ref({
  file1: undefined, // 신분증 사본
});

// 자동이체 변경 파일들 (cntrChTpCd = 301)
const autoFntChFiles = ref({
  file1: undefined, // CMS 변경신청서
  file2: undefined, // 신분증 사본
  file3: undefined, // 통장 사본
  file4: undefined, // 가족관계 증명서류
  file5: undefined, // 사업자등록증 (법인)
});

// 해지 및 철회신청 파일들 (cntrChTpCd = 401)
const rsgWdwlAplcFiles = ref({
  file1: undefined, // 증빙서류
});

function onConfirmAgrees(agreedInfos) {
  agreed.value = true;
  agIzs.value = agreedInfos;
}

function getFileListByCntrTpCd() {
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

  return fileList;
}

function addEtcFileList(fileList) {
  etcFiles.value.forEach((x) => {
    if (!isEmpty(x.file) || !isEmpty(x.existedFile)) {
      fileList.push({ ...x });
    }
  });
}

async function onClickTransfer() {
  const fileList = getFileListByCntrTpCd();
  addEtcFileList(fileList);
  const param = {
    cntrChTpCd: params.cntrChTpCd, // 계약변경유형
    cstNo: params.cntrCstNo, // 고객번호
    cntrChPrgsMoCn: params.cntrChPrgsMoCn, // 계약변경진행 메모내용
    cntrList: params.cntrBasis, // 계약목록
    fileList: fileList.map((x) => {
      const file = x?.dcmtRcpSn ? x.file : x;
      return { ...file };
    }),
    chRcpUsrId: params.chRcpUsrId, // 변경접수 사용자 ID
  };

  const res = await dataService.post('/sms/wells/contract/contracts/document-receipts', param);

  if (res?.data?.scsYn) {
    ok('done!');
  }
}

async function onClickUpdate() {
  const fileList = getFileListByCntrTpCd();
  addEtcFileList(fileList);
  const param = [];

  fileList.forEach((file, i) => {
    const dcmtRcpSn = file?.dcmtRcpSn ?? i + 1;
    param.push({
      dcmtRcpSn,
      existedFile: updateParams.value.find((x) => Number(x.dcmtRcpSn) === Number(dcmtRcpSn))?.apnFileId,
      attachDocumentId: updateParams.value[0]?.dcevdnDocId,
      attachFile: fileList[i]?.dcmtRcpSn ? fileList[i]?.file : fileList[i],
    });
  });

  const res = await dataService.put(`/sms/wells/contract/contracts/document-receipts/${updateParams.value[0].cntrChRcpId}`, param);
  if (res?.data?.scsYn) {
    ok('done!');
  }
}

async function onClickSave() {
  if (updateMode.value) onClickUpdate();
  else onClickTransfer();
}

async function onClickAddEtcFile() {
  let etcFileSn;
  if (params.cntrChTpCd === '103' || params.cntrChTpCd === '301') etcFileSn = 6;
  else etcFileSn = 2;
  let currIdx;
  for (let i = etcFileSn; i <= 10; i += 1) {
    const isExist = etcFiles.value.find((x) => Number(x.dcmtRcpSn) === i);
    if (!isExist) {
      currIdx = i;
      break;
    }
  }

  if (!currIdx) {
    await alert('10개 이상 첨부할 수 없습니다.');
    return;
  }
  etcFiles.value.push({ file: '', attachDocumentId: 'new', existedFile: null, dcmtRcpSn: currIdx });
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
