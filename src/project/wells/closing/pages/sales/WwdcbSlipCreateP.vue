<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSlipCreateP -전표 생성 - W-CL-U-0034P02
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권반제 데이터의 전표생성을 위한 팝업화면.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_POSTING_DT')"
        >
          <p>{{ stringUtil.getDateFormat(detailInf.budat) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CO_DV')"
        >
          <p>{{ detailInf.kwGrpCoNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BND_ALRPY')"
        >
          <p>{{ stringUtil.getNumberWithComma(detailInf.slBndAlrpyAmt) }}원</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-grid
      ref="grdDetailRef"
      class="mt30"
      :visible-rows="5"
      name="grdDetail"
      @init="initGrdDetail"
    />

    <template #action>
      <kw-btn
        v-permission:create
        primary
        :label="$t('MSG_BTN_CNTN_CREATE')"
        @click="onSlipCreate()"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, defineGrid, getComponentType, useGlobal, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const store = useStore();
const { alert } = useGlobal();
// const { ok } = useModal();
const dataService = useDataService();
const companyCode = ref([{ codeId: store.getters['meta/getUserInfo'].companyCode, codeName: store.getters['meta/getUserInfo'].companyName }]);
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const detailInf = ref({
  budat: dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD'),
  kwGrpCoCd: companyCode.value[0].codeId,
  kwGrpCoNm: companyCode.value[0].codeName,
  slBndAlrpyAmt: 0,
});

const props = defineProps({
  chkDataRows: { type: Array, default: () => [] },
});

onMounted(async () => {
  console.log('props.chkDataRows:', props.chkDataRows);
  const view = grdDetailRef.value.getView();
  view.getDataSource().setRows(props.chkDataRows);
  if (props.chkDataRows != null && props.chkDataRows.length > 0) {
    for (let i = 0; i < props.chkDataRows.length; i += 1) {
      detailInf.value.slBndAlrpyAmt += props.chkDataRows[i].slBndAlrpyAmt;
    }
  }
});

const saveParams = ref({
  baseYm: now.format('YYYYMM'),
  sapBzDvCd: '1110',
});

let cachedParams;
// 전표 생성
async function onSlipCreate() {
  cachedParams = cloneDeep(saveParams.value);
  console.log('cachedParams:', cachedParams);
  const response = await dataService.post('/sms/wells/closing/business-atam-adjusts', cachedParams);
  if (response.data === 'S') await alert(t('MSG_ALT_SAVE_DATA'));
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD, editable: false }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD, editable: false }, // 판매유형상세
    { fieldName: 'dgCstId', header: t('MSG_TXT_RPRS_CUST_NO'), width: '120', styleName: 'text-center', editable: false }, // 대표고객ID
    { fieldName: 'dgCstNm', header: t('MSG_TXT_DG_CST_CD_NM'), width: '120', styleName: 'text-center', editable: false }, // 대표고객명
    { fieldName: 'slBndAlrpyAmt', header: t('MSG_TXT_ALRPY_AMT') + t('MSG_TXT_WON'), width: '150', styleName: 'text-right', dataType: 'number', editable: false }, // 채권반제금액
    { fieldName: 'bktxt', header: t('MSG_TXT_SMRY'), width: '300', styleName: 'text-left', editor: { maxLength: 333 } }, // 전표적요
    { fieldName: 'budat', width: '100', visible: false }, // 전기일자
    { fieldName: 'kwGrpCoCd', width: '100', visible: false }, // 교원그룹회사코드
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
