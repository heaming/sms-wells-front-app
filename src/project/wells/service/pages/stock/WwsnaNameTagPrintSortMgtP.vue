<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaNameTagPrintSortMgtP(W-SV-U-0169P02) - 네임택 출력 정렬
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.06.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 네임택 출력 정렬 (http://localhost:3000/#/service/wwsna-)
 ****************************************************************************************************
--->

<template>
  <kw-popup
    size="md"
  >
    <kw-form
      :cols="1"
      ignore-on-modified
    >
      <kw-form-row>
        <!-- 정렬구분 -->
        <kw-form-item :label="$t('MSG_TXT_SORT_BASE')">
          <!-- 품목코드 -->
          <!-- 정렬항목코드 -->
          <kw-select
            v-model="searchParams.sortAtcCd"
            :options="codes.SORT_ATC_CD"
            style="max-width: calc((100% - 8px) / 2);"
          />
          <!-- 오름차순 -->
          <!-- 정렬순서코드 -->
          <kw-select
            v-model="searchParams.sortOdrCd"
            :options="codes.SORT_ODR_CD"
            style="max-width: calc((100% - 8px) / 2);"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!-- popup button -->
    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <!-- 확인 -->
      <kw-btn
        v-permission:read
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
    <!-- // popup button -->
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useModal } from 'kw-lib';

import { openReportPopup } from '~common/utils/cmPopupUtil';

const { cancel: onClickCancel } = useModal();

const props = defineProps({
  itmStrNo: {
    type: String,
    default: '',
  },
  strTpCd: {
    type: String,
    default: '',
  },
  itmPdCds: {
    type: String,
    default: '',
  },
  strRgstDt: {
    type: String,
    default: '',
  },

});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  sortAtcCd: 'ITM_PD_CD',
  sortOdrCd: 'ASC',

});

const codes = await codeUtil.getMultiCodes(
  'SORT_ATC_CD',
  'SORT_ODR_CD',
);

const ozParam = ref({
  height: 1100,
  width: 1200,
});

// TODO : nametec.ozr 붙여야하고 nametec에서 필요한 정렬값들 넘겨줘야함.
async function onClickConfirm() {
  const { itmStrNo, itmPdCds, strTpCd, strRgstDt } = props;
  openReportPopup(
    '/kyowon_as/nametec.ozr',
    '/kyowon_as/nametec.odi',
    JSON.stringify(
      {
        ITM_STR_NO: itmStrNo,
        ITM_PD_CDS: itmPdCds,
        STR_TP_CD: strTpCd,
        STR_DT: strRgstDt,
        COLUMN: searchParams.value.sortAtcCd,
        SC: searchParams.value.sortOdrCd,
      },
    ),
    { width: ozParam.width, height: ozParam.height },
  );
}

</script>
<style lang="scss" scoped>
::v-deep(.kw-date) {
  margin: 0;

  .kw-date__container {
    width: 100%;

    .datepicker-days,
    .datepicker-months,
    .datepicker-years {
      width: 100%;
      text-align: center;

      .table-condensed {
        display: inline-table;
        vertical-align: top;
        margin-top: 18px;
      }
    }

    .datepicker-months,
    .datepicker-years {
      padding: 0 45px;
    }
  }

  .datepicker {
    &.datepicker-inline {
      width: 100%;

      table tbody td {
        // : 6px 2px;
        width: 40px;
        height: 32px;
        border: 6px solid #fff;
        border-top-width: 2px;
        border-bottom-width: 2px;

        &.today {
          border: 6px solid #fff !important;
          border-top-width: 2px !important;
          border-bottom-width: 2px !important;
        }
      }
    }
  }
}
</style>
