<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSH
2. 프로그램 ID : WpshVocReceiptPsicMngtM
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.10.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- VOC 접수담당자 관리
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DEPT_INC')"
        >
          <kw-select
            v-model="searchParams.ichrDeptId"
            :options="codes"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.vocBizTpCd"
            :options="commonCodes.VOC_BIZ_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PROS_IPVM_TP')"
        >
          <kw-select
            v-model="searchParams.ipvmProsTpCd"
            :options="commonCodes.IPVM_PROS_TP_CD"
            first-option="all"
            :disable="searchParams.vocBizTpCd !== '20'"
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
          dense
          grid-action
          :label="'삭제'"
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
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
import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useGlobal, useMeta, confirm } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';
import dayjs from 'dayjs';

const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const { modal, notify } = useGlobal();
const prtnrPopupValidateChk = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  ichrDeptId: '',
  vocBizTpCd: '',
  ipvmProsTpCd: '',
});
let cachedParams;
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = [];

const commonCodes = await codeUtil.getMultiCodes(
  'VOC_BIZ_TP_CD',
  'IPVM_PROS_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'VOC_BIZ_TP_DTL_CD',
);

async function getCode() {
  codes.push({ codeId: '70078', codeName: '고객센터혁신기획팀' });
  codes.push({ codeId: '70202', codeName: '채권전략팀' });
  codes.push({ codeId: '70529', codeName: 'KSS개발팀' });
  codes.push({ codeId: '70532', codeName: '생활인바운드운영팀' });
  codes.push({ codeId: '70533', codeName: 'Wells파트' });
  codes.push({ codeId: '70632', codeName: '물류사업팀' });
  codes.push({ codeId: '71301', codeName: 'Wells영업지원팀' });
  codes.push({ codeId: '71309', codeName: 'Wells상담파트' });
  codes.push({ codeId: '71314', codeName: 'Wells CS운영팀' });
  codes.push({ codeId: '71321', codeName: '물류운영3팀' });
  codes.push({ codeId: '71356', codeName: '화성서비스센터' });
  codes.push({ codeId: '71361', codeName: '대구서비스센터' });
  codes.push({ codeId: '71774', codeName: '채권수납팀' });
  codes.push({ codeId: '71776', codeName: 'Wells사업기획팀' });
  codes.push({ codeId: '71807', codeName: '차세대Biz혁신팀' });
  codes.push({ codeId: '71948', codeName: 'SG TF팀' });
  codes.push({ codeId: '75050', codeName: 'Wells신채널영업팀' });
}

await getCode();
async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/vocPsic/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  console.log(products);

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    dgYn: 'N',
  });
}
async function onClickDelete() {
  const view = grdMainRef.value.getView();

  await gridUtil.confirmDeleteCheckedRows(view);
  notify(t('MSG_TXT_RFLT_CHANGED_DATA_WHEN_SAVE'));
}
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.isModified(view)) {
    notify(t('MSG_ALT_NO_CHG_CNTN'));
    return;
  }
  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) {
    return;
  }
  if (!await gridUtil.validate(view)) { return; }

  const changeRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/vocPsic', changeRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

watch(() => searchParams.value.vocBizTpCd, async (val) => {
  if (val !== '20') {
    searchParams.value.ipvmProsTpCd = '';
  }
});

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgYn' },
    { fieldName: 'ogNm' },
    { fieldName: 'vocBizTpDtlCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'mpno' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'vocBizAsnId' },
  ];

  const columns = [
    { fieldName: 'dgYn', header: t('MSG_BTN_RPRS'), width: '80', styleName: 'text-center', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
    { fieldName: 'ogNm', header: t('MSG_TXT_DEPT_INC'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'vocBizTpDtlCd',
      header: t('MSG_TXT_TASK_TYPE'),
      width: '200',
      options: commonCodes.VOC_BIZ_TP_DTL_CD,
      styleName: 'text-left',
      editor: { type: 'list' },
    },
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_EPNO'),
      width: '100',
      styleName: 'text-center, rg-button-icon--search',
      editor: { type: 'text' },
      button: 'action',
    },
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
      styleName: 'text-center',
      editable: false,
    },
    { fieldName: 'mpno', header: t('MSG_TXT_CONTACT'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'vocBizAsnId', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellButtonClicked = async (g, { dataRow, column }) => {
    const { prtnrNo } = gridUtil.getRowValue(g, dataRow);
    if (column === 'prtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo,
        },
      });
      if (result) {
        if (prtnrPopupValidateChk.value - 1 < 0) {
          prtnrPopupValidateChk.value = 0;
        } else {
          prtnrPopupValidateChk.value -= 1;
        }
        const res = await dataService.get(`${SMS_COMMON_URI}/partners/${payload.prtnrNo}-${payload.ogTpCd}/month/${now.format('YYYYMM')}`);
        const mpno = res.data.cralLocaraTno.concat('-').concat(res.data.mexnoEncr).concat('-').concat(res.data.cralIdvTno);
        data.setValue(dataRow, 'ogNm', res.data.ogNm);
        data.setValue(dataRow, 'mpno', mpno);
        data.setValue(dataRow, 'ogTpCd', payload.ogTpCd);
        data.setValue(dataRow, 'prtnrNo', payload.prtnrNo);
        data.setValue(dataRow, 'prtnrKnm', payload.prtnrKnm);
      }
    }
  };
  // multi row header setting
  view.setColumnLayout([
    'dgYn', 'ogNm', 'vocBizTpDtlCd',
    {
      header: t('MSG_TXT_PIC'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm'],
    },
    'mpno',
    'ogTpCd',
    'vocBizAsnId',
  ]);
});

</script>
