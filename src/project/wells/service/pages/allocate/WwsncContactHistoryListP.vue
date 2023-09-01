<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0163P01] WwsncContactHistoryListP - 고객 컨택이력
3. 작성자 : juno.cha
4. 작성일 : 2023.05.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 컨택이력 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount.totalCount" />
      </template>
    </kw-action-top>

    <kw-grid
      ref="gridMainRef"
      :visible-rows="10"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        :label="t('확인')"
        primary
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, useDataService, getComponentType, useModal } from 'kw-lib';
import { onMounted } from 'vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { cancel: onClickCancel } = useModal();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));

/*
 *  공통코드 조회
 *  (조회 후 후처리 - customCodes)
 */
const codes = await codeUtil.getMultiCodes(
  'ABSNC_RSON_CD', // 부재사유
);

/*
 *  Parent Parameter를 가져오기 위한 변수 선언.
 */
const props = defineProps({
  cstSvAsnNo: {
    type: String,
    required: true,
  },
});

const totalCount = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/*
 * 고객 컨택이력 조회
 */
async function getContactHistories() {
  const res = await dataService.get('/sms/wells/service/contact-histories', { params: { cstSvAsnNo: props.cstSvAsnNo } });
  totalCount.value.totalCount = res.data.length;
  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  // view.resetCurrent();
}

onMounted(async () => {
  await getContactHistories();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntcDt' },
    { fieldName: 'cntcHh' },
    { fieldName: 'absncRsonCd' },
    { fieldName: 'cntcCn' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('소속'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('사번'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('담당자명'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'cntcDt',
      header: t('컨택일시'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 아래 두 column은 primary key이므로 empty check pass
        const cntcDt = value ?? '';
        const cntcHh = grid.getValue(index.itemIndex, 'cntcHh') ?? '';
        return dayjs(`${cntcDt}${cntcHh}`).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    { fieldName: 'absncRsonCd', header: t('부재사유'), width: '150', styleName: 'text-left', options: codes.ABSNC_RSON_CD },
    { fieldName: 'cntcCn', header: t('컨택내용'), width: '184', styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
