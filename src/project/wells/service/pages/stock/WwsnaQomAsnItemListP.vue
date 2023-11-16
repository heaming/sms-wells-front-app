<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaQomAsnItemListP - 물량배정 품목 조회 (W-SV-U-0141P01)
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 물량배정 출고 품목을 확인하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
  >
    <kw-form
      :cols="2"
      :default-visible-rows="3"
      ignore-on-modified
    >
      <kw-form-row>
        <!-- 출고유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_TP')"
        >
          <kw-input
            v-model="searchParams.ostrTpNm"
            :readonly="true"
          />
        </kw-form-item>
        <!-- 출고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="searchParams.ostrWareNm"
            :readonly="true"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 배정년월/회차 -->
        <kw-form-item
          :label="`${t('MSG_TXT_ASN_YM')}/${t('MSG_TXT_ORDERSELECT_TITLE')}`"
        >
          <kw-input
            v-model="searchParams.asnInfo"
            :readonly="true"
          />
        </kw-form-item>
        <!-- 물류출고요청번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_LGST_OSTR_AK_NO')"
        >
          <kw-input
            v-model="searchParams.lgstOstrAkNo"
            :readonly="true"
            mask="AAAA-########-####"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 출고일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            :readonly="true"
            type="date"
          />
        </kw-form-item>
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="searchParams.strWareNm"
            :readonly="true"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        v-permission:download
        dense
        secondary
        icon="excel"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :total-count="totalCount"
      :visible-rows="9"
      @init="initGrdMain"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();

const dataService = useDataService();

const popupRef = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itmOstrNo: {
    type: String,
    default: '',
  },
});

const searchParams = ref({});
const totalCount = ref(0);
// 조회
async function fetchData() {
  const { itmOstrNo } = props;

  const res = await dataService.get('/sms/wells/service/qom-asn-items', { params: { itmOstrNo } });
  const itms = res.data;
  totalCount.value = itms.length;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(itms);
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const { itmOstrNo } = props;

  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/qom-asn-items', { params: { itmOstrNo } });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    searchCondition: false,
    exportData: res.data,
  });
}

// 출고정보 셋팅
function setSearchParams(res) {
  searchParams.value = cloneDeep(res.data);
}

// 파라미터에 해당하는 출고정보 조회
async function getItmOstrInfo() {
  const { itmOstrNo } = props;

  if (!isEmpty(itmOstrNo)) {
    const res = await dataService.get('/sms/wells/service/qom-asn-items/master-information', { params: { itmOstrNo } });

    setSearchParams(res);
  }
}

onMounted(async () => {
  await getItmOstrInfo();
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'pdAbbrNm' }, // 품목명
    { fieldName: 'ostrQty', dataType: 'number' }, // 확정수량
    { fieldName: 'stocQty', dataType: 'number' }, // 재고수량(개인)
    { fieldName: 'strConfDt' }, // 입고확정일자
    { fieldName: 'rmkCn' }, // 비고
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '95', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '200' },
    { fieldName: 'ostrQty', header: t('MSG_TXT_CNFM_QTY'), width: '80', styleName: 'text-right' },
    { fieldName: 'stocQty', header: `${t('MSG_TXT_STOC_QTY')}(${t('MSG_TXT_INDV')})`, width: '100', styleName: 'text-right' },
    { fieldName: 'strConfDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '200', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
