<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSG
2. 프로그램 ID : WwpsgRentManagementM - 임차관리 (K-W-GM-U-0041M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
임차관리 조회 화면
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
                <div class="float-right">
                  <kw-btn
                    :label="t('MSG_TXT_ADVNC_PLAN_DOC') + ' ' + t('MSG_TXT_EXPL2')"
                    dense
                    class="mr8"
                    @click="onClickTemplateDownload"
                  />
                  <kw-btn
                    :label="t('MSG_TXT_ADVNC_PLAN_DOC') + ' ' + t('MSG_TXT_FORM')"
                    dense
                    @click="onClickTemplateDownload2"
                  />
                </div>
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
                  <p>{{ t('MSG_TXT_ENTRPRNR') }} {{ t('MSG_TXT_RNT') }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_BLD_NM')"
                  required
                >
                  <kw-select
                    v-model="saveParams.bizAkBldCd"
                    :label="saveParams.bizAkBldNm"
                    rules="required"
                    first-option="select"
                    :options="bldInfoList"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_RNT_APLC_TP')"
                  required
                >
                  <kw-select
                    v-model="saveParams.rntAplcTpCd"
                    :label="$t('MSG_TXT_RNT_APLC_TP')"
                    rules="required"
                    first-option="select"
                    :options="codes.RNT_APLC_TP_CD"
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
                  :label="t('MSG_TXT_CNTN')"
                  colspan="3"
                >
                  <kw-input
                    v-model="saveParams.bizAkCn"
                    type="textarea"
                    :rows="5"
                    placeholder="※ 신규/분리, 플래너 사업장, 단기사업장의 경우는 반드시 첨부된 '사업장진출계획서' 작성 후 별도 첨부 바랍니다. (파일 미첨부시 반송됩니다.)"
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
                    attach-group-id="ATG_PSG_RPOT_MNGT"
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
// eslint-disable-next-line no-unused-vars
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta, modal } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useCmFile from '~common/composables/useCmFile';

const { getStandardFormFile } = useCmFile();
const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
// eslint-disable-next-line no-unused-vars
const { notify, alert } = useGlobal();
// eslint-disable-next-line no-unused-vars
const userInfo = getUserInfo();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
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
  rpotBizTpId: '30',
  rntAplcTpCd: '',
  rpotBizProcsStatCd: '',
});

const saveParams = ref({
  rntAplcTpCd: '',
  rpotBizTpId: '30',
  ogTpCd: '',
  prtnrNo: '',
  bizAkCn: '',
  bizAkBldCd: '',
  bizAkBldNm: '',
  prtnrKnm: '',
  cralIdvTno: '',
  mexnoEncr: '',
  cralLocaraTno: '',
  attachFileId: '',
  apnFileDocId: '',
  attachFiles: [],
});

let cachedParams;

const businessTypeList = ref([]);
const bldInfoList = ref([]);

function onClickTemplateDownload() {
  getStandardFormFile('FOM_PSG_W_0001');
}

function onClickTemplateDownload2() {
  getStandardFormFile('FOM_PSG_W_0002');
}

// eslint-disable-next-line no-unused-vars
async function getBaseInfo() {
  const baseInfoParams = { rpotBizTpDvCd: '01', rpotBizTpId: '30', ogTpCd: '' };
  const baseInfoRes = await dataService.get('/sms/wells/competence/rent-management/base-information', { params: baseInfoParams });
  // eslint-disable-next-line no-unused-vars
  const { businessType, bldInfo, BaseSearchInfo } = baseInfoRes.data;

  console.log(baseInfoRes.data);

  const bldList = bldInfo.map(({ bldCd, bldNm }) => ({ codeId: bldCd, codeName: bldNm }));

  businessTypeList.value = businessType;
  bldInfoList.value = bldList;

  saveParams.value.prtnrNo = BaseSearchInfo[0].prtnrNo;
  saveParams.value.prtnrKnm = BaseSearchInfo[0].prtnrKnm;
  saveParams.value.cralLocaraTno = BaseSearchInfo[0].cralLocaraTno;
  saveParams.value.mexnoEncr = BaseSearchInfo[0].mexnoEncr;
  saveParams.value.cralIdvTno = BaseSearchInfo[0].cralIdvTno;
  saveParams.value.ogTpCd = BaseSearchInfo[0].ogTpCd;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/rent-management/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  console.log(res.data);

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  pages.forEach((param) => {
    const phoneNo = `${param.cralLocaraTno}-${param.mexnoEncr}-${param.cralIdvTno}`;
    param.phoneNo = phoneNo;
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
  const res = await dataService.get('/sms/wells/competence/rent-management/excel-download', { params: searchParams.value });
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

  saveParams.value.bizAkBldNm = bldInfoList.value.find((e) => e.codeId === saveParams.value.bizAkBldCd).codeName;

  await dataService.post('/sms/wells/competence/rent-management/rent-management', saveParams.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
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
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_REQ_USER'), width: '100', styleName: 'text-center' },
    { fieldName: 'bizAkBldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'rntAplcTpNm', header: t('MSG_TXT_RNT') + t('MSG_TXT_TYPE'), width: '100', styleName: 'text-left' },
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
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'mexnoEncr', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cralIdvTno', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizProcsStatCd', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsSn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsCn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'rpotBizProcsStatNm', 'aplcDtm', 'prtnrKnm', 'bizAkBldNm', 'rntAplcTpNm', 'bizAkCn', 'fnlMdfcDtm',
    {
      header: t('MSG_TXT_FSH_SB_EMPLOYEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fnlMdfcUsrId', 'fnlMdfcUsrNm'],
    }, 'aplcnsPrtnrNo', 'rpotBizTpId', 'rpotBizAplcId', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno', 'rpotBizProcsStatCd', 'procsSn', 'procsCn',
  ]);

  view.onCellItemClicked = async (grid, { itemIndex, column }) => {
    if (column === 'rpotBizProcsStatNm') {
      // eslint-disable-next-line no-unused-vars
      const { result, payload } = await modal({
        component: 'WwpsgRentManagementP',
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
