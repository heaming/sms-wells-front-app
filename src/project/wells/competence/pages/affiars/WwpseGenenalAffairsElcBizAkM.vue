<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSE
2. 프로그램 ID : WwpseGenenalAffairsElcBizAkM - 총무전자업무요청 (K-W-GM-U-0024M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
총무전자업무요청 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="result-area relative-position">
      <kw-list
        separator
        item-padding="10px 0px 0px"
      >
        <div
          class="absolute"
          style="right: 100px;top: 20px;z-index: 2;"
        >
          <kw-btn
            :label="t('MSG_TXT_CONF_ARTC')"
            dense
            class="float-right"
            @click="openPopup('Y')"
          />
        </div>
        <kw-expansion-item
          group="list-group"
          padding-target="header"
          expansion-icon-align="center"
          expand-icon-class="kw-font-pt24"
          default-opened
        >
          <template #header>
            <kw-item-section>
              <kw-item-label>
                <span class="text-bold kw-font-pt18">{{ t('MSG_TXT_RGS') }}</span>
              </kw-item-label>
            </kw-item-section>
          </template>
          <div class="mt10">
            <kw-form
              ref="frmMainRef"
              :cols="3"
            >
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_TASK_TYPE')"
                  required
                >
                  <kw-select
                    v-model="saveParams.rpotBizTpId"
                    rules="required"
                    first-option="select"
                    :options="businessTypeList"
                    @change="getBaseInfo"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_PIC') + ' ' + t('MSG_TXT_EMPL_NM')"
                >
                  <p>{{ saveParams.prtnrKnm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_EPNO')"
                >
                  <p>{{ saveParams.prtnrNo }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_CONTACT')"
                >
                  <p>{{ saveParams.cralLocaraTno +"-"+ saveParams.mexnoEncr +"-"+saveParams.cralIdvTno }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_RCST') + ' ' + t('MSG_TXT_EMPL_NM')"
                >
                  <p>{{ saveParams.rcstPrtnrNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_EPNO')"
                >
                  <p>{{ saveParams.rcstPrtnrNo }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_CONTACT')"
                >
                  <p>{{ saveParams.rcstPhoneNo }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_SITE_NM')"
                >
                  <kw-select
                    v-model="saveParams.bizAkBldCd"
                    :label="saveParams.bizAkBldNm"
                    first-option="select"
                    :options="bldInfoList"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_CNTN')"
                  colspan="3"
                >
                  <kw-input
                    v-model="saveParams.bizAkCn"
                    type="textarea"
                    :rows="5"
                    :placeholder="saveParams.placeholder"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_ATTH_FILE')"
                  colspan="3"
                >
                  <zwcm-file-attacher
                    v-model="saveParams.attachFiles"
                    multiple
                    attach-group-id="ATG_PSE_GNAFR_MNGT"
                    :attach-document-id="saveParams.attachFileId"
                    :label="$t('MSG_TXT_ATTH_FILE')"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </div>
          <kw-separator class="mt20 mb20" />
          <div class="text-right">
            <kw-btn
              v-permission:create
              :label="t('MSG_BTN_RGST')"
              primary
              default
              @click="onClickSave"
            />
          </div>
        </kw-expansion-item>
        <kw-separator class="mt20 mb0" />
      </kw-list>
    </div>

    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <h3 class="mt0 pb20">
        <p>{{ t('MSG_TXT_BIZ_AK_LIST') }}</p>
      </h3>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_RCPDT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rcpStartDtm"
            v-model:to="searchParams.rcpEndDtm"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_RCPDT')"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_TASK_TYPE')">
          <kw-select
            v-model="searchParams.rpotBizTpId"
            :label="$t('MSG_TXT_TASK_TYPE')"
            :options="businessTypeList"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_STT')">
          <kw-select
            v-model="searchParams.rpotBizProcsStatCd"
            :label="$t('MSG_TXT_STT')"
            first-option="all"
            :options="codes.RPOT_BIZ_PROCS_STAT_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-if="userInfo.baseRleCd === W1580"
          v-permission:download
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-row="5"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, useGlobal, useMeta, modal } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
// eslint-disable-next-line no-unused-vars
import { aesDec, aesEnc } from '~common/utils/common';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { notify, alert } = useGlobal();
const userInfo = getUserInfo();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'RNT_APLC_TP_CD',
  'RPOT_BIZ_PROCS_STAT_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));
const frmMainRef = ref(getComponentType('KwForm'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  rcpStartDtm: now.date(1).format('YYYYMMDD'),
  rcpEndDtm: now.format('YYYYMMDD'),
  rpotBizTpId: '',
  rntAplcTpCd: '',
  rpotBizProcsStatCd: '',
});

const saveParams = ref({
  rntAplcTpCd: '',
  rpotBizTpId: '',
  ogTpCd: '',
  prtnrNo: '',
  bizAkCn: '',
  bizAkBldCd: '',
  bizAkBldNm: '',
  prtnrKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  attachFileId: '',
  apnFileDocId: '',
  rcstPrtnrNo: '',
  rcstPrtnrNm: '',
  rcstPhoneNo: '',
  placeholder: '',
  attachFiles: [],
});

let cachedParams;

const businessTypeList = ref([]);
const bldInfoList = ref([]);

async function getBusinessType() {
  const baseInfoParams = { rpotBizTpDvCd: '03', rpotBizTpId: '', ogTpCd: '', prtnrNo: userInfo.loginId };
  const res = await dataService.get('/sms/wells/competence/electronic-business-ak/business-type', { params: baseInfoParams });

  console.log(res.data);
  // eslint-disable-next-line no-unused-vars
  const { businessType, bldInfo, prtnrInfo } = res.data;

  console.log(userInfo);

  bldInfoList.value = bldInfo;
  saveParams.value.rcstPrtnrNo = userInfo.loginId;
  saveParams.value.rcstPrtnrNm = userInfo.userName;
  const phoneNo = userInfo.cellphone;
  saveParams.value.rcstPhoneNo = phoneNo;
  businessTypeList.value = businessType;
}

// eslint-disable-next-line no-unused-vars
async function getBaseInfo() {
  saveParams.value.prtnrNo = '';
  saveParams.value.prtnrKnm = '';
  saveParams.value.cralLocaraTno = '';
  saveParams.value.mexnoEncr = '';
  saveParams.value.cralIdvTno = '';
  saveParams.value.ogTpCd = '';
  saveParams.value.placeholder = '';

  let placeholder = '';
  switch (saveParams.value.rpotBizTpId) {
    case '010':
      placeholder = '1. (연락받을) 사용자명:\n';
      placeholder += '2. 사용자 연락처:\n';
      placeholder += '3. 모델명/평형:\n';
      placeholder += '4. 실외기위치:\n';
      placeholder += '5. 증상상세내용: 현장에서 결제하지 마세요\n';
      break;
    case '020':
      placeholder = '1. 집기 사용자명:\n';
      placeholder += '2. 신청 및 반납 품목: 노후집기 교체 관련해서는 노후비품 사진 첨부바랍니다.  \n';
      placeholder += '  -품목:\n';
      placeholder += '  -사유:\n';
      break;
    case '030':
      placeholder = '1. 사용자명:\n';
      placeholder += '2. 사용자사번:\n';
      placeholder += '3. 입금액:\n';
      placeholder += '4. 입금자명:\n';
      placeholder += '5. 내용:\n';
      placeholder += '  -데스크탑 에셋라벨번호: /PC관리번호(주황색스티커)\n';
      placeholder += '  -모니터 에셋라벨번호: /PC관리번호(주황색스티커)\n';
      break;
    case '050':
      placeholder = '* 공사진행시 사전협의된 내용만 접수바랍니다.\n';
      placeholder += '* 보고서, 견적서, 사업자등록증, 통장사본 반드시 첨부바랍니다.\n';
      placeholder += '* 소방공사의 경우 \'지적서\' 첨부\n';
      placeholder += '* 공급업체 등록은 2~3일 소요됩니다.\n';
      break;
    case '060':
      placeholder = '1. 수석플래너, 지점장, 지역단장, 사업단장, 총괄단장/사번:\n';
      placeholder += '2. 내용: *증명사진 첨부바랍니다.\n';
      placeholder += '* Wells매니저 은색/금색 명찰 재발급의 경우 유상,[게시판-양식함-Wells영업지원팀] 에서 신청서 작성 후 업체에 메일 발송 바랍니다.\n';
      break;
    case '070':
      placeholder = '1. 사용자명:\n';
      placeholder += '2. 사용자사번:\n';
      placeholder += '3. 사유: * 노후 PC의 경우 4년 도래된 PC만 교체 가능\n';
      placeholder += '         * BM, 업무담당, 지역/총괄단장에게만 해당됩니다.\n';
      placeholder += '         * 사용중인 PC의 관리번호(주황색 스티커)와 에셋라벨번호(KW10자리) 사진첨부 바랍니다.\n';
      break;
    case '080':
      placeholder = '1. 사용자명:\n';
      placeholder += '2. 사용자사번:\n';
      placeholder += '3. 내용: * 구매승인 요청 접수 후 반드시 반송 및 완료여부 확인바랍니다.\n';
      placeholder += '  - 품목:\n';
      placeholder += '  - 모델명:\n';
      placeholder += '  - 금액\n';
      placeholder += '  - 사유\n';
  }

  saveParams.value.placeholder = placeholder;

  const baseInfoParams = { rpotBizTpDvCd: '03', rpotBizTpId: saveParams.value.rpotBizTpId, ogTpCd: '' };
  const baseInfoRes = await dataService.get('/sms/wells/competence/electronic-business-ak/base-information', { params: baseInfoParams });

  console.log(baseInfoRes.data);

  if (baseInfoRes.data[0]) {
    saveParams.value.prtnrNo = baseInfoRes.data[0].prtnrNo;
    saveParams.value.prtnrKnm = baseInfoRes.data[0].prtnrKnm;
    saveParams.value.cralLocaraTno = baseInfoRes.data[0].cralLocaraTno;
    saveParams.value.mexnoEncr = baseInfoRes.data[0].mexnoEncr;
    saveParams.value.cralIdvTno = baseInfoRes.data[0].cralIdvTno;
    saveParams.value.ogTpCd = baseInfoRes.data[0].ogTpCd;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/electronic-business-ak/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  console.log(res.data);

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  pages.forEach((param) => {
    param.phoneNo = `${param.cralLocaraTno}-${param.mexnoEncr}-${param.cralIdvTno}`;
    param.rcstPhoneNo = `${param.rcstCralLocaraTno}-${param.rcstMexnoEncr}-${param.rcstCralIdvTno}`;
  });

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// eslint-disable-next-line no-unused-vars
async function onClickSave() {
  if (!saveParams.value.prtnrNo) {
    alert(t('MSG_ALT_CRSP_BIZ_PSIC_DSN'));
    return;
  }

  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  saveParams.value.bizAkBldNm = bldInfoList.value.find((e) => e.codeId === saveParams.value.bizAkBldCd).codeName;

  await dataService.post('/sms/wells/competence/electronic-business-ak/genenal-affairs', saveParams.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// eslint-disable-next-line no-unused-vars
function getCookie(name) {
  const { cookie } = document;

  if (document.cookie !== '') {
    const cookieArray = cookie.split('; ');
    console.log(cookieArray);
    // eslint-disable-next-line no-unused-vars
    for (let index = 0; index < cookieArray.length; index += 1) {
      const cookieName = cookieArray[index].split('=');
      console.log(cookieName);
      if (cookieName[0] === name) {
        return cookieName[1];
      }
    }
  }
}
async function openPopup(opnYn) {
  console.log(opnYn);
  if (opnYn === 'Y') {
    modal({
      component: 'WwpseConfirmationArticlesP',
      componentProps: {},
    });
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'rpotBizProcsStatNm',
      header: t('MSG_TXT_STT'),
      width: '80',
      renderer: {
        type: 'button',
        hideWhenEmpty: true,
      } },
    { fieldName: 'aplcDtm', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPhoneNo', header: t('MSG_TXT_CONTACT'), width: '120', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rpotBizTpNm', header: t('MSG_TXT_TASK_TYPE'), width: '150', styleName: 'text-left' },
    { fieldName: 'bizAkCn', header: t('MSG_TXT_CNTN'), width: '250', styleName: 'text-left' },
    { fieldName: 'fnlMdfcDtm',
      header: `${t('MSG_TXT_COMPLETE')}(${t('MSG_TXT_SB')})${t('MSG_TXT_DT')}`,
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'aplcnsPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizTpId', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizAplcId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'phoneNo', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizProcsStatCd', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsSn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsCn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'bizAkBldNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'rpotBizProcsStatNm', 'aplcDtm',
    {
      header: t('MSG_TXT_RCST'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rcstPrtnrNo', 'rcstPrtnrNm', 'rcstPhoneNo'],
    },
    {
      header: t('MSG_TXT_PIC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['prtnrNo', 'prtnrKnm'],
    },
    'rpotBizTpNm', 'bizAkCn', 'fnlMdfcDtm',
    {
      header: t('MSG_TXT_FSH_SB_EMPLOYEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fnlMdfcUsrId', 'fnlMdfcUsrNm'],
    }, 'aplcnsPrtnrNo', 'rpotBizTpId', 'rpotBizAplcId', 'phoneNo', 'rpotBizProcsStatCd', 'procsSn', 'procsCn', 'bizAkBldNm',
  ]);

  view.onCellItemClicked = async (grid, { itemIndex, column }) => {
    if (column === 'rpotBizProcsStatNm') {
      // eslint-disable-next-line no-unused-vars
      const { result, payload } = await modal({
        component: 'WwpseGenenalAffairsElcBizAkP',
        componentProps: {
          rowData: grid.getValues(itemIndex),
        },
      });

      await fetchData();
    }
  };
}

onMounted(() => {
  const openYn = getCookie('popupOpenYn');
  console.log(openYn);
  if (openYn) {
    openPopup('N');
  } else {
    openPopup('Y');
  }

  getBusinessType();
});
</script>
<style scoped></style>
