<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSG
2. 프로그램 ID : WwpsgBusinessCellPhoneChMgtM - 업무폰변경 관리 (K-W-GM-U-0043M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
업무폰변경 관리 화면
****************************************************************************************************
--->
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
                >
                  <p>{{ t('MSG_TXT_BIZ_CPHON_CH') }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_TYPE')"
                  required
                >
                  <kw-option-group
                    v-model="saveParams.bizCralTelChTpCd"
                    type="radio"
                    :options="codes.BIZ_CRAL_TEL_CH_TP_CD"
                    rules="required"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_CH_AK') + t('MSG_TXT_DT')"
                  required
                >
                  <kw-date-picker
                    v-model="saveParams.chRqdt"
                    rules="required"
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
                  :label="t('MSG_TXT_SELLER_FNM')"
                  required
                >
                  <kw-input
                    v-model="saveParams.sellPrtnrNo"
                    clearable
                    rules="required"
                    readonly
                  />
                  <kw-btn
                    icon="search"
                    secondary
                    @click="onClickPartner"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_EMPL_NM')"
                >
                  <p>{{ saveParams.sellPrtnrKnm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_PRTNR_NO')"
                >
                  <p>{{ saveParams.sellPrtnrNo }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_BLG')"
                >
                  <p>{{ saveParams.ogCd }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_RSB')"
                >
                  <p>{{ saveParams.rsbDvNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_BLD_NM')"
                >
                  <p>{{ saveParams.bldNm }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_CONTACT')"
                >
                  <p>
                    {{ saveParams.sellPhoneNo }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_BFCH')"
                  required
                >
                  <zwcm-telephone-number
                    v-model:tel-no1="saveParams.bfchCralLocaraTno"
                    v-model:tel-no2="saveParams.bfchMexnoEncr"
                    v-model:tel-no3="saveParams.bfchCralIdvTno"
                    required
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_AFCH')"
                  required
                >
                  <zwcm-telephone-number
                    v-model:tel-no1="saveParams.afchCralLocaraTno"
                    v-model:tel-no2="saveParams.afchMexnoEncr"
                    v-model:tel-no3="saveParams.afchCralIdvTno"
                    required
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_CH_RSON')"
                  colspan="3"
                  required
                >
                  <kw-input
                    v-model="saveParams.bizAkCn"
                    type="textarea"
                    :rows="5"
                    :placeholder="t('MSG_TXT_CH_RSON')"
                    rules="required"
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
            :readonly="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_RNT_APLC_TP')">
          <kw-select
            v-model="searchParams.rntAplcTpCd"
            :label="$t('MSG_TXT_RNT_APLC_TP')"
            first-option="all"
            :options="codes.RNT_APLC_TP_CD"
          />
        </kw-search-item>
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
import { cloneDeep } from 'lodash-es';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { notify } = useGlobal();
const userInfo = getUserInfo();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BIZ_CRAL_TEL_CH_TP_CD',
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
  rpotBizTpId: '1400',
  rntAplcTpCd: '',
  rpotBizProcsStatCd: '',
});

const saveParams = ref({
  rntAplcTpCd: '',
  rpotBizTpId: '1400',
  bizCralTelChTpCd: '10',
  chRqdt: '',
  ogTpCd: '',
  prtnrNo: '',
  prtnrKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  bfchCralLocaraTno: '',
  bfchMexnoEncr: '',
  bfchCralIdvTno: '',
  afchCralLocaraTno: '',
  afchMexnoEncr: '',
  afchCralIdvTno: '',
  bizAkCn: '',
  sellPrtnrNo: '',
  sellPrtnrKnm: '',
  rsbDvNm: '',
  ogNm: '',
  ogCd: '',
  sellPhoneNo: '',
  bldNm: '',
});

let cachedParams = null;

const businessTypeList = ref([]);

// eslint-disable-next-line no-unused-vars
async function getBaseInfo() {
  const baseInfoParams = { rpotBizTpDvCd: '02', rpotBizTpId: '1400', ogTpCd: '' };
  const baseInfoRes = await dataService.get('/sms/wells/competence/business-cell-phone/base-information', { params: baseInfoParams });
  const { businessType, BaseSearchInfo } = baseInfoRes.data;

  console.log(baseInfoRes.data);

  businessTypeList.value = businessType;

  saveParams.value.prtnrNo = BaseSearchInfo[0].prtnrNo;
  saveParams.value.prtnrKnm = BaseSearchInfo[0].prtnrKnm;
  saveParams.value.cralLocaraTno = BaseSearchInfo[0].cralLocaraTno;
  saveParams.value.mexnoEncr = BaseSearchInfo[0].mexnoEncr;
  saveParams.value.cralIdvTno = BaseSearchInfo[0].cralIdvTno;
  saveParams.value.ogTpCd = BaseSearchInfo[0].ogTpCd;
}

async function onClickPartner() {
  const { payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  saveParams.value.sellPrtnrNo = payload.prtnrNo;
  saveParams.value.sellPrtnrKnm = payload.prtnrKnm;
  saveParams.value.ogNm = payload.ogNm;
  saveParams.value.ogCd = payload.ogCd;
  saveParams.value.rsbDvNm = payload.rsbDvNm;

  const res = await dataService.get('/sms/wells/competence/business-cell-phone/prtnr-info', { params: { prtnrNo: payload.prtnrNo, ogTpCd: payload.ogTpCd } });
  console.log(res.data);

  saveParams.value.bldNm = res.data.bldNm;
  saveParams.value.sellPhoneNo = `${res.data.sellCralLocaraTno}-${res.data.sellMexnoEncr}-${res.data.sellCralIdvTno}`;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/business-cell-phone/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  console.log(res.data);

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  pages.forEach((param) => {
    param.bfchNo = `${param.bfchCralLocaraTno}-${param.bfchMexnoEncr}-${param.bfchCralIdvTno}`;
    param.afchNo = `${param.afchCralLocaraTno}-${param.afchMexnoEncr}-${param.afchCralIdvTno}`;
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

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  /* 백단(서비스) 엑셀 다운로드 */
  const res = await dataService.get('/sms/wells/competence/business-cell-phone/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// eslint-disable-next-line no-unused-vars
async function onClickSave() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  console.log(saveParams.value);

  await dataService.post('/sms/wells/competence/business-cell-phone/', saveParams.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
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
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '100', styleName: 'text-left' },
    { fieldName: 'bizCralTelChTpNm', header: t('MSG_TXT_TYPE') + t('MSG_TXT_TYPE'), width: '100', styleName: 'text-left' },
    { fieldName: 'bfchNo', header: t('MSG_TXT_BFCH'), width: '120', styleName: 'text-left' },
    { fieldName: 'afchNo', header: t('MSG_TXT_AFCH'), width: '120', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm',
      header: `${t('MSG_TXT_COMPLETE')}(${t('MSG_TXT_SB')})${t('MSG_TXT_DT')}`,
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'aplcnsPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizTpId', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizAplcId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'mexnoEncr', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cralIdvTno', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizProcsStatCd', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsSn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsCn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rcstPrtnrNo', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rcstPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rcstPhoneNo', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'chRqdt', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'ogCd', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },

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
      header: t('MSG_TXT_SELLER_PERSON'), // colspan title
      direction: 'horizontal', // merge type
      items: ['sellPrtnrNo', 'sellPrtnrNm', 'rsbDvNm'],
    }, 'bizCralTelChTpNm', 'bfchNo', 'afchNo', 'fnlMdfcDtm',
    {
      header: t('MSG_TXT_FSH_SB_EMPLOYEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fnlMdfcUsrId', 'fnlMdfcUsrNm'],
    }, 'aplcnsPrtnrNo', 'rpotBizTpId', 'rpotBizAplcId', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno', 'rpotBizProcsStatCd', 'procsSn', 'procsCn',
    'prtnrKnm', 'rcstPrtnrNo', 'rcstPrtnrNm', 'rcstPhoneNo', 'chRqdt', 'ogCd', 'ogNm',
  ]);

  view.onCellItemClicked = async (grid, { itemIndex, column }) => {
    if (column === 'rpotBizProcsStatNm') {
      // eslint-disable-next-line no-unused-vars
      const { result, payload } = await modal({
        component: 'WwpsgBusinessCellPhoneChMgtP',
        componentProps: {
          rowData: grid.getValues(itemIndex),
        },
      });

      await fetchData();
    }
  };
}

onMounted(() => {
  getBaseInfo();
});
</script>
<style scoped></style>
