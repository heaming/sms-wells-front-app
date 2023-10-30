<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncUnpaidGuideUrgentMgtMExclude ( W-BN-U-0032M01 ) - 미납요금 안내/촉구 대상 제외관리(탭)
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 미납요금 안내서, 촉구서 제외대상을 관리한다.
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    :modified-targets="['grdExclude']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_INQR_YM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.baseYm"
          type="month"
          rules="required"
          :label="$t('MSG_TXT_INQR_YM')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_FW_DV')"
        required
      >
        <kw-option-group
          v-model="searchParams.schFwDv"
          type="radio"
          :options="codes.UC_AMT_FW_TP_CD"
          rules="required"
          :label="$t('MSG_TXT_FW_DV')"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:download
        icon="upload_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_UP')"
        @click="onClickExcelUpload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdExcludeRef"
      :visible-rows="10"
      name="grdExclude"
      @init="initGridExclude"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  getComponentType,
  gridUtil,
  defineGrid,
  codeUtil,
  // useMeta,
  useGlobal,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { notify, modal } = useGlobal();
const { t } = useI18n();
const grdExcludeRef = ref(getComponentType('kw-grid'));
const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'UC_AMT_FW_TP_CD', // 미수금액발송유형코드
);
const baseUrl = '/sms/wells/bond/unpaid-excludes';
const now = dayjs();

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  schFwDv: '01',
});

let cachedParams;
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });
  totalCount.value = data?.length;

  const view = grdExcludeRef.value.getView();

  view.getDataSource().setRows(data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const onClickSave = async () => {
  const view = grdExcludeRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.put(baseUrl, changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

const onClickExcelUpload = async () => {
  const apiUrl = `${baseUrl}/excel-upload`;
  const templateId = 'FOM_GUD_URGT_OJ_EXCD';
  const {
    result,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
  }
};
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridExclude = defineGrid((data, view) => {
  const btOpt = {
    startView: 1,
    minViewMode: 1,
    language: 'ko',
    todayHighlight: true,
  };
  const columns = [
    { fieldName: 'fwDvNm', header: t('MSG_TXT_FW_DV'), width: '240', styleName: 'text-center', editable: false }, // 발송구분
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '240', styleName: 'text-center', editable: false }, // 고객번호
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_YM'), width: '240', styleName: 'text-center', editor: { type: 'btdate', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', editable: false }, // 적용시작년월
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_YM'), width: '240', styleName: 'text-center', editor: { type: 'btdate', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', editable: true, rules: 'required' }, // 적용종료년월
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '248', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 등록일자
    { fieldName: 'usrNm', header: t('MSG_TXT_RGST_USR'), width: '240', styleName: 'text-center', editable: false }, // 등록자
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'bndCntcExcdOjId' });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

</script>
