<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbAsProcsAgrgListM(K-W-SV-U-0025M01) - A/S 처리 현황
3. 작성자 : jaehunlee
4. 작성일 : 2023.07.19
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- A/S 처리 현황 (http://localhost:3000/#/service/wwsnb-as-procs-agrg-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item

          :label="$t('MSG_TXT_BASE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.taskType"
            :options="customCodes.TASK_TYPE_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
          />
          <kw-field
            v-model="searchParams.chkYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_WELSF_SDING_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const now = dayjs();
const { getPartMaster } = smsCommon();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

const customCodes = {
  TASK_TYPE_CD: [
    { codeId: '0', codeName: '설치+AS' },
    { codeId: '1', codeName: '설치(필터판매 제외)' },
    { codeId: '2', codeName: '제품교체(제품+고객)' },
    { codeId: '3', codeName: 'AS(제품교체 건 제외)' },
    { codeId: '4', codeName: 'BS' },
  ],
};

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  taskType: '1',
  pdGrpCd: '',
  pdCd: '',
  chkYn: 'N',
});

const productCode = ref();
watch(() => [searchParams.value.year, searchParams.value.pdGrpCd], async () => {
  const tempVal = await getPartMaster(undefined, searchParams.value.pdGrpCd);
  productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.codeName }));
}, { immediate: true });

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-procs-agrg', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-procs-agrg', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'cntGb' },
    { fieldName: 'cntTotal' },
    { fieldName: 'cnt01' },
    { fieldName: 'cnt02' },
    { fieldName: 'cnt03' },
    { fieldName: 'cnt04' },
    { fieldName: 'cnt05' },
    { fieldName: 'cnt06' },
    { fieldName: 'cnt07' },
    { fieldName: 'cnt08' },
    { fieldName: 'cnt09' },
    { fieldName: 'cnt10' },
    { fieldName: 'cnt11' },
    { fieldName: 'cnt12' },
    { fieldName: 'cnt13' },
    { fieldName: 'cnt14' },
    { fieldName: 'cnt15' },
    { fieldName: 'cnt16' },
    { fieldName: 'cnt17' },
    { fieldName: 'cnt18' },
    { fieldName: 'cnt19' },
    { fieldName: 'cnt20' },
    { fieldName: 'cnt21' },
    { fieldName: 'cnt22' },
    { fieldName: 'cnt23' },
    { fieldName: 'cnt24' },
    { fieldName: 'cnt25' },
    { fieldName: 'cnt26' },
    { fieldName: 'cnt27' },
    { fieldName: 'cnt28' },
    { fieldName: 'cnt29' },
    { fieldName: 'cnt30' },
    { fieldName: 'cnt31' },
    { fieldName: 'cntTotal', dataType: 'number' },
    { fieldName: 'cnt01', dataType: 'number' },
    { fieldName: 'cnt02', dataType: 'number' },
    { fieldName: 'cnt03', dataType: 'number' },
    { fieldName: 'cnt04', dataType: 'number' },
    { fieldName: 'cnt05', dataType: 'number' },
    { fieldName: 'cnt06', dataType: 'number' },
    { fieldName: 'cnt07', dataType: 'number' },
    { fieldName: 'cnt08', dataType: 'number' },
    { fieldName: 'cnt09', dataType: 'number' },
    { fieldName: 'cnt10', dataType: 'number' },
    { fieldName: 'cnt11', dataType: 'number' },
    { fieldName: 'cnt12', dataType: 'number' },
    { fieldName: 'cnt13', dataType: 'number' },
    { fieldName: 'cnt14', dataType: 'number' },
    { fieldName: 'cnt15', dataType: 'number' },
    { fieldName: 'cnt16', dataType: 'number' },
    { fieldName: 'cnt17', dataType: 'number' },
    { fieldName: 'cnt18', dataType: 'number' },
    { fieldName: 'cnt19', dataType: 'number' },
    { fieldName: 'cnt20', dataType: 'number' },
    { fieldName: 'cnt21', dataType: 'number' },
    { fieldName: 'cnt22', dataType: 'number' },
    { fieldName: 'cnt23', dataType: 'number' },
    { fieldName: 'cnt24', dataType: 'number' },
    { fieldName: 'cnt25', dataType: 'number' },
    { fieldName: 'cnt26', dataType: 'number' },
    { fieldName: 'cnt27', dataType: 'number' },
    { fieldName: 'cnt28', dataType: 'number' },
    { fieldName: 'cnt29', dataType: 'number' },
    { fieldName: 'cnt30', dataType: 'number' },
    { fieldName: 'cnt31', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_SV_CNR'),
      width: '150',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      },
      footers: [{

      }, {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      }, {

      }],
    },
    { fieldName: 'cntGb',
      header: t('MSG_TXT_DIV'),
      width: '100',
      styleName: 'text-center',
      footers: [{
        text: t('MSG_BTN_TASK_REG'),
        styleName: 'text-center',
      }, {
        text: t('MSG_TXT_VST_CNFM'),
        styleName: 'text-center',
      }, {
        text: t('MSG_TXT_PROCS_FSH'),
        styleName: 'text-center',
      }] },
    { fieldName: 'cntTotal',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cntTotal'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cntTotal'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cntTotal'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cntTotal'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cntTotal'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cntTotal'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt01',
      header: '01',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt01'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt01'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt01'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt01'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt01'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt01'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt02',
      header: '02',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt02'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt02'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt02'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt02'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt02'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt02'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt03',
      header: '03',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt03'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt03'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt03'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt03'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt03'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt03'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt04',
      header: '04',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt04'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt04'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt04'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt04'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt04'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt04'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt05',
      header: '05',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt05'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt05'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt05'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt05'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt05'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt05'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt06',
      header: '06',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt06'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt06'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt06'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt06'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt06'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt06'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt07',
      header: '07',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt07'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt07'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt07'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt07'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt07'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt07'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt08',
      header: '08',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt08'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt08'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt08'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt08'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt08'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt08'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt09',
      header: '09',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt09'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt09'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt09'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt09'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt09'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt09'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt10',
      header: '10',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt10'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt10'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt10'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt10'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt10'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt10'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt11',
      header: '11',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt11'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt11'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt11'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt11'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt11'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt11'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt12',
      header: '12',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt12'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt12'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt12'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt12'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt12'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt12'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt13',
      header: '13',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt13'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt13'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt13'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt13'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt13'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt13'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt14',
      header: '14',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt14'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt14'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt14'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt14'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt14'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt14'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt15',
      header: '15',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt15'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt15'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt15'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt15'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt15'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt15'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt16',
      header: '16',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt16'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt16'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt16'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt16'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt16'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt16'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt17',
      header: '17',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt17'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt17'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt17'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt17'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt17'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt17'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt18',
      header: '18',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt18'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt18'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt18'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt18'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt18'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt18'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt19',
      header: '19',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt19'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt19'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt19'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt19'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt19'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt19'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt20',
      header: '20',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt20'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt20'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt20'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt20'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt20'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt20'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt21',
      header: '21',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt21'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt21'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt21'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt21'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt21'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt21'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt22',
      header: '22',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt22'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt22'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt22'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt22'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt22'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt22'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt23',
      header: '23',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt23'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt23'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt23'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt23'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt23'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt23'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt24',
      header: '24',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt24'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt24'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt24'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt24'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt24'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt24'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt25',
      header: '25',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt25'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt25'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt25'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt25'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt25'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt25'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt26',
      header: '26',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt26'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt26'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt26'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt26'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt26'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt26'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt27',
      header: '27',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt27'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt27'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt27'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt27'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt27'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt27'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt28',
      header: '28',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt28'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt28'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt28'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt28'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt28'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt28'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt29',
      header: '29',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt29'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt29'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt29'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt29'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt29'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt29'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt30',
      header: '30',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt30'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt30'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt30'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt30'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt30'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt30'));
            }
          }

          return sum;
        },
      }] },
    { fieldName: 'cnt31',
      header: '31',
      width: '68',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footers: [{
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt31'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt31'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 1; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt31'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt31'));
            }
          }

          return sum;
        },
      }, {
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 2; i < cnt; i += 3) {
            if (Number.isNaN(Number(prod.getValue(i, 'cnt31'))) === false) {
              sum = Number(sum) + Number(prod.getValue(i, 'cnt31'));
            }
          }

          return sum;
        },
      }] },
  ];

  const columnLayout = [
    'ogNm',
    'cntGb',
    'cntTotal',
    'cnt01',
    'cnt02',
    'cnt03',
    'cnt04',
    'cnt05',
    'cnt06',
    'cnt07',
    'cnt08',
    'cnt09',
    'cnt10',
    'cnt11',
    'cnt12',
    'cnt13',
    'cnt14',
    'cnt15',
    'cnt16',
    'cnt17',
    'cnt18',
    'cnt19',
    'cnt20',
    'cnt21',
    'cnt22',
    'cnt23',
    'cnt24',
    'cnt25',
    'cnt26',
    'cnt27',
    'cnt28',
    'cnt29',
    'cnt30',
    'cnt31',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true, items: [{}, {}, {}] });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.footer.visible = true;
});

</script>
