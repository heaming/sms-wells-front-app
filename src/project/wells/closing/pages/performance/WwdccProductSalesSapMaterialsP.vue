<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : N/A
3. 작성자 : seungeon.jang
4. 작성일 : 2023.12.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 자재별 금액현황
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--l"
  >
    <div class="scoped-table-box">
      <table class="kw-table--normal">
        <colgroup>
          <col style="width: 80px;">
          <col style="width: 100px;">
          <col style="width: 100px;">
        </colgroup>
        <thead>
          <tr>
            <th>{{ t('MSG_TXT_SAP_MAT_CD') }}</th>
            <th>{{ t('MSG_TXT_SL_TOT_AMT_LF_WON') }}</th>
            <th>{{ t('MSG_TXT_SL_TOT_VAT_LF_WON') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ t('MSG_TXT_PDCT') }}</td>
            <td class="text-right">
              {{ info.pdctSlSumAmt }}
            </td>
            <td class="text-right">
              {{ info.pdctSlSumVat }}
            </td>
          </tr>
          <tr>
            <td>{{ t('MSG_TXT_PRDT') }}</td>
            <td class="text-right">
              {{ info.prdtSlSumAmt }}
            </td>
            <td class="text-right">
              {{ info.prdtSlSumVat }}
            </td>
          </tr>
          <tr>
            <td>{{ t('MSG_TXT_SV_PRDT') }}</td>
            <td class="text-right">
              {{ info.svdtSlSumAmt }}
            </td>
            <td class="text-right">
              {{ info.svdtSlSumVat }}
            </td>
          </tr>
          <tr>
            <td>{{ t('MSG_TXT_ETC') }}</td>
            <td class="text-right">
              {{ info.etcSlSumAmt }}
            </td>
            <td class="text-right">
              {{ info.etcSlSumVat }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let cachedParams;

const props = defineProps({
  baseDtFrom: {
    type: String,
    required: true,
  },
  baseDtTo: {
    type: String,
    required: true,
  },
  sellTpDtlCd: {
    type: String,
    required: true,
  },
  sellChnlDtl: {
    type: String,
    required: true,
  },
  sapPdDvCd: {
    type: String,
    required: true,
  },
});

const info = ref({});

async function fetchData() {
  cachedParams = cloneDeep(props);
  const res = await dataService.get('/sms/wells/closing/product-sales/sap-materials', { params: cachedParams });
  info.value = res.data;
}

onMounted(async () => {
  fetchData();
});

</script>

<style scoped lang="scss">
.scoped-table-box {
  width: 100%;
  height: auto;
  overflow: auto;
  position: relative;

  &::-webkit-scrollbar {
    width: 14px;
    height: 13px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border: 2px solid #eee;
    border-top: 1px solid #eee;
    border-radius: 0;
  }

  &::-webkit-scrollbar-track {
    background: #eee;
  }

  &::-webkit-scrollbar-corner {
    background: #eee;
  }

  &::-webkit-scrollbar-button {
    background: #eee url("~@assets/icons/grid_scroll_arrow_left.svg") center 3px no-repeat;

    &:vertical:decrement {
      background: #eee url("~@assets/icons/grid_scroll_arrow_up.svg") center center no-repeat;
    }

    &:vertical:increment {
      background: #eee url("~@assets/icons/grid_scroll_arrow_down.svg") center center no-repeat;
    }

    &:horizontal:increment {
      background: #eee url("~@assets/icons/grid_scroll_arrow_right.svg") center 3px no-repeat;
    }
  }
}
</style>
