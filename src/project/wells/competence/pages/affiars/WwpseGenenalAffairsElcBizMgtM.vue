<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSE
2. 프로그램 ID : WwpseGenenalAffairsElcBizMgtM - 총무전자업무관리  (K-W-GM-U-0023M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
총무전자업무관리 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DEPT_INC')"
        >
          <kw-select
            v-model="searchParams.ogCd"
            :label="$t('MSG_TXT_DEPT_INC')"
            first-option="all"
            :options="inChargeDepartmentList"
            readonly
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.rpotBizTpId"
            :label="$t('MSG_TXT_TASK_TYPE')"
            first-option="all"
            :options="businessTypeList"
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
          v-permission:delete
          grid-action
          :label="t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_ROW_ADD')"
          secondary
          dense
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_SAVE')"
          secondary
          dense
          @click="onClickSave"
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
      <kw-separator class="mt80 mb0" />
      <kw-action-top class="mb20 mt20">
        <template #left>
          <h3 class="kw-font-pt20">
            {{ t('MSG_TXT_RGS') }}
          </h3>
        </template>
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_SAVE')"
          secondary
          dense
          @click="onClickNtccnSave"
        />
      </kw-action-top>
      <kw-form>
        <kw-form-row :cols="2">
          <kw-form-item
            :label="t('MSG_TXT_TASK_TYPE')"
            required
          >
            <kw-select
              v-model="saveParams.rpotBizTpId"
              :label="$t('MSG_BTN_TASK_TYPE')"
              rules="required"
              first-option="select"
              :options="businessTypeList"
              @change="getBusinessTypeContent"
            />
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_POP_NTC_YN')"
          >
            <kw-checkbox
              v-model="saveParams.confArtcUseYn"
              :options="[t('MSG_TXT_POP_NTC_YN') ]"
              :true-value="Y"
              :false-value="N"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_NTCCN')"
            colspan="3"
            required
          >
            <kw-input
              v-model="saveParams.confArtcCn"
              type="textarea"
              rules="required"
              :rows="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta, modal } from 'kw-lib';
// eslint-disable-next-line no-unused-vars
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { notify, alert } = useGlobal();
// eslint-disable-next-line no-unused-vars
const userInfo = getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  rpotBizTpId: '',
  ogCd: '71301',
  rpotBizTpDvCd: '03',
});

const saveParams = ref({
  confArtcUseYn: 'N',
  confArtcCn: '',
  rpotBizTpId: '',
});

let cachedParams;
const businessTypeList = ref([]);
const inChargeDepartmentList = ref([]);

// eslint-disable-next-line no-unused-vars
async function getBusinessType() {
  const optionParams = { rpotBizTpDvCd: '03',
    ogCds: ['71301'] };
  const businessRes = await dataService.get('/sms/wells/competence/genenal-affairs-elc-biz/business-type', { params: optionParams });
  // eslint-disable-next-line no-unused-vars
  const { businessType, inChargeDepartment } = businessRes.data;

  console.log(businessRes.data);

  businessTypeList.value = businessType;
  inChargeDepartmentList.value = inChargeDepartment;

  const view = grdMainRef.value.getView();
  view.setColumn({
    name: 'rpotBizTpId',
    editor: { type: 'list' },
    rules: 'required',
    options: businessTypeList.value,
    optionValue: 'codeId',
    optionLabel: 'codeName',
  });
}

async function getBusinessTypeContent() {
  const optionParams = { rpotBizTpDvCd: '03', rpotBizTpId: saveParams.value.rpotBizTpId };
  const res = await dataService.get('/sms/wells/competence/genenal-affairs-elc-biz/business-type-content', { params: optionParams });

  console.log(res.data);

  saveParams.value.confArtcCn = res.data[0].confArtcCn;
  saveParams.value.confArtcUseYn = res.data[0].confArtcUseYn;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/genenal-affairs-elc-biz/paging', { params: { ...cachedParams, ...pageInfo.value } });
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

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  if (changedRows.length === 0) {
    alert(t('MSG_ALT_SAV_NO_DATA'));
    return false;
  }

  const saveRows = changedRows.map((item) => {
    if (item.dgYn === undefined) {
      item.dgYn = 'N';
    }
    return item;
  });

  console.log(saveRows);
  await dataService.post('/sms/wells/competence/genenal-affairs-elc-biz/business-manager-report', saveRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickNtccnSave() {
  console.log(saveParams.value);
  const businessTypeParam = { rpotBizTpId: saveParams.value.rpotBizTpId,
    confArtcCn: saveParams.value.confArtcCn,
    confArtcUseYn: saveParams.value.confArtcUseYn };

  await dataService.post('/sms/wells/competence/genenal-affairs-elc-biz/report-business-type', businessTypeParam);
  notify(t('MSG_ALT_SAVE_DATA'));
}

// 행삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // rowState 삭제상태 none 으로 나와 임시 set
  for (let i = 0; i < deletedRows.length; i += 1) {
    deletedRows[i].rowState = 'deleted';
  }

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/genenal-affairs-elc-biz/', { data: deletedRows });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'dgYn',
      header: t('MSG_TXT_DELEGATE'),
      width: '80',
      renderer: { type: 'check' },
    },
    { fieldName: 'ogNm', header: t('MSG_TXT_DEPT_INC'), width: '200', styleName: 'text-center', editable: false },
    { fieldName: 'rpotBizTpId', header: t('MSG_TXT_TASK_TYPE'), width: '300', styleName: 'text-left', options: [], editor: { type: 'list' }, rules: 'required' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center rg-button-icon--search', button: 'action', rules: 'required' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'phoneNo', header: t('MSG_TXT_CONTACT'), width: '200', styleName: 'text-center', editable: false },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_CONTACT'), width: '200', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizAsnId', header: t('MSG_TXT_CONTACT'), width: '200', styleName: 'text-center', visible: false },
    { fieldName: 'ogCd', header: t('MSG_TXT_CONTACT'), width: '200', styleName: 'text-center', visible: false },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    'dgYn', 'ogNm', 'rpotBizTpId',
    {
      header: t('MSG_TXT_PIC'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm'],
    },
    'phoneNo', 'ogTpCd', 'ogCd',
  ]);

  // eslint-disable-next-line no-unused-vars
  view.onCellButtonClicked = async (g, { itemIndex, fieldName }) => {
    if (fieldName === 'prtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo: searchParams.value.prtnrNo,
        },
      });

      console.log(result);
      console.log(payload);

      if (result) {
        const { prtnrNo } = payload;
        data.setValue(itemIndex, fieldName, prtnrNo);
        data.setValue(itemIndex, 'prtnrKnm', payload.prtnrKnm);
        data.setValue(itemIndex, 'ogTpCd', payload.ogTpCd);

        const res = await dataService.get('/sms/wells/competence/genenal-affairs-elc-biz/prtnr-info', { params: { ogTpCd: payload.ogTpCd, prtnrNo: payload.prtnrNo } });

        if (res.data) {
          const phoneNo = `${res.data[0].cralLocaraTno}-${res.data[0].mexnoEncr}-${res.data[0].cralIdvTno}`;
          data.setValue(itemIndex, 'phoneNo', phoneNo);
          data.setValue(itemIndex, 'ogNm', res.data[0].ogNm);
          data.setValue(itemIndex, 'ogCd', res.data[0].ogCd);
        }
      }
    }
  };
}

onMounted(() => {
  getBusinessType();
});

</script>
<style scoped></style>
