<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSH
2. 프로그램 ID : WpshVocReceiptMngtM
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.11.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- VOC 접수 관리
****************************************************************************************************
-->
<template>
  <kw-page>
    <div class="result-area">
      <kw-list
        separator
        item-padding="10px 0px 0px"
      >
        <kw-expansion-item
          group="list-group"
          padding-target="header"
          expansion-icon-align="center"
          expand-icon-class="kw-font-pt24"
        >
          <template #header>
            <kw-item-section>
              <kw-item-label>
                <span class="text-bold kw-font-pt18">{{ t('MSG_BTN_RGST') }}</span>
              </kw-item-label>
            </kw-item-section>
          </template>
          <div class="mt10">
            <kw-form :cols="3">
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_TTL')"
                  colspan="3"
                  required
                >
                  <kw-input
                    v-model.trim="insertParams.vocRcpTitNm"
                    :label="t('MSG_TXT_TTL')"
                    :maxlength="200"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_DIV')"
                  required
                  colspan="3"
                >
                  <kw-option-group
                    v-model="insertParams.vocBizTpCd"
                    type="radio"
                    :options="commonCodes.VOC_BIZ_TP_CD"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                v-if="insertParams.vocBizTpCd === '10'"
              >
                <kw-form-item
                  :label="t('MSG_TXT_CST_CD')"
                  required
                >
                  <kw-input
                    v-model="insertParams.cstNo"
                    clearable
                    rules="required"
                    readonly
                    :placeholder="t('MSG_TXT_OJPS_SEA')"
                  />
                  <kw-btn
                    icon="search"
                    secondary
                    @click="onClickCustomerSearch"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_CNTRT')"
                >
                  <p>{{ cntrParams.cstKnm }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                v-if="insertParams.vocBizTpCd === '10'"
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
                <kw-form-item
                  :label="t('MSG_TXT_IST_DT')"
                >
                  <p>{{ stringUtil.getDateFormat(cntrParams.istDt, 'YYYY-MM-DD') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                v-if="insertParams.vocBizTpCd === '10'"
              >
                <kw-form-item
                  :label="t('MSG_TXT_SELL_RGRP')"
                >
                  <p>{{ cntrParams.sellPrtnrBlgCd }}</p>
                </kw-form-item>
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
              <kw-form-row
                v-if="insertParams.vocBizTpCd === '20'"
              >
                <kw-form-item
                  :label="t('MSG_TXT_PROS_KND')"
                  required
                  colspan="3"
                >
                  <kw-option-group
                    v-model="insertParams.ipvmProsTpCd"
                    type="radio"
                    :options="commonCodes.IPVM_PROS_TP_CD"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="bizAkCnLbel"
                  colspan="3"
                  required
                >
                  <kw-input
                    v-model="insertParams.bizAkCn"
                    :label="bizAkCnLbel"
                    type="textarea"
                    :rows="5"
                    :placeholder="t('MSG_TXT_INP')"
                  />
                </kw-form-item>>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_ATTH_FILE')"
                  colspan="3"
                >
                  <zwcm-file-attacher
                    v-model="attachFiles"
                    attach-group-id="ATG_PSH_VOC_RCP"
                    multiple
                    downloadable
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </div>
          <kw-separator class="mt20 mb20" />
          <div class="text-right">
            <kw-btn
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
      @search="fetchData"
    >
      <div class="text-bold kw-font-pt18">
        Wells영업부 VOC
      </div>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BLTN_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startRcpDtm"
            v-model:to="searchParams.endRcpDtm"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.vocBizTpCd"
            :options="commonCodes.VOC_BIZ_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TIT_DOC_CRTR')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            :on-click-icon="onClickSearchNo"
            :regex="/^[A-Z가-힣ㄱ-ㅎ0-9]*$/i"
            clearable
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            clearable
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_TTL')"
          colspan="2"
        >
          <kw-input
            v-model.trim="searchParams.vocRcpTitNm"
            :maxlength="200"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PROCS_STAT')"
        >
          <kw-select
            v-model="searchParams.vocPrssStatCd"
            :options="commonCodes.VOC_PRGS_STAT_CD"
            first-option="all"
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
            :page-size-options="commonCodes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
      <kw-separator />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, codeUtil, useGlobal, useMeta, defineGrid, useDataService, gridUtil, getComponentType, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

const { t } = useI18n();
const now = dayjs();
const { modal } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

const attachFiles = ref([]);
const bizAkCnLbel = ref('클레임 발생 원인 및 고객 요청사항');
const searchParams = ref({
  startRcpDtm: now.format('YYYYMM').concat('01'),
  endRcpDtm: now.format('YYYYMMDD'),
  vocBizTpCd: '',
  prtnrNo: '',
  prtnrKnm: '',
  vocRcpTitNm: '',
  vocPrssStatCd: '',
});

const insertParams = ref({
  vocRcpTitNm: '',
  vocBizTpCd: '10',
  vocBizTpDtlCd: '100',
  bizAkCn: '',
  ipvmProsTpCd: '10',
  prtnrNo: userInfo.employeeIDNumber,
  cstNo: '',
  attachFiles: [],
  cntrNo: '',
  cntrSn: '',
  cntrCstNo: '',
});

const cntrParams = ref({
  cntrNo: '',
  cntrSn: '',
  cntrCstNo: '',
  cstKnm: '',
  sellTpCd: '',
  istDt: '',
  cntrDt: '',
  pdNm: '',
  sellPrtnrBlgCd: '',
  sellPrtnrNo: '',
  sellPrtnrNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const commonCodes = await codeUtil.getMultiCodes(
  'VOC_BIZ_TP_CD',
  'VOC_PRGS_STAT_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'IPVM_PROS_TP_CD',
  'VOC_RCP_CTG_CD',
);

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/competence/voc/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/competence/voc/excel-download', { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}
async function onClickCustomerSearch() {
  const { result, payload } = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: {
    },
  });
  if (result) {
    let res = '';
    cntrParams.value.cntrNo = payload.cntrNo;
    cntrParams.value.cntrSn = payload.cntrSn;
    cachedParams = cloneDeep(cntrParams.value);
    res = await dataService.get('/sms/wells/contract/contracts/order-details/customer-bases', { params: cachedParams });

    console.log(res);
    cntrParams.value.cntrCstNo = res.data[0].cntrCstNo;
    cntrParams.value.sellTpCd = res.data[0].sellTpCd;
    cntrParams.value.cstKnm = res.data[0].cstKnm;
    cachedParams = cloneDeep(cntrParams.value);
    res = await dataService.get('/sms/wells/contract/contracts/order-details/management-information', { params: cachedParams });
    console.log(res);

    cntrParams.value.istDt = res.data[0].istDt;
    cntrParams.value.cntrDt = res.data[0].cntrDt;
    cntrParams.value.pdNm = res.data[0].pdNm;
    cntrParams.value.sellPrtnrBlgCd = res.data[0].sellPrtnrBlgCd;
    cntrParams.value.sellPrtnrNo = res.data[0].sellPrtnrNo;
    cntrParams.value.sellPrtnrNm = res.data[0].sellPrtnrNm;
  }
}
async function openVocReceiptPopup(item) {
  console.log(item);
  const { result, payload } = await modal({
    component: 'WpshVocReceiptMngtDetailP',
    componentProps: {
      vocRcpId: item.vocRcpId,
      vocRcpTitNm: item.vocRcpTitNm,
      vocBizTpCd: item.vocBizTpCd,
      deptId: item.deptId,
      rsbEnNm: item.rsbEnNm,
      epno: item.epno,
      usrNm: item.usrNm,
      bizAkCn: item.bizAkCn,
      cntrNo: item.cntrNo,
      cntrSn: item.cntrSn,
      cstNo: item.cstNo,
    },
  });
  console.log(result);
  console.log(payload);
}
async function onClickSave() {
  if (insertParams.value.vocBizTpCd === '10') {
    insertParams.value.cntrNo = cntrParams.value.cntrNo;
    insertParams.value.cntrSn = cntrParams.value.cntrSn;
    insertParams.value.cntrCstNo = cntrParams.value.cntrCstNo;
  }
  insertParams.value.attachFiles = attachFiles.value;
  if (isEmpty(insertParams.value.vocRcpTitNm)) {
    await alert('제목은 필수입력입니다.');
    return;
  }
  cachedParams = cloneDeep(insertParams.value);
  await dataService.post('/sms/wells/competence/voc', cachedParams);
  await fetchData();
}

watch(() => insertParams.value.vocBizTpCd, (val) => {
  if (val === '10') {
    bizAkCnLbel.value = '클레임 발생 원인 및 고객 요청사항';
    insertParams.value.vocBizTpDtlCd = '100';
  } else if (val === '20') {
    bizAkCnLbel.value = '현재 프로세스 및 개선 요청사항';
    insertParams.value.vocBizTpDtlCd = '2'.concat(insertParams.value.ipvmProsTpCd);
  } else if (val === '30') {
    bizAkCnLbel.value = '내용';
    insertParams.value.vocBizTpDtlCd = '300';
  }
});
watch(() => insertParams.value.ipvmProsTpCd, (val) => {
  insertParams.value.vocBizTpDtlCd = '2'.concat(val);
});

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'vocBizTpCd' },
    { fieldName: 'deptNm' },
    { fieldName: 'deptId' },
    { fieldName: 'rsbEnNm' },
    { fieldName: 'epno' },
    { fieldName: 'usrNm' },
    { fieldName: 'vocRcpTitNm' },
    { fieldName: 'vocProcsStatCd' },
    { fieldName: 'rcpNm' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'rcpDtm' },
    { fieldName: 'procsDtm' },
    { fieldName: 'vocRcpCtgCd' },
    { fieldName: 'vocRcpId' },
    { fieldName: 'bizAkCn' },
    { fieldName: 'atthDocId' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstNo' },
  ];

  const columns = [
    { fieldName: 'vocBizTpCd', header: t('MSG_TXT_DIV'), width: '150', styleName: 'text-center', options: commonCodes.VOC_BIZ_TP_CD },
    { fieldName: 'deptNm', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'deptId', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbEnNm', header: t('MSG_TXT_RSB'), width: '100', styleName: 'text-center' },
    { fieldName: 'epno', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'usrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'vocRcpTitNm', header: t('MSG_TXT_TTL'), width: '150', styleName: 'text-left' },
    { fieldName: 'vocProcsStatCd', header: t('MSG_TXT_PROCS_STAT'), width: '100', styleName: 'text-center', options: commonCodes.VOC_PRGS_STAT_CD },
    { fieldName: 'rcpNm', header: t('MSG_TXT_RCST'), width: '100', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_BLTN_DTM'), width: '180', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD HH:mm:ss' },
    { fieldName: 'rcpDtm', header: t('MSG_TXT_RCP_DTM'), width: '180', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD HH:mm:ss' },
    { fieldName: 'procsDtm', header: t('MSG_TIT_PROC_DTM'), width: '180', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD HH:mm:ss' },
    { fieldName: 'vocRcpCtgCd', header: t('MSG_TXT_CATG'), width: '180', styleName: 'text-center', options: commonCodes.VOC_RCP_CTG_CD },
    { fieldName: 'vocRcpId', visible: false },
    { fieldName: 'bizAkCn', visible: false },
    { fieldName: 'atthDocId', visible: false },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'cstNo', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'vocBizTpCd',
    {
      header: t('MSG_TXT_WRP_INF'),
      direction: 'horizontal',
      items: ['deptNm', 'deptId', 'rsbEnNm', 'epno', 'usrNm'],
    },

    {
      header: t('MSG_TXT_WRTE_BLTNS_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['vocRcpTitNm', 'vocProcsStatCd', 'rcpNm', 'fstRgstDtm', 'rcpDtm'],
    },
    {
      header: t('MSG_TXT_WRTE_BLTNS_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['procsDtm', 'vocRcpCtgCd'],
    },
    {
      items: ['vocRcpId', 'bizAkCn', 'atthDocId', 'cntrNo', 'cntrSn', 'cstNo'],
      visible: false,
    },
  ]);
  view.onCellDblClicked = (grid, clickData) => {
    const newRowValue = grid.getValues(clickData.itemIndex);
    openVocReceiptPopup(newRowValue);
  };
});
</script>
